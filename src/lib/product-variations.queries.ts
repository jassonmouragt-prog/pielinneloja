import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db, schema } from "@/db/client";
import { and, asc, eq, inArray } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/auth-middleware";

export const listProductVariations = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((data: unknown) => z.object({ productId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const rows = await db
      .select()
      .from(schema.productVariations)
      .where(eq(schema.productVariations.productId, data.productId))
      .orderBy(asc(schema.productVariations.variationName), asc(schema.productVariations.optionValue));

    return rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      variationName: r.variationName,
      optionValue: r.optionValue,
      stock: r.stock,
      sortOrder: r.sortOrder,
    }));
  });

export const syncProductVariations = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((data: unknown) =>
    z
      .object({
        productId: z.string().uuid(),
        stockQuantity: z.number().int().min(0).optional(),
        variations: z.array(
          z.object({
            name: z.string().min(1).max(100),
            options: z.array(
              z.object({
                value: z.string().min(1).max(100),
                stock: z.number().int().min(0).default(0),
              }),
            ),
          }),
        ),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await db.transaction(async (tx) => {
      const existingProductRows = await tx
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, data.productId))
        .limit(1);
      const existingProduct = existingProductRows[0];
      if (!existingProduct) throw new Error("Produto não encontrado");

      // Effective stock total: provided value or the current product stock
      const totalProductStock = data.stockQuantity ?? existingProduct.stockQuantity ?? 0;

      const rowsToInsert: Array<{
        productId: string;
        variationName: string;
        optionValue: string;
        stock: number;
        sortOrder: number;
      }> = [];

      const variationsForJson: Array<{ name: string; options: Array<{ value: string; stock: number }> }> = [];

      let allocatedStock = 0;
      let hasAnyOptions = false;

      for (const v of data.variations) {
        const groupName = v.name.trim();
        const cleanOptions: Array<{ value: string; stock: number }> = [];
        for (let i = 0; i < v.options.length; i++) {
          const opt = v.options[i];
          if (!opt || !opt.value.trim()) continue;
          const optionValue = opt.value.trim();
          const stock = Math.max(0, Math.floor(opt.stock));
          hasAnyOptions = true;
          rowsToInsert.push({
            productId: data.productId,
            variationName: groupName,
            optionValue,
            stock,
            sortOrder: i,
          });
          cleanOptions.push({ value: optionValue, stock });
          allocatedStock += stock;
        }
        if (groupName) variationsForJson.push({ name: groupName, options: cleanOptions });
      }

      if (allocatedStock > totalProductStock) {
        throw new Error(
          `A soma do estoque das variações (${allocatedStock}) excede o estoque total do produto (${totalProductStock}).`,
        );
      }

      await tx
        .delete(schema.productVariations)
        .where(eq(schema.productVariations.productId, data.productId));

      if (rowsToInsert.length > 0) {
        await tx.insert(schema.productVariations).values(rowsToInsert);
      }

      // Keep the product stock as the total ceiling (admin-defined). If no registered
      // product stock exists and variations were allocated, use the allocated sum.
      const finalStock =
        totalProductStock > 0 || !hasAnyOptions ? totalProductStock : allocatedStock;

      await tx
        .update(schema.products)
        .set({
          stockQuantity: finalStock,
          variations: variationsForJson,
          updatedAt: new Date(),
        })
        .where(eq(schema.products.id, data.productId));
    });

    return { success: true };
  });

export const getProductWithVariations = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((data: unknown) => z.object({ productId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const productRows = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, data.productId))
      .limit(1);
    const product = productRows[0];
    if (!product) return null;

    const variations = await db
      .select()
      .from(schema.productVariations)
      .where(eq(schema.productVariations.productId, data.productId))
      .orderBy(asc(schema.productVariations.variationName), asc(schema.productVariations.sortOrder));

    const grouped: Record<string, Array<{ value: string; stock: number; id: string }>> = {};
    for (const v of variations) {
      if (!grouped[v.variationName]) grouped[v.variationName] = [];
      grouped[v.variationName]!.push({ value: v.optionValue, stock: v.stock, id: v.id });
    }

    let resultVariations = Object.entries(grouped).map(([name, opts]) => ({ name, options: opts }));

    // Fallback if product_variations table has no rows but product.variations JSON has data
    if (resultVariations.length === 0 && Array.isArray(product.variations) && product.variations.length > 0) {
      const parsed: Array<{ name: string; options: Array<{ value: string; stock: number; id: string }> }> = [];
      for (const v of product.variations as any[]) {
        if (!v?.name || !Array.isArray(v.options)) continue;
        parsed.push({
          name: v.name,
          options: v.options.map((opt: any, idx: number) => ({
            id: `legacy-${idx}`,
            value: typeof opt === "string" ? opt : (opt?.value || ""),
            stock: typeof opt === "object" && typeof opt?.stock === "number" ? opt.stock : (product.stockQuantity ?? 0),
          })),
        });
      }
      resultVariations = parsed;
    }

    return {
      product: {
        id: product.id,
        name: product.name,
        stockQuantity: product.stockQuantity,
      },
      variations: resultVariations,
    };
  });

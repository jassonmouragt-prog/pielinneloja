import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db, schema } from "@/db/client";
import { and, eq, sql } from "drizzle-orm";

export const registerPendingSale = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        customerName: z
          .string()
          .min(1, "O nome é obrigatório")
          .max(100, "O nome deve ter no máximo 100 caracteres"),
        totalAmount: z.number(),
        whatsappMessage: z.string(),
        items: z.array(
          z.object({
            productId: z.string().uuid(),
            quantity: z.number().int().positive(),
            price: z.number(),
            variations: z.record(z.string()).optional(),
          }),
        ),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { customerName, totalAmount, whatsappMessage, items } = data;

    const insertedSales = await db
      .insert(schema.sales)
      .values({
        totalAmount: totalAmount.toString(),
        status: "pending",
        whatsappMessage,
        customerName: customerName || null,
      })
      .returning();
    const sale = insertedSales[0];
    if (!sale) throw new Error("Failed to create sale");

    if (items.length > 0) {
      await db.insert(schema.saleItems).values(
        items.map((item) => ({
          saleId: sale.id,
          productId: item.productId,
          quantity: item.quantity,
          priceAtSale: item.price.toString(),
          variations: item.variations ?? null,
        })),
      );
    }

    return { success: true, saleId: sale.id };
  });

export const updateSaleStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        saleId: z.string().uuid(),
        status: z.enum(["confirmed", "cancelled", "pending"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { saleId, status } = data;

    const updateData: { status: string; confirmedAt?: Date } = { status };
    if (status === "confirmed") updateData.confirmedAt = new Date();

    const updated = await db
      .update(schema.sales)
      .set(updateData)
      .where(sql`${schema.sales.id} = ${saleId}`)
      .returning();
    const sale = updated[0];
    if (!sale) throw new Error("Sale not found");

    if (status === "confirmed") {
      const items = await db
        .select()
        .from(schema.saleItems)
        .where(sql`${schema.saleItems.saleId} = ${saleId}`);

      for (const item of items) {
        if (!item.productId) continue;

        await db.insert(schema.stockMovements).values({
          productId: item.productId,
          saleId: sale.id,
          quantity: -item.quantity,
          type: "sale",
          notes: "Venda confirmada via Admin",
        });

        const productRows = await db
          .select()
          .from(schema.products)
          .where(sql`${schema.products.id} = ${item.productId}`)
          .limit(1);
        const product = productRows[0];
        if (product) {
          const updatedStock = Math.max(0, (product.stockQuantity ?? 0) - item.quantity);
          await db
            .update(schema.products)
            .set({
              stockQuantity: updatedStock,
              updatedAt: new Date(),
            })
            .where(sql`${schema.products.id} = ${item.productId}`);
        }

        if (item.variations && typeof item.variations === "object") {
          for (const [varName, optValue] of Object.entries(item.variations as Record<string, string>)) {
            if (!varName || !optValue) continue;
            await db
              .update(schema.productVariations)
              .set({
                stock: sql`GREATEST(0, ${schema.productVariations.stock} - ${item.quantity})`,
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(schema.productVariations.productId, item.productId),
                  eq(schema.productVariations.variationName, varName),
                  eq(schema.productVariations.optionValue, optValue),
                ),
              );
          }
        }
      }
    }
    return { success: true };
  });

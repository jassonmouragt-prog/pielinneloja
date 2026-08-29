import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/auth-middleware";
import { uploadFile, deleteFile } from "@/lib/storage/r2";

const PRODUCT_KEY_PREFIX = "products";
const CATEGORY_KEY_PREFIX = "categories";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const images = await db
      .select()
      .from(schema.productImages)
      .where(eq(schema.productImages.productId, data.id));
    for (const img of images) {
      try {
        await deleteFile(img.url);
      } catch {
        // best effort
      }
    }
    await db.delete(schema.products).where(eq(schema.products.id, data.id));
    return { success: true };
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((data: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(2),
        subtitle: z.string().optional().nullable(),
        description: z.string().min(5),
        price: z.number().positive(),
        categoryId: z.string().uuid().nullable().optional(),
        stockQuantity: z.number().int().min(0),
        status: z.enum(["active", "inactive"]),
        variations: z
          .array(
            z.object({
              name: z.string().min(1),
              options: z.array(
                z.union([
                  z.string().min(1),
                  z.object({
                    value: z.string().min(1),
                    stock: z.number().int().min(0),
                  }),
                ]),
              ),
            }),
          )
          .default([]),
        imageBase64: z.string().optional().nullable(),
        imageContentType: z.string().optional().nullable(),
        imageFileName: z.string().optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { db: tx } = context;

    // Normalize variations and extract options with stocks
    const variationRowsToInsert: Array<{
      productId: string;
      variationName: string;
      optionValue: string;
      stock: number;
      sortOrder: number;
    }> = [];

    let totalVariationStock = 0;

    const normalizedVariations = data.variations
      .filter((v) => v.name && v.name.trim().length > 0)
      .map((v) => {
        const groupName = v.name.trim();
        const validOptions = v.options.filter((o) => {
          const val = typeof o === "string" ? o : o.value;
          return Boolean(val && val.trim().length > 0);
        });

        return {
          name: groupName,
          options: validOptions.map((o) => {
            const val = typeof o === "string" ? o.trim() : o.value.trim();
            const stock = typeof o === "object" && typeof o.stock === "number" ? Math.max(0, o.stock) : 0;
            totalVariationStock += stock;
            return { value: val, stock };
          }),
        };
      });

    // The stock total of the product is the ceiling (admin-defined stockQuantity).
    // Variations can only allocate up to this total.
    if (totalVariationStock > data.stockQuantity) {
      throw new Error(
        `A soma do estoque das variações (${totalVariationStock}) excede o estoque total do produto (${data.stockQuantity}).`,
      );
    }

    const payload = {
      name: data.name,
      subtitle: data.subtitle || null,
      description: data.description || null,
      price: data.price.toString(),
      categoryId: data.categoryId || null,
      stockQuantity: data.stockQuantity,
      status: data.status,
      variations: normalizedVariations,
      updatedAt: new Date(),
    };

    let productId = data.id;
    const isNew = !data.id;

    if (isNew) {
      const inserted = await tx.insert(schema.products).values(payload).returning();
      const created = inserted[0];
      if (!created) throw new Error("Failed to create product");
      productId = created.id;
      if (data.stockQuantity > 0 && productId) {
        await tx.insert(schema.stockMovements).values({
          productId,
          quantity: data.stockQuantity,
          type: "in",
          notes: "Estoque inicial",
        });
      }
    } else {
      await tx.update(schema.products).set(payload).where(eq(schema.products.id, data.id!));
    }

    if (productId) {
      // Sync product_variations rows
      await tx
        .delete(schema.productVariations)
        .where(eq(schema.productVariations.productId, productId));

      for (const v of data.variations) {
        if (!v.name || !v.name.trim()) continue;
        for (let i = 0; i < v.options.length; i++) {
          const opt = v.options[i];
          if (!opt) continue;
          const optValue = typeof opt === "string" ? opt.trim() : opt.value.trim();
          if (!optValue) continue;
          const optStock = typeof opt === "object" && typeof opt.stock === "number" ? Math.max(0, opt.stock) : 0;
          variationRowsToInsert.push({
            productId,
            variationName: v.name.trim(),
            optionValue: optValue,
            stock: optStock,
            sortOrder: i,
          });
        }
      }

      if (variationRowsToInsert.length > 0) {
        await tx.insert(schema.productVariations).values(variationRowsToInsert);
      }
    }

    if (data.imageBase64 && data.imageContentType && data.imageFileName && productId) {
      const ext = data.imageFileName.split(".").pop() ?? "bin";
      const key = `${PRODUCT_KEY_PREFIX}/${productId}-${Date.now()}.${ext}`;
      const buffer = base64ToBytes(data.imageBase64);
      const uploaded = await uploadFile(key, buffer, data.imageContentType);
      const oldImages = await tx
        .select()
        .from(schema.productImages)
        .where(eq(schema.productImages.productId, productId));
      for (const img of oldImages) {
        try {
          await deleteFile(img.url);
        } catch {
          // ignore
        }
      }
      await tx.delete(schema.productImages).where(eq(schema.productImages.productId, productId));
      await tx.insert(schema.productImages).values({
        productId,
        url: uploaded.key,
        isMain: true,
      });
    }

    return { success: true, id: productId };
  });

export const upsertCategory = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((data: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(2),
        tone: z.string().min(4),
        imageBase64: z.string().nullable().optional(),
        imageContentType: z.string().nullable().optional(),
        imageFileName: z.string().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    let imageUrl: string | null = null;
    if (data.imageBase64 && data.imageContentType && data.imageFileName) {
      const ext = data.imageFileName.split(".").pop() ?? "bin";
      const key = `${CATEGORY_KEY_PREFIX}/${generateUUID()}.${ext}`;
      const buffer = base64ToBytes(data.imageBase64);
      const uploaded = await uploadFile(key, buffer, data.imageContentType);
      imageUrl = uploaded.key;
    }
    const payload = {
      name: data.name,
      tone: data.tone,
      imageUrl: imageUrl ?? null,
      updatedAt: new Date(),
    };
    if (data.id) {
      await db.update(schema.categories).set(payload).where(eq(schema.categories.id, data.id));
      return { success: true, id: data.id };
    } else {
      const inserted = await db.insert(schema.categories).values(payload).returning();
      const created = inserted[0];
      if (!created) throw new Error("Failed to create category");
      return { success: true, id: created.id };
    }
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const rows = await db
      .select()
      .from(schema.categories)
      .where(eq(schema.categories.id, data.id))
      .limit(1);
    const cat = rows[0];
    if (cat?.imageUrl) {
      try {
        await deleteFile(cat.imageUrl);
      } catch {
        // ignore
      }
    }
    await db.delete(schema.categories).where(eq(schema.categories.id, data.id));
    return { success: true };
  });

export const listCategoriesAdmin = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async () => {
    return db.select().from(schema.categories).orderBy(schema.categories.name);
  });

export { };

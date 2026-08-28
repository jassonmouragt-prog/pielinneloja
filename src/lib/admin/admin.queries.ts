import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db, schema } from "@/db/client";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/auth-middleware";
import { uploadFile, deleteFile, buildPublicUrl } from "@/lib/storage/r2";
import { randomUUID } from "node:crypto";

const PRODUCT_KEY_PREFIX = "products";
const CATEGORY_KEY_PREFIX = "categories";

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
              options: z.array(z.string().min(1)),
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
    const payload = {
      name: data.name,
      subtitle: data.subtitle || null,
      description: data.description || null,
      price: data.price.toString(),
      categoryId: data.categoryId || null,
      stockQuantity: data.stockQuantity,
      status: data.status,
      variations: data.variations,
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

    if (data.imageBase64 && data.imageContentType && data.imageFileName && productId) {
      const ext = data.imageFileName.split(".").pop() ?? "bin";
      const key = `${PRODUCT_KEY_PREFIX}/${productId}-${Date.now()}.${ext}`;
      const buffer = Buffer.from(data.imageBase64, "base64");
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
      const key = `${CATEGORY_KEY_PREFIX}/${randomUUID()}.${ext}`;
      const buffer = Buffer.from(data.imageBase64, "base64");
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

export { buildPublicUrl };

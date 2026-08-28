import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db, schema } from "@/db/client";
import { requireAuth } from "@/lib/auth/auth-middleware";
import { and, eq, sql } from "drizzle-orm";

export const getAdminProfile = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { userId, email, role } = context;
    return { id: userId, email, role };
  });

export const updateProductStock = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((data: unknown) =>
    z
      .object({
        productId: z.string().uuid(),
        quantity: z.number().int(),
        type: z.string().min(1),
        notes: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { productId, quantity, type, notes } = data;
    const { db: tx } = context;

    const productRows = await tx
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, productId))
      .limit(1);
    const product = productRows[0];
    if (!product) throw new Error("Product not found");

    const currentStock = product.stockQuantity ?? 0;
    const newStock = currentStock + quantity;

    await tx
      .update(schema.products)
      .set({ stockQuantity: newStock, updatedAt: new Date() })
      .where(eq(schema.products.id, productId));

    await tx.insert(schema.stockMovements).values({
      productId,
      quantity,
      type,
      notes: notes ?? null,
    });

    return { success: true, newStock };
  });

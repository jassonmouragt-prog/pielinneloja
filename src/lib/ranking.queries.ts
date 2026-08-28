import { createServerFn } from "@tanstack/react-start";
import { db, schema } from "@/db/client";
import { and, eq, gte, sql, sum, desc } from "drizzle-orm";

export const getTopSellingProducts = createServerFn({ method: "GET" }).handler(
  async () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const rows = await db
      .select({
        productId: schema.saleItems.productId,
        productName: schema.products.name,
        productSubtitle: schema.products.subtitle,
        price: schema.products.price,
        status: schema.products.status,
        totalSold: sum(schema.saleItems.quantity).as("total_sold"),
      })
      .from(schema.saleItems)
      .innerJoin(schema.sales, eq(schema.saleItems.saleId, schema.sales.id))
      .innerJoin(schema.products, eq(schema.saleItems.productId, schema.products.id))
      .where(
        and(
          eq(schema.sales.status, "confirmed"),
          gte(schema.sales.createdAt, firstDayOfMonth),
        ),
      )
      .groupBy(schema.saleItems.productId, schema.products.name, schema.products.subtitle, schema.products.price, schema.products.status)
      .orderBy(desc(sql`total_sold`))
      .limit(3);

    if (rows.length === 0) return [];

    const productIds = rows.map((r) => r.productId).filter((id): id is string => !!id);
    if (productIds.length === 0) return [];

    const images = await db
      .select()
      .from(schema.productImages)
      .where(
        sql`${schema.productImages.productId} IN (${sql.join(
          productIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      );

    const byProduct = new Map<string, typeof images>();
    for (const img of images) {
      const arr = byProduct.get(img.productId) ?? [];
      arr.push(img);
      byProduct.set(img.productId, arr);
    }

    return rows
      .filter((r) => r.productId)
      .map((r) => ({
        productId: r.productId,
        name: r.productName,
        subtitle: r.productSubtitle,
        price: Number(r.price),
        totalSold: Number(r.totalSold ?? 0),
        product_images: (byProduct.get(r.productId!) ?? []).map((img) => ({
          id: img.id,
          productId: img.productId,
          url: img.url,
          isMain: img.isMain,
        })),
      }));
  },
);

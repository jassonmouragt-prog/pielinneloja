import { createServerFn } from "@tanstack/react-start";
import { db, schema } from "@/db/client";
import { and, desc, eq, gt, gte, sql, sum } from "drizzle-orm";

export const getTopSellingProducts = createServerFn({ method: "GET" }).handler(async () => {
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
        eq(schema.products.status, "active"),
        gt(schema.products.stockQuantity, 0),
      ),
    )
    .groupBy(
      schema.saleItems.productId,
      schema.products.name,
      schema.products.subtitle,
      schema.products.price,
      schema.products.status,
    )
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
});

export const getAllTopSellingProducts = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await db
    .select({
      productId: schema.saleItems.productId,
      productName: schema.products.name,
      productSubtitle: schema.products.subtitle,
      description: schema.products.description,
      price: schema.products.price,
      categoryId: schema.products.categoryId,
      stockQuantity: schema.products.stockQuantity,
      status: schema.products.status,
      variations: schema.products.variations,
      createdAt: schema.products.createdAt,
      updatedAt: schema.products.updatedAt,
      totalSold: sum(schema.saleItems.quantity).as("total_sold"),
    })
    .from(schema.saleItems)
    .innerJoin(schema.sales, eq(schema.saleItems.saleId, schema.sales.id))
    .innerJoin(schema.products, eq(schema.saleItems.productId, schema.products.id))
    .where(
      and(
        eq(schema.sales.status, "confirmed"),
        eq(schema.products.status, "active"),
        gt(schema.products.stockQuantity, 0),
      ),
    )
    .groupBy(
      schema.saleItems.productId,
      schema.products.name,
      schema.products.subtitle,
      schema.products.description,
      schema.products.price,
      schema.products.categoryId,
      schema.products.stockQuantity,
      schema.products.status,
      schema.products.variations,
      schema.products.createdAt,
      schema.products.updatedAt,
    )
    .orderBy(desc(sql`total_sold`));

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
    .map((r) => {
      const stockMap = new Map<string, number>();
      const variations = r.variations ?? [];
      const variationsForClient = Array.isArray(variations)
        ? variations.map((v: any) => {
            const cleanOptions: string[] = [];
            const stockByOption: Record<string, number> = {};
            if (Array.isArray(v.options)) {
              for (const opt of v.options) {
                const optValue = typeof opt === "string" ? opt : opt?.value || "";
                if (!optValue) continue;
                cleanOptions.push(optValue);
                const stock =
                  typeof opt === "object" && typeof opt?.stock === "number"
                    ? opt.stock
                    : (r.stockQuantity ?? 0);
                stockByOption[optValue] = stock;
              }
            }
            return { name: v.name, options: cleanOptions, stockByOption };
          })
        : [];

      return {
        id: r.productId,
        name: r.productName,
        subtitle: r.productSubtitle,
        description: r.description,
        price: Number(r.price),
        categoryId: r.categoryId,
        stockQuantity: r.stockQuantity,
        status: r.status,
        variations: variationsForClient,
        totalSold: Number(r.totalSold ?? 0),
        createdAt: r.createdAt?.toISOString() ?? null,
        updatedAt: r.updatedAt?.toISOString() ?? null,
        product_images: (byProduct.get(r.productId!) ?? []).map((img) => ({
          id: img.id,
          productId: img.productId,
          url: img.url,
          isMain: img.isMain,
          createdAt: img.createdAt?.toISOString() ?? null,
        })),
      };
    });
});

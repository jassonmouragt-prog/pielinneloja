import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db, schema } from "@/db/client";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { optionalAuth, requireAuth } from "@/lib/auth/auth-middleware";

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await db.select().from(schema.categories).orderBy(schema.categories.name);
  return rows.map((c) => ({
    id: c.id,
    name: c.name,
    imageUrl: c.imageUrl,
    tone: c.tone,
    createdAt: c.createdAt?.toISOString() ?? null,
    updatedAt: c.updatedAt?.toISOString() ?? null,
  }));
});

export const listPublicProducts = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z
      .object({
        categoryId: z.string().uuid().optional(),
        limit: z.number().int().positive().max(100).optional(),
      })
      .optional()
      .parse(data),
  )
  .handler(async ({ data }) => {
    const conds = [eq(schema.products.status, "active")];
    if (data?.categoryId) conds.push(eq(schema.products.categoryId, data.categoryId));

    const rows = await db
      .select({
        id: schema.products.id,
        name: schema.products.name,
        subtitle: schema.products.subtitle,
        description: schema.products.description,
        price: schema.products.price,
        categoryId: schema.products.categoryId,
        stockQuantity: schema.products.stockQuantity,
        status: schema.products.status,
        variations: schema.products.variations,
        createdAt: schema.products.createdAt,
        updatedAt: schema.products.updatedAt,
      })
      .from(schema.products)
      .where(and(...conds))
      .orderBy(desc(schema.products.createdAt))
      .limit(data?.limit ?? 100);

    if (rows.length === 0) return [];
    const productIds = rows.map((r) => r.id);
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
    return rows.map((p) => ({
      id: p.id,
      name: p.name,
      subtitle: p.subtitle,
      description: p.description,
      price: Number(p.price),
      categoryId: p.categoryId,
      stockQuantity: p.stockQuantity,
      status: p.status,
      variations: p.variations ?? [],
      createdAt: p.createdAt?.toISOString() ?? null,
      updatedAt: p.updatedAt?.toISOString() ?? null,
      product_images: (byProduct.get(p.id) ?? []).map((img) => ({
        id: img.id,
        productId: img.productId,
        url: img.url,
        isMain: img.isMain,
        createdAt: img.createdAt?.toISOString() ?? null,
      })),
    }));
  });

export const listAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async () => {
    const rows = await db
      .select({
        id: schema.products.id,
        name: schema.products.name,
        subtitle: schema.products.subtitle,
        description: schema.products.description,
        price: schema.products.price,
        categoryId: schema.products.categoryId,
        stockQuantity: schema.products.stockQuantity,
        status: schema.products.status,
        variations: schema.products.variations,
        createdAt: schema.products.createdAt,
        updatedAt: schema.products.updatedAt,
        categoryName: schema.categories.name,
      })
      .from(schema.products)
      .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
      .orderBy(desc(schema.products.createdAt));

    const productIds = rows.map((r) => r.id);
    const images =
      productIds.length === 0
        ? []
        : await db
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
    return rows.map((p) => ({
      id: p.id,
      name: p.name,
      subtitle: p.subtitle,
      description: p.description,
      price: Number(p.price),
      categoryId: p.categoryId,
      stockQuantity: p.stockQuantity,
      status: p.status,
      variations: p.variations ?? [],
      createdAt: p.createdAt?.toISOString() ?? null,
      updatedAt: p.updatedAt?.toISOString() ?? null,
      categoryName: p.categoryName,
      categories: p.categoryName ? { id: p.categoryId, name: p.categoryName } : null,
      product_images: (byProduct.get(p.id) ?? []).map((img) => ({
        id: img.id,
        productId: img.productId,
        url: img.url,
        isMain: img.isMain,
        createdAt: img.createdAt?.toISOString() ?? null,
      })),
    }));
  });

export const listAdminProductsMinimal = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async () => {
    const rows = await db
      .select({
        id: schema.products.id,
        name: schema.products.name,
        price: schema.products.price,
        stockQuantity: schema.products.stockQuantity,
        status: schema.products.status,
      })
      .from(schema.products)
      .where(eq(schema.products.status, "active"))
      .orderBy(schema.products.name);
    return rows.map((p) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      stockQuantity: p.stockQuantity,
      status: p.status,
    }));
  });

export const listProductsForStock = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async () => {
    const rows = await db
      .select({
        id: schema.products.id,
        name: schema.products.name,
        stockQuantity: schema.products.stockQuantity,
        categoryName: schema.categories.name,
      })
      .from(schema.products)
      .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
      .orderBy(schema.products.name);
    return rows.map((p) => ({
      id: p.id,
      name: p.name,
      stock_quantity: p.stockQuantity,
      categories: p.categoryName ? { name: p.categoryName } : null,
    }));
  });

export const listStockMovements = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async () => {
    const rows = await db
      .select({
        id: schema.stockMovements.id,
        productId: schema.stockMovements.productId,
        quantity: schema.stockMovements.quantity,
        type: schema.stockMovements.type,
        saleId: schema.stockMovements.saleId,
        notes: schema.stockMovements.notes,
        createdAt: schema.stockMovements.createdAt,
        productName: schema.products.name,
      })
      .from(schema.stockMovements)
      .leftJoin(schema.products, eq(schema.stockMovements.productId, schema.products.id))
      .orderBy(desc(schema.stockMovements.createdAt))
      .limit(50);
    return rows.map((r) => ({
      id: r.id,
      productId: r.productId,
      quantity: r.quantity,
      type: r.type,
      saleId: r.saleId,
      notes: r.notes,
      createdAt: r.createdAt?.toISOString() ?? null,
      products: r.productName ? { name: r.productName } : null,
    }));
  });

export const listSales = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async () => {
    const salesRows = await db.select().from(schema.sales).orderBy(desc(schema.sales.createdAt));

    if (salesRows.length === 0) return [];

    const saleIds = salesRows.map((s) => s.id);
    const items = await db
      .select({
        id: schema.saleItems.id,
        saleId: schema.saleItems.saleId,
        productId: schema.saleItems.productId,
        quantity: schema.saleItems.quantity,
        priceAtSale: schema.saleItems.priceAtSale,
        variations: schema.saleItems.variations,
        productName: schema.products.name,
      })
      .from(schema.saleItems)
      .leftJoin(schema.products, eq(schema.saleItems.productId, schema.products.id))
      .where(
        sql`${schema.saleItems.saleId} IN (${sql.join(
          saleIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      );

    const bySale = new Map<string, typeof items>();
    for (const it of items) {
      const arr = bySale.get(it.saleId) ?? [];
      arr.push(it);
      bySale.set(it.saleId, arr);
    }

    return salesRows.map((s) => ({
      id: s.id,
      totalAmount: s.totalAmount,
      total_amount: Number(s.totalAmount),
      status: s.status,
      whatsappMessage: s.whatsappMessage,
      customerName: s.customerName,
      customer_name: s.customerName,
      createdAt: s.createdAt?.toISOString() ?? null,
      confirmedAt: s.confirmedAt?.toISOString() ?? null,
      sale_items: (bySale.get(s.id) ?? []).map((it) => ({
        id: it.id,
        product_id: it.productId,
        productId: it.productId,
        quantity: it.quantity,
        price_at_sale: Number(it.priceAtSale),
        priceAtSale: Number(it.priceAtSale),
        variations: it.variations ?? null,
        products: it.productName ? { name: it.productName } : null,
      })),
    }));
  });

export const getRecentSales = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async () => {
    const salesRows = await db
      .select()
      .from(schema.sales)
      .orderBy(desc(schema.sales.createdAt))
      .limit(10);

    if (salesRows.length === 0) return [];

    const saleIds = salesRows.map((s) => s.id);
    const items = await db
      .select({
        id: schema.saleItems.id,
        saleId: schema.saleItems.saleId,
        productId: schema.saleItems.productId,
        quantity: schema.saleItems.quantity,
        priceAtSale: schema.saleItems.priceAtSale,
        productName: schema.products.name,
      })
      .from(schema.saleItems)
      .leftJoin(schema.products, eq(schema.saleItems.productId, schema.products.id))
      .where(
        sql`${schema.saleItems.saleId} IN (${sql.join(
          saleIds.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      );

    const bySale = new Map<string, typeof items>();
    for (const it of items) {
      const arr = bySale.get(it.saleId) ?? [];
      arr.push(it);
      bySale.set(it.saleId, arr);
    }

    return salesRows.map((s) => ({
      id: s.id,
      totalAmount: s.totalAmount,
      total_amount: Number(s.totalAmount),
      status: s.status,
      customerName: s.customerName,
      customer_name: s.customerName,
      createdAt: s.createdAt?.toISOString() ?? null,
      sale_items: (bySale.get(s.id) ?? []).map((it) => ({
        id: it.id,
        quantity: it.quantity,
        products: it.productName ? { name: it.productName } : null,
      })),
    }));
  });

export const getMonthSalesStats = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const rows = await db
      .select({
        totalAmount: schema.sales.totalAmount,
        status: schema.sales.status,
      })
      .from(schema.sales)
      .where(gte(schema.sales.createdAt, firstDayOfMonth));

    return rows.map((r) => ({
      total_amount: Number(r.totalAmount),
      status: r.status,
    }));
  });

export const getProductsForDashboard = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async () => {
    return db
      .select({
        id: schema.products.id,
        name: schema.products.name,
        stockQuantity: schema.products.stockQuantity,
      })
      .from(schema.products);
  });

export const getBillingData = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async () => {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const sales = await db
      .select({
        totalAmount: schema.sales.totalAmount,
        createdAt: schema.sales.createdAt,
      })
      .from(schema.sales)
      .where(
        and(eq(schema.sales.status, "confirmed"), gte(schema.sales.createdAt, twelveMonthsAgo)),
      );
    return sales.map((s) => ({
      total_amount: Number(s.totalAmount),
      created_at: s.createdAt?.toISOString() ?? null,
    }));
  });

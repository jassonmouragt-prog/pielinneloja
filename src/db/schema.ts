import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  uuid,
  integer,
  numeric,
  boolean,
  jsonb,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const appRole = pgEnum("app_role", ["admin", "user"]);

export const productStatus = pgEnum("product_status", ["active", "inactive", "draft"]);

export const expenseType = pgEnum("expense_type", [
  "funcionaria",
  "fornecedores",
  "agua",
  "luz",
  "internet",
  "aluguel",
  "marketing",
  "impostos",
  "outros",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const userRoles = pgTable(
  "user_roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: appRole("role").notNull(),
  },
  (t) => [index("user_roles_user_id_idx").on(t.userId)],
);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  imageUrl: text("image_url"),
  tone: varchar("tone", { length: 32 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    subtitle: text("subtitle"),
    description: text("description"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    stockQuantity: integer("stock_quantity").default(0).notNull(),
    status: varchar("status", { length: 32 }).default("active").notNull(),
    variations: jsonb("variations").default(sql`'[]'::jsonb`),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("products_category_id_idx").on(t.categoryId),
    index("products_status_idx").on(t.status),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    isMain: boolean("is_main").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("product_images_product_id_idx").on(t.productId)],
);

export const productVariations = pgTable(
  "product_variations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variationName: varchar("variation_name", { length: 100 }).notNull(),
    optionValue: varchar("option_value", { length: 100 }).notNull(),
    stock: integer("stock").default(0).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("product_variations_product_id_idx").on(t.productId),
    uniqueIndex("product_variations_unique_option").on(t.productId, t.variationName, t.optionValue),
  ],
);

export const sales = pgTable("sales", {
  id: uuid("id").primaryKey().defaultRandom(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  whatsappMessage: text("whatsapp_message"),
  customerName: varchar("customer_name", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
});

export const saleItems = pgTable(
  "sale_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    saleId: uuid("sale_id")
      .notNull()
      .references(() => sales.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    quantity: integer("quantity").notNull(),
    priceAtSale: numeric("price_at_sale", { precision: 12, scale: 2 }).notNull(),
    variations: jsonb("variations"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("sale_items_sale_id_idx").on(t.saleId)],
);

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variationId: uuid("variation_id").references(() => productVariations.id, { onDelete: "set null" }),
    quantity: integer("quantity").notNull(),
    type: varchar("type", { length: 32 }).notNull(),
    saleId: uuid("sale_id").references(() => sales.id, { onDelete: "set null" }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("stock_movements_product_id_idx").on(t.productId)],
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: expenseType("type").notNull(),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    expenseDate: timestamp("expense_date", { withTimezone: true }).defaultNow().notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("expenses_type_idx").on(t.type),
    index("expenses_date_idx").on(t.expenseDate),
  ],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
export type ProductVariation = typeof productVariations.$inferSelect;
export type NewProductVariation = typeof productVariations.$inferInsert;
export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;
export type SaleItem = typeof saleItems.$inferSelect;
export type NewSaleItem = typeof saleItems.$inferInsert;
export type StockMovement = typeof stockMovements.$inferSelect;
export type NewStockMovement = typeof stockMovements.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

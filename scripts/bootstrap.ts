import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

const url = process.env["DATABASE_URL"] || process.env["NEON_DATABASE_URL"];
if (!url) {
  throw new Error("DATABASE_URL is required to seed");
}

const connection = neon(url);
const db = drizzle(connection);

async function ensureRoleFunction() {
  await db.execute(sql`
    CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
      );
    END;
    $$;
  `);

  await db.execute(sql`REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;`);
  await db.execute(
    sql`GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO anon, authenticated;`,
  );
}

async function enableRls() {
  await db.execute(sql`ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`);
  await db.execute(sql`ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;`);
  await db.execute(sql`ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;`);
  await db.execute(sql`ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;`);
  await db.execute(sql`ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;`);
  await db.execute(sql`ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;`);
  await db.execute(sql`ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;`);
  await db.execute(sql`ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;`);
}

async function createPolicies() {
  await db.execute(sql`DROP POLICY IF EXISTS "Public can read categories" ON public.categories;`);
  await db.execute(
    sql`CREATE POLICY "Public can read categories" ON public.categories FOR SELECT USING (true);`,
  );

  await db.execute(
    sql`DROP POLICY IF EXISTS "Public can read active products" ON public.products;`,
  );
  await db.execute(
    sql`CREATE POLICY "Public can read active products" ON public.products FOR SELECT USING (status = 'active');`,
  );

  await db.execute(
    sql`DROP POLICY IF EXISTS "Public can read product images" ON public.product_images;`,
  );
  await db.execute(
    sql`CREATE POLICY "Public can read product images" ON public.product_images FOR SELECT USING (true);`,
  );

  await db.execute(sql`DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;`);
  await db.execute(
    sql`CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::uuid);`,
  );

  await db.execute(
    sql`DROP POLICY IF EXISTS "Admins full access categories" ON public.categories;`,
  );
  await db.execute(
    sql`CREATE POLICY "Admins full access categories" ON public.categories FOR ALL USING (public.has_role(current_setting('app.current_user_id', true)::uuid, 'admin')) WITH CHECK (public.has_role(current_setting('app.current_user_id', true)::uuid, 'admin'));`,
  );

  await db.execute(sql`DROP POLICY IF EXISTS "Admins full access products" ON public.products;`);
  await db.execute(
    sql`CREATE POLICY "Admins full access products" ON public.products FOR ALL USING (public.has_role(current_setting('app.current_user_id', true)::uuid, 'admin')) WITH CHECK (public.has_role(current_setting('app.current_user_id', true)::uuid, 'admin'));`,
  );

  await db.execute(
    sql`DROP POLICY IF EXISTS "Admins full access product_images" ON public.product_images;`,
  );
  await db.execute(
    sql`CREATE POLICY "Admins full access product_images" ON public.product_images FOR ALL USING (public.has_role(current_setting('app.current_user_id', true)::uuid, 'admin')) WITH CHECK (public.has_role(current_setting('app.current_user_id', true)::uuid, 'admin'));`,
  );

  await db.execute(sql`DROP POLICY IF EXISTS "Admins full access sales" ON public.sales;`);
  await db.execute(
    sql`CREATE POLICY "Admins full access sales" ON public.sales FOR ALL USING (public.has_role(current_setting('app.current_user_id', true)::uuid, 'admin')) WITH CHECK (public.has_role(current_setting('app.current_user_id', true)::uuid, 'admin'));`,
  );

  await db.execute(
    sql`DROP POLICY IF EXISTS "Admins full access sale_items" ON public.sale_items;`,
  );
  await db.execute(
    sql`CREATE POLICY "Admins full access sale_items" ON public.sale_items FOR ALL USING (public.has_role(current_setting('app.current_user_id', true)::uuid, 'admin')) WITH CHECK (public.has_role(current_setting('app.current_user_id', true)::uuid, 'admin'));`,
  );

  await db.execute(
    sql`DROP POLICY IF EXISTS "Admins full access stock_movements" ON public.stock_movements;`,
  );
  await db.execute(
    sql`CREATE POLICY "Admins full access stock_movements" ON public.stock_movements FOR ALL USING (public.has_role(current_setting('app.current_user_id', true)::uuid, 'admin')) WITH CHECK (public.has_role(current_setting('app.current_user_id', true)::uuid, 'admin'));`,
  );
}

async function seedAdminUser() {
  const adminEmail = "sualojinhaadmin@admin.com";
  const adminPassword = process.env["ADMIN_SEED_PASSWORD"] || "ChangeMe123!";

  const existing = await db.execute(
    sql`SELECT id FROM public.users WHERE email = ${adminEmail} LIMIT 1`,
  );
  if (existing.rows.length > 0) {
    console.log(`Admin user ${adminEmail} already exists.`);
    return;
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const inserted = await db.execute(
    sql`INSERT INTO public.users (email, password_hash) VALUES (${adminEmail}, ${passwordHash}) RETURNING id`,
  );
  const userId = inserted.rows[0].id as string;
  await db.execute(sql`INSERT INTO public.user_roles (user_id, role) VALUES (${userId}, 'admin')`);
  console.log(`Created admin user ${adminEmail} (id: ${userId}).`);
  console.log(`Password: ${adminPassword}  (set ADMIN_SEED_PASSWORD to override)`);
}

async function seedCategories() {
  const seed = [
    { name: "Maquiagem", tone: "#F06292" },
    { name: "Skincare", tone: "#F06292" },
    { name: "Cabelos", tone: "#F06292" },
    { name: "Corpo", tone: "#F06292" },
    { name: "Kits", tone: "#F06292" },
    { name: "Acessórios", tone: "#F06292" },
    { name: "Novidades", tone: "#F06292" },
  ];
  for (const cat of seed) {
    const existing = await db.execute(
      sql`SELECT id FROM public.categories WHERE name = ${cat.name} LIMIT 1`,
    );
    if (existing.rows.length > 0) continue;
    await db.execute(
      sql`INSERT INTO public.categories (name, tone) VALUES (${cat.name}, ${cat.tone})`,
    );
  }
  console.log("Seeded default categories.");
}

async function main() {
  console.log("Ensuring role function...");
  await ensureRoleFunction();
  console.log("Enabling RLS...");
  await enableRls();
  console.log("Creating policies...");
  await createPolicies();
  console.log("Seeding admin user...");
  await seedAdminUser();
  console.log("Seeding categories...");
  await seedCategories();
  console.log("Bootstrap complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

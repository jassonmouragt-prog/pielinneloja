import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db, schema } from "@/db/client";
import { and, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/auth-middleware";

export const listExpenses = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((data: unknown) =>
    z
      .object({
        from: z.string().optional(),
        to: z.string().optional(),
        type: z
          .enum(["funcionaria", "fornecedores", "agua", "luz", "internet", "aluguel", "marketing", "impostos", "outros"])
          .optional(),
        limit: z.number().int().positive().max(500).optional(),
      })
      .optional()
      .parse(data),
  )
  .handler(async ({ data }) => {
    const conds = [];
    if (data?.from) conds.push(gte(schema.expenses.expenseDate, new Date(data.from)));
    if (data?.to) conds.push(lte(schema.expenses.expenseDate, new Date(data.to)));
    if (data?.type) conds.push(eq(schema.expenses.type, data.type));

    const rows = await db
      .select()
      .from(schema.expenses)
      .where(conds.length > 0 ? and(...conds) : undefined)
      .orderBy(desc(schema.expenses.expenseDate))
      .limit(data?.limit ?? 200);

    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      description: r.description,
      amount: Number(r.amount),
      expenseDate: r.expenseDate?.toISOString() ?? null,
      notes: r.notes,
      createdAt: r.createdAt?.toISOString() ?? null,
    }));
  });

export const createExpense = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((data: unknown) =>
    z
      .object({
        type: z.enum(["funcionaria", "fornecedores", "agua", "luz", "internet", "aluguel", "marketing", "impostos", "outros"]),
        description: z.string().min(2, "Descrição obrigatória").max(255),
        amount: z.number().positive("Valor deve ser maior que zero"),
        expenseDate: z.string().optional(),
        notes: z.string().max(500).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const inserted = await db
      .insert(schema.expenses)
      .values({
        type: data.type,
        description: data.description,
        amount: data.amount.toString(),
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
        notes: data.notes ?? null,
      })
      .returning();
    const created = inserted[0];
    if (!created) throw new Error("Falha ao criar despesa");
    return {
      id: created.id,
      type: created.type,
      description: created.description,
      amount: Number(created.amount),
      expenseDate: created.expenseDate?.toISOString() ?? null,
      notes: created.notes,
    };
  });

export const deleteExpense = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    await db.delete(schema.expenses).where(eq(schema.expenses.id, data.id));
    return { success: true };
  });

export const getExpensesSummary = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .validator((data: unknown) =>
    z
      .object({
        from: z.string().optional(),
        to: z.string().optional(),
      })
      .optional()
      .parse(data),
  )
  .handler(async ({ data }) => {
    const conds = [];
    if (data?.from) conds.push(gte(schema.expenses.expenseDate, new Date(data.from)));
    if (data?.to) conds.push(lte(schema.expenses.expenseDate, new Date(data.to)));

    const rows = await db
      .select({
        type: schema.expenses.type,
        total: sum(schema.expenses.amount).as("total"),
        count: sql<number>`count(*)::int`.as("count"),
      })
      .from(schema.expenses)
      .where(conds.length > 0 ? and(...conds) : undefined)
      .groupBy(schema.expenses.type);

    return rows.map((r) => ({
      type: r.type,
      total: Number(r.total ?? 0),
      count: Number(r.count ?? 0),
    }));
  });

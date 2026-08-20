import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Authenticated server functions: the middleware injects `context.supabase`
// (RLS as the signed-in user). Never import the browser supabase client or
// client.server at module scope of a *.functions.ts file.
export const getAdminProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleData?.role !== 'admin') return null;

    const { data: { user } } = await supabase.auth.getUser();
    return { user, role: roleData.role };
  });

export const updateProductStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => z.object({
    productId: z.string(),
    quantity: z.number(),
    type: z.string(),
    notes: z.string().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { productId, quantity, type, notes } = data;
    const { supabase } = context;
    
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .single();

    if (!product) throw new Error("Product not found");

    const currentStock = product.stock_quantity ?? 0;
    const newStock = currentStock + quantity;

    const { error: updateError } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', productId);

    if (updateError) throw updateError;

    const { error: movementError } = await supabase
      .from('stock_movements')
      .insert({
        product_id: productId,
        quantity,
        type,
        notes: notes ?? null
      });

    if (movementError) throw movementError;

    return { success: true, newStock };
  });

import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const getAdminProfile = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'admin') return null;

    return { user, role: roleData.role };
  });

export const updateProductStock = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({
    productId: z.string(),
    quantity: z.number(),
    type: z.string(),
    notes: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    const { productId, quantity, type, notes } = data;
    
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

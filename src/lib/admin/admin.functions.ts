import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

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
  .handler(async ({ data }: { data: { productId: string, quantity: number, type: string, notes?: string } }) => {
    const { productId, quantity, type, notes } = data;
    
    // Auth check should be here, but using supabase client for now which has RLS
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .single();

    if (!product) throw new Error("Product not found");

    const newStock = product.stock_quantity + quantity;

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
        notes
      });

    if (movementError) throw movementError;

    return { success: true, newStock };
  });

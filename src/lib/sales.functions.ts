import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

export const registerPendingSale = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({
    totalAmount: z.number(),
    whatsappMessage: z.string(),
    items: z.array(z.object({
      productId: z.string(),
      quantity: z.number(),
      price: z.number()
    }))
  }).parse(data))
  .handler(async ({ data }) => {
    const { totalAmount, whatsappMessage, items } = data;

    const { data: sale, error: saleError } = await supabaseAdmin
      .from('sales')
      .insert({
        total_amount: totalAmount,
        status: 'pending',
        whatsapp_message: whatsappMessage
      })
      .select()
      .single();

    if (saleError) throw saleError;

    const saleItems = items.map(item => ({
      sale_id: sale.id,
      product_id: item.productId,
      quantity: item.quantity,
      price_at_sale: item.price
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) throw itemsError;

    return { success: true, saleId: sale.id };
  });

export const updateSaleStatus = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({
    saleId: z.string(),
    status: z.enum(['confirmed', 'cancelled', 'pending'])
  }).parse(data))
  .handler(async ({ data }) => {
    const { saleId, status } = data;

    const { data: sale, error: saleError } = await supabaseAdmin
      .from('sales')
      .update({ status })
      .eq('id', saleId)
      .select(`
        *,
        sale_items (product_id, quantity)
      `)
      .single();

    if (saleError) throw saleError;

    if (status === 'confirmed' && sale.sale_items) {
      for (const item of sale.sale_items) {
        if (!item.product_id) continue;

        await supabaseAdmin
          .from('stock_movements')
          .insert({
            product_id: item.product_id,
            sale_id: sale.id,
            quantity: -item.quantity,
            type: 'sale',
            notes: `Venda confirmada via Admin`
          });

        const { data: product } = await supabaseAdmin
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single();
        
        if (product) {
          await supabaseAdmin
            .from('products')
            .update({ stock_quantity: (product.stock_quantity || 0) - item.quantity })
            .eq('id', item.product_id);
        }
      }
    }

    return { success: true };
  });

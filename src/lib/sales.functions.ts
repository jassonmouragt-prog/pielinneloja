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

    // 1. Create sale record using supabaseAdmin to bypass RLS for public checkout
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

    // 2. Create sale items
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

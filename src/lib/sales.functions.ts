import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
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

    // 1. Create sale record
    const { data: sale, error: saleError } = await supabase
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

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) throw itemsError;

    return { success: true, saleId: sale.id };
  });

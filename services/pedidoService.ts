import { CreateOrderInputSchema } from '../schemas/order.schema';
import { supabase } from './supabase';

export const createOrder = async (orderInput: unknown) => {
  // 1. Valida os dados na entrada usando o schema do Zod
  const validatedData = CreateOrderInputSchema.parse(orderInput);

  // 2. Tenta inserir o pedido validado no banco Supabase
  const { data, error } = await supabase
    .from('orders')
    .insert([
      {
        customer_name: validatedData.customerName,
        coupon: validatedData.coupon,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};
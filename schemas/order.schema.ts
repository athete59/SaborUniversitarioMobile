import { z } from 'zod';

export const CreateOrderInputSchema = z.object({
  customerName: z.string().min(1, 'O nome do cliente é obrigatório'),
  items: z.array(
    z.object({
      productId: z.string().uuid('ID do produto inválido'),
      quantity: z.number().int().positive(),
      price: z.number().int().positive(),
    })
  ).min(1, 'O pedido deve ter pelo menos um item'),
  coupon: z.string().optional(),
}).strict();
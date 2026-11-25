import { describe, expect, it, vi } from 'vitest';
import { createOrder } from '../../services/pedidoService';
import { supabase } from '../../services/supabase';
import { buildOrderInput } from '../factories/order.factory';

// Simula a resposta do Supabase sem bater no banco real
vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: { id: 'uuid-1234', customer_name: 'Teste' },
            error: null,
          }),
        })),
      })),
    })),
  },
}));

describe('Integração: PedidoService com Supabase', () => {
  it('deve chamar o banco com os dados validados e retornar o pedido criado', async () => {
    // 1. Arrange: gera um payload válido com a factory
    const payload = buildOrderInput();

    // 2. Act: chama a função do serviço
    const result = await createOrder(payload);

    // 3. Assert: verifica se o objeto retornado contém o ID esperado e se o Supabase foi acionado
    expect(result).toHaveProperty('id', 'uuid-1234');
    expect(supabase.from).toHaveBeenCalledWith('orders');
  });
});
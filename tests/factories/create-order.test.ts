import { describe, expect, it } from 'vitest';
import { CreateOrderInputSchema } from '../../schemas/order.schema';
import { buildOrderInput } from '../factories/order.factory';

describe('Integração: Validação de Pedidos', () => {
  it('deve validar um pedido gerado dinamicamente pela factory com sucesso', () => {
    // 1. Arrange (Preparação): gera um payload aleatório usando a nossa factory
    const orderData = buildOrderInput();

    // 2. Act (Ação): executa a validação do schema do Zod
    const validationResult = CreateOrderInputSchema.safeParse(orderData);

    // 3. Assert (Verificação): confirma se o contrato foi respeitado
    expect(validationResult.success).toBe(true);
  });

  it('deve rejeitar um pedido com dados inválidos ou campos estranhos', () => {
    // Arrange: gera um payload inválido adicionando um campo não permitido
    const invalidOrder = buildOrderInput({
      campoNaoAutorizado: 'tentativa_de_injecao',
    });

    // Act: tenta validar o schema
    const validationResult = CreateOrderInputSchema.safeParse(invalidOrder);

    // Assert: garante que o Zod bloqueou devido ao .strict()
    expect(validationResult.success).toBe(false);
  });
});
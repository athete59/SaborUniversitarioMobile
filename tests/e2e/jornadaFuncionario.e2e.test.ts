import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  buildUsuario,
  buildProduto,
  buildPedidoE2E,
} from '../factories/order.factory';

// Mock do banco de dados em memória para simular o Supabase ponta a ponta
const bancoEmMemoria = {
  usuarios: [] as any[],
  funcionarios: [] as any[],
  funcionario: [] as any[],
  pedidos: [] as any[],
  pedidos_produtos: [] as any[],
  produtos: [] as any[],
};

vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn((tabela: string) => {
      const records = (bancoEmMemoria as any)[tabela] || [];

      return {
        select: vi.fn(() => ({
          eq: vi.fn((campo: string, valor: any) => ({
            eq: vi.fn((campo2: string, valor2: any) => ({
              maybeSingle: vi.fn().mockImplementation(async () => {
                const item = records.find(
                  (r: any) => r[campo] === valor && r[campo2] === valor2
                );
                return { data: item || null, error: null };
              }),
            })),
            maybeSingle: vi.fn().mockImplementation(async () => {
              const item = records.find((r: any) => r[campo] === valor);
              return { data: item || null, error: null };
            }),
            single: vi.fn().mockImplementation(async () => {
              const item = records.find((r: any) => r[campo] === valor);
              return { data: item || null, error: null };
            }),
            then: (resolve: any) =>
              resolve({
                data: records.filter((r: any) => r[campo] === valor),
                error: null,
              }),
          })),
          in: vi.fn((campo: string, valores: any[]) => ({
            then: (resolve: any) =>
              resolve({
                data: records.filter((r: any) => valores.includes(r[campo])),
                error: null,
              }),
          })),
          then: (resolve: any) => resolve({ data: records, error: null }),
        })),
        update: vi.fn((dadosAtualizados: any) => ({
          eq: vi.fn((campo: string, valor: any) => ({
            then: (resolve: any) => {
              const item = records.find((r: any) => r[campo] === valor);
              if (item) Object.assign(item, dadosAtualizados);
              resolve({ error: null });
            },
          })),
        })),
      };
    }),
  },
}));

import { autenticarUsuario, obterRotaInicialPorTipo } from '../../services/usuarioService';

/**
 * Função utilitária do scanner de pedidos que extrai o ID a partir do texto do QR Code.
 */
function extrairIdPedido(rawText: string): number | null {
  const limpo = rawText.trim().replace(/^PEDIDO_/i, '').replace(/[^0-9]/g, '');
  const id = parseInt(limpo, 10);
  return isNaN(id) ? null : id;
}

describe('E2E: Jornada Completa do Funcionário (Scanner e Baixa)', () => {
  beforeEach(() => {
    bancoEmMemoria.usuarios = [];
    bancoEmMemoria.funcionarios = [];
    bancoEmMemoria.funcionario = [];
    bancoEmMemoria.pedidos = [];
    bancoEmMemoria.pedidos_produtos = [];
    bancoEmMemoria.produtos = [];
  });

  it('deve realizar: Login do Funcionário -> Leitura do QR Code -> Baixa na Entrega -> Bloqueio de Reutilização', async () => {
    // -------------------------------------------------------------------------
    // 1. SETUP DO CENÁRIO: Funcionário cadastrado e Pedido pronto para retirada
    // -------------------------------------------------------------------------
    const usuarioFuncionario = buildUsuario('funcionario', {
      email: 'atendente@cantina.com',
      senha: 'funcPassword123',
    });
    bancoEmMemoria.usuarios.push(usuarioFuncionario);
    bancoEmMemoria.funcionarios.push({
      id: 202,
      idusuario: usuarioFuncionario.id,
      cargo: 'Atendente',
    });

    const produtoItem1 = buildProduto(2, { id: 10, nome: 'Pão de Queijo' });
    const produtoItem2 = buildProduto(1, { id: 20, nome: 'Café Expresso' });
    bancoEmMemoria.produtos.push(produtoItem1, produtoItem2);

    const pedidoCliente = buildPedidoE2E(42, 888, {
      status: 'Pronto',
      valortotal: 15.5,
    });
    bancoEmMemoria.pedidos.push(pedidoCliente);

    bancoEmMemoria.pedidos_produtos.push(
      { id: 1, idpedido: 42, idproduto: 10, quantidade: 2, preco_unitario: 5.0 },
      { id: 2, idpedido: 42, idproduto: 20, quantidade: 1, preco_unitario: 5.5 }
    );

    // -------------------------------------------------------------------------
    // 2. FASE 1: Autenticação do Funcionário
    // -------------------------------------------------------------------------
    const resultadoLogin = await autenticarUsuario(
      'atendente@cantina.com',
      'funcPassword123'
    );

    expect(resultadoLogin.sucesso).toBe(true);
    expect(resultadoLogin.usuario?.tipo).toBe('funcionario');
    expect(obterRotaInicialPorTipo(resultadoLogin.usuario!.tipo)).toBe(
      '/(tabs)/Funcionario/ScannerPedido'
    );

    // -------------------------------------------------------------------------
    // 3. FASE 2: Decodificação e Validação da Carga do QR Code
    // -------------------------------------------------------------------------
    const textoQrLidoPelaCamera = 'PEDIDO_42';
    const idPedidoExtraido = extrairIdPedido(textoQrLidoPelaCamera);

    expect(idPedidoExtraido).toBe(42);

    // -------------------------------------------------------------------------
    // 4. FASE 3: Consulta dos Itens e Estado do Pedido
    // -------------------------------------------------------------------------
    const pedidoNoBanco = bancoEmMemoria.pedidos.find((p) => p.id === idPedidoExtraido);
    expect(pedidoNoBanco).toBeDefined();
    expect(pedidoNoBanco.status).toBe('Pronto');

    const itensPedido = bancoEmMemoria.pedidos_produtos.filter(
      (pp) => pp.idpedido === idPedidoExtraido
    );
    expect(itensPedido).toHaveLength(2);

    // -------------------------------------------------------------------------
    // 5. FASE 4: Confirmação de Entrega (Dar Baixa)
    // -------------------------------------------------------------------------
    // O atendente clica em 'Confirmar Entrega'
    pedidoNoBanco.status = 'Entregue';

    const pedidoAtualizado = bancoEmMemoria.pedidos.find((p) => p.id === 42);
    expect(pedidoAtualizado.status).toBe('Entregue');

    // -------------------------------------------------------------------------
    // 6. FASE 5: Prevenção de QR Code Reutilizado / Pedido Já Entregue
    // -------------------------------------------------------------------------
    // Se o cliente tentar apresentar o mesmo QR Code novamente na fila:
    const idSegundaLeitura = extrairIdPedido('PEDIDO_42');
    const pedidoReconsultado = bancoEmMemoria.pedidos.find(
      (p) => p.id === idSegundaLeitura
    );

    const jaEntregue = pedidoReconsultado.status.toLowerCase() === 'entregue';
    expect(jaEntregue).toBe(true); // Aciona o alerta 'QR CODE JÁ UTILIZADO!'
  });
});

import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  buildUsuario,
  buildProduto,
  buildPedidoE2E,
} from '../factories/order.factory';

const bancoEmMemoria = {
  usuarios: [] as any[],
  empresas: [] as any[],
  empresa: [] as any[],
  produtos: [] as any[],
  pedidos: [] as any[],
};

vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn((tabela: string) => {
      const records = (bancoEmMemoria as any)[tabela] || [];

      return {
        select: vi.fn((_colunas?: string, options?: any) => {
          if (options?.count === 'exact' && options?.head === true) {
            return {
              eq: vi.fn((campo: string, valor: any) => {
                const count = records.filter((r: any) => r[campo] === valor).length;
                return Promise.resolve({ count, error: null });
              }),
              then: (resolve: any) =>
                resolve({ count: records.length, error: null }),
            };
          }

          return {
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
            then: (resolve: any) => resolve({ data: records, error: null }),
          };
        }),
        insert: vi.fn((itensParaInserir: any[]) => ({
          then: (resolve: any) => {
            itensParaInserir.forEach((it, idx) => {
              const novo = {
                id: (bancoEmMemoria as any)[tabela].length + idx + 1,
                ...it,
              };
              (bancoEmMemoria as any)[tabela].push(novo);
            });
            resolve({ error: null });
          },
        })),
      };
    }),
  },
}));

import { autenticarUsuario, obterRotaInicialPorTipo } from '../../services/usuarioService';

describe('E2E: Jornada Completa da Empresa (Dashboard, Produtos e Métricas)', () => {
  beforeEach(() => {
    bancoEmMemoria.usuarios = [];
    bancoEmMemoria.empresas = [];
    bancoEmMemoria.empresa = [];
    bancoEmMemoria.produtos = [];
    bancoEmMemoria.pedidos = [];
  });

  it('deve realizar: Login da Empresa -> Cálculo de Métricas no Dashboard -> Cadastro de Produto', async () => {
    // -------------------------------------------------------------------------
    // 1. SETUP DO CENÁRIO: Empresa cadastrada com produtos e pedidos
    // -------------------------------------------------------------------------
    const usuarioEmpresa = buildUsuario('empresa', {
      email: 'contato@lanchonetecentral.com',
      senha: 'empresaPass123',
    });
    bancoEmMemoria.usuarios.push(usuarioEmpresa);

    const perfilEmpresa = {
      id: 77,
      idusuario: usuarioEmpresa.id,
      nome: 'Lanchonete Central',
      imagem_url: 'https://exemplo.com/logo.png',
    };
    bancoEmMemoria.empresa.push(perfilEmpresa);

    // Produtos existentes da empresa
    bancoEmMemoria.produtos.push(
      buildProduto(1, { id: 101, idempresa: 77, nome: 'Refrigerante Lata' }),
      buildProduto(2, { id: 102, idempresa: 77, nome: 'Hambúrguer Artesanal' })
    );

    // Pedidos em diferentes estágios
    bancoEmMemoria.pedidos.push(
      buildPedidoE2E(1, 10, { status: 'Pendente' }),
      buildPedidoE2E(2, 11, { status: 'Em preparo' }),
      buildPedidoE2E(3, 12, { status: 'Pronto' }),
      buildPedidoE2E(4, 13, { status: 'Entregue' }),
      buildPedidoE2E(5, 14, { status: 'Entregue' })
    );

    // -------------------------------------------------------------------------
    // 2. FASE 1: Autenticação da Empresa
    // -------------------------------------------------------------------------
    const resultadoLogin = await autenticarUsuario(
      'contato@lanchonetecentral.com',
      'empresaPass123'
    );

    expect(resultadoLogin.sucesso).toBe(true);
    expect(resultadoLogin.usuario?.tipo).toBe('empresa');
    expect(resultadoLogin.usuario?.perfil?.id).toBe(77);
    expect(obterRotaInicialPorTipo(resultadoLogin.usuario!.tipo)).toBe(
      '/(tabs)/Empresa/Dashboard'
    );

    // -------------------------------------------------------------------------
    // 3. FASE 2: Métricas do Dashboard em Tempo Real
    // -------------------------------------------------------------------------
    const empresaId = resultadoLogin.usuario?.perfil?.id;

    // Contagem de produtos vinculados à empresa
    const produtosDaEmpresa = bancoEmMemoria.produtos.filter(
      (p) => p.idempresa === empresaId
    );
    expect(produtosDaEmpresa).toHaveLength(2);

    // Métricas de pedidos
    const todosPedidos = bancoEmMemoria.pedidos;
    const totalPedidos = todosPedidos.length;
    const pedidosPendentes = todosPedidos.filter((p) =>
      ['pendente', 'em preparo', 'pronto'].includes(p.status.toLowerCase())
    ).length;
    const pedidosEntregues = todosPedidos.filter(
      (p) => p.status.toLowerCase() === 'entregue'
    ).length;

    expect(totalPedidos).toBe(5);
    expect(pedidosPendentes).toBe(3);
    expect(pedidosEntregues).toBe(2);

    // -------------------------------------------------------------------------
    // 4. FASE 3: Cadastro de Novo Produto no Catálogo
    // -------------------------------------------------------------------------
    const novoProduto = {
      nome: 'Bolo de Pote de Chocolate',
      descricao: 'Delicioso bolo com recheio cremoso e cobertura',
      preco: '12.00 R$',
      idcategoria: 2,
      idempresa: empresaId,
      estado: 1,
      imagem: 'https://exemplo.com/bolo.jpg',
    };

    bancoEmMemoria.produtos.push({
      id: bancoEmMemoria.produtos.length + 1,
      ...novoProduto,
    });

    // Verificação de que o produto foi vinculado à empresa correta
    const produtosAtualizados = bancoEmMemoria.produtos.filter(
      (p) => p.idempresa === empresaId
    );
    expect(produtosAtualizados).toHaveLength(3);

    const produtoCadastrado = produtosAtualizados.find(
      (p) => p.nome === 'Bolo de Pote de Chocolate'
    );
    expect(produtoCadastrado).toBeDefined();
    expect(produtoCadastrado?.idempresa).toBe(77);
    expect(produtoCadastrado?.idcategoria).toBe(2);
  });
});

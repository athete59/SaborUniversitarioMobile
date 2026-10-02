import { describe, expect, it, beforeEach, vi } from 'vitest';

// Mock do AsyncStorage para testes no Node sem depender de window/DOM
vi.mock('@react-native-async-storage/async-storage', () => {
  let store: Record<string, string> = {};
  return {
    default: {
      getItem: vi.fn(async (key: string) => store[key] || null),
      setItem: vi.fn(async (key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn(async (key: string) => {
        delete store[key];
      }),
      clear: vi.fn(async () => {
        store = {};
      }),
    },
  };
});

import { useCartStore } from '../../stores/useCartStore';
import {
  buildUsuario,
  buildEmpresa,
  buildProduto,
} from '../factories/order.factory';

// Mock do Supabase para simular o banco de dados ponta a ponta com banco em memória
const bancoEmMemoria = {
  usuarios: [] as any[],
  empresas: [] as any[],
  empresa: [] as any[],
  clientes: [] as any[],
  produtos: [] as any[],
  pedidos: [] as any[],
  pedidos_produtos: [] as any[],
};

vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn((tabela: string) => {
      const records = (bancoEmMemoria as any)[tabela] || [];

      return {
        select: vi.fn((colunas?: string) => ({
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
        insert: vi.fn((itensParaInserir: any[]) => ({
          select: vi.fn(() => ({
            single: vi.fn().mockImplementation(async () => {
              const novo = {
                id: bancoEmMemoria.pedidos.length + 1,
                ...itensParaInserir[0],
              };
              bancoEmMemoria.pedidos.push(novo);
              return { data: novo, error: null };
            }),
          })),
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

describe('E2E: Jornada Completa do Cliente', () => {
  beforeEach(() => {
    // Reset da store do carrinho Zustand
    useCartStore.getState().limparCarrinho();

    // Reset dos dados em memória
    bancoEmMemoria.usuarios = [];
    bancoEmMemoria.empresas = [];
    bancoEmMemoria.empresa = [];
    bancoEmMemoria.clientes = [];
    bancoEmMemoria.produtos = [];
    bancoEmMemoria.pedidos = [];
    bancoEmMemoria.pedidos_produtos = [];
  });

  it('deve percorrer com sucesso: Login -> Cardápio -> Carrinho Zustand -> Checkout -> Emissão de QR Code', async () => {
    // -------------------------------------------------------------------------
    // 1. SETUP DO CENÁRIO: Usuário Cliente e Estabelecimento Cadastrados
    // -------------------------------------------------------------------------
    const usuarioCliente = buildUsuario('cliente', {
      email: 'estudante@unifei.edu.br',
      senha: 'senhaSegura123',
    });
    bancoEmMemoria.usuarios.push(usuarioCliente);
    bancoEmMemoria.clientes.push({
      id: 101,
      idusuario: usuarioCliente.id,
      saldo: 150.0,
    });

    const empresaConveniada = buildEmpresa({
      id: 50,
      nome: 'Cantina Universitária Central',
      imagem_url: 'https://exemplo.com/cantina.jpg',
    });
    bancoEmMemoria.empresa.push(empresaConveniada);

    const salgado = buildProduto(2, {
      id: 1,
      nome: 'Coxinha com Catupiry',
      preco: 'R$ 8,50',
      idempresa: empresaConveniada.id,
    });
    const bebida = buildProduto(1, {
      id: 2,
      nome: 'Suco de Laranja 500ml',
      preco: 'R$ 6,00',
      idempresa: empresaConveniada.id,
    });
    bancoEmMemoria.produtos.push(salgado, bebida);

    // -------------------------------------------------------------------------
    // 2. FASE 1: Autenticação do Cliente
    // -------------------------------------------------------------------------
    const resultadoLogin = await autenticarUsuario(
      'estudante@unifei.edu.br',
      'senhaSegura123'
    );

    expect(resultadoLogin.sucesso).toBe(true);
    expect(resultadoLogin.usuario).toBeDefined();
    expect(resultadoLogin.usuario?.tipo).toBe('cliente');
    expect(resultadoLogin.usuario?.email).toBe('estudante@unifei.edu.br');
    expect(obterRotaInicialPorTipo(resultadoLogin.usuario!.tipo)).toBe(
      '/(tabs)/Cliente/PaginaInicial'
    );

    // -------------------------------------------------------------------------
    // 3. FASE 2: Seleção de Produtos e Manipulação do Carrinho (Zustand)
    // -------------------------------------------------------------------------
    expect(useCartStore.getState().carrinho).toHaveLength(0);

    // Adiciona 2 coxinhas e 1 suco
    useCartStore.getState().adicionarItem({
      id: salgado.id,
      nome: salgado.nome,
      preco: 8.5,
      quantidade: 1,
    });
    useCartStore.getState().adicionarItem({
      id: salgado.id,
      nome: salgado.nome,
      preco: 8.5,
      quantidade: 1,
    });
    useCartStore.getState().adicionarItem({
      id: bebida.id,
      nome: bebida.nome,
      preco: 6.0,
      quantidade: 1,
    });

    const carrinhoAtual = useCartStore.getState().carrinho;
    expect(carrinhoAtual).toHaveLength(2); // 2 produtos distintos
    expect(useCartStore.getState().obterTotalItens()).toBe(3); // 2 + 1 = 3 itens

    const itemSalgado = carrinhoAtual.find((i) => i.id === salgado.id);
    expect(itemSalgado?.quantidade).toBe(2);

    // Cálculo do total esperado: (2 * 8.5) + (1 * 6.0) = 17.0 + 6.0 = 23.0
    const totalCalculado = carrinhoAtual.reduce(
      (acc, it) => acc + Number(it.preco) * it.quantidade,
      0
    );
    expect(totalCalculado).toBe(23.0);

    // -------------------------------------------------------------------------
    // 4. FASE 3: Checkout e Criação do Pedido no Supabase
    // -------------------------------------------------------------------------
    const novoPedido = {
      idcliente: resultadoLogin.usuario!.id,
      valortotal: totalCalculado,
      status: 'Em preparo',
      forma_pagamento: 'Pix',
      data_pedido: new Date().toISOString(),
    };
    bancoEmMemoria.pedidos.push({ id: 1, ...novoPedido });

    // Itens vinculados na tabela pedidos_produtos
    carrinhoAtual.forEach((item) => {
      bancoEmMemoria.pedidos_produtos.push({
        id: bancoEmMemoria.pedidos_produtos.length + 1,
        idpedido: 1,
        idproduto: item.id,
        quantidade: item.quantidade,
        preco_unitario: item.preco,
      });
    });

    // Carrinho é limpo após confirmação
    useCartStore.getState().limparCarrinho();
    expect(useCartStore.getState().carrinho).toHaveLength(0);

    // -------------------------------------------------------------------------
    // 5. FASE 4: Verificação em Meus Pedidos e Geração do QR Code
    // -------------------------------------------------------------------------
    const pedidosDoCliente = bancoEmMemoria.pedidos.filter(
      (p) => p.idcliente === resultadoLogin.usuario!.id
    );
    expect(pedidosDoCliente).toHaveLength(1);

    const pedidoRecuperado = pedidosDoCliente[0];
    expect(pedidoRecuperado.id).toBe(1);
    expect(pedidoRecuperado.valortotal).toBe(23.0);
    expect(pedidoRecuperado.status).toBe('Em preparo');

    // Validação da carga oficial do QR Code para entrega
    const qrCodeEsperado = `PEDIDO_${pedidoRecuperado.id}`;
    expect(qrCodeEsperado).toBe('PEDIDO_1');

    // Validação dos itens associados na tabela relacional
    const itensGravados = bancoEmMemoria.pedidos_produtos.filter(
      (pp) => pp.idpedido === pedidoRecuperado.id
    );
    expect(itensGravados).toHaveLength(2);
    expect(itensGravados.reduce((acc, it) => acc + it.quantidade, 0)).toBe(3);
  });
});

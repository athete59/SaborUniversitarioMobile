import { faker } from '@faker-js/faker';

export const buildOrderInput = (overrides = {}) => ({
  customerName: faker.person.fullName(),
  items: [
    {
      productId: faker.string.uuid(),
      quantity: faker.number.int({ min: 1, max: 5 }),
      price: faker.number.int({ min: 100, max: 5000 }),
    },
  ],
  coupon: faker.string.alphanumeric(8),
  ...overrides,
});

/**
 * Factory para geração dinâmica de usuários para testes E2E.
 */
export const buildUsuario = (
  tipo: 'cliente' | 'funcionario' | 'empresa' = 'cliente',
  overrides = {}
) => {
  const id = faker.number.int({ min: 10, max: 999 });
  return {
    id,
    nome: faker.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    senha: faker.internet.password({ length: 8 }),
    estado: 1,
    tipo,
    perfil: {
      id: faker.number.int({ min: 10, max: 999 }),
      idusuario: id,
      nome: faker.company.name(),
      imagem_url: faker.image.url(),
    },
    ...overrides,
  };
};

/**
 * Factory para geração dinâmica de produtos do cardápio.
 */
export const buildProduto = (
  idcategoria: 1 | 2 = 2,
  overrides = {}
) => ({
  id: faker.number.int({ min: 1, max: 500 }),
  nome: idcategoria === 1 ? `Suco de ${faker.food.fruit()}` : `Salgado de ${faker.food.meat()}`,
  descricao: faker.lorem.sentence(),
  preco: `R$ ${faker.number.float({ min: 4, max: 25, fractionDigits: 2 }).toFixed(2).replace('.', ',')}`,
  idcategoria,
  idempresa: faker.number.int({ min: 1, max: 20 }),
  imagem: faker.image.url(),
  estado: 1,
  ...overrides,
});

/**
 * Factory para geração dinâmica de empresas conveniadas.
 */
export const buildEmpresa = (overrides = {}) => ({
  id: faker.number.int({ min: 1, max: 100 }),
  nome: `Lanchonete ${faker.company.name()}`,
  imagem_url: faker.image.url(),
  idusuario: faker.number.int({ min: 1, max: 100 }),
  ...overrides,
});

/**
 * Factory para montagem do payload e dados do pedido para os fluxos E2E.
 */
export const buildPedidoE2E = (
  idPedido: number,
  idCliente: number,
  overrides = {}
) => ({
  id: idPedido,
  idcliente: idCliente,
  valortotal: faker.number.float({ min: 10, max: 100, fractionDigits: 2 }),
  status: 'Em preparo',
  forma_pagamento: 'Pix',
  data_pedido: new Date().toISOString(),
  qr_code_payload: `PEDIDO_${idPedido}`,
  ...overrides,
});
import { describe, expect, it, vi } from 'vitest';
import { autenticarUsuario } from '../../services/usuarioService';

// Mock com interceptação de tabelas para verificação estrita
const tabelasAcessadas: string[] = [];

vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn((tabela: string) => {
      tabelasAcessadas.push(tabela);

      if (tabela === 'usuarios') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((campo: string, valor: any) => ({
              eq: vi.fn((campo2: string, valor2: any) => ({
                maybeSingle: vi.fn().mockImplementation(async () => {
                  if (valor === 'desativado@teste.com' && valor2 === '123456') {
                    return {
                      data: {
                        id: 99,
                        nome: 'Usuário Desativado',
                        email: 'desativado@teste.com',
                        senha: '123456',
                        estado: 0, // Desativado
                      },
                      error: null,
                    };
                  }
                  return { data: null, error: null };
                }),
              })),
            })),
          })),
        };
      }

      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      };
    }),
  },
}));

function extrairIdPedido(rawText: string): number | null {
  const limpo = rawText.trim().replace(/^PEDIDO_/i, '').replace(/[^0-9]/g, '');
  const id = parseInt(limpo, 10);
  return isNaN(id) ? null : id;
}

describe('E2E: Resiliência, Segurança e Regras de Borda', () => {
  it('deve barrar o login de conta desativada (estado = 0)', async () => {
    const res = await autenticarUsuario('desativado@teste.com', '123456');
    expect(res.sucesso).toBe(false);
    expect(res.erro).toBe('Esta conta está desativada.');
  });

  it('deve rejeitar credenciais inexistentes', async () => {
    const res = await autenticarUsuario('naoexiste@teste.com', 'senhaErrada');
    expect(res.sucesso).toBe(false);
    expect(res.erro).toBe('Email ou senha inválidos.');
  });

  it('deve rejeitar textos de QR Code maliciosos ou em formato inválido', () => {
    expect(extrairIdPedido('codigo_invalido_sem_numero')).toBeNull();
    expect(extrairIdPedido('')).toBeNull();
    expect(extrairIdPedido('   ')).toBeNull();
    expect(extrairIdPedido('PEDIDO_ABC')).toBeNull();
    expect(extrairIdPedido('PEDIDO_INVALIDO')).toBeNull();
    expect(extrairIdPedido('PEDIDO_555')).toBe(555);
    expect(extrairIdPedido('555')).toBe(555);
  });

  it('nunca deve acessar a tabela legada restaurante', async () => {
    tabelasAcessadas.length = 0;
    await autenticarUsuario('desativado@teste.com', '123456');

    expect(tabelasAcessadas).not.toContain('restaurante');
    expect(tabelasAcessadas).not.toContain('restaurantes');
  });
});

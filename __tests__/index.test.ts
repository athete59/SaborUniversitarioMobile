import { describe, expect, it, vi } from "vitest";

// Mock do supabase para que os testes rodem em ambiente Node sem depender de módulos nativos do React Native
vi.mock("../services/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import {
  obterRotaInicialPorTipo,
  autenticarUsuario,
  type TipoUsuario,
  type UsuarioAutenticado,
} from "../services/usuarioService";

describe("Validação de Regras de Login e Perfis", () => {
  // TESTE 1: Validar campos vazios
  it("Deve barrar o login se o e-mail ou senha estiverem vazios", async () => {
    const resultado = await autenticarUsuario("", "");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro).toBe("Preencha todos os campos obrigatórios.");
  });

  // TESTE 2: Validar rota de Empresa
  it("Deve redirecionar para Dashboard se o tipo de usuário for empresa", () => {
    const tipo: TipoUsuario = "empresa";
    const rota = obterRotaInicialPorTipo(tipo);
    expect(rota).toBe("/(tabs)/Empresa/Dashboard");
  });

  // TESTE 2.1: Validar rota de Funcionário
  it("Deve redirecionar para ScannerPedido se o tipo de usuário for funcionario", () => {
    const tipo: TipoUsuario = "funcionario";
    const rota = obterRotaInicialPorTipo(tipo);
    expect(rota).toBe("/(tabs)/Funcionario/ScannerPedido");
  });

  // TESTE 3: Validar rota de Cliente comum
  it("Deve redirecionar para PaginaInicial se o tipo de usuário for cliente", () => {
    const tipo: TipoUsuario = "cliente";
    const rota = obterRotaInicialPorTipo(tipo);
    expect(rota).toBe("/(tabs)/Cliente/PaginaInicial");
  });

  // TESTE 4: Garantir que UsuarioAutenticado não expõe o campo senha
  it("Objeto UsuarioAutenticado deve conter apenas dados seguros (sem senha)", () => {
    const mockUsuario: UsuarioAutenticado = {
      id: 1,
      nome: "Cliente Teste",
      email: "cliente@teste.com",
      tipo: "cliente",
      perfil: { id: 1, idusuario: 1 },
    };

    expect(mockUsuario).not.toHaveProperty("senha");
    expect(mockUsuario.tipo).toBe("cliente");
    expect(mockUsuario.nome).toBe("Cliente Teste");
  });

  // TESTE 5: Identificar perfil de Empresa com sucesso
  it("Deve autenticar e classificar como 'empresa' quando houver registro em empresas", async () => {
    const { supabase } = await import("../services/supabase");

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "usuarios") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: { id: 2, nome: "Restaurante Uni", email: "restaurante@teste.com", senha: "123", estado: 1 },
                  error: null,
                }),
              }),
            }),
          }),
        } as any;
      }
      if (table === "empresas" || table === "empresa") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: { id: 10, idusuario: 2, nome: "Restaurante Uni" },
                error: null,
              }),
            }),
          }),
        } as any;
      }
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      } as any;
    });

    const resultado = await autenticarUsuario("restaurante@teste.com", "123");
    expect(resultado.sucesso).toBe(true);
    expect(resultado.usuario?.tipo).toBe("empresa");
    expect(resultado.usuario?.nome).toBe("Restaurante Uni");
    expect(resultado.usuario?.perfil?.id).toBe(10);
    expect((resultado.usuario as any)?.senha).toBeUndefined();
  });
});
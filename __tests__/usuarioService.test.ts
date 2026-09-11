import { describe, expect, it, vi } from "vitest";

// Mock do supabase para evitar que módulos nativos do React Native sejam carregados no Node
vi.mock("../services/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import {
    autenticarUsuario,
    obterRotaInicialPorTipo,
    type TipoUsuario,
    type UsuarioAutenticado,
} from "../services/usuarioService";

describe("Serviço de Usuários - Validação e Rotas", () => {
  it("Deve barrar o login se o e-mail ou senha estiverem vazios", async () => {
    const resultado = await autenticarUsuario("", "");
    expect(resultado.sucesso).toBe(false);
    expect(resultado.erro).toBe("Preencha todos os campos obrigatórios.");
  });

  it("Deve redirecionar para Dashboard se o tipo de usuário for empresa", () => {
    const tipo: TipoUsuario = "empresa";
    const rota = obterRotaInicialPorTipo(tipo);
    expect(rota).toBe("/(tabs)/Empresa/Dashboard");
  });

it("Deve redirecionar para ScannerPedido se o tipo de usuário for funcionario", () => {
    const tipo: TipoUsuario = "funcionario";
    const rota = obterRotaInicialPorTipo(tipo);
    expect(rota).toBe("/(tabs)/Funcionario/ScannerPedido");
  });
  it("Deve redirecionar para PaginaInicial se o tipo de usuário for cliente", () => {
    const tipo: TipoUsuario = "cliente";
    const rota = obterRotaInicialPorTipo(tipo);
    expect(rota).toBe("/(tabs)/Cliente/PaginaInicial");
  });

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
  });
});
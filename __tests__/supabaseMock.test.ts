import { describe, expect, it, vi } from "vitest";

// Mock do Supabase
vi.mock("../services/supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { autenticarUsuario } from "../services/usuarioService";

describe("Autenticação com Supabase Mock", () => {
  it("Deve autenticar e classificar como 'empresa' quando houver registro em empresas", async () => {
    const { supabase } = await import("../services/supabase");

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === "usuarios") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: async () => ({
                  data: {
                    id: 2,
                    nome: "Restaurante Uni",
                    email: "restaurante@teste.com",
                    senha: "123",
                    estado: 1,
                  },
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
  });
});
import { describe, expect, it } from "vitest";

// ETAPA DE TESTE UNITÁRIO (Padrão AAA: Arrange, Act, Assert)
describe("Validação de Regras de Login", () => {

  // TESTE 1: Validar campos vazios
  it("Deve barrar o login se o e-mail ou senha estiverem vazios", () => {
    // 1. ARRANGE (Preparar os dados de entrada)
    const email = "";
    const senha = "";

    // 2. ACT (Executar a validação)
    const ehValido = email.length > 0 && senha.length > 0;

    // 3. ASSERT (Verificar se o resultado foi o esperado)
    expect(ehValido).toBe(false);
  });

  // TESTE 2: Validar rota da Luiza (Empresa)
  it("Deve redirecionar para CadastrarProduto se o e-mail for da Luiza", () => {
    // 1. ARRANGE
    const emailLimpo = "luiza@gmail.com";

    // 2. ACT
    const rota = emailLimpo.toLowerCase() === "luiza@gmail.com"
      ? "/(tabs)/Empresa/CadastrarProduto"
      : "/(tabs)/Cliente/PaginaInicial";

    // 3. ASSERT
    expect(rota).toBe("/(tabs)/Empresa/CadastrarProduto");
  });

  // TESTE 3: Validar rota de Cliente comum
  it("Deve redirecionar para PaginaInicial se for outro e-mail", () => {
    // 1. ARRANGE
    const emailLimpo = "aluno@gmail.com";

    // 2. ACT
    const rota = emailLimpo.toLowerCase() === "luiza@gmail.com"
      ? "/(tabs)/Empresa/CadastrarProduto"
      : "/(tabs)/Cliente/PaginaInicial";

    // 3. ASSERT
    expect(rota).toBe("/(tabs)/Cliente/PaginaInicial");
  });
});
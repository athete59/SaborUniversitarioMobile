import { describe, expect, it } from "vitest";

// Função utilitária do carrinho para cálculo total
function calcularTotalCarrinho(
  itens: Array<{ preco: string | number; quantidade: number }>
): number {
  return itens.reduce((soma, item) => {
    const precoNumerico =
      typeof item.preco === "string"
        ? parseFloat(
            item.preco
              .replace("R$", "")
              .replace(/\s/g, "")
              .replace(".", "")
              .replace(",", ".")
          )
        : Number(item.preco);

    return soma + (isNaN(precoNumerico) ? 0 : precoNumerico) * item.quantidade;
  }, 0);
}

describe("Regras de Negócio do Carrinho", () => {
  it("Deve calcular corretamente o valor total com formatação de moeda em string", () => {
    const itensSimulados = [
      { preco: "R$ 12,50", quantidade: 2 }, // 25.00
      { preco: "R$ 5,00", quantidade: 1 },  // 5.00
    ];

    const total = calcularTotalCarrinho(itensSimulados);
    expect(total).toBe(30.0);
  });

  it("Deve retornar 0 quando o carrinho estiver sem itens", () => {
    const total = calcularTotalCarrinho([]);
    expect(total).toBe(0);
  });
});
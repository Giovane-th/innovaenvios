import { describe, it, expect, beforeAll } from "vitest";
import { CorreiosAPIFinal } from "./correios-api-final";

describe("CorreiosAPIFinal - Integração com API Real (JWT Token)", () => {
  let client: CorreiosAPIFinal;

  beforeAll(() => {
    const token = process.env.CORREIOS_TOKEN;
    const cartaoPostagem = process.env.CORREIOS_CARTAO_POSTAGEM;
    const contrato = process.env.CORREIOS_CONTRATO;
    const codigoAdmin = process.env.CORREIOS_CODIGO_ADMIN;

    expect(token).toBeTruthy();
    expect(cartaoPostagem).toBeTruthy();
    expect(contrato).toBeTruthy();
    expect(codigoAdmin).toBeTruthy();

    // Usar ambiente de produção com token JWT
    client = new CorreiosAPIFinal(
      token!,
      "producao",
      cartaoPostagem,
      contrato,
      codigoAdmin
    );
  });

  it("deve buscar informações de CEP", async () => {
    try {
      // Testar com um CEP válido (Avenida Paulista, São Paulo)
      const cepResponse = await client.searchCEP("01310100");

      expect(cepResponse).toBeDefined();
      expect(cepResponse.cep).toBe("01310100");
      expect(cepResponse.end).toBeTruthy();

      console.log("✅ Busca de CEP bem-sucedida!");
      console.log(`CEP: ${cepResponse.cep}`);
      console.log(`Endereço: ${cepResponse.end}`);
      console.log(`Cidade: ${cepResponse.cidade}, ${cepResponse.uf}`);
    } catch (error) {
      console.error("❌ Erro na busca de CEP:", error);
      throw error;
    }
  });

  it("deve calcular frete entre dois CEPs", async () => {
    try {
      // Calcular frete de São Paulo para Rio de Janeiro
      const fretes = await client.calcularFrete(
        "01310100", // São Paulo
        "20040020", // Rio de Janeiro
        1000, // 1kg
        2,
        11,
        16
      );

      expect(fretes).toBeDefined();
      expect(Array.isArray(fretes)).toBe(true);
      expect(fretes.length).toBeGreaterThan(0);

      console.log("✅ Frete calculado com sucesso!");
      fretes.forEach((frete) => {
        console.log(
          `  - ${frete.nome}: R$ ${frete.valor.toFixed(2)} (${frete.prazo} dias)`
        );
      });
    } catch (error) {
      console.error("❌ Erro ao calcular frete:", error);
      throw error;
    }
  });

  it("deve calcular frete com serviços específicos", async () => {
    try {
      // Calcular apenas PAC e SEDEX
      const fretes = await client.calcularFrete(
        "01310100", // São Paulo
        "30130100", // Belo Horizonte
        500, // 500g
        2,
        11,
        16,
        ["04162", "04014"] // PAC e SEDEX
      );

      expect(fretes).toBeDefined();
      expect(fretes.length).toBeLessThanOrEqual(2);

      console.log("✅ Frete calculado com serviços específicos!");
      fretes.forEach((frete) => {
        console.log(
          `  - ${frete.nome}: R$ ${frete.valor.toFixed(2)} (${frete.prazo} dias)`
        );
      });
    } catch (error) {
      console.error("❌ Erro ao calcular frete:", error);
      throw error;
    }
  });
});

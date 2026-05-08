import { describe, it, expect, beforeAll } from "vitest";
import { CorreiosAPIClientV2 } from "./correios-api-v2";

describe("CorreiosAPIClientV2 - Integração com API Real", () => {
  let client: CorreiosAPIClientV2;

  beforeAll(() => {
    // Usar ambiente de produção com as credenciais reais
    client = new CorreiosAPIClientV2("producao");
  });

  it("deve autenticar com as credenciais fornecidas", async () => {
    const usuario = process.env.CORREIOS_LOGIN || "";
    const senha = process.env.CORREIOS_SENHA || "";

    expect(usuario).toBeTruthy();
    expect(senha).toBeTruthy();

    try {
      const response = await client.authenticate(usuario, senha);

      expect(response).toBeDefined();
      expect(response.token).toBeTruthy();
      expect(response.dataVigenciaFim).toBeTruthy();

      console.log("✅ Autenticação bem-sucedida!");
      console.log(`Token gerado: ${response.token.substring(0, 20)}...`);
      console.log(`Expira em: ${response.dataVigenciaFim}`);
    } catch (error) {
      console.error("❌ Erro na autenticação:", error);
      throw error;
    }
  });

  it("deve verificar se o token é válido", async () => {
    const usuario = process.env.CORREIOS_LOGIN || "";
    const senha = process.env.CORREIOS_SENHA || "";

    await client.authenticate(usuario, senha);
    const isValid = client.isTokenValid();

    expect(isValid).toBe(true);
    console.log("✅ Token validado com sucesso!");
  });

  it("deve buscar informações de CEP", async () => {
    const usuario = process.env.CORREIOS_LOGIN || "";
    const senha = process.env.CORREIOS_SENHA || "";

    await client.authenticate(usuario, senha);

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
    const usuario = process.env.CORREIOS_LOGIN || "";
    const senha = process.env.CORREIOS_SENHA || "";

    await client.authenticate(usuario, senha);

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
});

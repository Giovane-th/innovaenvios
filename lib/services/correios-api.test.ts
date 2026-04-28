import { describe, it, expect, beforeAll } from "vitest";
import { CorreiosAPIClient } from "./correios-api";

describe("CorreiosAPIClient - Autenticação", () => {
  let client: CorreiosAPIClient;

  beforeAll(() => {
    client = new CorreiosAPIClient("homologacao");
  });

  it("deve autenticar com as credenciais fornecidas", async () => {
    const cartaoPostagem = process.env.CORREIOS_CARTAO_POSTAGEM || "";
    const senha = process.env.CORREIOS_SENHA || "";

    expect(cartaoPostagem).toBeTruthy();
    expect(senha).toBeTruthy();

    try {
      const response = await client.authenticate(cartaoPostagem, senha);

      expect(response).toBeDefined();
      expect(response.token).toBeTruthy();
      expect(response.cartaoPostagem).toBeDefined();
      expect(response.ambiente).toBe("HOMOLOGACAO");

      console.log("✅ Autenticação bem-sucedida!");
      console.log(`Token gerado: ${response.token.substring(0, 20)}...`);
      console.log(`Expira em: ${response.expiraEm}`);
    } catch (error) {
      console.error("❌ Erro na autenticação:", error);
      throw error;
    }
  });

  it("deve verificar se o token é válido", async () => {
    const cartaoPostagem = process.env.CORREIOS_CARTAO_POSTAGEM || "";
    const senha = process.env.CORREIOS_SENHA || "";

    const response = await client.authenticate(cartaoPostagem, senha);
    const isValid = client.isTokenValid();

    expect(isValid).toBe(true);
    console.log("✅ Token validado com sucesso!");
  });

  it("deve buscar informações de CEP", async () => {
    const cartaoPostagem = process.env.CORREIOS_CARTAO_POSTAGEM || "";
    const senha = process.env.CORREIOS_SENHA || "";

    await client.authenticate(cartaoPostagem, senha);

    try {
      // Testar com um CEP válido (Avenida Paulista, São Paulo)
      const cepResponse = await client.searchCEP("01310100");

      expect(cepResponse).toBeDefined();
      expect(cepResponse.cep).toBe("01310100");
      expect(cepResponse.end).toBeTruthy();
      expect(cepResponse.cidade).toBe("São Paulo");

      console.log("✅ Busca de CEP bem-sucedida!");
      console.log(`CEP: ${cepResponse.cep}`);
      console.log(`Endereço: ${cepResponse.end}`);
      console.log(`Cidade: ${cepResponse.cidade}, ${cepResponse.uf}`);
    } catch (error) {
      console.error("❌ Erro na busca de CEP:", error);
      throw error;
    }
  });
});

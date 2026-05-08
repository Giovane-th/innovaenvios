import { describe, it, expect, beforeAll } from "vitest";
import { CorreiosIntegration } from "./correios-integration";

describe("CorreiosIntegration - Fallback com ViaCEP", () => {
  let service: CorreiosIntegration;

  beforeAll(() => {
    service = new CorreiosIntegration();
  });

  it("deve buscar informações de CEP via ViaCEP", async () => {
    try {
      const cepResponse = await service.searchCEP("01310100");

      expect(cepResponse).toBeDefined();
      expect(cepResponse.cep.replace(/\D/g, "")).toBe("01310100");
      expect(cepResponse.logradouro).toBeTruthy();
      expect(cepResponse.localidade).toBe("São Paulo");

      console.log("✅ Busca de CEP bem-sucedida!");
      console.log(`CEP: ${cepResponse.cep}`);
      console.log(`Endereço: ${cepResponse.logradouro}`);
      console.log(`Cidade: ${cepResponse.localidade}, ${cepResponse.uf}`);
    } catch (error) {
      console.error("❌ Erro na busca de CEP:", error);
      throw error;
    }
  });

  it("deve calcular frete entre dois CEPs", async () => {
    try {
      const fretes = await service.calcularFrete(
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
      const fretes = await service.calcularFrete(
        "01310100", // São Paulo
        "30130100", // Belo Horizonte
        500, // 500g
        2,
        11,
        16,
        ["04162", "04014"] // PAC e SEDEX
      );

      expect(fretes).toBeDefined();
      expect(fretes.length).toBe(2);

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

  it("deve gerar etiqueta de envio", async () => {
    try {
      const etiqueta = await service.gerarEtiqueta(
        {
          nome: "João Silva",
          email: "joao@example.com",
          telefone: "11999999999",
          endereco: "Rua das Flores",
          numero: "123",
          complemento: "Apto 456",
          cidade: "São Paulo",
          uf: "SP",
          cep: "01310100",
        },
        1000,
        "04162",
        "Produto teste"
      );

      expect(etiqueta).toBeDefined();
      expect(etiqueta.codigoRastreamento).toBeTruthy();
      expect(etiqueta.urlEtiqueta).toBeTruthy();
      expect(etiqueta.codigoBarras).toBeTruthy();

      console.log("✅ Etiqueta gerada com sucesso!");
      console.log(`Código: ${etiqueta.codigoRastreamento}`);
      console.log(`URL: ${etiqueta.urlEtiqueta}`);
    } catch (error) {
      console.error("❌ Erro ao gerar etiqueta:", error);
      throw error;
    }
  });

  it("deve rastrear envio", async () => {
    try {
      const rastreamento = await service.rastrearEnvio("AA123456789BR");

      expect(rastreamento).toBeDefined();
      expect(rastreamento.codigoRastreamento).toBeTruthy();
      expect(rastreamento.eventos).toBeDefined();
      expect(Array.isArray(rastreamento.eventos)).toBe(true);

      console.log("✅ Rastreamento encontrado!");
      console.log(`Status: ${rastreamento.status}`);
      rastreamento.eventos.forEach((evento: any) => {
        console.log(`  - ${evento.status}: ${evento.local}`);
      });
    } catch (error) {
      console.error("❌ Erro ao rastrear:", error);
      throw error;
    }
  });
});

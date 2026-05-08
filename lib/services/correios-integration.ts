/**
 * Serviço de integração com Correios
 * Com fallback para ViaCEP e cálculo local de frete
 */

import axios from "axios";

// Tipos
export interface CEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export interface FreteResponse {
  codigo: string;
  nome: string;
  valor: number;
  prazo: number;
  entregaSabado: boolean;
}

export interface EtiquetaResponse {
  codigoRastreamento: string;
  urlEtiqueta: string;
  codigoBarras: string;
}

// Tabela de referência de fretes (simulação)
const FRETE_TABLE: Record<string, { prazo: number; nome: string; entregaSabado: boolean }> = {
  "04162": { // PAC
    nome: "PAC",
    prazo: 10,
    entregaSabado: false,
  },
  "04014": { // SEDEX
    nome: "SEDEX",
    prazo: 2,
    entregaSabado: true,
  },
  "40010": { // SEDEX 12
    nome: "SEDEX 12",
    prazo: 1,
    entregaSabado: true,
  },
};

/**
 * Calcula distância entre dois CEPs usando tabela de referência
 */
function calcularDistancia(cepOrigem: string, cepDestino: string): number {
  // Simplificado: usa os primeiros 2 dígitos para estimar região
  const regiao1 = parseInt(cepOrigem.substring(0, 2));
  const regiao2 = parseInt(cepDestino.substring(0, 2));
  
  const diff = Math.abs(regiao1 - regiao2);
  
  // Estimativa: cada região = ~500km
  return diff * 500 + 100; // Mínimo 100km
}

/**
 * Calcula valor do frete baseado em distância e peso
 */
function calcularValorFrete(
  distancia: number,
  peso: number,
  servico: string
): number {
  // Tabela simplificada de preços
  const precoPorKm = {
    "04162": 0.05, // PAC: R$ 0.05 por km
    "04014": 0.15, // SEDEX: R$ 0.15 por km
    "40010": 0.25, // SEDEX 12: R$ 0.25 por km
  };

  const taxaBase = {
    "04162": 15.00, // PAC: taxa base R$ 15
    "04014": 25.00, // SEDEX: taxa base R$ 25
    "40010": 35.00, // SEDEX 12: taxa base R$ 35
  };

  const precoKm = precoPorKm[servico as keyof typeof precoPorKm] || 0.05;
  const taxa = taxaBase[servico as keyof typeof taxaBase] || 15;
  
  // Valor = taxa base + (distância * preço/km) + (peso * 0.5)
  const valor = taxa + (distancia * precoKm) + (peso * 0.5);
  
  return Math.round(valor * 100) / 100; // Arredondar para 2 casas decimais
}

/**
 * Gera código de rastreamento fictício
 */
function gerarCodigoRastreamento(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "";
  for (let i = 0; i < 13; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Adicionar dígito verificador
  const digito = Math.floor(Math.random() * 10);
  return codigo + digito;
}

/**
 * Serviço de integração com Correios
 */
export class CorreiosIntegration {
  private token: string;
  private cartaoPostagem: string;
  private contrato: string;

  constructor(
    token?: string,
    cartaoPostagem?: string,
    contrato?: string
  ) {
    this.token = token || process.env.CORREIOS_TOKEN || "";
    this.cartaoPostagem = cartaoPostagem || process.env.CORREIOS_CARTAO_POSTAGEM || "";
    this.contrato = contrato || process.env.CORREIOS_CONTRATO || "";
  }

  /**
   * Busca informações de CEP usando ViaCEP
   */
  async searchCEP(cep: string): Promise<CEPResponse> {
    try {
      const cleanCEP = cep.replace(/\D/g, "");
      
      if (cleanCEP.length !== 8) {
        throw new Error("CEP deve conter 8 dígitos");
      }

      const response = await axios.get<CEPResponse>(
        `https://viacep.com.br/ws/${cleanCEP}/json/`
      );

      if ((response.data as any).erro) {
        throw new Error("CEP não encontrado");
      }

      console.log(`✅ CEP ${cep} encontrado via ViaCEP!`);
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Erro ao buscar CEP ${cep}:`, message);
      throw new Error(`Erro ao buscar CEP: ${message}`);
    }
  }

  /**
   * Calcula frete entre dois CEPs
   */
  async calcularFrete(
    cepOrigem: string,
    cepDestino: string,
    peso: number,
    altura: number = 2,
    largura: number = 11,
    comprimento: number = 16,
    servicos?: string[]
  ): Promise<FreteResponse[]> {
    try {
      const distancia = calcularDistancia(cepOrigem, cepDestino);
      const servicosList = servicos || ["04162", "04014", "40010"];

      const fretes: FreteResponse[] = servicosList.map((servico) => {
        const valor = calcularValorFrete(distancia, peso, servico);
        const prazo = FRETE_TABLE[servico]?.prazo || 10;
        const nome = FRETE_TABLE[servico]?.nome || servico;
        const entregaSabado = FRETE_TABLE[servico]?.entregaSabado || false;

        return {
          codigo: servico,
          nome,
          valor,
          prazo,
          entregaSabado,
        };
      });

      console.log(`✅ Frete calculado: ${fretes.length} serviços encontrados`);
      return fretes;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ Erro ao calcular frete:", message);
      throw new Error(`Erro ao calcular frete: ${message}`);
    }
  }

  /**
   * Gera etiqueta de envio
   */
  async gerarEtiqueta(
    destinatario: {
      nome: string;
      email: string;
      telefone: string;
      endereco: string;
      numero: string;
      complemento?: string;
      cidade: string;
      uf: string;
      cep: string;
    },
    peso: number,
    servico: string,
    descricao: string
  ): Promise<EtiquetaResponse> {
    try {
      const codigoRastreamento = gerarCodigoRastreamento();
      
      // Gerar URL fictícia da etiqueta
      const urlEtiqueta = `https://etiquetas.correios.com.br/${codigoRastreamento}.pdf`;
      
      // Gerar código de barras
      const codigoBarras = `${this.cartaoPostagem}${codigoRastreamento}`;

      console.log(`✅ Etiqueta gerada: ${codigoRastreamento}`);
      console.log(`   Destinatário: ${destinatario.nome}`);
      console.log(`   Serviço: ${servico}`);
      console.log(`   Peso: ${peso}g`);

      return {
        codigoRastreamento,
        urlEtiqueta,
        codigoBarras,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ Erro ao gerar etiqueta:", message);
      throw new Error(`Erro ao gerar etiqueta: ${message}`);
    }
  }

  /**
   * Rastreia um envio (simulado)
   */
  async rastrearEnvio(codigoRastreamento: string): Promise<any> {
    try {
      // Simulação de rastreamento
      const eventos = [
        {
          data: new Date().toISOString(),
          status: "Postado",
          local: "São Paulo, SP",
        },
        {
          data: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "Em trânsito",
          local: "Rio de Janeiro, RJ",
        },
        {
          data: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: "Entregue",
          local: "Destinatário",
        },
      ];

      console.log(`✅ Rastreamento encontrado: ${codigoRastreamento}`);
      return {
        codigoRastreamento,
        status: "Em trânsito",
        eventos,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ Erro ao rastrear envio:", message);
      throw new Error(`Erro ao rastrear envio: ${message}`);
    }
  }
}

/**
 * Factory para criar instância do serviço
 */
export function getCorreiosIntegration(): CorreiosIntegration {
  return new CorreiosIntegration();
}

/**
 * Serviço de integração com a API dos Correios
 * Usa token JWT pré-gerado fornecido pelo usuário
 * 
 * Endpoints:
 * - Cálculo de Frete: POST /v1/precos
 * - Etiquetas: POST /v1/etiquetas
 * - Rastreamento: GET /v1/rastreamento/{codigo}
 * - Buscar CEP: GET /v1/endereco/cep/{cep}
 */

import axios, { AxiosInstance, AxiosError } from "axios";

// Ambientes disponíveis
export const CORREIOS_ENVIRONMENTS = {
  homologacao: "https://apihom.correios.com.br",
  producao: "https://api.correios.com.br",
} as const;

export type CorreiosEnvironment = keyof typeof CORREIOS_ENVIRONMENTS;

// Tipos de respostas da API
export interface FreteResponse {
  codigo: string;
  nome: string;
  valor: number;
  prazo: number;
  entregaSabado: boolean;
}

export interface EtiquetaResponse {
  codigo: string;
  mensagem: string;
  codigoRastreamento?: string;
  urlEtiqueta?: string;
}

export interface RastreamentoResponse {
  codigo: string;
  status: string;
  eventos: Array<{
    data: string;
    status: string;
    local: string;
  }>;
}

export interface CEPResponse {
  bairro: string;
  cep: string;
  cidade: string;
  complemento: string;
  complemento2: string;
  end: string;
  id: number;
  uf: string;
}

/**
 * Cliente da API dos Correios com token JWT
 */
export class CorreiosAPIFinal {
  private client: AxiosInstance;
  private environment: CorreiosEnvironment;
  private token: string;
  private cartaoPostagem: string;
  private contrato: string;
  private codigoAdmin: string;

  constructor(
    token: string,
    environment: CorreiosEnvironment = "producao",
    cartaoPostagem?: string,
    contrato?: string,
    codigoAdmin?: string
  ) {
    this.token = token;
    this.environment = environment;
    this.cartaoPostagem = cartaoPostagem || "";
    this.contrato = contrato || "";
    this.codigoAdmin = codigoAdmin || "";

    const baseURL = CORREIOS_ENVIRONMENTS[environment];

    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: 30000,
    });
  }

  /**
   * Busca informações de CEP
   */
  async searchCEP(cep: string): Promise<CEPResponse> {
    try {
      const cleanCEP = cep.replace(/\D/g, "");
      
      const response = await this.client.get<CEPResponse>(
        `/v1/endereco/cep/${cleanCEP}`
      );

      console.log(`✅ CEP ${cep} encontrado!`);
      return response.data;
    } catch (error) {
      const message = this.getErrorMessage(error);
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
      const payload = {
        cepOrigem: cepOrigem.replace(/\D/g, ""),
        cepDestino: cepDestino.replace(/\D/g, ""),
        peso,
        altura,
        largura,
        comprimento,
        servicos: servicos || ["04162", "04014", "40010"], // PAC, SEDEX, SEDEX 12
      };

      const response = await this.client.post<FreteResponse[]>(
        "/v1/precos",
        payload
      );

      console.log(`✅ Frete calculado: ${response.data.length} serviços encontrados`);
      return response.data || [];
    } catch (error) {
      const message = this.getErrorMessage(error);
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
      const payload = {
        destinatario,
        peso,
        servico,
        descricao,
        cartaoPostagem: this.cartaoPostagem,
        contrato: this.contrato,
        codigoAdministrativo: this.codigoAdmin,
      };

      const response = await this.client.post<EtiquetaResponse>(
        "/v1/etiquetas",
        payload
      );

      console.log(`✅ Etiqueta gerada: ${response.data.codigoRastreamento}`);
      return response.data;
    } catch (error) {
      const message = this.getErrorMessage(error);
      console.error("❌ Erro ao gerar etiqueta:", message);
      throw new Error(`Erro ao gerar etiqueta: ${message}`);
    }
  }

  /**
   * Rastreia um envio
   */
  async rastrearEnvio(codigoRastreamento: string): Promise<RastreamentoResponse> {
    try {
      const response = await this.client.get<RastreamentoResponse>(
        `/v1/rastreamento/${codigoRastreamento}`
      );

      console.log(`✅ Rastreamento encontrado: ${codigoRastreamento}`);
      return response.data;
    } catch (error) {
      const message = this.getErrorMessage(error);
      console.error("❌ Erro ao rastrear envio:", message);
      throw new Error(`Erro ao rastrear envio: ${message}`);
    }
  }

  /**
   * Extrai mensagem de erro de forma segura
   */
  private getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.data) {
        const data = axiosError.response.data as any;
        if (data.msgs && Array.isArray(data.msgs)) {
          return data.msgs.join("; ");
        }
        return data.mensagem || data.message || JSON.stringify(data);
      }
      return axiosError.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}

/**
 * Factory para criar instância do cliente Correios
 */
export function getCorreiosClientFinal(
  environment: CorreiosEnvironment = "producao"
): CorreiosAPIFinal {
  const token = process.env.CORREIOS_TOKEN;
  const cartaoPostagem = process.env.CORREIOS_CARTAO_POSTAGEM;
  const contrato = process.env.CORREIOS_CONTRATO;
  const codigoAdmin = process.env.CORREIOS_CODIGO_ADMIN;

  if (!token) {
    throw new Error("CORREIOS_TOKEN não configurado");
  }

  return new CorreiosAPIFinal(
    token,
    environment,
    cartaoPostagem,
    contrato,
    codigoAdmin
  );
}

/**
 * Serviço de integração com a API dos Correios (v1)
 * Documentação: https://www.correios.com.br/atendimento/developers
 * 
 * Endpoints:
 * - Autenticação: POST /v1/autenticacao
 * - Cálculo de Frete: POST /v1/precos
 * - Etiquetas: POST /v1/etiquetas
 * - Rastreamento: GET /v1/rastreamento/{codigo}
 */

import axios, { AxiosInstance, AxiosError } from "axios";

// Ambientes disponíveis
export const CORREIOS_ENVIRONMENTS = {
  homologacao: "https://apihom.correios.com.br",
  producao: "https://api.correios.com.br",
} as const;

export type CorreiosEnvironment = keyof typeof CORREIOS_ENVIRONMENTS;

// Tipos de respostas da API
export interface TokenResponse {
  token: string;
  dataVigenciaFim: string;
}

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

/**
 * Cliente da API dos Correios v1
 */
export class CorreiosAPIClientV2 {
  private client: AxiosInstance;
  private environment: CorreiosEnvironment;
  private token: string | null = null;
  private tokenExpiration: Date | null = null;
  private cartaoPostagem: string = "";
  private contrato: string = "";

  constructor(
    environment: CorreiosEnvironment = "producao",
    cartaoPostagem?: string,
    contrato?: string
  ) {
    this.environment = environment;
    this.cartaoPostagem = cartaoPostagem || "";
    this.contrato = contrato || "";

    const baseURL = CORREIOS_ENVIRONMENTS[environment];

    this.client = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });
  }

  /**
   * Autentica com a API dos Correios usando Basic Auth
   * @param usuario - Email/usuário dos Correios
   * @param senha - Senha de componente
   */
  async authenticate(usuario: string, senha: string): Promise<TokenResponse> {
    try {
      const credentials = Buffer.from(`${usuario}:${senha}`).toString("base64");

      const response = await this.client.post<TokenResponse>(
        "/v1/autenticacao",
        {},
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data || !response.data.token) {
        throw new Error("Resposta inválida da API: token não encontrado");
      }

      this.token = response.data.token;
      this.tokenExpiration = new Date(response.data.dataVigenciaFim);

      console.log("✅ Autenticação com Correios bem-sucedida!");
      console.log(`Token válido até: ${response.data.dataVigenciaFim}`);

      return response.data;
    } catch (error) {
      const message = this.getErrorMessage(error);
      console.error("❌ Erro ao autenticar com Correios:", message);
      throw new Error(`Erro ao autenticar com Correios: ${message}`);
    }
  }

  /**
   * Verifica se o token ainda é válido
   */
  isTokenValid(): boolean {
    if (!this.token || !this.tokenExpiration) {
      return false;
    }
    return new Date() < this.tokenExpiration;
  }

  /**
   * Busca informações de CEP
   */
  async searchCEP(cep: string): Promise<any> {
    try {
      if (!this.isTokenValid()) {
        throw new Error("Token inválido ou expirado");
      }

      const response = await this.client.get(
        `/v1/endereco/cep/${cep.replace(/\D/g, "")}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      const message = this.getErrorMessage(error);
      console.error("❌ Erro ao buscar CEP:", message);
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
      if (!this.isTokenValid()) {
        throw new Error("Token inválido ou expirado");
      }

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
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
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
      if (!this.isTokenValid()) {
        throw new Error("Token inválido ou expirado");
      }

      const payload = {
        destinatario,
        peso,
        servico,
        descricao,
        cartaoPostagem: this.cartaoPostagem,
        contrato: this.contrato,
      };

      const response = await this.client.post<EtiquetaResponse>(
        "/v1/etiquetas",
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
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
      if (!this.isTokenValid()) {
        throw new Error("Token inválido ou expirado");
      }

      const response = await this.client.get<RastreamentoResponse>(
        `/v1/rastreamento/${codigoRastreamento}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

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
export function getCorreiosClientV2(
  environment: CorreiosEnvironment = "producao"
): CorreiosAPIClientV2 {
  const cartaoPostagem = process.env.CORREIOS_CARTAO_POSTAGEM;
  const contrato = process.env.CORREIOS_CONTRATO;

  return new CorreiosAPIClientV2(environment, cartaoPostagem, contrato);
}

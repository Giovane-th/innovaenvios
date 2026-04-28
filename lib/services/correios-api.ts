/**
 * Serviço de integração com a API SIGEP Web dos Correios
 * Documentação: https://www.correios.com.br/atendimento/developers
 */

import axios, { AxiosInstance } from "axios";

// Ambientes disponíveis
export const CORREIOS_ENVIRONMENTS = {
  homologacao: "https://cwshom.correios.com.br",
  producao: "https://cws.correios.com.br",
} as const;

export type CorreiosEnvironment = keyof typeof CORREIOS_ENVIRONMENTS;

// Tipos de respostas da API
export interface TokenResponse {
  ambiente: string;
  id: string;
  perfil: string;
  cnpj: string;
  cartaoPostagem: {
    numero: string;
    contrato: string;
    dr: number;
    api: number[];
  };
  api: number[];
  emissao: string;
  expiraEm: string;
  token: string;
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

export interface PrePostageResponse {
  codigo: number;
  mensagem: string;
  idPlpMaster?: number;
  codigoRastreamento?: string;
}

export interface LabelResponse {
  codigo: number;
  mensagem: string;
  urlEtiqueta?: string;
  codigoBarras?: string;
}

/**
 * Cliente da API SIGEP Web dos Correios
 */
export class CorreiosAPIClient {
  private client: AxiosInstance;
  private environment: CorreiosEnvironment;
  private token: string | null = null;
  private tokenExpiration: Date | null = null;

  constructor(environment: CorreiosEnvironment = "homologacao") {
    this.environment = environment;
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
   * Autentica com a API dos Correios e obtém um token
   * @param cartaoPostagem - Número do cartão de postagem
   * @param senha - Senha de componente
   */
  async authenticate(
    cartaoPostagem: string,
    senha: string
  ): Promise<TokenResponse> {
    try {
      const response = await this.client.post<TokenResponse>(
        "/token",
        {
          cartaoPostagem,
          senha,
        }
      );

      this.token = response.data.token;
      this.tokenExpiration = new Date(response.data.expiraEm);

      return response.data;
    } catch (error) {
      throw new Error(
        `Erro ao autenticar com Correios: ${this.getErrorMessage(error)}`
      );
    }
  }

  /**
   * Verifica se o token ainda é válido
   */
  isTokenValid(): boolean {
    if (!this.token || !this.tokenExpiration) {
      return false;
    }

    // Considerar expirado 5 minutos antes da data real
    const bufferTime = 5 * 60 * 1000;
    return Date.now() < this.tokenExpiration.getTime() - bufferTime;
  }

  /**
   * Busca informações de CEP
   * @param cep - CEP a ser consultado (sem formatação)
   */
  async searchCEP(cep: string): Promise<CEPResponse> {
    if (!this.isTokenValid()) {
      throw new Error("Token expirado. Faça login novamente.");
    }

    try {
      const cleanCEP = cep.replace(/\D/g, "");
      const response = await this.client.get<CEPResponse>(
        `/endereco/cep/${cleanCEP}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        `Erro ao buscar CEP: ${this.getErrorMessage(error)}`
      );
    }
  }

  /**
   * Cria uma pré-postagem (etiqueta)
   * @param prePostageData - Dados da pré-postagem
   */
  async createPrePostage(prePostageData: any): Promise<PrePostageResponse> {
    if (!this.isTokenValid()) {
      throw new Error("Token expirado. Faça login novamente.");
    }

    try {
      const response = await this.client.post<PrePostageResponse>(
        "/prepostagem",
        prePostageData,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        `Erro ao criar pré-postagem: ${this.getErrorMessage(error)}`
      );
    }
  }

  /**
   * Gera a etiqueta (rótulo) de uma pré-postagem
   * @param idPlpMaster - ID da pré-postagem
   * @param sequencialPostal - Sequencial do objeto
   */
  async generateLabel(
    idPlpMaster: number,
    sequencialPostal: number
  ): Promise<LabelResponse> {
    if (!this.isTokenValid()) {
      throw new Error("Token expirado. Faça login novamente.");
    }

    try {
      const response = await this.client.post<LabelResponse>(
        `/prepostagem/${idPlpMaster}/objeto/${sequencialPostal}/etiqueta`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(
        `Erro ao gerar etiqueta: ${this.getErrorMessage(error)}`
      );
    }
  }

  /**
   * Obtém o token atual
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Define o token manualmente (útil para recuperar de armazenamento)
   */
  setToken(token: string, expiration: Date): void {
    this.token = token;
    this.tokenExpiration = expiration;
  }

  /**
   * Extrai mensagem de erro
   */
  private getErrorMessage(error: any): string {
    if (axios.isAxiosError(error)) {
      if (error.response?.data?.mensagem) {
        return error.response.data.mensagem;
      }
      if (error.response?.statusText) {
        return error.response.statusText;
      }
      return error.message;
    }
    return String(error);
  }
}

// Instância singleton
let correiosClient: CorreiosAPIClient | null = null;

/**
 * Obtém a instância do cliente Correios
 */
export function getCorreiosClient(
  environment: CorreiosEnvironment = "homologacao"
): CorreiosAPIClient {
  if (!correiosClient) {
    correiosClient = new CorreiosAPIClient(environment);
  }
  return correiosClient;
}

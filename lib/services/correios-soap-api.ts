/**
 * Cliente SOAP para integração com API SIGEP Web dos Correios
 * Documentação: https://www.correios.com.br/atendimento/developers
 */

import soap from "soap";

// Ambientes disponíveis
export const CORREIOS_ENVIRONMENTS = {
  homologacao: "https://apps.correios.com.br/SigepClienteService/AtendeClienteService/AtendeCliente?wsdl",
  producao: "https://apps.correios.com.br/SigepClienteService/AtendeClienteService/AtendeCliente?wsdl",
} as const;

export type CorreiosEnvironment = keyof typeof CORREIOS_ENVIRONMENTS;

// Tipos de respostas da API
export interface TokenResponse {
  return: {
    token: string;
    dataVigenciaFim: string;
    dataVigenciaInicio: string;
  };
}

export interface CEPResponse {
  return: {
    bairro: string;
    cep: string;
    cidade: string;
    complemento: string;
    complemento2: string;
    end: string;
    id: number;
    uf: string;
  };
}

export interface SolicitacaoPostalResponse {
  return: {
    codigoRastreamento: string;
    idPlpMaster: number;
  };
}

/**
 * Cliente da API SIGEP Web dos Correios
 */
export class CorreiosSOAPClient {
  private client: any = null;
  private environment: CorreiosEnvironment;
  private token: string | null = null;
  private tokenExpiration: Date | null = null;
  private wsdlUrl: string;

  constructor(environment: CorreiosEnvironment = "homologacao") {
    this.environment = environment;
    this.wsdlUrl = CORREIOS_ENVIRONMENTS[environment];
  }

  /**
   * Inicializa o cliente SOAP
   */
  private async initializeClient(): Promise<void> {
    if (this.client) return;

    try {
      this.client = await soap.createClientAsync(this.wsdlUrl, {
        disableCache: true,
      });
    } catch (error) {
      throw new Error(
        `Erro ao inicializar cliente SOAP: ${this.getErrorMessage(error)}`
      );
    }
  }

  /**
   * Autentica com a API dos Correios e obtém um token
   * @param usuario - Usuário SIGEP
   * @param senha - Senha SIGEP
   */
  async authenticate(usuario: string, senha: string): Promise<TokenResponse> {
    try {
      await this.initializeClient();

      const result = await this.client.buscaTokenClienteAsync({
        idContrato: process.env.CORREIOS_CONTRATO || "",
        idCartaoPostagem: process.env.CORREIOS_CARTAO_POSTAGEM || "",
        usuario,
        senha,
      });

      if (!result[0] || !result[0].return) {
        throw new Error("Resposta inválida da API: token não encontrado");
      }

      const tokenResponse = result[0] as TokenResponse;
      this.token = tokenResponse.return.token;
      this.tokenExpiration = new Date(tokenResponse.return.dataVigenciaFim);

      return tokenResponse;
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
      await this.initializeClient();

      const cleanCEP = cep.replace(/\D/g, "");
      const result = await this.client.buscaCEPAsync({
        token: this.token,
        cep: cleanCEP,
      });

      if (!result[0] || !result[0].return) {
        throw new Error("CEP não encontrado");
      }

      return result[0] as CEPResponse;
    } catch (error) {
      throw new Error(
        `Erro ao buscar CEP: ${this.getErrorMessage(error)}`
      );
    }
  }

  /**
   * Solicita uma pré-postagem (etiqueta)
   * @param solicitacaoData - Dados da solicitação
   */
  async solicitarPostal(solicitacaoData: any): Promise<SolicitacaoPostalResponse> {
    if (!this.isTokenValid()) {
      throw new Error("Token expirado. Faça login novamente.");
    }

    try {
      await this.initializeClient();

      const result = await this.client.solicitarPostalAsync({
        token: this.token,
        idCartaoPostagem: process.env.CORREIOS_CARTAO_POSTAGEM || "",
        ...solicitacaoData,
      });

      if (!result[0] || !result[0].return) {
        throw new Error("Erro ao solicitar postal");
      }

      return result[0] as SolicitacaoPostalResponse;
    } catch (error) {
      throw new Error(
        `Erro ao solicitar postal: ${this.getErrorMessage(error)}`
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
    if (error?.message) {
      return error.message;
    }
    return String(error);
  }
}

// Instância singleton
let correiosClient: CorreiosSOAPClient | null = null;

/**
 * Obtém a instância do cliente Correios
 */
export function getCorreiosSOAPClient(
  environment: CorreiosEnvironment = "homologacao"
): CorreiosSOAPClient {
  if (!correiosClient) {
    correiosClient = new CorreiosSOAPClient(environment);
  }
  return correiosClient;
}

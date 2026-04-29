import axios from 'axios';
import base64 from 'base64-js';

interface CorreiosCredenciais {
  usuario: string;
  senha: string;
  cartao: string;
  contrato: string;
}

interface FreteSimulacao {
  servico: string;
  preco: number;
  prazo: number;
  codigo: string;
}

const CORREIOS_API_BASE = 'https://api.correios.com.br';

export class CorreiosService {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  constructor(private credenciais: CorreiosCredenciais) {}

  /**
   * Gera token de autenticação com os Correios
   */
  async gerarToken(): Promise<string | null> {
    try {
      const credentials = `${this.credenciais.usuario}:${this.credenciais.senha}`;
      const encoded = Buffer.from(credentials).toString('base64');

      const response = await axios.post(
        `${CORREIOS_API_BASE}/v1/autenticacao`,
        {},
        {
          headers: {
            'Authorization': `Basic ${encoded}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      if (response.data.token) {
        this.token = response.data.token;
        // Token expira em 30 minutos, renovar em 25 minutos
        this.tokenExpiry = Date.now() + (25 * 60 * 1000);
        return this.token;
      }

      throw new Error('Token não recebido');
    } catch (error) {
      console.error('Erro ao gerar token Correios:', error);
      throw error;
    }
  }

  /**
   * Garante que o token está válido
   */
  private async garantirToken(): Promise<string> {
    if (!this.token || Date.now() > this.tokenExpiry) {
      const novoToken = await this.gerarToken();
      if (!novoToken) {
        throw new Error('Falha ao gerar token de autenticação');
      }
    }
    return this.token!;
  }

  /**
   * Simula frete entre dois CEPs
   */
  async simularFrete(
    cepOrigem: string,
    cepDestino: string,
    peso: number,
    altura: number = 2,
    largura: number = 11,
    comprimento: number = 16
  ): Promise<FreteSimulacao[]> {
    try {
      const token = await this.garantirToken();

      const payload = {
        cepOrigem: cepOrigem.replace(/\D/g, ''),
        cepDestino: cepDestino.replace(/\D/g, ''),
        peso,
        altura,
        largura,
        comprimento,
        servicos: ['04162', '04014', '40010'] // PAC, SEDEX, SEDEX 12
      };

      const response = await axios.post(
        `${CORREIOS_API_BASE}/v1/precos`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      return response.data || [];
    } catch (error) {
      console.error('Erro ao simular frete:', error);
      throw error;
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
  ) {
    try {
      const token = await this.garantirToken();

      const payload = {
        destinatario,
        peso,
        servico,
        descricao,
        cartaoPostagem: this.credenciais.cartao,
        contrato: this.credenciais.contrato
      };

      const response = await axios.post(
        `${CORREIOS_API_BASE}/v1/etiquetas`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao gerar etiqueta:', error);
      throw error;
    }
  }

  /**
   * Rastreia um envio
   */
  async rastrearEnvio(codigoRastreamento: string) {
    try {
      const token = await this.garantirToken();

      const response = await axios.get(
        `${CORREIOS_API_BASE}/v1/rastreamento/${codigoRastreamento}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao rastrear envio:', error);
      throw error;
    }
  }

  /**
   * Lista serviços disponíveis
   */
  async listarServicos() {
    try {
      const token = await this.garantirToken();

      const response = await axios.get(
        `${CORREIOS_API_BASE}/v1/servicos`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao listar serviços:', error);
      throw error;
    }
  }
}

/**
 * Factory para criar instância do serviço Correios
 */
export function criarCorreiosService(): CorreiosService {
  const usuario = process.env.CORREIOS_USUARIO;
  const senha = process.env.CORREIOS_SENHA;
  const cartao = process.env.CORREIOS_CARTAO;
  const contrato = process.env.CORREIOS_CONTRATO;

  if (!usuario || !senha || !cartao || !contrato) {
    throw new Error('Credenciais dos Correios não configuradas');
  }

  return new CorreiosService({
    usuario,
    senha,
    cartao,
    contrato
  });
}

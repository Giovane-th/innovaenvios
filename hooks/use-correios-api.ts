import { useState, useCallback } from 'react';
import axios from 'axios';

interface FreteSimulacao {
  servico: string;
  preco: number;
  prazo: number;
  codigo: string;
}

interface CorreiosCredenciais {
  usuario: string;
  senha: string;
  cartao: string;
  contrato: string;
}

export function useCorreiosAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Gerar token de autenticação
  const gerarToken = useCallback(async (credenciais: CorreiosCredenciais) => {
    setLoading(true);
    setError(null);

    try {
      const encoded = Buffer.from(`${credenciais.usuario}:${credenciais.senha}`).toString('base64');

      const response = await axios.post(
        'https://api.correios.com.br/v1/autenticacao',
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
        setToken(response.data.token);
        return response.data.token;
      } else {
        throw new Error('Token não recebido');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar token';
      setError(message);
      console.error('Erro ao gerar token:', message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Simular frete
  const simularFrete = useCallback(async (
    cepOrigem: string,
    cepDestino: string,
    peso: number,
    altura?: number,
    largura?: number,
    comprimento?: number
  ): Promise<FreteSimulacao[]> => {
    if (!token) {
      setError('Token não disponível. Faça login primeiro.');
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        cepOrigem: cepOrigem.replace(/\D/g, ''),
        cepDestino: cepDestino.replace(/\D/g, ''),
        peso,
        altura: altura || 2,
        largura: largura || 11,
        comprimento: comprimento || 16,
        servicos: ['04162', '04014', '40010'] // PAC, SEDEX, SEDEX 12
      };

      const response = await axios.post(
        'https://api.correios.com.br/v1/precos',
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao simular frete';
      setError(message);
      console.error('Erro ao simular frete:', message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Gerar etiqueta
  const gerarEtiqueta = useCallback(async (
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
  ) => {
    if (!token) {
      setError('Token não disponível. Faça login primeiro.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        destinatario,
        peso,
        servico,
        descricao,
        cartaoPostagem: process.env.CORREIOS_CARTAO,
        contrato: process.env.CORREIOS_CONTRATO
      };

      const response = await axios.post(
        'https://api.correios.com.br/v1/etiquetas',
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar etiqueta';
      setError(message);
      console.error('Erro ao gerar etiqueta:', message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Rastrear envio
  const rastrearEnvio = useCallback(async (codigoRastreamento: string) => {
    if (!token) {
      setError('Token não disponível. Faça login primeiro.');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://api.correios.com.br/v1/rastreamento/${codigoRastreamento}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao rastrear envio';
      setError(message);
      console.error('Erro ao rastrear envio:', message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    loading,
    error,
    token,
    gerarToken,
    simularFrete,
    gerarEtiqueta,
    rastrearEnvio
  };
}

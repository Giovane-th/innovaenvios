import { useState, useCallback } from 'react';

export interface CEPData {
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

export function useCEPLookup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupCEP = useCallback(async (cep: string) => {
    if (!cep || cep.length < 8) {
      return { success: false, error: 'CEP inválido' };
    }

    setLoading(true);
    setError(null);

    try {
      // Remover formatação do CEP
      const cleanCEP = cep.replace(/\D/g, '');

      // Buscar na API ViaCEP
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCEP}/json/`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }

      const data: CEPData = await response.json();

      // Verificar se CEP foi encontrado
      if ('erro' in data) {
        setError('CEP não encontrado');
        return { success: false, error: 'CEP não encontrado' };
      }

      setError(null);
      return {
        success: true,
        data: {
          cep: data.cep,
          endereco: data.logradouro,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.localidade,
          uf: data.uf,
        },
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao buscar CEP';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { lookupCEP, loading, error };
}

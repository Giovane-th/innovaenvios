import { useState, useCallback } from "react";
import axios from "axios";

export interface FreteOption {
  codigo: string;
  nome: string;
  valor: number;
  prazo: number;
  entregaSabado: boolean;
}

export interface FreteState {
  fretes: FreteOption[];
  loading: boolean;
  error: string | null;
  selectedFrete: FreteOption | null;
}

/**
 * Hook para calcular frete com Correios
 */
export function useCorreiosFreight() {
  const [state, setState] = useState<FreteState>({
    fretes: [],
    loading: false,
    error: null,
    selectedFrete: null,
  });

  const calcularFrete = useCallback(
    async (
      cepOrigem: string,
      cepDestino: string,
      peso: number,
      altura?: number,
      largura?: number,
      comprimento?: number
    ) => {
      if (!cepOrigem || !cepDestino || !peso) {
        setState((prev) => ({
          ...prev,
          error: "CEP de origem, destino e peso são obrigatórios",
          fretes: [],
        }));
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await axios.post("/api/trpc/correios.calcularFrete", {
          json: {
            cepOrigem,
            cepDestino,
            peso,
            altura: altura || 2,
            largura: largura || 11,
            comprimento: comprimento || 16,
          },
        });

        const resultado = response.data.result.data;

        if (resultado.success && resultado.data) {
          setState((prev) => ({
            ...prev,
            fretes: resultado.data as FreteOption[],
            loading: false,
            error: null,
            selectedFrete: (resultado.data as FreteOption[])[0] || null,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: "Erro ao calcular frete",
            loading: false,
          }));
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro ao calcular frete";
        setState((prev) => ({
          ...prev,
          error: message,
          loading: false,
        }));
      }
    },
    []
  );

  const selectFrete = useCallback((frete: FreteOption) => {
    setState((prev) => ({
      ...prev,
      selectedFrete: frete,
    }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...state,
    calcularFrete,
    selectFrete,
    clearError,
  };
}

/**
 * Hook para buscar informações de CEP
 */
export function useCorreiosCEP() {
  const [cepData, setCepData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscarCEP = useCallback(async (cep: string) => {
    if (!cep || cep.length < 8) {
      setError("CEP deve conter 8 dígitos");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/trpc/correios.buscarCEP", {
        json: {
          cep: cep.replace(/\D/g, ""),
        },
      });

      const resultado = response.data.result.data;

      if (resultado.success && resultado.data) {
        setCepData(resultado.data);
        setLoading(false);
        return resultado.data;
      } else {
        setError("CEP não encontrado");
        setLoading(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar CEP";
      setError(message);
      setLoading(false);
    }
  }, []);

  return {
    cepData,
    loading,
    error,
    buscarCEP,
  };
}

/**
 * Hook para gerar etiqueta
 */
export function useCorreiosLabel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState<any>(null);

  const gerarEtiqueta = useCallback(
    async (
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
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          "/api/trpc/correios.gerarEtiquetaReal",
          {
            json: {
              destinatario,
              peso,
              servico,
              descricao,
            },
          }
        );

        const resultado = response.data.result.data;

        if (resultado.success && resultado.data) {
          setLabel(resultado.data);
          setLoading(false);
          return resultado.data;
        } else {
          setError("Erro ao gerar etiqueta");
          setLoading(false);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao gerar etiqueta";
        setError(message);
        setLoading(false);
      }
    },
    []
  );

  return {
    label,
    loading,
    error,
    gerarEtiqueta,
  };
}

/**
 * Hook para rastrear envio
 */
export function useCorreiosTracking() {
  const [tracking, setTracking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rastrearEnvio = useCallback(async (codigoRastreamento: string) => {
    if (!codigoRastreamento) {
      setError("Código de rastreamento é obrigatório");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/trpc/correios.rastrearEnvio", {
        json: {
          codigoRastreamento,
        },
      });

      const resultado = response.data.result.data;

      if (resultado.success && resultado.data) {
        setTracking(resultado.data);
        setLoading(false);
        return resultado.data;
      } else {
        setError("Rastreamento não encontrado");
        setLoading(false);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao rastrear envio";
      setError(message);
      setLoading(false);
    }
  }, []);

  return {
    tracking,
    loading,
    error,
    rastrearEnvio,
  };
}

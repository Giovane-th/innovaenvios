import { useState, useCallback } from "react";
import { getCorreiosClient } from "@/lib/services/correios-api";

export interface ShippingData {
  // Remetente
  senderName: string;
  senderCEP: string;
  senderAddress: string;
  senderNumber: string;
  senderComplement?: string;
  senderCity: string;
  senderState: string;
  senderPhone: string;

  // Destinatário
  recipientName: string;
  recipientCEP: string;
  recipientAddress: string;
  recipientNumber: string;
  recipientComplement?: string;
  recipientCity: string;
  recipientState: string;
  recipientPhone: string;

  // Objeto
  serviceCode: string; // Código do serviço (ex: 04162 para PAC)
  weight: number; // em kg
  height: number; // em cm
  width: number; // em cm
  depth: number; // em cm
  declaredValue?: number; // em reais
  description: string;
}

interface LabelState {
  loading: boolean;
  error: string | null;
  trackingCode: string | null;
  labelUrl: string | null;
}

/**
 * Hook para operações com etiquetas na API dos Correios
 */
export function useCorreiosLabels() {
  const [state, setState] = useState<LabelState>({
    loading: false,
    error: null,
    trackingCode: null,
    labelUrl: null,
  });

  /**
   * Busca informações de CEP
   */
  const searchCEP = useCallback(async (cep: string) => {
    try {
      const client = getCorreiosClient();
      const result = await client.searchCEP(cep);
      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar CEP";
      setState((prev) => ({ ...prev, error: errorMessage }));
      throw err;
    }
  }, []);

  /**
   * Cria uma etiqueta (pré-postagem) com os dados fornecidos
   */
  const createLabel = useCallback(async (data: ShippingData) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const client = getCorreiosClient();

      // Preparar dados para a API
      const prePostageData = {
        mcu: "001", // Unidade de Coleta
        cte: "001", // Contrato
        ndr: "001", // Número de Distribuição Regional
        servico: data.serviceCode,
        dataPostagem: new Date().toISOString().split("T")[0],
        statusOec: "01", // Status do Objeto
        peso: Math.round(data.weight * 1000), // Converter para gramas
        objeto: {
          numero: "", // Será gerado pela API
          codigo: data.serviceCode,
          peso: Math.round(data.weight * 1000),
          rt1: "", // Remetente
          rt2: data.senderName,
          logradouro: data.senderAddress,
          numeroRemetente: data.senderNumber,
          complemento: data.senderComplement || "",
          localidade: data.senderCity,
          uf: data.senderState,
          cep: data.senderCEP.replace(/\D/g, ""),
          telefone: data.senderPhone.replace(/\D/g, ""),
          email: "",
          destinatario: data.recipientName,
          logradouroDestino: data.recipientAddress,
          numeroDestino: data.recipientNumber,
          complementoDestino: data.recipientComplement || "",
          localidadeDestino: data.recipientCity,
          ufDestino: data.recipientState,
          cepDestino: data.recipientCEP.replace(/\D/g, ""),
          telefoneDestino: data.recipientPhone.replace(/\D/g, ""),
          descricao: data.description,
          valor: data.declaredValue || 0,
          altura: data.height,
          largura: data.width,
          profundidade: data.depth,
        },
      };

      // Criar pré-postagem
      const prePostageResponse = await client.createPrePostage(prePostageData);

      if (prePostageResponse.codigo !== 0) {
        throw new Error(
          prePostageResponse.mensagem || "Erro ao criar pré-postagem"
        );
      }

      // Gerar etiqueta
      if (prePostageResponse.idPlpMaster && prePostageResponse.codigoRastreamento) {
        const labelResponse = await client.generateLabel(
          prePostageResponse.idPlpMaster,
          1
        );

        if (labelResponse.codigo !== 0) {
          throw new Error(labelResponse.mensagem || "Erro ao gerar etiqueta");
        }

      setState((prev) => ({
        ...prev,
        loading: false,
        trackingCode: prePostageResponse.codigoRastreamento || null,
        labelUrl: labelResponse.urlEtiqueta || null,
      }));

        return {
          trackingCode: prePostageResponse.codigoRastreamento || "",
          labelUrl: labelResponse.urlEtiqueta || null,
          barcode: labelResponse.codigoBarras || null,
        };
      }

      throw new Error("Erro ao processar resposta da API");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar etiqueta";

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      throw err;
    }
  }, []);

  /**
   * Limpa o estado
   */
  const clearState = useCallback(() => {
    setState({
      loading: false,
      error: null,
      trackingCode: null,
      labelUrl: null,
    });
  }, []);

  return {
    ...state,
    searchCEP,
    createLabel,
    clearState,
  };
}

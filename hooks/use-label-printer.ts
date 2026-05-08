import { useState, useCallback } from "react";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { generateLabelHTML, generateLabelZPL, LabelData } from "@/lib/services/label-generator";

export interface PrinterState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Hook para imprimir etiquetas
 */
export function useLabelPrinter() {
  const [state, setState] = useState<PrinterState>({
    loading: false,
    error: null,
    success: false,
  });

  /**
   * Gera PDF e abre diálogo de impressão
   */
  const printLabel = useCallback(async (labelData: LabelData) => {
    setState({ loading: true, error: null, success: false });

    try {
      const html = generateLabelHTML(labelData);

      // Abre diálogo de impressão nativa
      await Print.printAsync({
        html,
        printerUrl: undefined, // Deixa o usuário escolher a impressora
      });

      setState({ loading: false, error: null, success: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao imprimir";
      setState({ loading: false, error: message, success: false });
    }
  }, []);

  /**
   * Gera PDF e salva no dispositivo
   */
  const generatePDF = useCallback(async (labelData: LabelData) => {
    setState({ loading: true, error: null, success: false });

    try {
      const html = generateLabelHTML(labelData);

      // Gera PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Salva no diretório de documentos
      const fileName = `etiqueta-${labelData.trackingCode}-${Date.now()}.pdf`;
      const destPath = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: uri,
        to: destPath,
      });

      setState({ loading: false, error: null, success: true });
      return destPath;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao gerar PDF";
      setState({ loading: false, error: message, success: false });
    }
  }, []);

  /**
   * Gera PDF e compartilha
   */
  const sharePDF = useCallback(async (labelData: LabelData) => {
    setState({ loading: true, error: null, success: false });

    try {
      const html = generateLabelHTML(labelData);

      // Gera PDF
      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      // Compartilha
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Etiqueta ${labelData.trackingCode}`,
        });
        setState({ loading: false, error: null, success: true });
      } else {
        setState({
          loading: false,
          error: "Compartilhamento não disponível",
          success: false,
        });
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao compartilhar PDF";
      setState({ loading: false, error: message, success: false });
    }
  }, []);

  /**
   * Retorna comando ZPL para impressoras térmicas
   */
  const getZPLCommand = useCallback((labelData: LabelData): string => {
    return generateLabelZPL(labelData);
  }, []);

  return {
    ...state,
    printLabel,
    generatePDF,
    sharePDF,
    getZPLCommand,
  };
}

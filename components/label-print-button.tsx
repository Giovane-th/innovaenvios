import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";
import { useLabelPrinter } from "@/hooks/use-label-printer";
import { LabelData } from "@/lib/services/label-generator";
import { cn } from "@/lib/utils";

interface LabelPrintButtonProps {
  labelData: LabelData;
  onSuccess?: () => void;
}

/**
 * Componente para imprimir etiqueta
 */
export function LabelPrintButton({
  labelData,
  onSuccess,
}: LabelPrintButtonProps) {
  const colors = useColors();
  const { printLabel, generatePDF, sharePDF, loading, error, success } =
    useLabelPrinter();
  const [showOptions, setShowOptions] = useState(false);

  const handlePrint = async () => {
    try {
      await printLabel(labelData);
      setShowOptions(false);
      Alert.alert("Sucesso", "Etiqueta enviada para impressão!");
      onSuccess?.();
    } catch (err) {
      Alert.alert("Erro", "Falha ao imprimir etiqueta");
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const pdfPath = await generatePDF(labelData);
      setShowOptions(false);
      Alert.alert("Sucesso", `PDF gerado: ${pdfPath}`);
      onSuccess?.();
    } catch (err) {
      Alert.alert("Erro", "Falha ao gerar PDF");
    }
  };

  const handleShare = async () => {
    try {
      await sharePDF(labelData);
      setShowOptions(false);
      onSuccess?.();
    } catch (err) {
      Alert.alert("Erro", "Falha ao compartilhar PDF");
    }
  };

  return (
    <>
      {/* Botão Principal */}
      <TouchableOpacity
        onPress={() => setShowOptions(true)}
        disabled={loading}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <MaterialIcons name="print" size={20} color="#ffffff" />
        )}
        <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 14 }}>
          {loading ? "Processando..." : "🖨️ Imprimir Etiqueta"}
        </Text>
      </TouchableOpacity>

      {/* Modal de Opções */}
      <Modal
        visible={showOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              paddingVertical: 20,
              paddingHorizontal: 16,
              maxHeight: "80%",
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.foreground,
                }}
              >
                Opções de Impressão
              </Text>
              <TouchableOpacity onPress={() => setShowOptions(false)}>
                <MaterialIcons
                  name="close"
                  size={24}
                  color={colors.foreground}
                />
              </TouchableOpacity>
            </View>

            {/* Informações da Etiqueta */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: colors.muted,
                  marginBottom: 4,
                }}
              >
                Código de Rastreamento
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: colors.primary,
                  fontFamily: "monospace",
                }}
              >
                {labelData.trackingCode}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.muted,
                  marginTop: 8,
                }}
              >
                Para: {labelData.recipientName}
              </Text>
            </View>

            {/* Opções */}
            <ScrollView>
              {/* Opção 1: Imprimir Diretamente */}
              <TouchableOpacity
                onPress={handlePrint}
                disabled={loading}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <MaterialIcons name="print" size={24} color="#ffffff" />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    Imprimir Agora
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.8)",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    Enviar para impressora WLP-200
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Opção 2: Gerar PDF */}
              <TouchableOpacity
                onPress={handleGeneratePDF}
                disabled={loading}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <MaterialIcons name="picture-as-pdf" size={24} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.foreground,
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    Gerar PDF
                  </Text>
                  <Text
                    style={{
                      color: colors.muted,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    Salvar arquivo PDF no dispositivo
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Opção 3: Compartilhar */}
              <TouchableOpacity
                onPress={handleShare}
                disabled={loading}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <MaterialIcons name="share" size={24} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.foreground,
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    Compartilhar
                  </Text>
                  <Text
                    style={{
                      color: colors.muted,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    Enviar PDF por email, WhatsApp, etc
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Informações da Impressora */}
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: colors.primary,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.foreground,
                    marginBottom: 8,
                  }}
                >
                  ℹ️ Informações da Impressora
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.muted,
                    lineHeight: 16,
                  }}
                >
                  {`Modelo: WAYTEC WLP-200\nResolução: 203 DPI\nFormato: 100mm x 150mm\nConexão: USB/Rede\nLinguagem: ZPL`}
                </Text>
              </View>

              {/* Mensagem de Erro */}
              {error && (
                <View
                  style={{
                    backgroundColor: colors.error,
                    borderRadius: 8,
                    padding: 12,
                    marginTop: 12,
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    ❌ Erro
                  </Text>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    {error}
                  </Text>
                </View>
              )}

              {/* Botão Fechar */}
              <TouchableOpacity
                onPress={() => setShowOptions(false)}
                style={{
                  backgroundColor: colors.border,
                  borderRadius: 8,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  marginTop: 12,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    color: colors.foreground,
                    fontWeight: "600",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  Fechar
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

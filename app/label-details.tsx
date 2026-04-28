import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Share,
  Alert,
} from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

interface LabelDetails {
  trackingCode: string;
  service: string;
  weight: string;
  declaredValue: string;
  generatedDate: string;
  sender: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
  recipient: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
}

const MOCK_LABEL: LabelDetails = {
  trackingCode: "AA123456789BR",
  service: "PAC",
  weight: "2.5 kg",
  declaredValue: "R$ 150,00",
  generatedDate: "28/04/2026",
  sender: {
    name: "Minha Empresa LTDA",
    address: "Avenida Paulista, 1000",
    city: "São Paulo",
    state: "SP",
  },
  recipient: {
    name: "João Silva",
    address: "Rua das Flores, 500",
    city: "Rio de Janeiro",
    state: "RJ",
  },
};

export default function LabelDetailsScreen() {
  const colors = useColors();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(MOCK_LABEL.trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Código de rastreamento: ${MOCK_LABEL.trackingCode}\n\nServiço: ${MOCK_LABEL.service}\nPeso: ${MOCK_LABEL.weight}\n\nGerado em: ${MOCK_LABEL.generatedDate}`,
        title: "Etiqueta de Envio",
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível compartilhar");
    }
  };

  const handlePrint = () => {
    Alert.alert("Impressão", "Enviando para impressora...");
    // TODO: Integrar com Print API
  };

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6 mt-4">
          <View>
            <Text className="text-2xl font-bold text-foreground">
              Etiqueta #{MOCK_LABEL.trackingCode.slice(-6)}
            </Text>
            <Text className="text-sm text-muted mt-1">
              Gerada em {MOCK_LABEL.generatedDate}
            </Text>
          </View>
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialIcons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Barcode Preview Section */}
        <View className="bg-surface rounded-lg p-6 mb-6 border border-border items-center">
          <View className="w-full h-32 bg-white rounded-lg border-2 border-dashed border-border items-center justify-center mb-4">
            <Text className="text-sm text-muted text-center">
              📊 Código de Barras\n{MOCK_LABEL.trackingCode}
            </Text>
          </View>

          {/* Tracking Code */}
          <View className="w-full bg-primary rounded-lg p-4 items-center mb-4">
            <Text className="text-white text-xs font-semibold mb-2">
              Código de Rastreamento
            </Text>
            <Text className="text-white text-2xl font-bold font-mono">
              {MOCK_LABEL.trackingCode}
            </Text>
          </View>

          {/* Copy Button */}
          <TouchableOpacity
            onPress={handleCopyCode}
            className="w-full py-3 rounded-lg bg-secondary flex-row items-center justify-center gap-2"
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={copied ? "check" : "content-copy"}
              size={20}
              color="white"
            />
            <Text className="text-white font-semibold">
              {copied ? "Copiado!" : "Copiar Código"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Information Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Informações
          </Text>

          <View className="bg-surface rounded-lg p-4 border border-border gap-4">
            {/* Service Info */}
            <View className="flex-row items-center justify-between pb-4 border-b border-border">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
                  <MaterialIcons name="local-shipping" size={20} color="white" />
                </View>
                <View>
                  <Text className="text-xs text-muted">Serviço</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {MOCK_LABEL.service}
                  </Text>
                </View>
              </View>
            </View>

            {/* Weight Info */}
            <View className="flex-row items-center justify-between pb-4 border-b border-border">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-secondary items-center justify-center">
                  <MaterialIcons name="scale" size={20} color="white" />
                </View>
                <View>
                  <Text className="text-xs text-muted">Peso</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {MOCK_LABEL.weight}
                  </Text>
                </View>
              </View>
            </View>

            {/* Declared Value Info */}
            <View className="flex-row items-center justify-between pb-4 border-b border-border">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-accent items-center justify-center">
                  <MaterialIcons name="attach-money" size={20} color="white" />
                </View>
                <View>
                  <Text className="text-xs text-muted">Valor Declarado</Text>
                  <Text className="text-base font-semibold text-foreground">
                    {MOCK_LABEL.declaredValue}
                  </Text>
                </View>
              </View>
            </View>

            {/* Date Info */}
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
                <MaterialIcons name="calendar-today" size={20} color="white" />
              </View>
              <View>
                <Text className="text-xs text-muted">Data de Geração</Text>
                <Text className="text-base font-semibold text-foreground">
                  {MOCK_LABEL.generatedDate}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sender and Recipient Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Endereços
          </Text>

          {/* Sender */}
          <View className="bg-surface rounded-lg p-4 border border-border mb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="send" size={20} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground">
                Remetente
              </Text>
            </View>
            <Text className="text-base font-semibold text-foreground">
              {MOCK_LABEL.sender.name}
            </Text>
            <Text className="text-sm text-muted mt-1">
              {MOCK_LABEL.sender.address}
            </Text>
            <Text className="text-sm text-muted">
              {MOCK_LABEL.sender.city}, {MOCK_LABEL.sender.state}
            </Text>
          </View>

          {/* Recipient */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="location-on" size={20} color={colors.secondary} />
              <Text className="text-sm font-semibold text-foreground">
                Destinatário
              </Text>
            </View>
            <Text className="text-base font-semibold text-foreground">
              {MOCK_LABEL.recipient.name}
            </Text>
            <Text className="text-sm text-muted mt-1">
              {MOCK_LABEL.recipient.address}
            </Text>
            <Text className="text-sm text-muted">
              {MOCK_LABEL.recipient.city}, {MOCK_LABEL.recipient.state}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity
            onPress={handlePrint}
            className="flex-1 py-3 rounded-lg bg-primary flex-row items-center justify-center gap-2"
            activeOpacity={0.7}
          >
            <MaterialIcons name="print" size={20} color="white" />
            <Text className="text-white font-semibold">Imprimir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            className="flex-1 py-3 rounded-lg bg-secondary flex-row items-center justify-center gap-2"
            activeOpacity={0.7}
          >
            <MaterialIcons name="share" size={20} color="white" />
            <Text className="text-white font-semibold">Compartilhar</Text>
          </TouchableOpacity>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          className="py-3 rounded-lg bg-surface border border-border items-center justify-center mb-8"
          activeOpacity={0.7}
        >
          <Text className="text-foreground font-semibold">Voltar ao Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}

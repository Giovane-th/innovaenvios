import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import { MaterialIcons } from "@expo/vector-icons";
import { cn } from "@/lib/utils";
import { useCorreiosFreight, FreteOption } from "@/hooks/use-correios-freight";

interface FreteSelectProps {
  cepOrigem: string;
  cepDestino: string;
  peso: number;
  onSelectFrete: (frete: FreteOption) => void;
  selectedFrete?: FreteOption | null;
}

/**
 * Componente para selecionar opção de frete
 */
export function FreteSelector({
  cepOrigem,
  cepDestino,
  peso,
  onSelectFrete,
  selectedFrete,
}: FreteSelectProps) {
  const colors = useColors();
  const { fretes, loading, error, calcularFrete, selectFrete } =
    useCorreiosFreight();
  const [hasCalculated, setHasCalculated] = useState(false);

  // Calcular frete quando CEPs ou peso mudam
  useEffect(() => {
    if (cepOrigem && cepDestino && peso > 0) {
      calcularFrete(cepOrigem, cepDestino, peso);
      setHasCalculated(true);
    }
  }, [cepOrigem, cepDestino, peso, calcularFrete]);

  const handleSelectFrete = (frete: FreteOption) => {
    selectFrete(frete);
    onSelectFrete(frete);
  };

  if (!hasCalculated) {
    return (
      <View style={{ padding: 16, backgroundColor: colors.surface }}>
        <Text style={{ color: colors.muted, textAlign: "center" }}>
          Preencha CEP de origem, destino e peso para calcular frete
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View
        style={{
          padding: 24,
          alignItems: "center",
          backgroundColor: colors.surface,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{
            marginTop: 12,
            color: colors.muted,
            fontSize: 14,
          }}
        >
          Calculando frete...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          padding: 16,
          backgroundColor: colors.surface,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: colors.error,
        }}
      >
        <Text style={{ color: colors.error, fontWeight: "600" }}>
          Erro ao calcular frete
        </Text>
        <Text style={{ color: colors.muted, marginTop: 4, fontSize: 12 }}>
          {error}
        </Text>
      </View>
    );
  }

  if (fretes.length === 0) {
    return (
      <View style={{ padding: 16, backgroundColor: colors.surface }}>
        <Text style={{ color: colors.muted, textAlign: "center" }}>
          Nenhuma opção de frete disponível
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginVertical: 12 }}
      contentContainerStyle={{ paddingHorizontal: 4 }}
    >
      {fretes.map((frete) => {
        const isSelected =
          selectedFrete?.codigo === frete.codigo ||
          (fretes.length > 0 && !selectedFrete && fretes[0].codigo === frete.codigo);

        return (
          <TouchableOpacity
            key={frete.codigo}
            onPress={() => handleSelectFrete(frete)}
            style={{
              marginHorizontal: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: isSelected ? colors.primary : colors.surface,
              borderWidth: 2,
              borderColor: isSelected ? colors.primary : colors.border,
              minWidth: 160,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Serviço */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: isSelected ? "#ffffff" : colors.foreground,
                marginBottom: 4,
              }}
            >
              {frete.nome}
            </Text>

            {/* Preço */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: isSelected ? "#ffffff" : colors.primary,
                marginBottom: 4,
              }}
            >
              R$ {frete.valor.toFixed(2)}
            </Text>

            {/* Prazo */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="schedule"
                size={14}
                color={isSelected ? "#ffffff" : colors.muted}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: isSelected ? "#ffffff" : colors.muted,
                }}
              >
                {frete.prazo} dia{frete.prazo > 1 ? "s" : ""}
              </Text>
            </View>

            {/* Entrega no sábado */}
            {frete.entregaSabado && (
              <View
                style={{
                  marginTop: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                  backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : colors.success,
                  borderRadius: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color: isSelected ? "#ffffff" : colors.background,
                    fontWeight: "600",
                  }}
                >
                  Entrega sábado
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

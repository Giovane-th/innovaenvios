import { ScrollView, Text, View, TouchableOpacity, FlatList, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { MaterialIcons } from "@expo/vector-icons";

interface ShippingLabel {
  id: string;
  trackingCode: string;
  recipient: string;
  status: "generated" | "posted" | "transit" | "delivered";
  date: string;
}

const MOCK_LABELS: ShippingLabel[] = [
  {
    id: "1",
    trackingCode: "AA123456789BR",
    recipient: "João Silva",
    status: "generated",
    date: "Hoje",
  },
  {
    id: "2",
    trackingCode: "AA123456790BR",
    recipient: "Maria Santos",
    status: "posted",
    date: "Ontem",
  },
  {
    id: "3",
    trackingCode: "AA123456791BR",
    recipient: "Pedro Costa",
    status: "transit",
    date: "2 dias atrás",
  },
];

const STATUS_LABELS = {
  generated: "Gerada",
  posted: "Postada",
  transit: "Em trânsito",
  delivered: "Entregue",
};

const STATUS_COLORS = {
  generated: "#FFD700",
  posted: "#0066CC",
  transit: "#22B573",
  delivered: "#22C55E",
};

export default function HomeScreen() {
  const colors = useColors();
  const [refreshing, setRefreshing] = useState(false);
  const [labels, setLabels] = useState<ShippingLabel[]>(MOCK_LABELS);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simular carregamento de dados
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderLabelItem = ({ item }: { item: ShippingLabel }) => (
    <TouchableOpacity
      className="bg-surface rounded-lg p-4 mb-3 border border-border flex-row items-center justify-between"
      activeOpacity={0.7}
    >
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">
          {item.trackingCode}
        </Text>
        <Text className="text-xs text-muted mt-1">{item.recipient}</Text>
        <Text className="text-xs text-muted mt-1">{item.date}</Text>
      </View>
      <View
        className="px-3 py-1 rounded-full"
        style={{ backgroundColor: STATUS_COLORS[item.status] + "20" }}
      >
        <Text
          className="text-xs font-medium"
          style={{ color: STATUS_COLORS[item.status] }}
        >
          {STATUS_LABELS[item.status]}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="flex-1">
      <FlatList
        data={labels}
        renderItem={renderLabelItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListHeaderComponent={
          <View className="pb-6">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-8">
              <View>
                <Text className="text-2xl font-bold text-foreground">
                  In'Nova Envios
                </Text>
                <Text className="text-sm text-muted mt-1">
                  Bem-vindo de volta!
                </Text>
              </View>
              <TouchableOpacity
                className="w-10 h-10 rounded-full bg-surface items-center justify-center"
                activeOpacity={0.7}
              >
                <MaterialIcons name="menu" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Summary Cards */}
            <View className="flex-row gap-4 mb-8">
              {/* Envios Hoje */}
              <View className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <Text className="text-xs text-muted font-medium">Envios Hoje</Text>
                <Text className="text-3xl font-bold text-primary mt-2">5</Text>
                <Text className="text-xs text-muted mt-1">etiquetas geradas</Text>
              </View>

              {/* Pendentes */}
              <View className="flex-1 bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <Text className="text-xs text-muted font-medium">Pendentes</Text>
                <Text className="text-3xl font-bold text-secondary mt-2">2</Text>
                <Text className="text-xs text-muted mt-1">para postar</Text>
              </View>
            </View>

            {/* Últimos Envios Section */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-foreground">
                Últimos Envios
              </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text className="text-primary text-sm font-medium">Ver tudo</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-24 right-6 w-16 h-16 rounded-full bg-primary items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>
    </ScreenContainer>
  );
}

import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Image,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FreightSimulatorModal } from "@/components/freight-simulator-modal";

interface ShippingItem {
  id: string;
  code: string;
  recipient: string;
  status: "Gerada" | "Postada" | "Em trânsito" | "Entregue";
  date: string;
}

interface MenuOpcao {
  id: string;
  titulo: string;
  icone: string;
  cor: string;
  acao: () => void;
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { employee, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [shippings, setShippings] = useState<ShippingItem[]>([]);
  const [showFreightSimulator, setShowFreightSimulator] = useState(false);

  useEffect(() => {
    loadShippings();
  }, []);

  const loadShippings = async () => {
    try {
      const stored = await AsyncStorage.getItem("shipping_history");
      if (stored) {
        setShippings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShippings();
    setRefreshing(false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleCreateLabel = () => {
    router.push("/create-label");
  };

  const handleViewLabel = (item: ShippingItem) => {
    router.push({
      pathname: "/label-details",
      params: { id: item.id, code: item.code },
    });
  };

  const menuOpcoes: MenuOpcao[] = [
    { 
      id: '1', 
      titulo: 'Cadastrar Cliente', 
      icone: 'person-add', 
      cor: '#3B82F6', 
      acao: () => router.push('/clients') 
    },
    { 
      id: '2', 
      titulo: 'Criar Etiqueta', 
      icone: 'add-box', 
      cor: '#10B981', 
      acao: handleCreateLabel 
    },
    { 
      id: '3', 
      titulo: 'Rastrear Envio', 
      icone: 'local-shipping', 
      cor: '#F59E0B', 
      acao: () => router.push('/tracking') 
    },
    { 
      id: '4', 
      titulo: 'Consultar Clientes', 
      icone: 'search', 
      cor: '#8B5CF6', 
      acao: () => router.push('/clients') 
    },
    { 
      id: '5', 
      titulo: 'Relatórios', 
      icone: 'bar-chart', 
      cor: '#EC4899', 
      acao: () => router.push('/reports') 
    },
    { 
      id: '6', 
      titulo: 'Configurações', 
      icone: 'settings', 
      cor: '#6B7280', 
      acao: () => router.push('/settings') 
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Gerada":
        return colors.primary;
      case "Postada":
        return colors.secondary;
      case "Em trânsito":
        return "#F59E0B";
      case "Entregue":
        return colors.success;
      default:
        return colors.muted;
    }
  };

  return (
    <ScreenContainer className="flex-1">
      <FlatList
        data={shippings.slice(0, 5)}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleViewLabel(item)}
            activeOpacity={0.7}
            className="bg-surface rounded-lg p-4 border border-border mb-3 flex-row items-center justify-between"
          >
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground">
                {item.code}
              </Text>
              <Text className="text-sm text-muted mt-1">{item.recipient}</Text>
              <Text className="text-xs text-muted mt-1">{item.date}</Text>
            </View>

            <View className="items-end gap-2">
              <View
                style={{ backgroundColor: getStatusColor(item.status) + "20" }}
                className="rounded-full px-3 py-1"
              >
                <Text
                  style={{ color: getStatusColor(item.status) }}
                  className="text-xs font-semibold"
                >
                  {item.status}
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListHeaderComponent={
          <View className="pb-6">
            {/* Header with Logo */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1 flex-row items-center">
                <Image
                  source={require("@/assets/images/icon.png")}
                  style={{ width: 40, height: 40, marginRight: 12 }}
                />
                <View>
                  <Text className="text-2xl font-bold text-foreground">
                    InNova Envios - IEP
                  </Text>
                  <Text className="text-sm text-muted mt-1">
                    Bem-vindo, {employee?.name || 'Funcionário'}!
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/settings")}
                className="p-3 bg-surface rounded-lg border border-border"
                activeOpacity={0.7}
              >
                <MaterialIcons name="settings" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Watermark Background */}
            <View
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: [{ translateX: -75 }, { translateY: -75 }],
                opacity: 0.08,
                zIndex: 0,
              }}
            >
              <Image
                source={require("@/assets/images/icon.png")}
                style={{ width: 150, height: 150 }}
              />
            </View>

            {/* Menu de Opções */}
            <View className="mb-6">
              <Text className="text-lg font-semibold text-foreground mb-3">
                Opções Rápidas
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {menuOpcoes.map((opcao) => (
                  <TouchableOpacity
                    key={opcao.id}
                    onPress={opcao.acao}
                    activeOpacity={0.7}
                    style={{
                      width: '48%',
                      backgroundColor: opcao.cor + '15',
                      borderColor: opcao.cor,
                      borderWidth: 1,
                      borderRadius: 12,
                      padding: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialIcons name={opcao.icone as any} size={28} color={opcao.cor} />
                    <Text 
                      style={{ 
                        color: opcao.cor, 
                        marginTop: 8, 
                        fontSize: 12, 
                        fontWeight: '600', 
                        textAlign: 'center' 
                      }}
                    >
                      {opcao.titulo}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Stats Cards */}
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <Text className="text-sm text-blue-600 font-semibold">Envios Hoje</Text>
                <Text className="text-3xl font-bold text-primary mt-2">
                  {shippings.filter((s) => s.date === new Date().toISOString().split("T")[0])
                    .length}
                </Text>
                <Text className="text-xs text-blue-600 mt-1">etiquetas geradas</Text>
              </View>

              <View className="flex-1 bg-green-50 rounded-lg p-4 border border-green-200">
                <Text className="text-sm text-green-600 font-semibold">Pendentes</Text>
                <Text className="text-3xl font-bold text-secondary mt-2">
                  {shippings.filter((s) => s.status === "Gerada").length}
                </Text>
                <Text className="text-xs text-green-600 mt-1">para postar</Text>
              </View>
            </View>

            {/* Últimos Envios */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-foreground">
                Últimos Envios
              </Text>
              {shippings.length > 0 && (
                <TouchableOpacity activeOpacity={0.7}>
                  <Text className="text-primary font-semibold">Ver tudo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="bg-surface rounded-lg p-6 border border-border items-center my-8">
            <MaterialIcons name="local-shipping" size={48} color={colors.muted} />
            <Text className="text-foreground font-semibold mt-3 text-center">
              Nenhum envio ainda
            </Text>
            <Text className="text-muted text-sm text-center mt-1">
              Crie sua primeira etiqueta para começar
            </Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 rounded-lg py-3 flex-row items-center justify-center gap-2 border border-red-200 mt-8 mb-8"
            activeOpacity={0.7}
          >
            <MaterialIcons name="logout" size={20} color="#EF4444" />
            <Text className="text-red-600 font-semibold">Sair</Text>
          </TouchableOpacity>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}
      />

      {/* Floating Action Buttons */}
      <TouchableOpacity
        onPress={handleCreateLabel}
        className="absolute bottom-24 right-6 w-16 h-16 rounded-full bg-primary items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setShowFreightSimulator(true)}
        className="absolute bottom-40 right-6 w-14 h-14 rounded-full bg-blue-600 items-center justify-center shadow-lg"
        activeOpacity={0.8}
      >
        <MaterialIcons name="calculate" size={24} color="white" />
      </TouchableOpacity>

      {/* Freight Simulator Modal */}
      <FreightSimulatorModal
        visible={showFreightSimulator}
        onClose={() => setShowFreightSimulator(false)}
      />
    </ScreenContainer>
  );
}

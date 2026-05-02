import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ModalHeader } from "@/components/modal-header";
import { useRouter } from "expo-router";

interface Printer {
  id: string;
  name: string;
  ip: string;
  port: number;
  isDefault: boolean;
  addedAt: string;
}

const PRINTERS_STORAGE_KEY = "innova_printers";

export default function SettingsPrinterScreen() {
  const colors = useColors();
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [printerName, setPrinterName] = useState("");
  const [printerIP, setPrinterIP] = useState("");
  const [printerPort, setPrinterPort] = useState("9100");

  // Carregar impressoras ao montar
  useEffect(() => {
    loadPrinters();
  }, []);

  const loadPrinters = async () => {
    try {
      const stored = await AsyncStorage.getItem(PRINTERS_STORAGE_KEY);
      if (stored) {
        setPrinters(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Erro ao carregar impressoras:", error);
    }
  };

  const savePrinters = async (updatedPrinters: Printer[]) => {
    try {
      await AsyncStorage.setItem(
        PRINTERS_STORAGE_KEY,
        JSON.stringify(updatedPrinters)
      );
      setPrinters(updatedPrinters);
    } catch (error) {
      console.error("Erro ao salvar impressoras:", error);
    }
  };

  const handleAddPrinter = async () => {
    if (!printerName.trim() || !printerIP.trim()) {
      Alert.alert("Erro", "Preencha o nome e IP da impressora");
      return;
    }

    setLoading(true);
    try {
      // Aqui você pode adicionar teste de conexão com a impressora
      const newPrinter: Printer = {
        id: Date.now().toString(),
        name: printerName,
        ip: printerIP,
        port: parseInt(printerPort) || 9100,
        isDefault: printers.length === 0, // Primeira impressora é padrão
        addedAt: new Date().toISOString(),
      };

      const updated = [...printers, newPrinter];
      await savePrinters(updated);

      setPrinterName("");
      setPrinterIP("");
      setPrinterPort("9100");
      setShowForm(false);

      Alert.alert("Sucesso", "Impressora adicionada com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao adicionar impressora");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (printerId: string) => {
    const updated = printers.map((p) => ({
      ...p,
      isDefault: p.id === printerId,
    }));
    await savePrinters(updated);
  };

  const handleDeletePrinter = async (printerId: string) => {
    Alert.alert(
      "Confirmar",
      "Deseja remover esta impressora?",
      [
        { text: "Cancelar", onPress: () => {} },
        {
          text: "Remover",
          onPress: async () => {
            const updated = printers.filter((p) => p.id !== printerId);
            await savePrinters(updated);
          },
        },
      ]
    );
  };

  const handleTestConnection = async (printer: Printer) => {
    Alert.alert(
      "Teste de Conexão",
      `Testando conexão com ${printer.name}...\n\nIP: ${printer.ip}:${printer.port}`
    );
    // TODO: Implementar teste real de conexão
  };

  const router = useRouter();
  return (
    <ScreenContainer className="flex-1">
      <ModalHeader
        title="Impressoras"
        onClose={() => router.back()}
      />
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">

        {/* Add Printer Button */}
        {!showForm && (
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            className="bg-primary rounded-lg p-4 flex-row items-center justify-center gap-2 mb-6"
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={24} color="white" />
            <Text className="text-white font-semibold">Adicionar Impressora</Text>
          </TouchableOpacity>
        )}

        {/* Add Printer Form */}
        {showForm && (
          <View className="bg-surface rounded-lg p-4 border border-border mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-foreground">
                Nova Impressora
              </Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <MaterialIcons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Nome */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Nome
              </Text>
              <TextInput
                placeholder="Ex: Impressora 1"
                value={printerName}
                onChangeText={setPrinterName}
                editable={!loading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
              />
            </View>

            {/* IP */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Endereço IP
              </Text>
              <TextInput
                placeholder="Ex: 192.168.1.100"
                value={printerIP}
                onChangeText={setPrinterIP}
                editable={!loading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                keyboardType="decimal-pad"
              />
            </View>

            {/* Porta */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Porta
              </Text>
              <TextInput
                placeholder="9100"
                value={printerPort}
                onChangeText={setPrinterPort}
                editable={!loading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                keyboardType="number-pad"
              />
            </View>

            {/* Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleAddPrinter}
                disabled={loading}
                className="flex-1 bg-primary rounded-lg py-3 flex-row items-center justify-center gap-2"
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <MaterialIcons name="check" size={20} color="white" />
                )}
                <Text className="text-white font-semibold">
                  {loading ? "Adicionando..." : "Adicionar"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowForm(false)}
                disabled={loading}
                className="flex-1 bg-surface border border-border rounded-lg py-3 flex-row items-center justify-center gap-2"
                activeOpacity={0.7}
              >
                <Text className="text-foreground font-semibold">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Printers List */}
        {printers.length > 0 ? (
          <View className="mb-8">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Impressoras Configuradas
            </Text>

            <FlatList
              data={printers}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="bg-surface rounded-lg p-4 border border-border mb-3">
                  {/* Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <MaterialIcons name="print" size={20} color={colors.primary} />
                        <Text className="text-base font-semibold text-foreground">
                          {item.name}
                        </Text>
                        {item.isDefault && (
                          <View className="bg-primary rounded-full px-2 py-1">
                            <Text className="text-white text-xs font-semibold">
                              Padrão
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-sm text-muted mt-1">
                        {item.ip}:{item.port}
                      </Text>
                    </View>

                    {/* Delete Button */}
                    <TouchableOpacity
                      onPress={() => handleDeletePrinter(item.id)}
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="delete" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>

                  {/* Actions */}
                  <View className="flex-row gap-2">
                    {!item.isDefault && (
                      <TouchableOpacity
                        onPress={() => handleSetDefault(item.id)}
                        className="flex-1 bg-secondary rounded-lg py-2 flex-row items-center justify-center gap-1"
                        activeOpacity={0.7}
                      >
                        <MaterialIcons name="check-circle" size={16} color="white" />
                        <Text className="text-white text-xs font-semibold">
                          Definir como Padrão
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => handleTestConnection(item)}
                      className="flex-1 bg-primary rounded-lg py-2 flex-row items-center justify-center gap-1"
                      activeOpacity={0.7}
                    >
                      <MaterialIcons name="wifi" size={16} color="white" />
                      <Text className="text-white text-xs font-semibold">
                        Testar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          </View>
        ) : (
          <View className="bg-surface rounded-lg p-6 border border-border items-center">
            <MaterialIcons name="print" size={48} color={colors.muted} />
            <Text className="text-foreground font-semibold mt-3 text-center">
              Nenhuma impressora configurada
            </Text>
            <Text className="text-muted text-sm text-center mt-1">
              Adicione uma impressora para começar a imprimir etiquetas
            </Text>
          </View>
        )}

        {/* Info Section */}
        <View className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-6 mb-8">
          <View className="flex-row gap-3">
            <MaterialIcons name="info" size={20} color="#0066CC" />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-blue-900">
                Dica: Impressoras de Rede
              </Text>
              <Text className="text-xs text-blue-800 mt-1">
                Use impressoras de rede (IP) para melhor compatibilidade. Porta padrão: 9100
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

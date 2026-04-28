import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useThermalPrinter } from "@/hooks/use-thermal-printer";
import { MaterialIcons } from "@expo/vector-icons";

export default function PrinterSettingsScreen() {
  const colors = useColors();
  const router = useRouter();
  const {
    printers,
    defaultPrinter,
    loadPrinters,
    addPrinter,
    testConnection,
    setDefault,
    removePrinter,
  } = useThermalPrinter();

  const [showAddModal, setShowAddModal] = useState(false);
  const [printerName, setPrinterName] = useState("");
  const [printerIP, setPrinterIP] = useState("");
  const [printerPort, setPrinterPort] = useState("9100");
  const [printerWidth, setPrinterWidth] = useState<"58" | "80">("80");
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadPrinters();
  }, []);

  const handleAddPrinter = async () => {
    if (!printerName.trim() || !printerIP.trim() || !printerPort.trim()) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      // Testar conexão primeiro
      const connected = await testConnection(printerIP, parseInt(printerPort));
      if (!connected) {
        Alert.alert(
          "Aviso",
          "Não foi possível conectar à impressora. Deseja adicionar mesmo assim?"
        );
      }

      await addPrinter(
        printerName,
        printerIP,
        parseInt(printerPort),
        printerWidth === "58" ? 58 : 80
      );

      Alert.alert("Sucesso", "Impressora adicionada!");
      setPrinterName("");
      setPrinterIP("");
      setPrinterPort("9100");
      setPrinterWidth("80");
      setShowAddModal(false);
    } catch (error) {
      Alert.alert("Erro", error instanceof Error ? error.message : "Erro ao adicionar impressora");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (ip: string, port: string) => {
    setIsTesting(true);
    try {
      const connected = await testConnection(ip, parseInt(port));
      Alert.alert(
        "Resultado",
        connected ? "Conexão bem-sucedida!" : "Não foi possível conectar"
      );
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <ScreenContainer className="bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
          <View className="flex-row items-center gap-3 flex-1">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">Impressoras</Text>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 py-6 gap-6">
          {/* Add Printer Button */}
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="bg-primary rounded-lg py-4 flex-row items-center justify-center gap-2"
            activeOpacity={0.7}
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text className="text-white font-semibold text-base">Adicionar Impressora</Text>
          </TouchableOpacity>

          {/* Printers List */}
          {printers.length > 0 ? (
            <View>
              <Text className="text-sm font-semibold text-foreground mb-3">
                Impressoras Configuradas ({printers.length})
              </Text>

              <FlatList
                data={printers}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
                    <View className="flex-row items-start justify-between mb-2">
                      <View className="flex-1">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-sm font-semibold text-foreground flex-1">
                            {item.name}
                          </Text>
                          {defaultPrinter?.id === item.id && (
                            <View className="bg-green-100 rounded px-2 py-1">
                              <Text className="text-xs font-semibold text-success">Padrão</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs text-muted mt-1">
                          {item.ip}:{item.port} ({item.width}mm)
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row gap-2 mt-3">
                      <TouchableOpacity
                        onPress={() => handleTestConnection(item.ip, item.port.toString())}
                        disabled={isTesting}
                        className="flex-1 bg-blue-100 rounded py-2 flex-row items-center justify-center gap-1"
                        activeOpacity={0.7}
                      >
                        {isTesting ? (
                          <ActivityIndicator color={colors.primary} size="small" />
                        ) : (
                          <MaterialIcons name="check-circle-outline" size={16} color={colors.primary} />
                        )}
                        <Text className="text-xs font-semibold text-primary">Testar</Text>
                      </TouchableOpacity>

                      {defaultPrinter?.id !== item.id && (
                        <TouchableOpacity
                          onPress={() => setDefault(item.id)}
                          className="flex-1 bg-yellow-100 rounded py-2 flex-row items-center justify-center gap-1"
                          activeOpacity={0.7}
                        >
                          <MaterialIcons name="star-outline" size={16} color="#F59E0B" />
                          <Text className="text-xs font-semibold text-warning">Padrão</Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            "Remover",
                            `Deseja remover ${item.name}?`,
                            [
                              { text: "Cancelar", style: "cancel" },
                              {
                                text: "Remover",
                                style: "destructive",
                                onPress: () => removePrinter(item.id),
                              },
                            ]
                          );
                        }}
                        className="flex-1 bg-red-100 rounded py-2 flex-row items-center justify-center gap-1"
                        activeOpacity={0.7}
                      >
                        <MaterialIcons name="delete-outline" size={16} color="#EF4444" />
                        <Text className="text-xs font-semibold text-error">Remover</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            </View>
          ) : (
            <View className="bg-surface rounded-lg p-6 items-center gap-2">
              <MaterialIcons name="print" size={32} color={colors.muted} />
              <Text className="text-sm text-muted">Nenhuma impressora configurada</Text>
              <Text className="text-xs text-muted text-center">
                Clique em "Adicionar Impressora" para começar
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Printer Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
        presentationStyle="formSheet"
      >
        <ScreenContainer className="bg-white">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
            <Text className="text-xl font-bold text-foreground flex-1">
              Adicionar Impressora
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)} activeOpacity={0.7}>
              <MaterialIcons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Modal Form */}
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            className="px-6 py-4"
          >
            <View className="gap-4">
              {/* Nome */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Nome da Impressora *
                </Text>
                <TextInput
                  placeholder="Ex: Impressora Sala 1"
                  value={printerName}
                  onChangeText={setPrinterName}
                  editable={!isLoading}
                  placeholderTextColor={colors.muted}
                  className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                />
              </View>

              {/* IP */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Endereço IP *
                </Text>
                <TextInput
                  placeholder="192.168.1.100"
                  value={printerIP}
                  onChangeText={setPrinterIP}
                  editable={!isLoading}
                  placeholderTextColor={colors.muted}
                  className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                  keyboardType="numeric"
                />
              </View>

              {/* Porta */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Porta *
                </Text>
                <TextInput
                  placeholder="9100"
                  value={printerPort}
                  onChangeText={setPrinterPort}
                  editable={!isLoading}
                  placeholderTextColor={colors.muted}
                  className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                  keyboardType="numeric"
                />
              </View>

              {/* Largura */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Largura da Etiqueta *
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setPrinterWidth("58")}
                    className={`flex-1 rounded-lg py-3 border-2 items-center ${
                      printerWidth === "58"
                        ? "border-primary bg-blue-50"
                        : "border-border bg-white"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`font-semibold ${
                        printerWidth === "58" ? "text-primary" : "text-foreground"
                      }`}
                    >
                      58mm
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setPrinterWidth("80")}
                    className={`flex-1 rounded-lg py-3 border-2 items-center ${
                      printerWidth === "80"
                        ? "border-primary bg-blue-50"
                        : "border-border bg-white"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`font-semibold ${
                        printerWidth === "80" ? "text-primary" : "text-foreground"
                      }`}
                    >
                      80mm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Buttons */}
              <View className="gap-3 mt-6 pb-6">
                <TouchableOpacity
                  onPress={handleAddPrinter}
                  disabled={isLoading}
                  className="bg-primary rounded-lg py-4 flex-row items-center justify-center gap-2"
                  activeOpacity={0.7}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <MaterialIcons name="add" size={20} color="white" />
                  )}
                  <Text className="text-white font-semibold text-base">
                    {isLoading ? "Adicionando..." : "Adicionar Impressora"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  disabled={isLoading}
                  className="border border-border rounded-lg py-4 flex-row items-center justify-center gap-2"
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="close" size={20} color={colors.foreground} />
                  <Text className="text-foreground font-semibold text-base">
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}

import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useAuth } from "@/lib/auth-context";
import { MaterialIcons } from "@expo/vector-icons";

export default function LoginScreen() {
  const colors = useColors();
  const { login, loading } = useAuth();

  const [cartaoPostagem, setCartaoPostagem] = useState("");
  const [contrato, setContrato] = useState("");
  const [cnpj, setCNPJ] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!cartaoPostagem.trim() || !contrato.trim()) {
      Alert.alert("Erro", "Preencha o Cartão de Postagem e Contrato");
      return;
    }

    try {
      await login(cartaoPostagem, contrato, cnpj || undefined);
    } catch (error) {
      Alert.alert(
        "Erro ao fazer login",
        error instanceof Error ? error.message : "Tente novamente"
      );
    }
  };

  return (
    <ScreenContainer containerClassName="bg-gradient-to-b from-blue-50 to-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-between py-8 px-6">
          {/* Logo Section */}
          <View className="items-center pt-12 pb-8">
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 140, height: 140 }}
              contentFit="contain"
            />
            <Text className="text-2xl font-bold text-primary mt-6 text-center">
              In'Nova Envios
            </Text>
            <Text className="text-sm text-muted mt-2">
              Geração de Etiquetas
            </Text>
          </View>

          {/* Form Section */}
          <View className="gap-4">
            {/* Cartão de Postagem */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Cartão de Postagem
              </Text>
              <TextInput
                placeholder="0076337634"
                value={cartaoPostagem}
                onChangeText={setCartaoPostagem}
                editable={!loading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                keyboardType="numeric"
              />
            </View>

            {/* Contrato */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Número do Contrato
              </Text>
              <TextInput
                placeholder="9912528344"
                value={contrato}
                onChangeText={setContrato}
                editable={!loading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                keyboardType="numeric"
              />
            </View>

            {/* CNPJ (Opcional) */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                CNPJ (Opcional)
              </Text>
              <TextInput
                placeholder="36543139000129"
                value={cnpj}
                onChangeText={setCNPJ}
                editable={!loading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                keyboardType="numeric"
              />
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="bg-primary rounded-lg py-4 flex-row items-center justify-center gap-2 mt-4"
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <MaterialIcons name="login" size={20} color="white" />
              )}
              <Text className="text-white font-semibold text-base">
                {loading ? "Entrando..." : "Entrar"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-6">
            <View className="flex-row gap-3">
              <MaterialIcons name="info" size={20} color="#0066CC" />
              <View className="flex-1">
                <Text className="text-xs font-semibold text-blue-900">
                  Dados de Teste
                </Text>
                <Text className="text-xs text-blue-800 mt-1">
                  Use suas credenciais dos Correios para fazer login
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

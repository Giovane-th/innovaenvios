import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";
import { useState } from "react";
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
    <ImageBackground
      source={require("@/assets/images/login-bg.png")}
      style={{ flex: 1 }}
      imageStyle={{ resizeMode: "cover" }}
    >
      <ScreenContainer containerClassName="bg-transparent">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-end pb-12 px-6">
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
          </View>
        </ScrollView>
      </ScreenContainer>
    </ImageBackground>
  );
}

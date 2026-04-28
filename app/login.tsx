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
  const { loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Erro", "Preencha o email e senha");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Integrar com API de autenticação do backend
      // Por enquanto, simular login bem-sucedido
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Simular sucesso
      Alert.alert("Sucesso", "Login realizado com sucesso!");
      
      // Limpar formulário
      setEmail("");
      setPassword("");
    } catch (error) {
      Alert.alert(
        "Erro ao fazer login",
        error instanceof Error ? error.message : "Tente novamente"
      );
    } finally {
      setIsLoading(false);
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
              {/* Email */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Email
                </Text>
                <TextInput
                  placeholder="seu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  editable={!isLoading}
                  placeholderTextColor={colors.muted}
                  className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Senha */}
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">
                  Senha
                </Text>
                <View className="flex-row items-center border border-border rounded-lg bg-white px-4">
                  <TextInput
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                    placeholderTextColor={colors.muted}
                    className="flex-1 py-3 text-foreground"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={showPassword ? "visibility" : "visibility-off"}
                      size={20}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className="bg-primary rounded-lg py-4 flex-row items-center justify-center gap-2 mt-4"
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <MaterialIcons name="login" size={20} color="white" />
                )}
                <Text className="text-white font-semibold text-base">
                  {isLoading ? "Entrando..." : "Entrar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    </ImageBackground>
  );
}

import { ScrollView, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { Image } from "expo-image";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

export default function LoginScreen() {
  const colors = useColors();
  const [cartao, setCartao] = useState("");
  const [contrato, setContrato] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    
    if (!cartao.trim() || !contrato.trim() || !senha.trim()) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      // TODO: Integrar com API de autenticação dos Correios
      console.log("Login attempt:", { cartao, contrato, senha });
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Após sucesso, redirecionar para Home
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
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
              style={{ width: 120, height: 120 }}
              contentFit="contain"
            />
            <Text className="text-3xl font-bold text-foreground mt-6 text-center">
              In'Nova Envios
            </Text>
            <Text className="text-base text-muted mt-2">
              Gere etiquetas de envio com facilidade
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
                placeholder="00000000000"
                value={cartao}
                onChangeText={setCartao}
                editable={!loading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-surface"
                keyboardType="number-pad"
              />
            </View>

            {/* Número do Contrato */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Número do Contrato
              </Text>
              <TextInput
                placeholder="0000000000"
                value={contrato}
                onChangeText={setContrato}
                editable={!loading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-surface"
                keyboardType="number-pad"
              />
            </View>

            {/* Senha de Componente */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Senha de Componente
              </Text>
              <TextInput
                placeholder="••••••••"
                value={senha}
                onChangeText={setSenha}
                editable={!loading}
                secureTextEntry
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-surface"
              />
            </View>

            {/* Error Message */}
            {error ? (
              <View className="bg-red-50 border border-error rounded-lg p-3">
                <Text className="text-error text-sm">{error}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={cn(
                "rounded-lg py-3 flex-row items-center justify-center gap-2",
                loading ? "bg-primary opacity-70" : "bg-primary"
              )}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : null}
              <Text className="text-white font-semibold text-base">
                {loading ? "Entrando..." : "Entrar"}
              </Text>
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity className="items-center py-2">
              <Text className="text-primary text-sm font-medium">
                Esqueceu a senha?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View className="items-center pt-8">
            <Text className="text-xs text-muted text-center">
              Conecte-se com segurança aos Correios
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

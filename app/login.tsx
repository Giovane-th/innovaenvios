import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { MaterialIcons } from "@expo/vector-icons";

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");

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

  const handleSignUp = async () => {
    if (
      !signUpName.trim() ||
      !signUpEmail.trim() ||
      !signUpPassword.trim() ||
      !signUpConfirmPassword.trim()
    ) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      Alert.alert("Erro", "As senhas não conferem");
      return;
    }

    if (signUpPassword.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Integrar com API de cadastro do backend
      // Por enquanto, simular cadastro bem-sucedido
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert("Sucesso", "Usuário cadastrado com sucesso! Faça login agora.");

      // Limpar formulário e voltar ao login
      setSignUpName("");
      setSignUpEmail("");
      setSignUpPassword("");
      setSignUpConfirmPassword("");
      setIsSignUp(false);
    } catch (error) {
      Alert.alert(
        "Erro ao cadastrar",
        error instanceof Error ? error.message : "Tente novamente"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View className="items-center pt-8 pb-6">
          <Image
            source={require("@/assets/images/login-bg.png")}
            style={{ width: "100%", height: 280, resizeMode: "contain" }}
          />
        </View>

        {/* Form Section */}
        <View className="flex-1 px-6 pb-8">
          {!isSignUp ? (
            // Login Form
            <>
              <Text className="text-2xl font-bold text-foreground mb-6 text-center">
                Entrar
              </Text>

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
                  className="bg-primary rounded-lg py-4 flex-row items-center justify-center gap-2 mt-2"
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

              {/* Signup Link */}
              <View className="flex-row items-center justify-center gap-2 mt-6">
                <Text className="text-muted">Não tem uma conta?</Text>
                <TouchableOpacity onPress={() => setIsSignUp(true)} activeOpacity={0.7}>
                  <Text className="text-primary font-semibold">Cadastre-se</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Sign Up Form
            <>
              <Text className="text-2xl font-bold text-foreground mb-6 text-center">
                Cadastrar
              </Text>

              <View className="gap-4">
                {/* Nome */}
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Nome Completo
                  </Text>
                  <TextInput
                    placeholder="Seu nome"
                    value={signUpName}
                    onChangeText={setSignUpName}
                    editable={!isLoading}
                    placeholderTextColor={colors.muted}
                    className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                  />
                </View>

                {/* Email */}
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Email
                  </Text>
                  <TextInput
                    placeholder="seu@email.com"
                    value={signUpEmail}
                    onChangeText={setSignUpEmail}
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
                  <TextInput
                    placeholder="••••••••"
                    value={signUpPassword}
                    onChangeText={setSignUpPassword}
                    editable={!isLoading}
                    placeholderTextColor={colors.muted}
                    className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                {/* Confirmar Senha */}
                <View>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Confirmar Senha
                  </Text>
                  <TextInput
                    placeholder="••••••••"
                    value={signUpConfirmPassword}
                    onChangeText={setSignUpConfirmPassword}
                    editable={!isLoading}
                    placeholderTextColor={colors.muted}
                    className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                  onPress={handleSignUp}
                  disabled={isLoading}
                  className="bg-primary rounded-lg py-4 flex-row items-center justify-center gap-2 mt-2"
                  activeOpacity={0.7}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <MaterialIcons name="person-add" size={20} color="white" />
                  )}
                  <Text className="text-white font-semibold text-base">
                    {isLoading ? "Cadastrando..." : "Cadastrar"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Link */}
              <View className="flex-row items-center justify-center gap-2 mt-6">
                <Text className="text-muted">Já tem uma conta?</Text>
                <TouchableOpacity onPress={() => setIsSignUp(false)} activeOpacity={0.7}>
                  <Text className="text-primary font-semibold">Entrar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

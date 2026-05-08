import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useColors } from "@/hooks/use-colors";

interface EmployeeAuthModalProps {
  visible: boolean;
  onAuthenticate: (employee: any) => void;
  onCancel: () => void;
}

export function EmployeeAuthModal({
  visible,
  onAuthenticate,
  onCancel,
}: EmployeeAuthModalProps) {
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuthenticate() {
    if (!email || !password) {
      Alert.alert("Erro", "Email e senha são obrigatórios");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/employees/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Autenticação falhou");
      }

      const { employee } = await response.json();
      onAuthenticate(employee);
      setEmail("");
      setPassword("");
    } catch (error) {
      Alert.alert("Erro", "Email ou senha incorretos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 12,
            padding: 24,
            width: "100%",
            maxWidth: 400,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.foreground,
              marginBottom: 20,
            }}
          >
            Autenticação de Funcionário
          </Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              color: "black",
              backgroundColor: colors.surface,
            }}
            placeholderTextColor={colors.muted}
          />

          <TextInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
              color: "black",
              backgroundColor: colors.surface,
            }}
            placeholderTextColor={colors.muted}
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onCancel}
              disabled={loading}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.surface,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAuthenticate}
              disabled={loading}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.primary,
                alignItems: "center",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={{ color: colors.background, fontWeight: "600" }}>
                  Autenticar
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { Ionicons } from "@expo/vector-icons";

interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
}

export default function EmployeesScreen() {
  const router = useRouter();
  const colors = useColors();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    setLoading(true);
    try {
      const response = await fetch("/api/employees");
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEmployee() {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert("Erro", "Todos os campos são obrigatórios");
      return;
    }

    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Falha ao criar funcionário");
      }

      Alert.alert("Sucesso", "Funcionário criado com sucesso");
      setFormData({ name: "", email: "", password: "" });
      setShowForm(false);
      loadEmployees();
    } catch (error) {
      Alert.alert("Erro", "Falha ao criar funcionário");
    }
  }

  async function handleDeleteEmployee(id: number) {
    Alert.alert(
      "Confirmar",
      "Tem certeza que deseja deletar este funcionário?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`/api/employees/${id}`, {
                method: "DELETE",
              });

              if (!response.ok) {
                throw new Error("Falha ao deletar");
              }

              Alert.alert("Sucesso", "Funcionário deletado");
              loadEmployees();
            } catch (error) {
              Alert.alert("Erro", "Falha ao deletar funcionário");
            }
          },
        },
      ]
    );
  }

  return (
    <ScreenContainer className="p-4">
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "600", color: colors.foreground }}>
          Funcionários
        </Text>
        <TouchableOpacity
          onPress={() => setShowForm(!showForm)}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: colors.primary,
            borderRadius: 6,
          }}
        >
          <Ionicons name="add" size={24} color={colors.background} />
        </TouchableOpacity>
      </View>

      {showForm && (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            Novo Funcionário
          </Text>

          <TextInput
            placeholder="Nome"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              color: "black",
            }}
            placeholderTextColor={colors.muted}
          />

          <TextInput
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              color: "black",
            }}
            placeholderTextColor={colors.muted}
          />

          <TextInput
            placeholder="Senha"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              marginBottom: 12,
              color: "black",
            }}
            placeholderTextColor={colors.muted}
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => setShowForm(false)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.border,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCreateEmployee}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.primary,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.background, fontWeight: "600" }}>
                Criar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderLeftWidth: 4,
                borderLeftColor: item.active ? colors.success : colors.error,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
                    {item.email}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                    {item.role === "admin" ? "Administrador" : "Funcionário"}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleDeleteEmployee(item.id)}
                  style={{ padding: 8 }}
                >
                  <Ionicons name="trash" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}

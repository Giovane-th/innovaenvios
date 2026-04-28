import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useStudents } from "@/hooks/use-students";
import { MaterialIcons } from "@expo/vector-icons";

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  onStudentAdded?: (studentId: string) => void;
}

export function AddStudentModal({
  visible,
  onClose,
  onStudentAdded,
}: AddStudentModalProps) {
  const colors = useColors();
  const { addStudent } = useStudents();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddStudent = async () => {
    if (!nome.trim() || !cep.trim() || !endereco.trim() || !numero.trim() || !bairro.trim() || !cidade.trim() || !estado.trim()) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios");
      return;
    }

    setIsLoading(true);
    try {
      const newStudent = await addStudent({
        nome,
        email: email || undefined,
        telefone: telefone || undefined,
        cep,
        endereco,
        numero,
        complemento: complemento || undefined,
        bairro,
        cidade,
        estado,
      });

      Alert.alert("Sucesso", "Cliente cadastrado com sucesso!");

      // Limpar formulário
      setNome("");
      setEmail("");
      setTelefone("");
      setCep("");
      setEndereco("");
      setNumero("");
      setComplemento("");
      setBairro("");
      setCidade("");
      setEstado("");

      onStudentAdded?.(newStudent.id);
      onClose();
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error ? error.message : "Erro ao cadastrar cliente"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="formSheet"
    >
      <ScreenContainer className="bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
          <Text className="text-xl font-bold text-foreground flex-1">
            Novo Cliente
          </Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <MaterialIcons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Form */}
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="px-6 py-4"
        >
          <View className="gap-4">
            {/* Nome */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Nome Completo *
              </Text>
              <TextInput
                placeholder="Nome do cliente"
                value={nome}
                onChangeText={setNome}
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
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                editable={!isLoading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Telefone */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Telefone
              </Text>
              <TextInput
                placeholder="(11) 99999-9999"
                value={telefone}
                onChangeText={setTelefone}
                editable={!isLoading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                keyboardType="phone-pad"
              />
            </View>

            {/* CEP */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                CEP *
              </Text>
              <TextInput
                placeholder="12345-678"
                value={cep}
                onChangeText={setCep}
                editable={!isLoading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                keyboardType="numeric"
              />
            </View>

            {/* Endereço */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Endereço *
              </Text>
              <TextInput
                placeholder="Rua, Avenida, etc"
                value={endereco}
                onChangeText={setEndereco}
                editable={!isLoading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
              />
            </View>

            {/* Número */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Número *
              </Text>
              <TextInput
                placeholder="123"
                value={numero}
                onChangeText={setNumero}
                editable={!isLoading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
                keyboardType="numeric"
              />
            </View>

            {/* Complemento */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Complemento
              </Text>
              <TextInput
                placeholder="Apto, Sala, etc"
                value={complemento}
                onChangeText={setComplemento}
                editable={!isLoading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
              />
            </View>

            {/* Bairro */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Bairro *
              </Text>
              <TextInput
                placeholder="Nome do bairro"
                value={bairro}
                onChangeText={setBairro}
                editable={!isLoading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
              />
            </View>

            {/* Cidade */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Cidade *
              </Text>
              <TextInput
                placeholder="Nome da cidade"
                value={cidade}
                onChangeText={setCidade}
                editable={!isLoading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-white"
              />
            </View>

            {/* Estado */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Estado *
              </Text>
              <TextInput
                placeholder="SP"
                value={estado}
                onChangeText={setEstado}
                editable={!isLoading}
                placeholderTextColor={colors.muted}
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-white uppercase"
                maxLength={2}
              />
            </View>

            {/* Buttons */}
            <View className="gap-3 mt-6 pb-6">
              <TouchableOpacity
                onPress={handleAddStudent}
                disabled={isLoading}
                className="bg-primary rounded-lg py-4 flex-row items-center justify-center gap-2"
                activeOpacity={0.7}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <MaterialIcons name="person-add" size={20} color="white" />
                )}
                <Text className="text-white font-semibold text-base">
                  {isLoading ? "Cadastrando..." : "Cadastrar Cliente"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
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
  );
}

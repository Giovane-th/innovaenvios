import {
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useState } from "react";
import { ScreenContainer } from "@/components/screen-container";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { MaterialIcons } from "@expo/vector-icons";
import { cn } from "@/lib/utils";
import { AddStudentModal } from "./add-student-modal";
import { useStudents } from "@/hooks/use-students";
import { FreteSelector } from "@/components/frete-selector";
import { LabelPrintButton } from "@/components/label-print-button";
import { EmployeeAuthModal } from "@/components/employee-auth-modal";
import type { FreteOption } from "@/hooks/use-correios-freight";
import type { LabelData } from "@/lib/services/label-generator";

interface FormData {
  // Remetente
  senderName: string;
  senderCEP: string;
  senderAddress: string;
  senderNumber: string;
  senderComplement: string;
  senderCity: string;
  senderState: string;
  senderPhone: string;

  // Destinatário
  recipientName: string;
  recipientCEP: string;
  recipientAddress: string;
  recipientNumber: string;
  recipientComplement: string;
  recipientCity: string;
  recipientState: string;
  recipientPhone: string;

  // Objeto
  serviceType: string;
  weight: string;
  height: string;
  width: string;
  depth: string;
  declaredValue: string;
  description: string;
}

export default function CreateLabelScreen() {
  const colors = useColors();
  const router = useRouter();
  const { searchStudents, loadStudents } = useStudents();
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [form, setForm] = useState<FormData>({
    senderName: "Minha Empresa LTDA",
    senderCEP: "01310100",
    senderAddress: "Avenida Paulista",
    senderNumber: "1000",
    senderComplement: "Sala 100",
    senderCity: "São Paulo",
    senderState: "SP",
    senderPhone: "(11) 3000-0000",

    recipientName: "",
    recipientCEP: "",
    recipientAddress: "",
    recipientNumber: "",
    recipientComplement: "",
    recipientCity: "",
    recipientState: "",
    recipientPhone: "",

    serviceType: "PAC",
    weight: "",
    height: "",
    width: "",
    depth: "",
    declaredValue: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState<"sender" | "recipient" | "object">("recipient");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [showStudentList, setShowStudentList] = useState(false);
  const [selectedFrete, setSelectedFrete] = useState<FreteOption | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const studentSearchResults = studentSearchQuery.trim() ? searchStudents(studentSearchQuery) : { students: [], total: 0 };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectStudent = (studentId: string) => {
    loadStudents().then(() => {
      const results = searchStudents("");
      const student = results.students.find((s) => s.id === studentId);
      if (student) {
        setForm((prev) => ({
          ...prev,
          recipientName: student.nome,
          recipientCEP: student.cep,
          recipientAddress: student.endereco,
          recipientNumber: student.numero,
          recipientComplement: student.complemento || "",
          recipientCity: student.cidade,
          recipientState: student.estado,
          recipientPhone: student.telefone || "",
        }));
        setShowStudentList(false);
        setStudentSearchQuery("");
      }
    });
  };

  const handleGenerateLabel = async () => {
    if (!currentEmployee) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    try {
      // TODO: Integrar com API de pré-postagem dos Correios
      console.log("Generate label:", form);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Após sucesso, redirecionar para tela de detalhes
    } catch (err) {
      console.error("Error generating label:", err);
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({
    title,
    section,
  }: {
    title: string;
    section: "sender" | "recipient" | "object";
  }) => (
    <Pressable
      onPress={() =>
        setExpandedSection(expandedSection === section ? "recipient" : section)
      }
      className="flex-row items-center justify-between py-3 px-4 bg-surface rounded-lg mb-4 border border-border"
    >
      <Text className="text-base font-semibold text-foreground">{title}</Text>
      <MaterialIcons
        name={expandedSection === section ? "expand-less" : "expand-more"}
        size={24}
        color={colors.foreground}
      />
    </Pressable>
  );

  const FormField = ({
    label,
    value,
    field,
    placeholder,
    keyboardType = "default",
    editable = true,
  }: {
    label: string;
    value: string;
    field: keyof FormData;
    placeholder?: string;
    keyboardType?: string;
    editable?: boolean;
  }) => (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-foreground mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={(text) => handleInputChange(field, text)}
        placeholder={placeholder || label}
        placeholderTextColor={colors.muted}
        editable={editable}
        keyboardType={keyboardType as any}
        className={cn(
          "border border-border rounded-lg px-4 py-3 text-foreground bg-surface",
          !editable && "opacity-50"
        )}
      />
    </View>
  );

  return (
    <ScreenContainer className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6 mt-4">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Nova Etiqueta</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <MaterialIcons name="close" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Employee Section */}
        {currentEmployee ? (
          <View className="bg-green-100 rounded-lg p-3 flex-row items-center justify-between mb-6">
            <Text className="text-green-800 font-semibold">👤 {currentEmployee.name}</Text>
            <TouchableOpacity
              onPress={() => setCurrentEmployee(null)}
              className="px-3 py-1 bg-red-500 rounded"
            >
              <Text className="text-white text-sm">Sair</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setShowAuthModal(true)}
            className="bg-blue-100 rounded-lg p-3 items-center mb-6"
          >
            <Text className="text-blue-800 font-semibold">Autenticar Funcionário</Text>
          </TouchableOpacity>
        )}

        {/* Sender Section */}
        <SectionHeader title="📤 Remetente" section="sender" />
        {expandedSection === "sender" && (
          <View className="mb-6 pb-4 border-b border-border">
            <FormField
              label="Nome da Empresa"
              value={form.senderName}
              field="senderName"
            />
            <FormField
              label="CEP"
              value={form.senderCEP}
              field="senderCEP"
              keyboardType="number-pad"
            />
            <FormField
              label="Endereço"
              value={form.senderAddress}
              field="senderAddress"
            />
            <FormField
              label="Número"
              value={form.senderNumber}
              field="senderNumber"
              keyboardType="number-pad"
            />
            <FormField
              label="Complemento"
              value={form.senderComplement}
              field="senderComplement"
            />
            <FormField
              label="Cidade"
              value={form.senderCity}
              field="senderCity"
            />
            <FormField
              label="Estado"
              value={form.senderState}
              field="senderState"
            />
            <FormField
              label="Telefone"
              value={form.senderPhone}
              field="senderPhone"
              keyboardType="phone-pad"
            />
          </View>
        )}

        {/* Recipient Section */}
        <SectionHeader title="📬 Destinatário" section="recipient" />
        {expandedSection === "recipient" && (
          <View className="mb-6 pb-4 border-b border-border">
            {/* Buttons for Student Management */}
            <View className="flex-row gap-2 mb-4">
              <TouchableOpacity
                onPress={() => setShowStudentList(!showStudentList)}
                className="flex-1 bg-blue-100 rounded-lg py-2 px-3 flex-row items-center justify-center gap-2"
                activeOpacity={0.7}
              >
                <MaterialIcons name="search" size={18} color={colors.primary} />
                <Text className="text-sm font-semibold text-primary">Buscar Cliente</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowAddStudentModal(true)}
                className="flex-1 bg-green-100 rounded-lg py-2 px-3 flex-row items-center justify-center gap-2"
                activeOpacity={0.7}
              >
                <MaterialIcons name="person-add" size={18} color="#22C55E" />
                <Text className="text-sm font-semibold text-success">Novo Cliente</Text>
              </TouchableOpacity>
            </View>

            {/* Student Search */}
            {showStudentList && (
              <View className="mb-4 p-3 bg-surface rounded-lg border border-border">
                <TextInput
                  placeholder="Buscar por nome ou email..."
                  value={studentSearchQuery}
                  onChangeText={setStudentSearchQuery}
                  placeholderTextColor={colors.muted}
                  className="border border-border rounded-lg px-3 py-2 text-foreground mb-2"
                />
                {studentSearchResults.total > 0 ? (
                  <ScrollView className="max-h-40">
                    {studentSearchResults.students.map((student) => (
                      <TouchableOpacity
                        key={student.id}
                        onPress={() => handleSelectStudent(student.id)}
                        className="py-2 px-2 border-b border-border"
                        activeOpacity={0.7}
                      >
                        <Text className="text-sm font-semibold text-foreground">{student.nome}</Text>
                        <Text className="text-xs text-muted">{student.endereco}, {student.numero} - {student.cidade}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                ) : studentSearchQuery.trim() ? (
                  <Text className="text-sm text-muted text-center py-2">Nenhum cliente encontrado</Text>
                ) : null}
              </View>
            )}

            <FormField
              label="Nome *"
              value={form.recipientName}
              field="recipientName"
              placeholder="Nome completo"
            />
            <FormField
              label="CEP *"
              value={form.recipientCEP}
              field="recipientCEP"
              keyboardType="number-pad"
              placeholder="00000000"
            />
            <FormField
              label="Endereço"
              value={form.recipientAddress}
              field="recipientAddress"
              editable={false}
            />
            <FormField
              label="Número *"
              value={form.recipientNumber}
              field="recipientNumber"
              keyboardType="number-pad"
            />
            <FormField
              label="Complemento"
              value={form.recipientComplement}
              field="recipientComplement"
            />
            <FormField
              label="Cidade"
              value={form.recipientCity}
              field="recipientCity"
              editable={false}
            />
            <FormField
              label="Estado"
              value={form.recipientState}
              field="recipientState"
              editable={false}
            />
            <FormField
              label="Telefone"
              value={form.recipientPhone}
              field="recipientPhone"
              keyboardType="phone-pad"
            />
          </View>
        )}

        {/* Object Section */}
        <SectionHeader title="📦 Objeto" section="object" />
        {expandedSection === "object" && (
          <View className="mb-6">
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Tipo de Serviço
              </Text>
              <View className="flex-row gap-2">
                {["PAC", "SEDEX", "MOTO"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-lg border",
                      form.serviceType === type
                        ? "bg-primary border-primary"
                        : "bg-surface border-border"
                    )}
                    onPress={() => handleInputChange("serviceType", type)}
                  >
                    <Text
                      className={cn(
                        "text-sm font-semibold text-center",
                        form.serviceType === type
                          ? "text-white"
                          : "text-foreground"
                      )}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <FormField
              label="Peso (kg)"
              value={form.weight}
              field="weight"
              keyboardType="decimal-pad"
            />

            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Dimensões
              </Text>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <TextInput
                    value={form.height}
                    onChangeText={(text) => handleInputChange("height", text)}
                    placeholder="Altura (cm)"
                    placeholderTextColor={colors.muted}
                    keyboardType="number-pad"
                    className="border border-border rounded-lg px-3 py-2 text-foreground bg-surface text-xs"
                  />
                </View>
                <View className="flex-1">
                  <TextInput
                    value={form.width}
                    onChangeText={(text) => handleInputChange("width", text)}
                    placeholder="Largura (cm)"
                    placeholderTextColor={colors.muted}
                    keyboardType="number-pad"
                    className="border border-border rounded-lg px-3 py-2 text-foreground bg-surface text-xs"
                  />
                </View>
                <View className="flex-1">
                  <TextInput
                    value={form.depth}
                    onChangeText={(text) => handleInputChange("depth", text)}
                    placeholder="Profundidade (cm)"
                    placeholderTextColor={colors.muted}
                    keyboardType="number-pad"
                    className="border border-border rounded-lg px-3 py-2 text-foreground bg-surface text-xs"
                  />
                </View>
              </View>
            </View>

            <FormField
              label="Valor Declarado (R$)"
              value={form.declaredValue}
              field="declaredValue"
              keyboardType="decimal-pad"
            />

            <FormField
              label="Descrição do Conteúdo"
              value={form.description}
              field="description"
              placeholder="Ex: Eletrônicos, Roupas, etc."
            />

            {/* Frete Selector */}
            <View className="mt-6 pt-4 border-t border-border">
              <Text className="text-sm font-semibold text-foreground mb-3">
                💰 Opções de Frete
              </Text>
              <FreteSelector
                cepOrigem={form.senderCEP}
                cepDestino={form.recipientCEP}
                peso={parseFloat(form.weight) || 0}
                onSelectFrete={setSelectedFrete}
                selectedFrete={selectedFrete}
              />
              {selectedFrete && (
                <View className="mt-4 p-3 bg-primary rounded-lg">
                  <Text className="text-white font-semibold">
                    {selectedFrete.nome} - R$ {selectedFrete.valor.toFixed(2)}
                  </Text>
                  <Text className="text-white text-xs mt-1">
                    Prazo: {selectedFrete.prazo} dia{selectedFrete.prazo > 1 ? "s" : ""}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View className="flex-col gap-3 mt-8 mb-8">
          {/* Print Button - Visible when frete is selected */}
          {selectedFrete && (
            <LabelPrintButton
              labelData={{
                senderName: form.senderName,
                senderAddress: form.senderAddress,
                senderNumber: form.senderNumber,
                senderCity: form.senderCity,
                senderState: form.senderState,
                senderCEP: form.senderCEP,
                recipientName: form.recipientName,
                recipientAddress: form.recipientAddress,
                recipientNumber: form.recipientNumber,
                recipientComplement: form.recipientComplement,
                recipientCity: form.recipientCity,
                recipientState: form.recipientState,
                recipientCEP: form.recipientCEP,
                recipientPhone: form.recipientPhone,
                weight: parseFloat(form.weight) || 0,
                serviceType: form.serviceType,
                description: form.description,
                declaredValue: parseFloat(form.declaredValue) || 0,
                trackingCode: `AA${Math.random().toString().slice(2, 11)}BR`,
              } as LabelData}
              onSuccess={() => {
                Alert.alert("Sucesso", "Etiqueta gerada com sucesso!");
              }}
            />
          )}

          {/* Main Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg bg-surface border border-border items-center justify-center"
              activeOpacity={0.7}
            >
              <Text className="text-foreground font-semibold">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGenerateLabel}
              disabled={loading || !currentEmployee}
              className={cn(
                "flex-1 py-3 rounded-lg flex-row items-center justify-center gap-2",
                loading || !currentEmployee ? "bg-gray-400 opacity-70" : "bg-primary"
              )}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <MaterialIcons name="check" size={20} color="white" />
              )}
              <Text className="text-white font-semibold">
                {!currentEmployee ? "Autentique-se Primeiro" : loading ? "Gerando..." : "Gerar Etiqueta"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Add Student Modal */}
      <AddStudentModal
        visible={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        onStudentAdded={(studentId) => {
          handleSelectStudent(studentId);
          loadStudents();
        }}
      />

      {/* Employee Auth Modal */}
      <EmployeeAuthModal
        visible={showAuthModal}
        onAuthenticate={(employee) => {
          setCurrentEmployee(employee);
          setShowAuthModal(false);
        }}
        onCancel={() => setShowAuthModal(false)}
      />
    </ScreenContainer>
  );
}

import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useStudents } from "@/hooks/use-students";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

export default function ImportStudentsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { students, loadStudents, importFromCSV } = useStudents();
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "application/vnd.ms-excel"],
      });

      if (result.canceled) {
        return;
      }

      setIsLoading(true);

      // Ler arquivo
      const response = await fetch(result.assets[0].uri);
      const csvContent = await response.text();

      // Importar
      const importResult = await importFromCSV(csvContent);
      setImportResult(importResult);

      if (importResult.success > 0) {
        Alert.alert(
          "Sucesso",
          `${importResult.success} aluno(s) importado(s) com sucesso!`
        );
      }

      if (importResult.failed > 0) {
        Alert.alert(
          "Aviso",
          `${importResult.failed} linha(s) falharam:\n${importResult.errors.slice(0, 3).join("\n")}`
        );
      }
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error ? error.message : "Erro ao importar arquivo"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-border">
          <View className="flex-row items-center gap-3 flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">Importar Alunos</Text>
          </View>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 py-6 gap-6">
          {/* Instructions */}
          <View className="bg-blue-50 rounded-lg p-4 gap-2">
            <Text className="text-sm font-semibold text-foreground">
              Como importar:
            </Text>
            <Text className="text-xs text-muted leading-relaxed">
              1. Exporte os alunos do Gerencie Aqui em formato CSV{"\n"}
              2. Certifique-se que o arquivo tem as colunas: Nome, Email, Telefone, CEP, Endereço, Número, Complemento, Bairro, Cidade, Estado{"\n"}
              3. Clique em "Selecionar Arquivo" e escolha o CSV{"\n"}
              4. Os alunos serão importados automaticamente
            </Text>
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            onPress={handlePickFile}
            disabled={isLoading}
            className="bg-primary rounded-lg py-4 flex-row items-center justify-center gap-3"
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <MaterialIcons name="upload-file" size={20} color="white" />
            )}
            <Text className="text-white font-semibold text-base">
              {isLoading ? "Importando..." : "Selecionar Arquivo CSV"}
            </Text>
          </TouchableOpacity>

          {/* Import Result */}
          {importResult && (
            <View className="bg-green-50 rounded-lg p-4 gap-2">
              <View className="flex-row items-center gap-2">
                <MaterialIcons name="check-circle" size={20} color="#22C55E" />
                <Text className="text-sm font-semibold text-foreground">
                  Resultado da Importação
                </Text>
              </View>
              <Text className="text-xs text-muted">
                ✓ {importResult.success} aluno(s) importado(s){"\n"}
                ✗ {importResult.failed} erro(s)
              </Text>
            </View>
          )}

          {/* Students List */}
          <View>
            <Text className="text-sm font-semibold text-foreground mb-3">
              Total de Alunos: {students.length}
            </Text>

            {students.length > 0 ? (
              <FlatList
                data={students}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View className="bg-surface rounded-lg p-3 mb-2 border border-border">
                    <Text className="text-sm font-semibold text-foreground">
                      {item.nome}
                    </Text>
                    {item.email && (
                      <Text className="text-xs text-muted mt-1">{item.email}</Text>
                    )}
                    <Text className="text-xs text-muted mt-1">
                      {item.endereco}, {item.numero} - {item.bairro}, {item.cidade} - {item.estado}
                    </Text>
                  </View>
                )}
              />
            ) : (
              <View className="bg-surface rounded-lg p-6 items-center gap-2">
                <MaterialIcons name="people-outline" size={32} color={colors.muted} />
                <Text className="text-sm text-muted">Nenhum aluno importado ainda</Text>
              </View>
            )}
          </View>

          {/* Done Button */}
          {students.length > 0 && (
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-success rounded-lg py-4 flex-row items-center justify-center gap-2"
              activeOpacity={0.7}
            >
              <MaterialIcons name="check" size={20} color="white" />
              <Text className="text-white font-semibold text-base">
                Concluído
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

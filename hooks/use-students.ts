import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Student, StudentImportResult, StudentSearchResult } from "@/lib/types/student";
import { nanoid } from "nanoid/non-secure";

const STUDENTS_KEY = "@innova_envios_students";

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar alunos do AsyncStorage
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AsyncStorage.getItem(STUDENTS_KEY);
      if (data) {
        setStudents(JSON.parse(data));
      }
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar alunos no AsyncStorage
  const saveStudents = useCallback(async (newStudents: Student[]) => {
    try {
      await AsyncStorage.setItem(STUDENTS_KEY, JSON.stringify(newStudents));
      setStudents(newStudents);
    } catch (error) {
      console.error("Erro ao salvar alunos:", error);
      throw error;
    }
  }, []);

  // Importar alunos de CSV
  const importFromCSV = useCallback(
    async (csvContent: string): Promise<StudentImportResult> => {
      const lines = csvContent.trim().split("\n");
      if (lines.length < 2) {
        return { success: 0, failed: 0, errors: ["Arquivo CSV vazio"] };
      }

      const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
      const result: StudentImportResult = { success: 0, failed: 0, errors: [] };
      const newStudents: Student[] = [...students];

      // Mapear índices das colunas
      const nameIdx = headers.findIndex((h) => h.includes("nome"));
      const emailIdx = headers.findIndex((h) => h.includes("email"));
      const phoneIdx = headers.findIndex((h) => h.includes("telefone"));
      const cepIdx = headers.findIndex((h) => h.includes("cep"));
      const addressIdx = headers.findIndex((h) => h.includes("endereco") || h.includes("rua"));
      const numberIdx = headers.findIndex((h) => h.includes("numero"));
      const complementIdx = headers.findIndex((h) => h.includes("complemento"));
      const neighborhoodIdx = headers.findIndex((h) => h.includes("bairro"));
      const cityIdx = headers.findIndex((h) => h.includes("cidade"));
      const stateIdx = headers.findIndex((h) => h.includes("estado"));

      // Processar linhas
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(",").map((v) => v.trim());

          if (!values[nameIdx] || !values[cepIdx]) {
            result.failed++;
            result.errors.push(`Linha ${i + 1}: Nome ou CEP ausente`);
            continue;
          }

          const student: Student = {
            id: nanoid(),
            nome: values[nameIdx],
            email: emailIdx >= 0 ? values[emailIdx] : undefined,
            telefone: phoneIdx >= 0 ? values[phoneIdx] : undefined,
            cep: values[cepIdx],
            endereco: addressIdx >= 0 ? values[addressIdx] : "",
            numero: numberIdx >= 0 ? values[numberIdx] : "",
            complemento: complementIdx >= 0 ? values[complementIdx] : undefined,
            bairro: neighborhoodIdx >= 0 ? values[neighborhoodIdx] : "",
            cidade: cityIdx >= 0 ? values[cityIdx] : "",
            estado: stateIdx >= 0 ? values[stateIdx] : "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };

          newStudents.push(student);
          result.success++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Linha ${i + 1}: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        }
      }

      if (result.success > 0) {
        await saveStudents(newStudents);
      }

      return result;
    },
    [students, saveStudents]
  );

  // Buscar alunos por nome ou email
  const searchStudents = useCallback(
    (query: string): StudentSearchResult => {
      const lowerQuery = query.toLowerCase();
      const filtered = students.filter(
        (s) =>
          s.nome.toLowerCase().includes(lowerQuery) ||
          (s.email && s.email.toLowerCase().includes(lowerQuery))
      );

      return {
        students: filtered,
        total: filtered.length,
      };
    },
    [students]
  );

  // Adicionar aluno
  const addStudent = useCallback(
    async (student: Omit<Student, "id" | "createdAt" | "updatedAt">) => {
      const newStudent: Student = {
        ...student,
        id: nanoid(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const newStudents = [...students, newStudent];
      await saveStudents(newStudents);
      return newStudent;
    },
    [students, saveStudents]
  );

  // Atualizar aluno
  const updateStudent = useCallback(
    async (id: string, updates: Partial<Student>) => {
      const newStudents = students.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
      );

      await saveStudents(newStudents);
    },
    [students, saveStudents]
  );

  // Deletar aluno
  const deleteStudent = useCallback(
    async (id: string) => {
      const newStudents = students.filter((s) => s.id !== id);
      await saveStudents(newStudents);
    },
    [students, saveStudents]
  );

  // Obter aluno por ID
  const getStudent = useCallback(
    (id: string) => {
      return students.find((s) => s.id === id);
    },
    [students]
  );

  return {
    students,
    loading,
    loadStudents,
    importFromCSV,
    searchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudent,
  };
}

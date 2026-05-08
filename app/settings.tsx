import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useLabelTracking } from '@/hooks/use-label-tracking';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const router = useRouter();
  const { employee, logout, employees, createEmployee, deleteEmployee } = useAuth();
  const { getStatistics } = useLabelTracking();

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  const [newEmployeePassword, setNewEmployeePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [showCorreiosSettings, setShowCorreiosSettings] = useState(false);
  const [correiosData, setCorreiosData] = useState({
    cartaoPostagem: '',
    contrato: '',
    usuario: '',
    senha: '',
    cepOrigem: '',
    codigoAdministrativo: '',
  });

  useEffect(() => {
    const stats = getStatistics();
    setStats(stats);
    loadCorreiosSettings();
  }, []);

  const loadCorreiosSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('correios_settings');
      if (saved) {
        setCorreiosData(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', onPress: () => {} },
      {
        text: 'Sair',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleAddEmployee = async () => {
    if (!newEmployeeName.trim() || !newEmployeeEmail.trim() || !newEmployeePassword.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const result = await createEmployee(
        newEmployeeName,
        newEmployeeEmail,
        newEmployeePassword,
        'user'
      );

      if (result.success) {
        Alert.alert('Sucesso', 'Funcionário criado com sucesso!');
        setNewEmployeeName('');
        setNewEmployeeEmail('');
        setNewEmployeePassword('');
        setShowAddEmployee(false);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao criar funcionário');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao criar funcionário');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCorreiosSettings = async () => {
    if (!correiosData.cartaoPostagem.trim() || !correiosData.contrato.trim() || 
        !correiosData.usuario.trim() || !correiosData.senha.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await AsyncStorage.setItem('correios_settings', JSON.stringify(correiosData));
      Alert.alert('Sucesso', 'Configurações dos Correios salvas com sucesso!');
      setShowCorreiosSettings(false);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao salvar configurações');
    }
  };

  const handleDeleteEmployee = (employeeId: string, employeeName: string) => {
    Alert.alert(
      'Deletar Funcionário',
      `Tem certeza que deseja deletar ${employeeName}?`,
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Deletar',
          onPress: async () => {
            const result = await deleteEmployee(employeeId);
            if (result.success) {
              Alert.alert('Sucesso', 'Funcionário deletado com sucesso!');
            } else {
              Alert.alert('Erro', result.error || 'Erro ao deletar funcionário');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const isAdmin = employee?.role === 'admin';

  return (
    <ScreenContainer className="bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 pt-4 pb-4">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color="#11181C" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-foreground">Configurações</Text>
        </View>

        {/* Perfil */}
        <View className="bg-white rounded-lg p-6 m-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-blue-600 items-center justify-center">
              <Text className="text-white text-2xl font-bold">
                {employee?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-lg font-bold text-foreground">
                {employee?.name}
              </Text>
              <Text className="text-sm text-gray-600">
                {employee?.email}
              </Text>
              <View className="mt-2 flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                <Text className="text-xs text-gray-600">
                  {isAdmin ? 'Administrador' : 'Usuário'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Estatísticas */}
        {stats && (
          <View className="bg-white rounded-lg p-6 m-4 shadow-sm">
            <Text className="text-lg font-bold text-foreground mb-4">
              Minhas Etiquetas
            </Text>
            <View className="flex-row flex-wrap gap-2">
              <View className="flex-1 bg-blue-50 rounded-lg p-4 min-w-[45%]">
                <Text className="text-2xl font-bold text-blue-600">
                  {stats.total}
                </Text>
                <Text className="text-xs text-gray-600 mt-1">Total</Text>
              </View>
              <View className="flex-1 bg-yellow-50 rounded-lg p-4 min-w-[45%]">
                <Text className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </Text>
                <Text className="text-xs text-gray-600 mt-1">Pendentes</Text>
              </View>
              <View className="flex-1 bg-green-50 rounded-lg p-4 min-w-[45%]">
                <Text className="text-2xl font-bold text-green-600">
                  {stats.shipped}
                </Text>
                <Text className="text-xs text-gray-600 mt-1">Enviadas</Text>
              </View>
              <View className="flex-1 bg-purple-50 rounded-lg p-4 min-w-[45%]">
                <Text className="text-2xl font-bold text-purple-600">
                  {stats.delivered}
                </Text>
                <Text className="text-xs text-gray-600 mt-1">Entregues</Text>
              </View>
            </View>
          </View>
        )}

        {/* Configurações dos Correios (Admin Only) */}
        {isAdmin && (
          <View className="bg-white rounded-lg p-6 m-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-foreground">
                Configurações Correios
              </Text>
              <TouchableOpacity
                onPress={() => setShowCorreiosSettings(true)}
                className="bg-blue-600 rounded-lg px-4 py-2 flex-row items-center"
              >
                <MaterialIcons name="edit" size={20} color="white" />
                <Text className="text-white font-semibold ml-1">Editar</Text>
              </TouchableOpacity>
            </View>
            <View className="space-y-2">
              <View className="flex-row items-center py-2 border-b border-gray-200">
                <Text className="text-sm text-gray-600 flex-1">Cartão de Postagem:</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {correiosData.cartaoPostagem || 'Não configurado'}
                </Text>
              </View>
              <View className="flex-row items-center py-2 border-b border-gray-200">
                <Text className="text-sm text-gray-600 flex-1">Contrato:</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {correiosData.contrato || 'Não configurado'}
                </Text>
              </View>
              <View className="flex-row items-center py-2 border-b border-gray-200">
                <Text className="text-sm text-gray-600 flex-1">CEP de Origem:</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {correiosData.cepOrigem || 'Não configurado'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Funcionários (Admin Only) */}
        {isAdmin && (
          <View className="bg-white rounded-lg p-6 m-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-foreground">
                Funcionários
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddEmployee(true)}
                className="bg-blue-600 rounded-lg px-4 py-2 flex-row items-center"
              >
                <MaterialIcons name="add" size={20} color="white" />
                <Text className="text-white font-semibold ml-1">Novo</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={employees}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View className="flex-row items-center justify-between p-3 border-b border-gray-200">
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">
                      {item.name}
                    </Text>
                    <Text className="text-xs text-gray-600">
                      {item.email}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View className="bg-gray-100 rounded px-2 py-1">
                      <Text className="text-xs text-gray-600">
                        {item.role === 'admin' ? 'Admin' : 'Usuário'}
                      </Text>
                    </View>
                    {item.id !== employee?.id && (
                      <TouchableOpacity
                        onPress={() => handleDeleteEmployee(item.id, item.name)}
                        className="p-2"
                      >
                        <MaterialIcons name="delete" size={18} color="#ef4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            />
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-600 rounded-lg p-4 m-4 flex-row items-center justify-center"
        >
          <MaterialIcons name="logout" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Sair</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal Configurações Correios */}
      <Modal visible={showCorreiosSettings} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl p-6">
            <Text className="text-2xl font-bold text-foreground mb-6">
              Configurações Correios
            </Text>

            <Text className="text-sm font-semibold text-gray-600 mb-2">
              Cartão de Postagem
            </Text>
            <TextInput
              placeholder="0000000000"
              value={correiosData.cartaoPostagem}
              onChangeText={(text) => setCorreiosData({...correiosData, cartaoPostagem: text})}
              editable={!loading}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 16,
                fontSize: 16,
              }}
            />

            <Text className="text-sm font-semibold text-gray-600 mb-2">
              Contrato
            </Text>
            <TextInput
              placeholder="0000000"
              value={correiosData.contrato}
              onChangeText={(text) => setCorreiosData({...correiosData, contrato: text})}
              editable={!loading}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 16,
                fontSize: 16,
              }}
            />

            <Text className="text-sm font-semibold text-gray-600 mb-2">
              Usuário Correios
            </Text>
            <TextInput
              placeholder="seu-usuario"
              value={correiosData.usuario}
              onChangeText={(text) => setCorreiosData({...correiosData, usuario: text})}
              autoCapitalize="none"
              editable={!loading}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 16,
                fontSize: 16,
              }}
            />

            <Text className="text-sm font-semibold text-gray-600 mb-2">
              Senha Correios
            </Text>
            <TextInput
              placeholder="••••••••"
              value={correiosData.senha}
              onChangeText={(text) => setCorreiosData({...correiosData, senha: text})}
              secureTextEntry
              editable={!loading}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 16,
                fontSize: 16,
              }}
            />

            <Text className="text-sm font-semibold text-gray-600 mb-2">
              CEP de Origem
            </Text>
            <TextInput
              placeholder="00000-000"
              value={correiosData.cepOrigem}
              onChangeText={(text) => setCorreiosData({...correiosData, cepOrigem: text})}
              keyboardType="numeric"
              editable={!loading}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 16,
                fontSize: 16,
              }}
            />

            <Text className="text-sm font-semibold text-gray-600 mb-2">
              Código Administrativo
            </Text>
            <TextInput
              placeholder="0000000"
              value={correiosData.codigoAdministrativo}
              onChangeText={(text) => setCorreiosData({...correiosData, codigoAdministrativo: text})}
              editable={!loading}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 24,
                fontSize: 16,
              }}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowCorreiosSettings(false)}
                disabled={loading}
                className="flex-1 bg-gray-200 rounded-lg p-4"
              >
                <Text className="text-gray-800 font-semibold text-center">
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveCorreiosSettings}
                disabled={loading}
                className={`flex-1 bg-blue-600 rounded-lg p-4 flex-row justify-center items-center ${
                  loading ? 'opacity-70' : ''
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Adicionar Funcionário */}
      <Modal visible={showAddEmployee} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl p-6">
            <Text className="text-2xl font-bold text-foreground mb-6">
              Novo Funcionário
            </Text>

            <Text className="text-sm font-semibold text-gray-600 mb-2">
              Nome
            </Text>
            <TextInput
              placeholder="Nome completo"
              value={newEmployeeName}
              onChangeText={setNewEmployeeName}
              editable={!loading}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 16,
                fontSize: 16,
              }}
            />

            <Text className="text-sm font-semibold text-gray-600 mb-2">
              Email
            </Text>
            <TextInput
              placeholder="email@example.com"
              value={newEmployeeEmail}
              onChangeText={setNewEmployeeEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 16,
                fontSize: 16,
              }}
            />

            <Text className="text-sm font-semibold text-gray-600 mb-2">
              Senha
            </Text>
            <TextInput
              placeholder="••••••••"
              value={newEmployeePassword}
              onChangeText={setNewEmployeePassword}
              secureTextEntry
              editable={!loading}
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 24,
                fontSize: 16,
              }}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowAddEmployee(false)}
                disabled={loading}
                className="flex-1 bg-gray-200 rounded-lg p-4"
              >
                <Text className="text-gray-800 font-semibold text-center">
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddEmployee}
                disabled={loading}
                className={`flex-1 bg-blue-600 rounded-lg p-4 flex-row justify-center items-center ${
                  loading ? 'opacity-70' : ''
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">Criar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

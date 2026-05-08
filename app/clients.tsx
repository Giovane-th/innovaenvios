import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useClientsAPI } from '@/hooks/use-clients-api';
import { useCEPLookup } from '@/hooks/use-cep-lookup';
import { useClientReport } from '@/hooks/use-client-report';

export default function ClientsScreen() {
  const router = useRouter();
  const {
    clients,
    loading,
    searchQuery,
    setSearchQuery,
    addClient,
    updateClient,
    deleteClient,
    getStatistics,
  } = useClientsAPI();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const { lookupCEP, loading: cepLoading } = useCEPLookup();
  const { generateCSVReport, generateHTMLReport } = useClientReport();

  // Formulário de novo cliente
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf_cnpj: '',
    telefone: '',
    celular: '',
    endereco: '',
    numero: '',
    complemento: '',
    cidade: '',
    uf: '',
    bairro: '',
    cep: '',
    ponto_referencia: '',
  });

  const stats = getStatistics();

  const handleAddClient = async () => {
    if (!formData.nome.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }

    const result = await addClient(formData);
    if (result.success) {
      Alert.alert('Sucesso', 'Cliente adicionado com sucesso!');
      setFormData({
        nome: '',
        email: '',
        cpf_cnpj: '',
        telefone: '',
        celular: '',
        endereco: '',
        numero: '',
        complemento: '',
        cidade: '',
        uf: '',
        bairro: '',
        cep: '',
        ponto_referencia: '',
      });
      setShowAddModal(false);
    } else {
      Alert.alert('Erro', result.error || 'Erro ao adicionar cliente');
    }
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      Alert.alert('Info', 'Clientes já foram importados do banco de dados!');
      setShowImportModal(false);
    } catch (error) {
      Alert.alert('Erro', 'Erro ao importar clientes');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteClient = (clientId: number, clientName: string) => {
    Alert.alert(
      'Deletar Cliente',
      `Tem certeza que deseja deletar ${clientName}?`,
      [
        { text: 'Cancelar', onPress: () => {} },
        {
          text: 'Deletar',
          onPress: async () => {
            const result = await deleteClient(clientId);
            if (result.success) {
              Alert.alert('Sucesso', 'Cliente deletado com sucesso!');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleExportReport = () => {
    Alert.alert(
      'Exportar Relatório',
      'Escolha o formato:',
      [
        {
          text: 'CSV',
          onPress: () => {
            const csv = generateCSVReport(clients, 'Relatório de Clientes - In\'Nova Envios');
            // Criar blob e download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            Alert.alert('Sucesso', 'Relatório exportado com sucesso!');
          },
        },
        {
          text: 'HTML (Impressão)',
          onPress: () => {
            const html = generateHTMLReport(clients, 'Relatório de Clientes - In\'Nova Envios');
            const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `clientes_${new Date().toISOString().split('T')[0]}.html`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            Alert.alert('Sucesso', 'Relatório gerado! Abra o arquivo para imprimir.');
          },
        },
        { text: 'Cancelar', onPress: () => {} },
      ]
    );
  };


  return (
    <ScreenContainer className="bg-gray-50">
      <FlatList
        data={clients}
        renderItem={({ item }) => (
          <View className="bg-white rounded-lg p-4 m-3 shadow-sm border border-gray-200">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground">
                  {item.nome}
                </Text>
                <Text className="text-xs text-gray-600 mt-1">
                  {item.cpf_cnpj}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteClient(item.id, item.nome)}
                className="p-2"
              >
                <MaterialIcons name="delete" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <View className="gap-2">
              {item.email && (
                <View className="flex-row items-center">
                  <MaterialIcons name="email" size={14} color="#666" />
                  <Text className="text-xs text-gray-600 ml-2">{item.email}</Text>
                </View>
              )}
              {item.telefone && (
                <View className="flex-row items-center">
                  <MaterialIcons name="phone" size={14} color="#666" />
                  <Text className="text-xs text-gray-600 ml-2">{item.telefone}</Text>
                </View>
              )}
              {item.celular && (
                <View className="flex-row items-center">
                  <MaterialIcons name="smartphone" size={14} color="#666" />
                  <Text className="text-xs text-gray-600 ml-2">{item.celular}</Text>
                </View>
              )}
              {item.endereco && (
                <View className="flex-row items-center">
                  <MaterialIcons name="location-on" size={14} color="#666" />
                  <Text className="text-xs text-gray-600 ml-2">
                    {item.endereco}, {item.numero} {item.complemento && `- ${item.complemento}`}
                  </Text>
                </View>
              )}
              {item.cep && (
                <View className="flex-row items-center">
                  <MaterialIcons name="pin" size={14} color="#666" />
                  <Text className="text-xs text-gray-600 ml-2">
                    {item.cep} - {item.cidade}, {item.uf}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View className="pb-4">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
              <View>
                <Text className="text-2xl font-bold text-foreground">
                  Clientes
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Total: {clients.length}
                </Text>
              </View>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={handleExportReport}
                  className="bg-purple-600 rounded-lg p-3"
                >
                  <MaterialIcons name="file-download" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowImportModal(true)}
                  className="bg-green-600 rounded-lg p-3"
                >
                  <MaterialIcons name="download" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowAddModal(true)}
                  className="bg-blue-600 rounded-lg p-3"
                >
                  <MaterialIcons name="add" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Busca */}
            <View className="p-4 bg-white border-b border-gray-200">
              <View className="flex-row items-center bg-gray-100 rounded-lg px-3">
                <MaterialIcons name="search" size={20} color="#999" />
                <TextInput
                  placeholder="Buscar cliente..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  className="flex-1 py-3 ml-2"
                  placeholderTextColor="#999"
                  style={{ color: '#000' }}
                />
              </View>
            </View>

            {/* Estatísticas */}
            {stats.total > 0 && (
              <View className="p-4 bg-white border-b border-gray-200">
                <Text className="text-sm font-semibold text-gray-600 mb-2">
                  Estatísticas
                </Text>
                <View className="flex-row gap-2">
                  <View className="flex-1 bg-blue-50 rounded-lg p-3">
                    <Text className="text-2xl font-bold text-blue-600">
                      {stats.total}
                    </Text>
                    <Text className="text-xs text-gray-600">Total</Text>
                  </View>
                  <View className="flex-1 bg-green-50 rounded-lg p-3">
                    <Text className="text-2xl font-bold text-green-600">
                      {stats.total}
                    </Text>
                    <Text className="text-xs text-gray-600">Estados</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <MaterialIcons name="people-outline" size={48} color="#ccc" />
            <Text className="text-gray-600 mt-4">Nenhum cliente encontrado</Text>
          </View>
        }
      />

      {/* Modal Adicionar Cliente */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-2xl p-6 max-h-[90%]">
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-2xl font-bold text-foreground mb-6">
                Novo Cliente
              </Text>

              {/* Nome */}
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Nome *
              </Text>
              <TextInput
                placeholder="Nome completo"
                value={formData.nome}
                onChangeText={(text) =>
                  setFormData({ ...formData, nome: text })
                }
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 16,
                  fontSize: 16,
                  color: '#000',
                }}
              />

              {/* Email */}
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Email
              </Text>
              <TextInput
                placeholder="email@example.com"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                keyboardType="email-address"
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 16,
                  fontSize: 16,
                  color: '#000',
                }}
              />

              {/* CPF/CNPJ */}
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                CPF/CNPJ
              </Text>
              <TextInput
                placeholder="000.000.000-00"
                value={formData.cpf_cnpj}
                onChangeText={(text) =>
                  setFormData({ ...formData, cpf_cnpj: text })
                }
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 16,
                  fontSize: 16,
                  color: '#000',
                }}
              />

              {/* Telefone */}
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Telefone
              </Text>
              <TextInput
                placeholder="(11) 0000-0000"
                value={formData.telefone}
                onChangeText={(text) =>
                  setFormData({ ...formData, telefone: text })
                }
                keyboardType="phone-pad"
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 16,
                  fontSize: 16,
                  color: '#000',
                }}
              />

              {/* Celular */}
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Celular
              </Text>
              <TextInput
                placeholder="(11) 99999-9999"
                value={formData.celular}
                onChangeText={(text) =>
                  setFormData({ ...formData, celular: text })
                }
                keyboardType="phone-pad"
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 16,
                  fontSize: 16,
                  color: '#000',
                }}
              />

              {/* Endereço */}
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Endereço
              </Text>
              <TextInput
                placeholder="Rua/Avenida"
                value={formData.endereco}
                onChangeText={(text) =>
                  setFormData({ ...formData, endereco: text })
                }
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 16,
                  fontSize: 16,
                  color: '#000',
                }}
              />

              {/* Número */}
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Número
              </Text>
              <TextInput
                placeholder="123"
                value={formData.numero}
                onChangeText={(text) =>
                  setFormData({ ...formData, numero: text })
                }
                keyboardType="numeric"
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 16,
                  fontSize: 16,
                  color: '#000',
                }}
              />

              {/* Complemento */}
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Complemento
              </Text>
              <TextInput
                placeholder="Apt, Sala, etc"
                value={formData.complemento}
                onChangeText={(text) =>
                  setFormData({ ...formData, complemento: text })
                }
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 16,
                  fontSize: 16,
                  color: '#000',
                }}
              />

              {/* CEP */}
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                CEP
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                <TextInput
                  placeholder="00.000-000"
                  value={formData.cep}
                  onChangeText={(text) =>
                    setFormData({ ...formData, cep: text })
                  }
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 16,
                    color: '#000',
                  }}
                />
                <TouchableOpacity
                  onPress={async () => {
                    if (formData.cep.length >= 8) {
                      const result = await lookupCEP(formData.cep);
                      if (result.success && result.data) {
                        setFormData({
                          ...formData,
                          endereco: result.data.endereco,
                          complemento: result.data.complemento,
                          bairro: result.data.bairro,
                          cidade: result.data.cidade,
                          uf: result.data.uf,
                        });
                        Alert.alert('Sucesso', 'Endereço preenchido automaticamente!');
                      } else {
                        Alert.alert('Erro', result.error || 'CEP não encontrado');
                      }
                    } else {
                      Alert.alert('Erro', 'Digite um CEP válido');
                    }
                  }}
                  disabled={cepLoading}
                  style={{
                    backgroundColor: cepLoading ? '#9ca3af' : '#2563eb',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {cepLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <MaterialIcons name="search" size={20} color="white" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Cidade */}
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Cidade
              </Text>
              <TextInput
                placeholder="São Paulo"
                value={formData.cidade}
                onChangeText={(text) =>
                  setFormData({ ...formData, cidade: text })
                }
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 16,
                  fontSize: 16,
                  color: '#000',
                }}
              />

              {/* UF */}
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                UF
              </Text>
              <TextInput
                placeholder="SP"
                value={formData.uf}
                onChangeText={(text) =>
                  setFormData({ ...formData, uf: text.toUpperCase() })
                }
                maxLength={2}
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 16,
                  fontSize: 16,
                  color: '#000',
                }}
              />

              {/* Bairro */}
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Bairro
              </Text>
              <TextInput
                placeholder="Centro"
                value={formData.bairro}
                onChangeText={(text) =>
                  setFormData({ ...formData, bairro: text })
                }
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 16,
                  fontSize: 16,
                  color: '#000',
                }}
              />

              {/* Ponto de Referência */}
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Ponto de Referência
              </Text>
              <TextInput
                placeholder="Próximo à..."
                value={formData.ponto_referencia}
                onChangeText={(text) =>
                  setFormData({ ...formData, ponto_referencia: text })
                }
                style={{
                  borderWidth: 1,
                  borderColor: '#e5e7eb',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  marginBottom: 24,
                  fontSize: 16,
                  color: '#000',
                }}
              />

              {/* Botões */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 rounded-lg p-4"
                >
                  <Text className="text-gray-800 font-semibold text-center">
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAddClient}
                  className="flex-1 bg-blue-600 rounded-lg p-4"
                >
                  <Text className="text-white font-semibold text-center">
                    Adicionar
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Importar Clientes */}
      <Modal visible={showImportModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-2xl font-bold text-foreground mb-4">
              Importar Clientes
            </Text>

            <Text className="text-gray-600 mb-6">
              Deseja importar os 1.097 clientes do arquivo Excel?
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowImportModal(false)}
                disabled={importing}
                className="flex-1 bg-gray-200 rounded-lg p-4"
              >
                <Text className="text-gray-800 font-semibold text-center">
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleImport}
                disabled={importing}
                className={`flex-1 bg-green-600 rounded-lg p-4 flex-row justify-center items-center ${
                  importing ? 'opacity-70' : ''
                }`}
              >
                {importing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">Importar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  Switch,
  FlatList,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { MaterialIcons } from '@expo/vector-icons';
import { trpc } from '@/lib/trpc';
import { useColors } from '@/hooks/use-colors';

interface ScheduledReport {
  id: number;
  email: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  reportType: 'shipping' | 'revenue' | 'summary';
  enabled: boolean;
  lastSentAt?: Date;
}

export default function ScheduledReportsScreen() {
  const colors = useColors();
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [reportType, setReportType] = useState<'shipping' | 'revenue' | 'summary'>('shipping');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const result = await (trpc.scheduledReports.list as any).query();
      setReports(result);
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Erro', 'Erro ao carregar relatórios agendados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!email) {
      Alert.alert('Erro', 'Por favor, insira um email');
      return;
    }

    try {
      setLoading(true);
      await (trpc.scheduledReports.create as any).mutate({
        email,
        frequency,
        reportType,
      });
      Alert.alert('Sucesso', 'Relatório agendado com sucesso!');
      setShowModal(false);
      setEmail('');
      loadReports();
    } catch (error) {
      console.error('Error creating report:', error);
      Alert.alert('Erro', 'Erro ao criar relatório agendado');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleReport = async (report: ScheduledReport) => {
    try {
      await (trpc.scheduledReports.update as any).mutate({
        id: report.id,
        enabled: !report.enabled,
      });
      loadReports();
    } catch (error) {
      console.error('Error updating report:', error);
      Alert.alert('Erro', 'Erro ao atualizar relatório');
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    Alert.alert('Confirmar', 'Deseja deletar este relatório agendado?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          try {
            await (trpc.scheduledReports.delete as any).mutate({ id: reportId });
            Alert.alert('Sucesso', 'Relatório deletado');
            loadReports();
          } catch (error) {
            console.error('Error deleting report:', error);
            Alert.alert('Erro', 'Erro ao deletar relatório');
          }
        },
      },
    ]);
  };

  const frequencyLabels = {
    daily: 'Diariamente',
    weekly: 'Semanalmente',
    monthly: 'Mensalmente',
  };

  const reportTypeLabels = {
    shipping: 'Envios',
    revenue: 'Faturamento',
    summary: 'Resumo',
  };

  return (
    <ScreenContainer className="bg-gray-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="bg-white p-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-foreground">Relatórios Agendados</Text>
          <Text className="text-sm text-gray-600 mt-1">Gerencie envios automáticos de relatórios</Text>
        </View>

        {loading && reports.length === 0 ? (
          <View className="flex-1 items-center justify-center p-4">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-gray-600 mt-2">Carregando...</Text>
          </View>
        ) : reports.length === 0 ? (
          <View className="flex-1 items-center justify-center p-4">
            <MaterialIcons name="mail-outline" size={48} color={colors.muted} />
            <Text className="text-gray-600 mt-2">Nenhum relatório agendado</Text>
            <Text className="text-sm text-gray-500 mt-1">Crie um novo para começar</Text>
          </View>
        ) : (
          <FlatList
            data={reports}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View className="bg-white m-3 rounded-lg border border-gray-200 p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">{item.email}</Text>
                    <Text className="text-sm text-gray-600 mt-1">
                      {reportTypeLabels[item.reportType]} • {frequencyLabels[item.frequency]}
                    </Text>
                  </View>
                  <Switch
                    value={item.enabled}
                    onValueChange={() => handleToggleReport(item)}
                    trackColor={{ false: '#ccc', true: colors.primary }}
                  />
                </View>

                {item.lastSentAt && (
                  <Text className="text-xs text-gray-500 mb-3">
                    Último envio: {new Date(item.lastSentAt).toLocaleDateString('pt-BR')}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={() => handleDeleteReport(item.id)}
                  className="bg-red-50 rounded-lg p-2 items-center"
                >
                  <Text className="text-red-600 font-semibold text-sm">Deletar</Text>
                </TouchableOpacity>
              </View>
            )}
            scrollEnabled={false}
          />
        )}

        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="bg-primary m-4 rounded-lg p-4 items-center flex-row justify-center gap-2"
        >
          <MaterialIcons name="add" size={24} color="white" />
          <Text className="text-white font-semibold">Novo Relatório</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-white rounded-lg p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-foreground mb-4">Agendar Relatório</Text>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
                <View className="border border-gray-300 rounded-lg px-3 py-2">
                  <Text style={{ color: '#000' }}>{email || 'seu@email.com'}</Text>
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Frequência</Text>
                <View className="gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      onPress={() => setFrequency(freq)}
                      className={`p-3 rounded-lg border-2 ${
                        frequency === freq
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Text
                        className={`font-medium ${
                          frequency === freq ? 'text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {frequencyLabels[freq]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Tipo de Relatório</Text>
                <View className="gap-2">
                  {(['shipping', 'revenue', 'summary'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setReportType(type)}
                      className={`p-3 rounded-lg border-2 ${
                        reportType === type
                          ? 'bg-green-50 border-green-500'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Text
                        className={`font-medium ${
                          reportType === type ? 'text-green-600' : 'text-gray-700'
                        }`}
                      >
                        {reportTypeLabels[type]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="flex-row gap-2 mt-4">
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 rounded-lg p-3 items-center"
                >
                  <Text className="text-foreground font-semibold">Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateReport}
                  disabled={loading}
                  className="flex-1 bg-primary rounded-lg p-3 items-center"
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
        </View>
      </Modal>
    </ScreenContainer>
  );
}

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { MaterialIcons } from '@expo/vector-icons';
import { trpc } from '@/lib/trpc';
import { useColors } from '@/hooks/use-colors';

interface ReportData {
  totalShipments: number;
  totalValue: number;
  averageValue: number;
  byStatus: Record<string, number>;
  byDestination: Record<string, number>;
  dailyData: Array<{
    date: string;
    count: number;
    value: number;
  }>;
}

export default function ReportsScreen() {
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
  const [tempDate, setTempDate] = useState('');

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const result = await (trpc.reports.getShippingReport as any).query({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      setReportData(result);
    } catch (error) {
      console.error('Error loading report:', error);
      Alert.alert('Erro', 'Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (type: 'start' | 'end', dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (type === 'start') {
        setStartDate(date);
      } else {
        setEndDate(date);
      }
      setShowDatePicker(null);
      setTempDate('');
    } catch (error) {
      Alert.alert('Erro', 'Data inválida');
    }
  };

  const exportToPDF = async () => {
    if (!reportData) return;

    try {
      let pdfContent = `
        <html>
          <head>
            <title>Relatório de Envios</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #0a7ea4; text-align: center; }
              .header { margin-bottom: 20px; }
              .section { margin: 20px 0; page-break-inside: avoid; }
              .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
              .stat-box { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
              .stat-label { color: #666; font-size: 12px; }
              .stat-value { font-size: 24px; font-weight: bold; color: #0a7ea4; }
              table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              th { background-color: #0a7ea4; color: white; padding: 10px; text-align: left; }
              td { padding: 8px; border-bottom: 1px solid #ddd; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
            </style>
          </head>
          <body>
            <h1>Relatório de Envios</h1>
            <div class="header">
              <p><strong>Período:</strong> ${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}</p>
              <p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            </div>

            <div class="section">
              <h2>Resumo Geral</h2>
              <div class="stats">
                <div class="stat-box">
                  <div class="stat-label">Total de Envios</div>
                  <div class="stat-value">${reportData.totalShipments}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">Valor Total</div>
                  <div class="stat-value">R$ ${reportData.totalValue.toFixed(2)}</div>
                </div>
                <div class="stat-box">
                  <div class="stat-label">Valor Médio</div>
                  <div class="stat-value">R$ ${reportData.averageValue.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div class="section">
              <h2>Envios por Status</h2>
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(reportData.byStatus)
                    .map(
                      ([status, count]) => `
                    <tr>
                      <td>${status}</td>
                      <td>${count}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>

            <div class="section">
              <h2>Envios por Destino (UF)</h2>
              <table>
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(reportData.byDestination)
                    .map(
                      ([uf, count]) => `
                    <tr>
                      <td>${uf}</td>
                      <td>${count}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>
            </div>

            <div class="footer">
              <p>Relatório gerado automaticamente pelo sistema InNova Envios</p>
            </div>
          </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        const blob = new Blob([pdfContent], { type: 'text/html;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          `relatorio_envios_${new Date().toISOString().split('T')[0]}.html`
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Alert.alert('Sucesso', 'Relatório exportado com sucesso!');
      } else {
        Alert.alert('Info', 'Exportação de PDF disponível apenas na versão web');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Erro', 'Erro ao exportar relatório');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <ScreenContainer className="bg-gray-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="bg-white p-4 border-b border-gray-200">
          <Text className="text-2xl font-bold text-foreground">Relatórios</Text>
          <Text className="text-sm text-gray-600 mt-1">Análise de envios e faturamento</Text>
        </View>

        <View className="bg-white p-4 m-3 rounded-lg border border-gray-200">
          <Text className="text-lg font-semibold text-foreground mb-3">Filtros</Text>

          <View className="gap-3">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Data Inicial</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker('start')}
                className="bg-gray-100 rounded-lg p-3 flex-row items-center justify-between"
              >
                <Text className="text-foreground">{startDate.toLocaleDateString('pt-BR')}</Text>
                <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-1">Data Final</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker('end')}
                className="bg-gray-100 rounded-lg p-3 flex-row items-center justify-between"
              >
                <Text className="text-foreground">{endDate.toLocaleDateString('pt-BR')}</Text>
                <MaterialIcons name="calendar-today" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-2 mt-2">
              <TouchableOpacity
                onPress={loadReport}
                disabled={loading}
                className="flex-1 bg-primary rounded-lg p-3 items-center"
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <MaterialIcons name="refresh" size={20} color="white" />
                    <Text className="text-white font-semibold text-sm mt-1">Atualizar</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={exportToPDF}
                disabled={!reportData || loading}
                className="flex-1 bg-green-600 rounded-lg p-3 items-center"
              >
                <MaterialIcons name="file-download" size={20} color="white" />
                <Text className="text-white font-semibold text-sm mt-1">Exportar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center p-4">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-gray-600 mt-2">Carregando relatório...</Text>
          </View>
        ) : reportData ? (
          <>
            <View className="p-3 gap-3">
              <View className="bg-white rounded-lg p-4 border border-gray-200">
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="text-sm text-gray-600">Total de Envios</Text>
                    <Text className="text-3xl font-bold text-primary mt-1">
                      {reportData.totalShipments}
                    </Text>
                  </View>
                  <MaterialIcons name="local-shipping" size={32} color={colors.primary} />
                </View>
              </View>

              <View className="bg-white rounded-lg p-4 border border-gray-200">
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="text-sm text-gray-600">Valor Total</Text>
                    <Text className="text-3xl font-bold text-green-600 mt-1">
                      {formatCurrency(reportData.totalValue)}
                    </Text>
                  </View>
                  <MaterialIcons name="attach-money" size={32} color="#16a34a" />
                </View>
              </View>

              <View className="bg-white rounded-lg p-4 border border-gray-200">
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="text-sm text-gray-600">Valor Médio</Text>
                    <Text className="text-3xl font-bold text-blue-600 mt-1">
                      {formatCurrency(reportData.averageValue)}
                    </Text>
                  </View>
                  <MaterialIcons name="trending-up" size={32} color="#2563eb" />
                </View>
              </View>
            </View>

            {Object.keys(reportData.byStatus).length > 0 && (
              <View className="bg-white p-4 m-3 rounded-lg border border-gray-200">
                <Text className="text-lg font-semibold text-foreground mb-3">Por Status</Text>
                {Object.entries(reportData.byStatus).map(([status, count]) => (
                  <View key={status} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                    <Text className="text-foreground capitalize">{status}</Text>
                    <View className="bg-blue-100 rounded-full px-3 py-1">
                      <Text className="text-blue-700 font-semibold">{count}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {Object.keys(reportData.byDestination).length > 0 && (
              <View className="bg-white p-4 m-3 rounded-lg border border-gray-200 mb-4">
                <Text className="text-lg font-semibold text-foreground mb-3">Por Destino (UF)</Text>
                {Object.entries(reportData.byDestination)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([uf, count]) => (
                    <View key={uf} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                      <Text className="text-foreground font-medium">{uf}</Text>
                      <View className="bg-green-100 rounded-full px-3 py-1">
                        <Text className="text-green-700 font-semibold">{count}</Text>
                      </View>
                    </View>
                  ))}
              </View>
            )}
          </>
        ) : (
          <View className="flex-1 items-center justify-center p-4">
            <MaterialIcons name="info" size={48} color={colors.muted} />
            <Text className="text-gray-600 mt-2">Nenhum dado disponível</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showDatePicker !== null} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-white rounded-lg p-6 w-full max-w-sm">
            <Text className="text-xl font-bold text-foreground mb-4">
              {showDatePicker === 'start' ? 'Data Inicial' : 'Data Final'}
            </Text>

            <TextInput
              placeholder="YYYY-MM-DD"
              value={tempDate}
              onChangeText={setTempDate}
              className="border border-gray-300 rounded-lg p-3 mb-4"
              style={{ color: '#000' }}
            />

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => {
                  setShowDatePicker(null);
                  setTempDate('');
                }}
                className="flex-1 bg-gray-200 rounded-lg p-3 items-center"
              >
                <Text className="text-foreground font-semibold">Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  if (tempDate) {
                    handleDateChange(showDatePicker!, tempDate);
                  }
                }}
                className="flex-1 bg-primary rounded-lg p-3 items-center"
              >
                <Text className="text-white font-semibold">Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/use-auth';
import { trpc } from '@/lib/trpc';

interface ShippingLabelWithCost {
  id: number;
  code: string;
  recipient: string;
  cost: string | null;
  weight: string | null;
  service_type: string | null;
  status: string;
  created_by: number;
  createdAt: Date;
}

export default function ReportsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [labels, setLabels] = useState<ShippingLabelWithCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState('month'); // 'week', 'month', 'year'
  const [totalCost, setTotalCost] = useState(0);
  const [averageCost, setAverageCost] = useState(0);

  // Verificar se é admin
  useEffect(() => {
    if (user && (user as any).role !== 'admin') {
      Alert.alert('Acesso Negado', 'Apenas administradores podem acessar relatórios de gastos');
      router.back();
    }
  }, [user]);

  // Carregar etiquetas
  useEffect(() => {
    loadLabels();
  }, [filterPeriod]);

  const loadLabels = async () => {
    try {
      setLoading(true);
      const result = await (trpc.shippingLabels.list as any).query();
      
      // Filtrar por período
      const now = new Date();
      let startDate = new Date();
      
      if (filterPeriod === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (filterPeriod === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (filterPeriod === 'year') {
        startDate.setFullYear(now.getFullYear() - 1);
      }

      const filtered = result.filter((label: any) => {
        const labelDate = new Date(label.createdAt);
        return labelDate >= startDate && labelDate <= now;
      });

      setLabels(filtered);

      // Calcular totais
      const total = filtered.reduce((sum: number, label: any) => {
        const cost = parseFloat(label.cost || '0');
        return sum + cost;
      }, 0);

      setTotalCost(total);
      setAverageCost(filtered.length > 0 ? total / filtered.length : 0);
    } catch (error) {
      console.error('Erro ao carregar etiquetas:', error);
      Alert.alert('Erro', 'Falha ao carregar relatório de gastos');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    Alert.alert(
      'Exportar Relatório',
      'Escolha o formato:',
      [
        {
          text: 'CSV',
          onPress: () => {
            const csv = generateCSV();
            downloadFile(csv, 'relatorio-gastos.csv', 'text/csv');
          },
        },
        {
          text: 'PDF',
          onPress: () => {
            const html = generateHTML();
            downloadFile(html, 'relatorio-gastos.html', 'text/html');
          },
        },
        { text: 'Cancelar', onPress: () => {} },
      ]
    );
  };

  const generateCSV = () => {
    const headers = ['Código', 'Destinatário', 'Custo', 'Peso', 'Serviço', 'Status', 'Data'];
    const rows = labels.map((label) => [
      label.code,
      label.recipient,
      label.cost || '0',
      label.weight || '-',
      label.service_type || '-',
      label.status,
      new Date(label.createdAt).toLocaleDateString('pt-BR'),
    ]);

    const csv = [
      ['Relatório de Gastos de Envio'],
      [`Período: ${filterPeriod}`],
      [`Total de Envios: ${labels.length}`],
      [`Custo Total: R$ ${totalCost.toFixed(2)}`],
      [`Custo Médio: R$ ${averageCost.toFixed(2)}`],
      [],
      headers,
      ...rows,
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csv;
  };

  const generateHTML = () => {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Gastos</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #0a7ea4; }
          .summary { background: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #0a7ea4; color: white; padding: 10px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>Relatório de Gastos de Envio</h1>
        <div class="summary">
          <p><strong>Período:</strong> ${filterPeriod}</p>
          <p><strong>Total de Envios:</strong> ${labels.length}</p>
          <p><strong>Custo Total:</strong> R$ ${totalCost.toFixed(2)}</p>
          <p><strong>Custo Médio:</strong> R$ ${averageCost.toFixed(2)}</p>
          <p><strong>Data do Relatório:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Destinatário</th>
              <th>Custo</th>
              <th>Peso</th>
              <th>Serviço</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            ${labels
              .map(
                (label) => `
              <tr>
                <td>${label.code}</td>
                <td>${label.recipient}</td>
                <td>R$ ${parseFloat(label.cost || '0').toFixed(2)}</td>
                <td>${label.weight || '-'}</td>
                <td>${label.service_type || '-'}</td>
                <td>${label.status}</td>
                <td>${new Date(label.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    if (typeof window !== 'undefined') {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      Alert.alert('Sucesso', 'Relatório exportado com sucesso!');
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0a7ea4" />
      </ScreenContainer>
    );
  }

  if (!user || (user as any).role !== 'admin') {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-lg text-red-600">Acesso Negado</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="gap-4">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">Relatório de Gastos</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-gray-200 rounded-lg p-2"
            >
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Filtro de Período */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-600">Período</Text>
            <View className="flex-row gap-2">
              {['week', 'month', 'year'].map((period) => (
                <TouchableOpacity
                  key={period}
                  onPress={() => setFilterPeriod(period)}
                  className={`flex-1 rounded-lg p-3 ${
                    filterPeriod === period ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <Text
                    className={`text-center font-semibold ${
                      filterPeriod === period ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {period === 'week' ? '7 dias' : period === 'month' ? '30 dias' : '1 ano'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Resumo */}
          <View className="gap-3">
            <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <Text className="text-sm text-gray-600">Total de Envios</Text>
              <Text className="text-3xl font-bold text-blue-600">{labels.length}</Text>
            </View>

            <View className="bg-green-50 rounded-lg p-4 border border-green-200">
              <Text className="text-sm text-gray-600">Custo Total</Text>
              <Text className="text-3xl font-bold text-green-600">R$ {totalCost.toFixed(2)}</Text>
            </View>

            <View className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <Text className="text-sm text-gray-600">Custo Médio por Envio</Text>
              <Text className="text-3xl font-bold text-purple-600">R$ {averageCost.toFixed(2)}</Text>
            </View>
          </View>

          {/* Botão Exportar */}
          <TouchableOpacity
            onPress={handleExportReport}
            className="bg-blue-600 rounded-lg p-4"
          >
            <View className="flex-row items-center justify-center gap-2">
              <MaterialIcons name="download" size={20} color="white" />
              <Text className="text-white font-semibold">Exportar Relatório</Text>
            </View>
          </TouchableOpacity>

          {/* Lista de Etiquetas */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-3">Detalhes dos Envios</Text>
            <FlatList
              data={labels}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View className="bg-surface rounded-lg p-3 mb-2 border border-border">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">{item.code}</Text>
                      <Text className="text-sm text-muted">{item.recipient}</Text>
                    </View>
                    <View className="bg-blue-100 rounded px-2 py-1">
                      <Text className="text-xs font-semibold text-blue-700">{item.status}</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between mb-2">
                    <View>
                      <Text className="text-xs text-muted">Custo</Text>
                      <Text className="font-semibold text-green-600">
                        R$ {parseFloat(item.cost || '0').toFixed(2)}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-xs text-muted">Peso</Text>
                      <Text className="font-semibold text-foreground">{item.weight || '-'}</Text>
                    </View>
                    <View>
                      <Text className="text-xs text-muted">Serviço</Text>
                      <Text className="font-semibold text-foreground">{item.service_type || '-'}</Text>
                    </View>
                  </View>

                  <Text className="text-xs text-muted">
                    {new Date(item.createdAt).toLocaleString('pt-BR')}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

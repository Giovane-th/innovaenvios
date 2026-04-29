import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TrackingEvent {
  id: string;
  date: string;
  status: string;
  location: string;
  description: string;
  details?: string;
}

interface TrackingInfo {
  codigo: string;
  status: 'Gerada' | 'Postada' | 'Em trânsito' | 'Entregue';
  destinatario: string;
  endereco: string;
  events: TrackingEvent[];
  dataPostagem?: string;
  dataEntrega?: string;
}

export default function TrackingScreen() {
  const colors = useColors();
  const [codigoRastreamento, setCodigoRastreamento] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historico, setHistorico] = useState<TrackingInfo[]>([]);

  // Carregar histórico de rastreamentos
  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      const stored = await AsyncStorage.getItem('tracking_history');
      if (stored) {
        setHistorico(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  // Simular rastreamento (quando API voltar, usar dados reais)
  const rastrear = async () => {
    if (!codigoRastreamento.trim()) {
      setError('Digite o código de rastreamento');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulação local de rastreamento
      const simulacao: TrackingInfo = {
        codigo: codigoRastreamento,
        status: 'Em trânsito',
        destinatario: 'Cliente Exemplo',
        endereco: 'Rua Exemplo, 123 - São Paulo, SP',
        dataPostagem: new Date().toLocaleDateString('pt-BR'),
        events: [
          {
            id: '1',
            date: new Date().toLocaleDateString('pt-BR'),
            status: 'Entregue',
            location: 'Centro de Distribuição - São Paulo',
            description: 'Objeto entregue',
            details: 'Entregue ao destinatário'
          },
          {
            id: '2',
            date: new Date(Date.now() - 86400000).toLocaleDateString('pt-BR'),
            status: 'Em trânsito',
            location: 'Centro de Distribuição - Rio de Janeiro',
            description: 'Objeto em trânsito',
            details: 'Saiu para entrega'
          },
          {
            id: '3',
            date: new Date(Date.now() - 172800000).toLocaleDateString('pt-BR'),
            status: 'Postado',
            location: 'Agência dos Correios - São Paulo',
            description: 'Objeto postado',
            details: 'Recebido pela agência'
          }
        ]
      };

      setTrackingInfo(simulacao);

      // Salvar no histórico
      const novoHistorico = [simulacao, ...historico.filter(h => h.codigo !== codigoRastreamento)].slice(0, 10);
      setHistorico(novoHistorico);
      await AsyncStorage.setItem('tracking_history', JSON.stringify(novoHistorico));

      setCodigoRastreamento('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao rastrear');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (trackingInfo) {
      await rastrear();
    }
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Gerada':
        return colors.primary;
      case 'Postada':
        return '#F59E0B';
      case 'Em trânsito':
        return '#3B82F6';
      case 'Entregue':
        return colors.success;
      default:
        return colors.muted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Gerada':
        return 'description';
      case 'Postada':
        return 'local-shipping';
      case 'Em trânsito':
        return 'directions';
      case 'Entregue':
        return 'check-circle';
      default:
        return 'info';
    }
  };

  return (
    <ScreenContainer className="flex-1">
      <FlatList
        data={[]}
        renderItem={() => null}
        keyExtractor={() => 'dummy'}
        scrollEnabled={false}
        ListHeaderComponent={
          <View className="pb-6">
            {/* Header */}
            <View className="mb-6">
              <Text className="text-2xl font-bold text-foreground">
                Rastreamento
              </Text>
              <Text className="text-sm text-muted mt-1">
                Acompanhe seus envios
              </Text>
            </View>

            {/* Busca */}
            <View className="flex-row gap-2 mb-6">
              <TextInput
                value={codigoRastreamento}
                onChangeText={setCodigoRastreamento}
                placeholder="Código de rastreamento"
                placeholderTextColor={colors.muted}
                className="flex-1 border border-border rounded-lg p-3 text-foreground bg-surface"
                onSubmitEditing={rastrear}
              />
              <TouchableOpacity
                onPress={rastrear}
                disabled={loading}
                className="bg-primary rounded-lg p-3 justify-center"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <MaterialIcons name="search" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>

            {/* Erro */}
            {error && (
              <View className="bg-red-50 rounded-lg p-3 mb-6 border border-red-200">
                <Text className="text-red-600 text-sm">{error}</Text>
              </View>
            )}

            {/* Rastreamento Atual */}
            {trackingInfo && (
              <View className="bg-surface rounded-lg p-4 border border-border mb-6">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-foreground">
                      {trackingInfo.codigo}
                    </Text>
                    <Text className="text-sm text-muted mt-1">
                      {trackingInfo.destinatario}
                    </Text>
                  </View>
                  <View
                    style={{ backgroundColor: getStatusColor(trackingInfo.status) + '20' }}
                    className="rounded-full px-3 py-1"
                  >
                    <Text
                      style={{ color: getStatusColor(trackingInfo.status) }}
                      className="text-xs font-semibold"
                    >
                      {trackingInfo.status}
                    </Text>
                  </View>
                </View>

                <Text className="text-xs text-muted mb-4">
                  {trackingInfo.endereco}
                </Text>

                {/* Timeline */}
                <View>
                  {trackingInfo.events.map((event, index) => (
                    <View key={event.id} className="flex-row mb-4">
                      {/* Linha */}
                      {index < trackingInfo.events.length - 1 && (
                        <View
                          style={{
                            position: 'absolute',
                            left: 12,
                            top: 40,
                            width: 2,
                            height: 60,
                            backgroundColor: colors.border
                          }}
                        />
                      )}

                      {/* Ícone */}
                      <View
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: getStatusColor(event.status),
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                          zIndex: 1
                        }}
                      >
                        <MaterialIcons
                          name={getStatusIcon(event.status) as any}
                          size={16}
                          color="white"
                        />
                      </View>

                      {/* Conteúdo */}
                      <View className="flex-1">
                        <Text className="font-semibold text-foreground text-sm">
                          {event.description}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                          {event.location}
                        </Text>
                        <Text className="text-xs text-muted mt-1">
                          {event.date}
                        </Text>
                        {event.details && (
                          <Text className="text-xs text-muted mt-2 italic">
                            {event.details}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Histórico */}
            {historico.length > 0 && (
              <View>
                <Text className="text-lg font-semibold text-foreground mb-3">
                  Histórico de Rastreamentos
                </Text>
                {historico.map((item) => (
                  <TouchableOpacity
                    key={item.codigo}
                    onPress={() => setTrackingInfo(item)}
                    className="bg-surface rounded-lg p-4 border border-border mb-3 flex-row items-center justify-between"
                  >
                    <View className="flex-1">
                      <Text className="font-semibold text-foreground">
                        {item.codigo}
                      </Text>
                      <Text className="text-sm text-muted mt-1">
                        {item.destinatario}
                      </Text>
                    </View>
                    <View
                      style={{ backgroundColor: getStatusColor(item.status) + '20' }}
                      className="rounded-full px-3 py-1"
                    >
                      <Text
                        style={{ color: getStatusColor(item.status) }}
                        className="text-xs font-semibold"
                      >
                        {item.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Vazio */}
            {!trackingInfo && historico.length === 0 && (
              <View className="bg-surface rounded-lg p-6 border border-border items-center my-8">
                <MaterialIcons name="local-shipping" size={48} color={colors.muted} />
                <Text className="text-foreground font-semibold mt-3 text-center">
                  Nenhum rastreamento
                </Text>
                <Text className="text-muted text-sm text-center mt-1">
                  Digite um código para rastrear seu envio
                </Text>
              </View>
            )}
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </ScreenContainer>
  );
}

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/use-colors';
import { useCorreiosTracking, type TrackingInfo } from '@/hooks/use-correios-tracking';
import { ScreenContainer } from '@/components/screen-container';

interface TrackingRealtimeProps {
  trackingCode?: string;
  onClose?: () => void;
}

export function TrackingRealtime({ trackingCode, onClose }: TrackingRealtimeProps) {
  const colors = useColors();
  const { fetchTracking, getTracking, loading } = useCorreiosTracking();
  const [currentTracking, setCurrentTracking] = useState<TrackingInfo | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (trackingCode) {
      fetchTracking(trackingCode).then(result => {
        if (result.success && result.data) {
          setCurrentTracking(result.data);
        }
      });
    }
  }, [trackingCode, fetchTracking]);

  // Auto-refresh a cada 60 segundos
  useEffect(() => {
    if (!autoRefresh || !trackingCode) return;

    const interval = setInterval(() => {
      fetchTracking(trackingCode).then(result => {
        if (result.success && result.data) {
          setCurrentTracking(result.data);
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [autoRefresh, trackingCode, fetchTracking]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#10B981';
      case 'in_transit':
        return '#3B82F6';
      case 'posted':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      default:
        return colors.muted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'check-circle';
      case 'in_transit':
        return 'local-shipping';
      case 'posted':
        return 'mail';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Entregue';
      case 'in_transit':
        return 'Em Trânsito';
      case 'posted':
        return 'Postado';
      case 'error':
        return 'Erro';
      default:
        return 'Pendente';
    }
  };

  if (!currentTracking) {
    return (
      <ScreenContainer className="items-center justify-center">
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <Text className="text-muted">Nenhum rastreamento encontrado</Text>
        )}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-foreground">Rastreamento</Text>
            {onClose && (
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            )}
          </View>

          {/* Código de Rastreamento */}
          <View className="bg-surface rounded-lg p-4 mb-4">
            <Text className="text-sm text-muted mb-2">Código de Rastreamento</Text>
            <Text className="text-lg font-bold text-foreground">{currentTracking.code}</Text>
          </View>
        </View>

        {/* Status Principal */}
        <View
          style={{
            backgroundColor: getStatusColor(currentTracking.status) + '10',
            borderLeftWidth: 4,
            borderLeftColor: getStatusColor(currentTracking.status),
            borderRadius: 8,
            padding: 16,
            marginBottom: 24
          }}
        >
          <View className="flex-row items-center gap-3 mb-3">
            <MaterialIcons
              name={getStatusIcon(currentTracking.status) as any}
              size={28}
              color={getStatusColor(currentTracking.status)}
            />
            <View>
              <Text className="text-sm text-muted">Status Atual</Text>
              <Text className="text-xl font-bold text-foreground">
                {getStatusLabel(currentTracking.status)}
              </Text>
            </View>
          </View>

          <View className="border-t border-border pt-3 mt-3">
            <Text className="text-sm text-muted mb-1">Localização Atual</Text>
            <Text className="text-base font-semibold text-foreground">
              {currentTracking.currentLocation}
            </Text>
          </View>

          {currentTracking.status !== 'delivered' && (
            <View className="border-t border-border pt-3 mt-3">
              <Text className="text-sm text-muted mb-1">Previsão de Entrega</Text>
              <Text className="text-base font-semibold text-foreground">
                {currentTracking.estimatedDelivery}
              </Text>
            </View>
          )}
        </View>

        {/* Timeline de Eventos */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">Histórico de Eventos</Text>

          {currentTracking.events.map((event, index) => (
            <View key={index} className="flex-row mb-6">
              {/* Timeline Dot */}
              <View className="items-center mr-4">
                <View
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                    marginBottom: 8
                  }}
                />
                {index < currentTracking.events.length - 1 && (
                  <View
                    style={{
                      width: 2,
                      height: 60,
                      backgroundColor: colors.border
                    }}
                  />
                )}
              </View>

              {/* Event Content */}
              <View className="flex-1">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-base font-semibold text-foreground flex-1">
                    {event.status}
                  </Text>
                  <Text className="text-xs text-muted">
                    {event.date} {event.time}
                  </Text>
                </View>

                <Text className="text-sm text-muted mb-1">{event.location}</Text>
                <Text className="text-sm text-foreground">{event.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Auto-refresh Toggle */}
        <View className="flex-row items-center justify-between bg-surface rounded-lg p-4 mb-6">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="refresh" size={20} color={colors.primary} />
            <Text className="text-sm font-semibold text-foreground">Atualização Automática</Text>
          </View>
          <TouchableOpacity
            onPress={() => setAutoRefresh(!autoRefresh)}
            style={{
              backgroundColor: autoRefresh ? colors.primary : colors.border,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 6
            }}
          >
            <Text className="text-xs font-semibold text-white">
              {autoRefresh ? 'Ativa' : 'Inativa'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Última Atualização */}
        <Text className="text-xs text-muted text-center">
          Última atualização: {new Date(currentTracking.lastUpdate).toLocaleString('pt-BR')}
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

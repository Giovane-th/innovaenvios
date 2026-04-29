import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useColors } from '@/hooks/use-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ShippingData {
  id: string;
  code: string;
  recipient: string;
  status: 'Gerada' | 'Postada' | 'Em trânsito' | 'Entregue';
  date: string;
  createdBy?: string;
}

interface DashboardStats {
  totalEnvios: number;
  enviosHoje: number;
  enviosPendentes: number;
  enviosEntregues: number;
  porFuncionario: Record<string, number>;
  porEstado: Record<string, number>;
  porStatus: Record<string, number>;
}

export function ShippingDashboard() {
  const colors = useColors();
  const [stats, setStats] = useState<DashboardStats>({
    totalEnvios: 0,
    enviosHoje: 0,
    enviosPendentes: 0,
    enviosEntregues: 0,
    porFuncionario: {},
    porEstado: {},
    porStatus: {}
  });

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const carregarEstatisticas = async () => {
    try {
      const stored = await AsyncStorage.getItem('shipping_history');
      if (!stored) return;

      const envios: ShippingData[] = JSON.parse(stored);
      const hoje = new Date().toISOString().split('T')[0];

      // Calcular estatísticas
      const porStatus: Record<string, number> = {
        'Gerada': 0,
        'Postada': 0,
        'Em trânsito': 0,
        'Entregue': 0
      };

      const porFuncionario: Record<string, number> = {};
      let enviosHoje = 0;
      let enviosPendentes = 0;
      let enviosEntregues = 0;

      envios.forEach(envio => {
        // Por status
        porStatus[envio.status]++;

        // Por funcionário
        if (envio.createdBy) {
          porFuncionario[envio.createdBy] = (porFuncionario[envio.createdBy] || 0) + 1;
        }

        // Hoje
        if (envio.date === hoje) {
          enviosHoje++;
        }

        // Pendentes
        if (envio.status === 'Gerada') {
          enviosPendentes++;
        }

        // Entregues
        if (envio.status === 'Entregue') {
          enviosEntregues++;
        }
      });

      setStats({
        totalEnvios: envios.length,
        enviosHoje,
        enviosPendentes,
        enviosEntregues,
        porFuncionario,
        porEstado: {},
        porStatus
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Gerada':
        return '#3B82F6';
      case 'Postada':
        return '#F59E0B';
      case 'Em trânsito':
        return '#8B5CF6';
      case 'Entregue':
        return '#10B981';
      default:
        return colors.muted;
    }
  };

  const StatCard = ({ titulo, valor, cor, icone }: any) => (
    <View
      style={{
        backgroundColor: cor + '15',
        borderColor: cor,
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <Text style={{ fontSize: 12, color: cor, fontWeight: '600', marginBottom: 8 }}>
        {titulo}
      </Text>
      <Text style={{ fontSize: 28, color: cor, fontWeight: 'bold' }}>
        {valor}
      </Text>
    </View>
  );

  const BarChart = ({ dados, titulo }: any) => {
    const maxValor = Math.max(...Object.values(dados).map(v => Number(v)), 1);

    return (
      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
          {titulo}
        </Text>
        {Object.entries(dados).map(([label, valor]: any) => (
          <View key={label} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>{label}</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.foreground }}>
                {valor}
              </Text>
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: colors.surface,
                borderRadius: 4,
                overflow: 'hidden'
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${(valor / maxValor) * 100}%`,
                  backgroundColor: colors.primary,
                  borderRadius: 4
                }}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16 }}
    >
      {/* Título */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground, marginBottom: 16 }}>
        Dashboard de Envios
      </Text>

      {/* Cards de Estatísticas */}
      <StatCard
        titulo="Total de Envios"
        valor={stats.totalEnvios}
        cor={colors.primary}
        icone="package"
      />

      <StatCard
        titulo="Envios Hoje"
        valor={stats.enviosHoje}
        cor="#3B82F6"
        icone="calendar-today"
      />

      <StatCard
        titulo="Pendentes"
        valor={stats.enviosPendentes}
        cor="#F59E0B"
        icone="pending-actions"
      />

      <StatCard
        titulo="Entregues"
        valor={stats.enviosEntregues}
        cor="#10B981"
        icone="check-circle"
      />

      {/* Gráfico de Status */}
      {Object.keys(stats.porStatus).length > 0 && (
        <BarChart
          dados={stats.porStatus}
          titulo="Envios por Status"
        />
      )}

      {/* Gráfico de Funcionários */}
      {Object.keys(stats.porFuncionario).length > 0 && (
        <BarChart
          dados={stats.porFuncionario}
          titulo="Envios por Funcionário"
        />
      )}

      {/* Resumo */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          borderLeftWidth: 4,
          borderLeftColor: colors.primary,
          marginBottom: 24
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
          📊 Resumo
        </Text>
        <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18 }}>
          {`Total: ${stats.totalEnvios} envios\n`}
          {`Hoje: ${stats.enviosHoje} envios\n`}
          {`Taxa de Entrega: ${stats.totalEnvios > 0 ? ((stats.enviosEntregues / stats.totalEnvios) * 100).toFixed(1) : 0}%`}
        </Text>
      </View>
    </ScrollView>
  );
}

import { useState, useCallback, useEffect } from 'react';

export interface TrackingEvent {
  date: string;
  time: string;
  status: string;
  location: string;
  detail: string;
}

export interface TrackingInfo {
  code: string;
  status: 'pending' | 'posted' | 'in_transit' | 'delivered' | 'error';
  currentLocation: string;
  estimatedDelivery: string;
  events: TrackingEvent[];
  lastUpdate: string;
}

export function useCorreiosTracking() {
  const [tracking, setTracking] = useState<Map<string, TrackingInfo>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simular busca de rastreamento nos Correios
  const fetchTracking = useCallback(async (trackingCode: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulação de resposta da API dos Correios
      const mockTracking: TrackingInfo = {
        code: trackingCode,
        status: 'in_transit',
        currentLocation: 'São Paulo, SP',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        events: [
          {
            date: new Date().toLocaleDateString('pt-BR'),
            time: '14:30',
            status: 'Saiu para entrega',
            location: 'São Paulo, SP',
            detail: 'Objeto saiu para entrega'
          },
          {
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
            time: '09:15',
            status: 'Em trânsito',
            location: 'Centro de Distribuição - São Paulo, SP',
            detail: 'Objeto em trânsito'
          },
          {
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
            time: '16:45',
            status: 'Postado',
            location: 'Agência dos Correios',
            detail: 'Objeto postado'
          }
        ],
        lastUpdate: new Date().toISOString()
      };

      setTracking(prev => new Map(prev).set(trackingCode, mockTracking));
      return { success: true, data: mockTracking };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao buscar rastreamento';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sincronizar rastreamento em tempo real (polling)
  const startRealtimeTracking = useCallback((trackingCode: string, intervalMs: number = 60000) => {
    // Buscar imediatamente
    fetchTracking(trackingCode);

    // Configurar polling
    const interval = setInterval(() => {
      fetchTracking(trackingCode);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [fetchTracking]);

  // Obter rastreamento armazenado
  const getTracking = useCallback((trackingCode: string) => {
    return tracking.get(trackingCode);
  }, [tracking]);

  // Obter todos os rastreamentos
  const getAllTracking = useCallback(() => {
    return Array.from(tracking.values());
  }, [tracking]);

  // Limpar rastreamento
  const clearTracking = useCallback((trackingCode: string) => {
    setTracking(prev => {
      const newMap = new Map(prev);
      newMap.delete(trackingCode);
      return newMap;
    });
  }, []);

  // Verificar se entrega foi realizada
  const isDelivered = useCallback((trackingCode: string) => {
    const info = tracking.get(trackingCode);
    return info?.status === 'delivered';
  }, [tracking]);

  // Obter próximo evento esperado
  const getNextEvent = useCallback((trackingCode: string) => {
    const info = tracking.get(trackingCode);
    if (!info || info.events.length === 0) return null;
    return info.events[0]; // Primeiro evento é o mais recente
  }, [tracking]);

  return {
    tracking: Array.from(tracking.values()),
    loading,
    error,
    fetchTracking,
    startRealtimeTracking,
    getTracking,
    getAllTracking,
    clearTracking,
    isDelivered,
    getNextEvent
  };
}

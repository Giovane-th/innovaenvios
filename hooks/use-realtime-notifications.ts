import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'sucesso' | 'aviso' | 'erro' | 'info';
  timestamp: string;
  lido: boolean;
  acao?: {
    titulo: string;
    callback: () => void;
  };
}

export function useRealtimeNotifications() {
  const [notificacoes, setNotificacoes] = useState<Notification[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);

  // Carregar notificações
  useEffect(() => {
    carregarNotificacoes();
  }, []);

  const carregarNotificacoes = async () => {
    try {
      const stored = await AsyncStorage.getItem('notificacoes');
      if (stored) {
        const notifs = JSON.parse(stored);
        setNotificacoes(notifs);
        const naoLidasCount = notifs.filter((n: Notification) => !n.lido).length;
        setNaoLidas(naoLidasCount);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  // Adicionar notificação
  const adicionarNotificacao = useCallback(async (notif: Omit<Notification, 'id' | 'timestamp' | 'lido'>) => {
    const novaNotif: Notification = {
      ...notif,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      lido: false
    };

    const updated = [novaNotif, ...notificacoes];
    setNotificacoes(updated);
    setNaoLidas(updated.filter(n => !n.lido).length);

    // Salvar
    await AsyncStorage.setItem('notificacoes', JSON.stringify(updated));

    // Simular notificação do sistema
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'granted') {
          new Notification(notif.titulo, {
            body: notif.mensagem,
            icon: '/icon.png'
          });
        }
      } catch (error) {
        console.error('Erro ao enviar notificação:', error);
      }
    }

    return novaNotif;
  }, [notificacoes]);

  // Marcar como lido
  const marcarComoLido = useCallback(async (id: string) => {
    const updated = notificacoes.map(n =>
      n.id === id ? { ...n, lido: true } : n
    );
    setNotificacoes(updated);
    setNaoLidas(updated.filter(n => !n.lido).length);
    await AsyncStorage.setItem('notificacoes', JSON.stringify(updated));
  }, [notificacoes]);

  // Remover notificação
  const removerNotificacao = useCallback(async (id: string) => {
    const updated = notificacoes.filter(n => n.id !== id);
    setNotificacoes(updated);
    setNaoLidas(updated.filter(n => !n.lido).length);
    await AsyncStorage.setItem('notificacoes', JSON.stringify(updated));
  }, [notificacoes]);

  // Limpar todas
  const limparTodas = useCallback(async () => {
    setNotificacoes([]);
    setNaoLidas(0);
    await AsyncStorage.removeItem('notificacoes');
  }, []);

  // Simular notificações de entrega
  const simularNotificacaoEntrega = useCallback((codigo: string, destinatario: string) => {
    adicionarNotificacao({
      titulo: '📦 Entrega Realizada',
      mensagem: `Etiqueta ${codigo} entregue para ${destinatario}`,
      tipo: 'sucesso'
    });
  }, [adicionarNotificacao]);

  // Simular notificações de problemas
  const simularNotificacaoProblema = useCallback((codigo: string, problema: string) => {
    adicionarNotificacao({
      titulo: '⚠️ Problema no Envio',
      mensagem: `Etiqueta ${codigo}: ${problema}`,
      tipo: 'aviso'
    });
  }, [adicionarNotificacao]);

  return {
    notificacoes,
    naoLidas,
    adicionarNotificacao,
    marcarComoLido,
    removerNotificacao,
    limparTodas,
    simularNotificacaoEntrega,
    simularNotificacaoProblema
  };
}

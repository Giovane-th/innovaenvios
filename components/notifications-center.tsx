import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/use-colors';
import { useRealtimeNotifications, type Notification } from '@/hooks/use-realtime-notifications';

interface NotificationsCenterProps {
  visible: boolean;
  onClose: () => void;
}

export function NotificationsCenter({ visible, onClose }: NotificationsCenterProps) {
  const colors = useColors();
  const {
    notificacoes,
    naoLidas,
    marcarComoLido,
    removerNotificacao,
    limparTodas
  } = useRealtimeNotifications();

  const getIcone = (tipo: string) => {
    switch (tipo) {
      case 'sucesso':
        return 'check-circle';
      case 'aviso':
        return 'warning';
      case 'erro':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'notifications';
    }
  };

  const getCor = (tipo: string) => {
    switch (tipo) {
      case 'sucesso':
        return '#10B981';
      case 'aviso':
        return '#F59E0B';
      case 'erro':
        return '#EF4444';
      case 'info':
        return '#3B82F6';
      default:
        return colors.muted;
    }
  };

  const NotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      onPress={() => marcarComoLido(item.id)}
      style={{
        backgroundColor: item.lido ? colors.surface : getCor(item.tipo) + '10',
        borderLeftWidth: 4,
        borderLeftColor: getCor(item.tipo),
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}
    >
      <View style={{ flex: 1, flexDirection: 'row', gap: 12 }}>
        <MaterialIcons
          name={getIcone(item.tipo) as any}
          size={24}
          color={getCor(item.tipo)}
          style={{ marginTop: 2 }}
        />
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.foreground,
            marginBottom: 4
          }}>
            {item.titulo}
          </Text>
          <Text style={{
            fontSize: 12,
            color: colors.muted,
            marginBottom: 8
          }}>
            {item.mensagem}
          </Text>
          <Text style={{
            fontSize: 10,
            color: colors.muted
          }}>
            {new Date(item.timestamp).toLocaleString('pt-BR')}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => removerNotificacao(item.id)}
        style={{ padding: 4 }}
      >
        <MaterialIcons name="close" size={20} color={colors.muted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            marginTop: 80,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          }}
        >
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20
          }}>
            <View>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: colors.foreground
              }}>
                Notificações
              </Text>
              {naoLidas > 0 && (
                <View style={{
                  backgroundColor: '#EF4444',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  marginTop: 4
                }}>
                  <Text style={{
                    color: 'white',
                    fontSize: 10,
                    fontWeight: '600'
                  }}>
                    {naoLidas} nova{naoLidas > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {notificacoes.length > 0 && (
                <TouchableOpacity
                  onPress={limparTodas}
                  style={{
                    padding: 8,
                    backgroundColor: colors.surface,
                    borderRadius: 8
                  }}
                >
                  <MaterialIcons name="delete-sweep" size={20} color={colors.muted} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={onClose}
                style={{
                  padding: 8,
                  backgroundColor: colors.surface,
                  borderRadius: 8
                }}
              >
                <MaterialIcons name="close" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Lista de Notificações */}
          {notificacoes.length > 0 ? (
            <FlatList
              data={notificacoes}
              renderItem={({ item }) => <NotificationItem item={item} />}
              keyExtractor={item => item.id}
              scrollEnabled={true}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <MaterialIcons
                name="notifications-none"
                size={48}
                color={colors.muted}
                style={{ marginBottom: 12 }}
              />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.foreground,
                marginBottom: 4
              }}>
                Sem notificações
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.muted
              }}>
                Você está em dia com tudo!
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

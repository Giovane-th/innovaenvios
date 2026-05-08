import * as Notifications from 'expo-notifications';
import { getDb } from './db.js';

/**
 * Configuração de notificações
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  } as any),
});

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

/**
 * Armazena token de notificação do dispositivo
 */
export async function storeNotificationToken(
  userId: number,
  token: string,
  platform: 'ios' | 'android' | 'web'
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not connected');

    // Aqui você armazenaria o token no banco de dados
    // Por enquanto, apenas logamos
    console.log(`[Notifications] Token stored for user ${userId}:`, token);
  } catch (error) {
    console.error('Error storing notification token:', error);
  }
}

/**
 * Envia notificação para um usuário
 */
export async function sendNotificationToUser(
  userId: number,
  payload: NotificationPayload
): Promise<void> {
  try {
    // Aqui você recuperaria o token do banco e enviaria via Expo Push Notifications
    console.log(`[Notifications] Sending to user ${userId}:`, payload);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

/**
 * Notifica quando uma etiqueta é criada
 */
export async function notifyLabelCreated(
  userId: number,
  labelCode: string,
  recipient: string
): Promise<void> {
  await sendNotificationToUser(userId, {
    title: 'Etiqueta Criada',
    body: `Etiqueta ${labelCode} para ${recipient} foi criada com sucesso`,
    data: {
      type: 'label_created',
      labelCode,
      recipient,
    },
  });
}

/**
 * Notifica quando status de envio muda
 */
export async function notifyStatusChanged(
  userId: number,
  labelCode: string,
  newStatus: string
): Promise<void> {
  const statusMessages: Record<string, string> = {
    pending: 'Pendente',
    processing: 'Processando',
    shipped: 'Enviado',
    in_transit: 'Em trânsito',
    delivered: 'Entregue',
    failed: 'Falha na entrega',
    returned: 'Devolvido',
  };

  await sendNotificationToUser(userId, {
    title: 'Status do Envio Atualizado',
    body: `Etiqueta ${labelCode} agora está: ${statusMessages[newStatus] || newStatus}`,
    data: {
      type: 'status_changed',
      labelCode,
      status: newStatus,
    },
  });
}

/**
 * Notifica sobre relatório agendado
 */
export async function notifyScheduledReport(
  userId: number,
  reportType: string,
  period: string
): Promise<void> {
  await sendNotificationToUser(userId, {
    title: 'Relatório Disponível',
    body: `Seu relatório de ${reportType} (${period}) está pronto para download`,
    data: {
      type: 'report_ready',
      reportType,
      period,
    },
  });
}

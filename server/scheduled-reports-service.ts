import { getDb } from './db.js';
import * as reportsDb from './reports-db.js';

/**
 * Tipos de frequência de relatório
 */
export type ReportFrequency = 'daily' | 'weekly' | 'monthly';

/**
 * Configuração de relatório agendado
 */
export interface ScheduledReport {
  id: number;
  userId: number;
  email: string;
  frequency: ReportFrequency;
  reportType: 'shipping' | 'revenue' | 'summary';
  enabled: boolean;
  lastSentAt?: Date;
  createdAt: Date;
}

/**
 * Calcula próxima data de envio baseado na frequência
 */
function getNextSendDate(frequency: ReportFrequency, lastSent?: Date): Date {
  const now = new Date();
  const next = lastSent ? new Date(lastSent) : new Date();

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      next.setHours(8, 0, 0, 0); // 8 AM
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      next.setHours(8, 0, 0, 0);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(8, 0, 0, 0);
      break;
  }

  return next;
}

/**
 * Cria um relatório agendado
 */
export async function createScheduledReport(
  userId: number,
  email: string,
  frequency: ReportFrequency,
  reportType: 'shipping' | 'revenue' | 'summary'
): Promise<ScheduledReport> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not connected');

    // Aqui você inseriria no banco de dados
    const report: ScheduledReport = {
      id: Math.floor(Math.random() * 10000),
      userId,
      email,
      frequency,
      reportType,
      enabled: true,
      createdAt: new Date(),
    };

    console.log('[ScheduledReports] Created:', report);
    return report;
  } catch (error) {
    console.error('Error creating scheduled report:', error);
    throw error;
  }
}

/**
 * Lista relatórios agendados de um usuário
 */
export async function listScheduledReports(userId: number): Promise<ScheduledReport[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not connected');

    // Aqui você buscaria do banco de dados
    console.log('[ScheduledReports] Listing for user:', userId);
    return [];
  } catch (error) {
    console.error('Error listing scheduled reports:', error);
    throw error;
  }
}

/**
 * Atualiza um relatório agendado
 */
export async function updateScheduledReport(
  reportId: number,
  updates: Partial<ScheduledReport>
): Promise<ScheduledReport> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not connected');

    // Aqui você atualizaria no banco de dados
    const report: ScheduledReport = {
      id: reportId,
      userId: 0,
      email: '',
      frequency: 'monthly',
      reportType: 'summary',
      enabled: true,
      createdAt: new Date(),
      ...updates,
    };

    console.log('[ScheduledReports] Updated:', report);
    return report;
  } catch (error) {
    console.error('Error updating scheduled report:', error);
    throw error;
  }
}

/**
 * Deleta um relatório agendado
 */
export async function deleteScheduledReport(reportId: number): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not connected');

    // Aqui você deletaria do banco de dados
    console.log('[ScheduledReports] Deleted:', reportId);
  } catch (error) {
    console.error('Error deleting scheduled report:', error);
    throw error;
  }
}

/**
 * Processa relatórios agendados que devem ser enviados
 * Esta função deve ser chamada periodicamente (ex: a cada 5 minutos)
 */
export async function processScheduledReports(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not connected');

    console.log('[ScheduledReports] Processing scheduled reports...');

    // Aqui você buscaria todos os relatórios que precisam ser enviados
    // e os processaria

    // Exemplo de lógica:
    // 1. Buscar todos os relatórios habilitados
    // 2. Para cada um, verificar se é hora de enviar
    // 3. Se for, gerar o relatório
    // 4. Enviar por email
    // 5. Atualizar lastSentAt

    console.log('[ScheduledReports] Processing complete');
  } catch (error) {
    console.error('Error processing scheduled reports:', error);
  }
}

/**
 * Gera conteúdo HTML do relatório para email
 */
export async function generateReportHTML(
  reportType: 'shipping' | 'revenue' | 'summary',
  startDate: Date,
  endDate: Date
): Promise<string> {
  try {
    const report = await reportsDb.getShippingReport(startDate, endDate);

    let html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Relatório de Envios</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 20px; }
          h1 { color: #0a7ea4; text-align: center; margin-bottom: 30px; }
          .header { background: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .stat-box { background: #f9f9f9; padding: 15px; border-left: 4px solid #0a7ea4; border-radius: 3px; }
          .stat-label { color: #666; font-size: 12px; margin-bottom: 5px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #0a7ea4; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #0a7ea4; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #eee; }
          tr:nth-child(even) { background: #f9f9f9; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
          .button { display: inline-block; background: #0a7ea4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Relatório de Envios</h1>
          
          <div class="header">
            <p><strong>Período:</strong> ${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}</p>
            <p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          </div>

          <div class="stats">
            <div class="stat-box">
              <div class="stat-label">Total de Envios</div>
              <div class="stat-value">${report.totalShipments}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Valor Total</div>
              <div class="stat-value">R$ ${report.totalValue.toFixed(2)}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Valor Médio</div>
              <div class="stat-value">R$ ${report.averageValue.toFixed(2)}</div>
            </div>
          </div>

          <h2 style="color: #0a7ea4; margin-top: 30px;">Envios por Status</h2>
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(report.byStatus)
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

          <h2 style="color: #0a7ea4; margin-top: 30px;">Envios por Destino (UF)</h2>
          <table>
            <thead>
              <tr>
                <th>Estado</th>
                <th>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(report.byDestination)
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

          <div class="footer">
            <p>Este é um relatório automático gerado pelo sistema InNova Envios - IEP.</p>
            <p>Não responda este email. Para dúvidas, entre em contato com o administrador.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  } catch (error) {
    console.error('Error generating report HTML:', error);
    throw error;
  }
}

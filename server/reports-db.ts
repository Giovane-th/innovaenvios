import { getDb } from './db.js';
import { shippingLabels } from '../drizzle/schema.js';
import { sql } from 'drizzle-orm';

export interface ShippingReport {
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

/**
 * Get shipping reports for a date range
 */
export async function getShippingReport(
  startDate: Date,
  endDate: Date
): Promise<ShippingReport> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not connected');
    
    // Get all shipments in the date range
    const allShipments = await db
      .select()
      .from(shippingLabels)
      .where(
        sql`DATE(${shippingLabels.createdAt}) >= DATE(${startDate}) AND DATE(${shippingLabels.createdAt}) <= DATE(${endDate})`
      );

    if (!allShipments || allShipments.length === 0) {
      return {
        totalShipments: 0,
        totalValue: 0,
        averageValue: 0,
        byStatus: {},
        byDestination: {},
        dailyData: [],
      };
    }

    // Calculate totals
    const totalShipments = allShipments.length;
    const totalValue = allShipments.reduce((sum: number, s: any) => sum + (s.valor || 0), 0);
    const averageValue = totalShipments > 0 ? totalValue / totalShipments : 0;

    // Group by status
    const byStatus: Record<string, number> = {};
    allShipments.forEach((s: any) => {
      const status = s.status || 'pending';
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    // Group by destination (UF)
    const byDestination: Record<string, number> = {};
    allShipments.forEach((s: any) => {
      const uf = s.uf_destino || 'Unknown';
      byDestination[uf] = (byDestination[uf] || 0) + 1;
    });

    // Group by day
    const dailyMap: Record<string, { count: number; value: number }> = {};
    allShipments.forEach((s: any) => {
      const dateStr = s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : 'Unknown';
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { count: 0, value: 0 };
      }
      dailyMap[dateStr].count += 1;
      dailyMap[dateStr].value += s.valor || 0;
    });

    const dailyData = Object.entries(dailyMap)
      .map(([date, data]) => ({
        date,
        count: data.count,
        value: data.value,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalShipments,
      totalValue,
      averageValue,
      byStatus,
      byDestination,
      dailyData,
    };
  } catch (error) {
    console.error('Error getting shipping report:', error);
    throw error;
  }
}

/**
 * Get summary statistics
 */
export async function getReportSummary() {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not connected');
    
    const allShipments = await db.select().from(shippingLabels);

    const totalShipments = allShipments.length;
    const totalValue = allShipments.reduce((sum: number, s: any) => sum + (s.valor || 0), 0);
    const pendingCount = allShipments.filter((s: any) => s.status === 'pending').length;
    const completedCount = allShipments.filter((s: any) => s.status === 'completed').length;

    return {
      totalShipments,
      totalValue,
      pendingCount,
      completedCount,
      averageValue: totalShipments > 0 ? totalValue / totalShipments : 0,
    };
  } catch (error) {
    console.error('Error getting report summary:', error);
    throw error;
  }
}

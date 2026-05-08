import { describe, it, expect, beforeAll } from 'vitest';
import * as reportsDb from '../reports-db';

describe('Reports Database Functions', () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  describe('getShippingReport', () => {
    it('should return a report structure with required fields', async () => {
      const report = await reportsDb.getShippingReport(thirtyDaysAgo, now);
      
      expect(report).toHaveProperty('totalShipments');
      expect(report).toHaveProperty('totalValue');
      expect(report).toHaveProperty('averageValue');
      expect(report).toHaveProperty('byStatus');
      expect(report).toHaveProperty('byDestination');
      expect(report).toHaveProperty('dailyData');
    });

    it('should return non-negative numbers', async () => {
      const report = await reportsDb.getShippingReport(thirtyDaysAgo, now);
      
      expect(report.totalShipments).toBeGreaterThanOrEqual(0);
      expect(report.totalValue).toBeGreaterThanOrEqual(0);
      expect(report.averageValue).toBeGreaterThanOrEqual(0);
    });

    it('should return empty report for future dates', async () => {
      const futureStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const futureEnd = new Date(futureStart.getTime() + 24 * 60 * 60 * 1000);
      
      const report = await reportsDb.getShippingReport(futureStart, futureEnd);
      
      expect(report.totalShipments).toBe(0);
      expect(report.totalValue).toBe(0);
      expect(report.averageValue).toBe(0);
    });

    it('should have valid byStatus structure', async () => {
      const report = await reportsDb.getShippingReport(thirtyDaysAgo, now);
      
      expect(typeof report.byStatus).toBe('object');
      Object.values(report.byStatus).forEach((count) => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have valid byDestination structure', async () => {
      const report = await reportsDb.getShippingReport(thirtyDaysAgo, now);
      
      expect(typeof report.byDestination).toBe('object');
      Object.values(report.byDestination).forEach((count) => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have valid dailyData array', async () => {
      const report = await reportsDb.getShippingReport(thirtyDaysAgo, now);
      
      expect(Array.isArray(report.dailyData)).toBe(true);
      report.dailyData.forEach((day) => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('count');
        expect(day).toHaveProperty('value');
        expect(typeof day.count).toBe('number');
        expect(typeof day.value).toBe('number');
      });
    });
  });

  describe('getReportSummary', () => {
    it('should return summary with required fields', async () => {
      const summary = await reportsDb.getReportSummary();
      
      expect(summary).toHaveProperty('totalShipments');
      expect(summary).toHaveProperty('totalValue');
      expect(summary).toHaveProperty('pendingCount');
      expect(summary).toHaveProperty('completedCount');
      expect(summary).toHaveProperty('averageValue');
    });

    it('should return non-negative numbers', async () => {
      const summary = await reportsDb.getReportSummary();
      
      expect(summary.totalShipments).toBeGreaterThanOrEqual(0);
      expect(summary.totalValue).toBeGreaterThanOrEqual(0);
      expect(summary.pendingCount).toBeGreaterThanOrEqual(0);
      expect(summary.completedCount).toBeGreaterThanOrEqual(0);
      expect(summary.averageValue).toBeGreaterThanOrEqual(0);
    });

    it('should have valid counts', async () => {
      const summary = await reportsDb.getReportSummary();
      
      expect(summary.pendingCount + summary.completedCount).toBeLessThanOrEqual(summary.totalShipments);
    });
  });
});

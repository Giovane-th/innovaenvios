import { describe, it, expect } from 'vitest';
import * as scheduledReportsService from '../scheduled-reports-service';

describe('Scheduled Reports Service', () => {
  describe('createScheduledReport', () => {
    it('should create a scheduled report with valid data', async () => {
      const report = await scheduledReportsService.createScheduledReport(
        1,
        'admin@innova.com',
        'weekly',
        'shipping'
      );

      expect(report).toHaveProperty('id');
      expect(report.userId).toBe(1);
      expect(report.email).toBe('admin@innova.com');
      expect(report.frequency).toBe('weekly');
      expect(report.reportType).toBe('shipping');
      expect(report.enabled).toBe(true);
    });

    it('should create reports with different frequencies', async () => {
      const frequencies = ['daily', 'weekly', 'monthly'] as const;

      for (const freq of frequencies) {
        const report = await scheduledReportsService.createScheduledReport(
          1,
          'test@innova.com',
          freq,
          'shipping'
        );

        expect(report.frequency).toBe(freq);
      }
    });

    it('should create reports with different types', async () => {
      const types = ['shipping', 'revenue', 'summary'] as const;

      for (const type of types) {
        const report = await scheduledReportsService.createScheduledReport(
          1,
          'test@innova.com',
          'weekly',
          type
        );

        expect(report.reportType).toBe(type);
      }
    });
  });

  describe('listScheduledReports', () => {
    it('should return an array of reports', async () => {
      const reports = await scheduledReportsService.listScheduledReports(1);
      expect(Array.isArray(reports)).toBe(true);
    });
  });

  describe('updateScheduledReport', () => {
    it('should update a scheduled report', async () => {
      const updated = await scheduledReportsService.updateScheduledReport(1, {
        enabled: false,
        frequency: 'monthly',
      });

      expect(updated.enabled).toBe(false);
      expect(updated.frequency).toBe('monthly');
    });
  });

  describe('deleteScheduledReport', () => {
    it('should delete a scheduled report without error', async () => {
      await expect(
        scheduledReportsService.deleteScheduledReport(1)
      ).resolves.toBeUndefined();
    });
  });

  describe('generateReportHTML', () => {
    it('should generate valid HTML for report', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const html = await scheduledReportsService.generateReportHTML(
        'shipping',
        thirtyDaysAgo,
        now
      );

      expect(typeof html).toBe('string');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Relatório de Envios');
      expect(html).toContain('Total de Envios');
      expect(html).toContain('Valor Total');
    });

    it('should include statistics in generated HTML', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const html = await scheduledReportsService.generateReportHTML(
        'shipping',
        thirtyDaysAgo,
        now
      );

      expect(html).toContain('Envios por Status');
      expect(html).toContain('Envios por Destino');
      expect(html).toContain('<table>');
    });
  });

  describe('processScheduledReports', () => {
    it('should process scheduled reports without error', async () => {
      await expect(
        scheduledReportsService.processScheduledReports()
      ).resolves.toBeUndefined();
    });
  });
});

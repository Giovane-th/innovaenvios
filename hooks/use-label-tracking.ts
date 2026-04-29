import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/lib/auth-context-v2';

export interface LabelRecord {
  id: string;
  barcode: string;
  employeeId: string;
  employeeName: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'printed' | 'shipped' | 'delivered';
  metadata?: {
    width?: number;
    height?: number;
    weight?: number;
    destination?: string;
  };
}

export function useLabelTracking() {
  const { employee } = useAuth();
  const [labels, setLabels] = useState<LabelRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar histórico de etiquetas
  const loadLabels = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('labels_history');
      if (stored) {
        setLabels(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao carregar etiquetas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar nova etiqueta
  const createLabel = useCallback(
    async (barcode: string, metadata?: LabelRecord['metadata']) => {
      if (!employee) {
        return { success: false, error: 'Funcionário não autenticado' };
      }

      try {
        const newLabel: LabelRecord = {
          id: `label_${Date.now()}`,
          barcode,
          employeeId: employee.id,
          employeeName: employee.name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'pending',
          metadata,
        };

        const updated = [...labels, newLabel];
        await AsyncStorage.setItem('labels_history', JSON.stringify(updated));
        setLabels(updated);

        return { success: true, label: newLabel };
      } catch (error) {
        console.error('Erro ao criar etiqueta:', error);
        return { success: false, error: 'Erro ao criar etiqueta' };
      }
    },
    [employee, labels]
  );

  // Atualizar status da etiqueta
  const updateLabelStatus = useCallback(
    async (labelId: string, status: LabelRecord['status']) => {
      try {
        const updated = labels.map((label) =>
          label.id === labelId
            ? { ...label, status, updatedAt: new Date().toISOString() }
            : label
        );
        await AsyncStorage.setItem('labels_history', JSON.stringify(updated));
        setLabels(updated);
        return { success: true };
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
        return { success: false, error: 'Erro ao atualizar status' };
      }
    },
    [labels]
  );

  // Obter etiquetas do funcionário
  const getEmployeeLabels = useCallback(
    (employeeId?: string) => {
      const id = employeeId || employee?.id;
      if (!id) return [];
      return labels.filter((label) => label.employeeId === id);
    },
    [labels, employee]
  );

  // Obter estatísticas
  const getStatistics = useCallback(() => {
    if (!employee) return null;

    const employeeLabels = getEmployeeLabels();
    return {
      total: employeeLabels.length,
      pending: employeeLabels.filter((l) => l.status === 'pending').length,
      printed: employeeLabels.filter((l) => l.status === 'printed').length,
      shipped: employeeLabels.filter((l) => l.status === 'shipped').length,
      delivered: employeeLabels.filter((l) => l.status === 'delivered').length,
    };
  }, [employee, getEmployeeLabels]);

  // Exportar relatório
  const exportReport = useCallback(
    async (startDate?: Date, endDate?: Date) => {
      try {
        let filtered = labels;

        if (startDate && endDate) {
          filtered = labels.filter((label) => {
            const labelDate = new Date(label.createdAt);
            return labelDate >= startDate && labelDate <= endDate;
          });
        }

        // Agrupar por funcionário
        const grouped = filtered.reduce(
          (acc, label) => {
            if (!acc[label.employeeId]) {
              acc[label.employeeId] = {
                employeeName: label.employeeName,
                labels: [],
              };
            }
            acc[label.employeeId].labels.push(label);
            return acc;
          },
          {} as Record<string, { employeeName: string; labels: LabelRecord[] }>
        );

        return {
          success: true,
          data: grouped,
          exportedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Erro ao exportar relatório:', error);
        return { success: false, error: 'Erro ao exportar relatório' };
      }
    },
    [labels]
  );

  return {
    labels,
    loading,
    loadLabels,
    createLabel,
    updateLabelStatus,
    getEmployeeLabels,
    getStatistics,
    exportReport,
  };
}

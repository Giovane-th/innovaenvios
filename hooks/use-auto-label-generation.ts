import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface EtiquetaGerada {
  id: string;
  codigo: string;
  destinatario: string;
  endereco: string;
  peso: number;
  servico: string;
  preco: number;
  status: 'Gerada' | 'Postada' | 'Em trânsito' | 'Entregue';
  criadoEm: string;
  criadoPor: string;
}

export function useAutoLabelGeneration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Gera uma etiqueta automaticamente
   */
  const gerarEtiqueta = useCallback(async (
    destinatario: {
      nome: string;
      email: string;
      telefone: string;
      endereco: string;
      numero: string;
      complemento?: string;
      cidade: string;
      uf: string;
      cep: string;
    },
    peso: number,
    servico: string,
    preco: number,
    criadoPor: string
  ): Promise<EtiquetaGerada | null> => {
    setLoading(true);
    setError(null);

    try {
      // Gerar código de rastreamento (formato: BR + 8 dígitos + 2 dígitos verificadores)
      const codigo = `BR${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;

      const etiqueta: EtiquetaGerada = {
        id: `etiqueta_${Date.now()}`,
        codigo,
        destinatario: destinatario.nome,
        endereco: `${destinatario.endereco}, ${destinatario.numero}${destinatario.complemento ? ` - ${destinatario.complemento}` : ''} - ${destinatario.cidade}, ${destinatario.uf}`,
        peso,
        servico,
        preco,
        status: 'Gerada',
        criadoEm: new Date().toISOString(),
        criadoPor
      };

      // Salvar no histórico
      const stored = await AsyncStorage.getItem('etiquetas_geradas');
      const etiquetas: EtiquetaGerada[] = stored ? JSON.parse(stored) : [];
      etiquetas.unshift(etiqueta);
      await AsyncStorage.setItem('etiquetas_geradas', JSON.stringify(etiquetas.slice(0, 100)));

      // Salvar no histórico de envios
      const shippingStored = await AsyncStorage.getItem('shipping_history');
      const shippings: any[] = shippingStored ? JSON.parse(shippingStored) : [];
      shippings.unshift({
        id: etiqueta.id,
        code: etiqueta.codigo,
        recipient: etiqueta.destinatario,
        status: 'Gerada',
        date: new Date().toISOString().split('T')[0],
        createdBy: criadoPor
      });
      await AsyncStorage.setItem('shipping_history', JSON.stringify(shippings.slice(0, 100)));

      return etiqueta;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar etiqueta';
      setError(message);
      console.error('Erro ao gerar etiqueta:', message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lista etiquetas geradas
   */
  const listarEtiquetas = useCallback(async (limite: number = 50): Promise<EtiquetaGerada[]> => {
    try {
      const stored = await AsyncStorage.getItem('etiquetas_geradas');
      const etiquetas: EtiquetaGerada[] = stored ? JSON.parse(stored) : [];
      return etiquetas.slice(0, limite);
    } catch (err) {
      console.error('Erro ao listar etiquetas:', err);
      return [];
    }
  }, []);

  /**
   * Busca etiqueta por código
   */
  const buscarEtiqueta = useCallback(async (codigo: string): Promise<EtiquetaGerada | null> => {
    try {
      const stored = await AsyncStorage.getItem('etiquetas_geradas');
      const etiquetas: EtiquetaGerada[] = stored ? JSON.parse(stored) : [];
      return etiquetas.find(e => e.codigo === codigo) || null;
    } catch (err) {
      console.error('Erro ao buscar etiqueta:', err);
      return null;
    }
  }, []);

  /**
   * Atualiza status da etiqueta
   */
  const atualizarStatus = useCallback(async (
    codigo: string,
    novoStatus: 'Gerada' | 'Postada' | 'Em trânsito' | 'Entregue'
  ): Promise<boolean> => {
    try {
      const stored = await AsyncStorage.getItem('etiquetas_geradas');
      const etiquetas: EtiquetaGerada[] = stored ? JSON.parse(stored) : [];
      
      const index = etiquetas.findIndex(e => e.codigo === codigo);
      if (index !== -1) {
        etiquetas[index].status = novoStatus;
        await AsyncStorage.setItem('etiquetas_geradas', JSON.stringify(etiquetas));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      return false;
    }
  }, []);

  /**
   * Gera relatório de etiquetas
   */
  const gerarRelatorio = useCallback(async (
    dataInicio?: string,
    dataFim?: string,
    criadoPor?: string
  ): Promise<{
    total: number;
    porStatus: Record<string, number>;
    custoTotal: number;
    etiquetas: EtiquetaGerada[];
  }> => {
    try {
      const stored = await AsyncStorage.getItem('etiquetas_geradas');
      let etiquetas: EtiquetaGerada[] = stored ? JSON.parse(stored) : [];

      // Filtrar por data
      if (dataInicio || dataFim) {
        etiquetas = etiquetas.filter(e => {
          const data = new Date(e.criadoEm);
          if (dataInicio && data < new Date(dataInicio)) return false;
          if (dataFim && data > new Date(dataFim)) return false;
          return true;
        });
      }

      // Filtrar por criador
      if (criadoPor) {
        etiquetas = etiquetas.filter(e => e.criadoPor === criadoPor);
      }

      // Calcular estatísticas
      const porStatus: Record<string, number> = {
        'Gerada': 0,
        'Postada': 0,
        'Em trânsito': 0,
        'Entregue': 0
      };

      let custoTotal = 0;

      etiquetas.forEach(e => {
        porStatus[e.status]++;
        custoTotal += e.preco;
      });

      return {
        total: etiquetas.length,
        porStatus,
        custoTotal,
        etiquetas
      };
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      return {
        total: 0,
        porStatus: {},
        custoTotal: 0,
        etiquetas: []
      };
    }
  }, []);

  return {
    loading,
    error,
    gerarEtiqueta,
    listarEtiquetas,
    buscarEtiqueta,
    atualizarStatus,
    gerarRelatorio
  };
}

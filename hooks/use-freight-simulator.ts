import { useState, useCallback } from 'react';

export interface FreightQuote {
  service: string;
  price: string;
  deadline: string;
  error?: string;
}

export interface FreightSimulation {
  originZip: string;
  destinationZip: string;
  weight: number; // em gramas
  length: number; // em cm
  width: number; // em cm
  height: number; // em cm
  quotes: FreightQuote[];
  timestamp: Date;
}

export function useFreightSimulator() {
  const [loading, setLoading] = useState(false);
  const [simulations, setSimulations] = useState<FreightSimulation[]>([]);

  // Simular frete usando a API dos Correios
  const simulateFreight = useCallback(
    async (
      originZip: string,
      destinationZip: string,
      weight: number,
      length: number,
      width: number,
      height: number
    ): Promise<FreightQuote[]> => {
      try {
        setLoading(true);

        // Limpar formatação do CEP
        const cleanOrigin = originZip.replace(/\D/g, '');
        const cleanDest = destinationZip.replace(/\D/g, '');

        if (cleanOrigin.length !== 8 || cleanDest.length !== 8) {
          throw new Error('CEP inválido');
        }

        // Usar a API dos Correios (via backend)
        const response = await fetch('/api/freight/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originZip: cleanOrigin,
            destinationZip: cleanDest,
            weight,
            length,
            width,
            height,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao simular frete');
        }

        const data = await response.json();
        const quotes: FreightQuote[] = data.quotes || [];

        // Salvar simulação no histórico
        const simulation: FreightSimulation = {
          originZip: cleanOrigin,
          destinationZip: cleanDest,
          weight,
          length,
          width,
          height,
          quotes,
          timestamp: new Date(),
        };

        setSimulations((prev) => [simulation, ...prev.slice(0, 9)]); // Manter últimas 10

        return quotes;
      } catch (error) {
        console.error('Erro ao simular frete:', error);
        return [
          {
            service: 'Erro',
            price: '0',
            deadline: 'Não foi possível calcular',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          },
        ];
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Simular frete localmente (sem API)
  const simulateFreightLocal = useCallback(
    (
      originZip: string,
      destinationZip: string,
      weight: number,
      length: number,
      width: number,
      height: number
    ): FreightQuote[] => {
      // Cálculo simplificado baseado em distância e peso
      // Em produção, usar a API real dos Correios

      const cleanOrigin = originZip.replace(/\D/g, '');
      const cleanDest = destinationZip.replace(/\D/g, '');

      if (cleanOrigin.length !== 8 || cleanDest.length !== 8) {
        return [
          {
            service: 'Erro',
            price: '0',
            deadline: 'CEP inválido',
          },
        ];
      }

      // Simular distância (em produção, usar geolocalização real)
      const distance = Math.abs(parseInt(cleanDest) - parseInt(cleanOrigin)) / 1000;

      // Cálculo base: R$ 0.50 por km + R$ 0.01 por grama
      const baseCost = distance * 0.5 + (weight * 0.01) / 1000;

      // Serviços e markups
      const services = [
        {
          name: 'PAC (Econômico)',
          markup: 1.0,
          deadline: Math.ceil(distance / 500) + 3,
        },
        {
          name: 'SEDEX (Rápido)',
          markup: 1.8,
          deadline: Math.ceil(distance / 1000) + 1,
        },
        {
          name: 'SEDEX 12 (Muito Rápido)',
          markup: 2.5,
          deadline: 1,
        },
      ];

      const quotes: FreightQuote[] = services.map((service) => ({
        service: service.name,
        price: (baseCost * service.markup).toFixed(2),
        deadline: `${service.deadline} dia(s)`,
      }));

      // Salvar simulação
      const simulation: FreightSimulation = {
        originZip: cleanOrigin,
        destinationZip: cleanDest,
        weight,
        length,
        width,
        height,
        quotes,
        timestamp: new Date(),
      };

      setSimulations((prev) => [simulation, ...prev.slice(0, 9)]);

      return quotes;
    },
    []
  );

  // Limpar histórico
  const clearHistory = useCallback(() => {
    setSimulations([]);
  }, []);

  return {
    loading,
    simulations,
    simulateFreight,
    simulateFreightLocal,
    clearHistory,
  };
}

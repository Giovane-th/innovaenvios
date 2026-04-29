import { useState, useCallback } from 'react';

export interface MarketplaceOrder {
  id: string;
  marketplace: 'shopee' | 'olx' | 'mercado-livre';
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    city: string;
    state: string;
    cep: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}

export function useMarketplaceIntegration() {
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simular importação de pedidos do Shopee
  const importFromShopee = useCallback(async (shopeeApiKey: string, shopeeShopId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Simulação de chamada à API do Shopee
      const mockOrders: MarketplaceOrder[] = [
        {
          id: 'shopee-001',
          marketplace: 'shopee',
          orderId: 'SHP-2026-001',
          customerName: 'João Silva',
          customerEmail: 'joao@email.com',
          customerPhone: '11999999999',
          address: {
            street: 'Rua das Flores',
            number: '123',
            city: 'São Paulo',
            state: 'SP',
            cep: '01234-567'
          },
          items: [
            { name: 'Produto A', quantity: 2, price: 50.00 }
          ],
          totalPrice: 100.00,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];
      setOrders(prev => [...prev, ...mockOrders]);
      return { success: true, count: mockOrders.length };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao importar do Shopee';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Simular importação de pedidos do OLX
  const importFromOLX = useCallback(async (olxApiKey: string) => {
    setLoading(true);
    setError(null);
    try {
      const mockOrders: MarketplaceOrder[] = [
        {
          id: 'olx-001',
          marketplace: 'olx',
          orderId: 'OLX-2026-001',
          customerName: 'Maria Santos',
          customerEmail: 'maria@email.com',
          customerPhone: '11988888888',
          address: {
            street: 'Avenida Paulista',
            number: '1000',
            city: 'São Paulo',
            state: 'SP',
            cep: '01311-100'
          },
          items: [
            { name: 'Produto B', quantity: 1, price: 75.00 }
          ],
          totalPrice: 75.00,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];
      setOrders(prev => [...prev, ...mockOrders]);
      return { success: true, count: mockOrders.length };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao importar do OLX';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Simular importação de pedidos do Mercado Livre
  const importFromMercadoLivre = useCallback(async (mlApiKey: string, mlUserId: string) => {
    setLoading(true);
    setError(null);
    try {
      const mockOrders: MarketplaceOrder[] = [
        {
          id: 'ml-001',
          marketplace: 'mercado-livre',
          orderId: 'ML-2026-001',
          customerName: 'Pedro Costa',
          customerEmail: 'pedro@email.com',
          customerPhone: '11977777777',
          address: {
            street: 'Rua Augusta',
            number: '2000',
            city: 'São Paulo',
            state: 'SP',
            cep: '01305-100'
          },
          items: [
            { name: 'Produto C', quantity: 3, price: 30.00 }
          ],
          totalPrice: 90.00,
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];
      setOrders(prev => [...prev, ...mockOrders]);
      return { success: true, count: mockOrders.length };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao importar do Mercado Livre';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Converter pedido de marketplace para etiqueta
  const convertToLabel = useCallback((order: MarketplaceOrder) => {
    return {
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      address: `${order.address.street}, ${order.address.number}${order.address.complement ? ', ' + order.address.complement : ''} - ${order.address.city}, ${order.address.state} ${order.address.cep}`,
      weight: 1.0, // Peso padrão
      serviceType: 'PAC', // Serviço padrão
      marketplaceOrderId: order.orderId,
      marketplace: order.marketplace,
      totalValue: order.totalPrice
    };
  }, []);

  return {
    orders,
    loading,
    error,
    importFromShopee,
    importFromOLX,
    importFromMercadoLivre,
    convertToLabel
  };
}

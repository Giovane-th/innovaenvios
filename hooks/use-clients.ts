import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Client {
  id: string;
  nome: string;
  email: string;
  cpf_cnpj: string;
  telefone: string;
  celular: string;
  endereco: string;
  numero: string;
  complemento: string;
  cidade: string;
  uf: string;
  bairro: string;
  cep: string;
  ponto_referencia?: string;
  createdAt: string;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Carregar clientes ao iniciar
  useEffect(() => {
    loadClients();
  }, []);

  // Carregar clientes do armazenamento
  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('clients_list');
      if (stored) {
        setClients(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Importar clientes do JSON
  const importClients = useCallback(async (clientsData: Client[]) => {
    try {
      setLoading(true);
      // Mesclar com clientes existentes (evitar duplicatas)
      const existingIds = new Set(clients.map((c) => c.id));
      const newClients = clientsData.filter((c) => !existingIds.has(c.id));
      const merged = [...clients, ...newClients];

      await AsyncStorage.setItem('clients_list', JSON.stringify(merged));
      setClients(merged);

      return { success: true, imported: newClients.length };
    } catch (error) {
      console.error('Erro ao importar clientes:', error);
      return { success: false, error: 'Erro ao importar clientes' };
    } finally {
      setLoading(false);
    }
  }, [clients]);

  // Adicionar novo cliente
  const addClient = useCallback(
    async (client: Omit<Client, 'id' | 'createdAt'>) => {
      try {
        const newClient: Client = {
          ...client,
          id: `client_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        const updated = [...clients, newClient];
        await AsyncStorage.setItem('clients_list', JSON.stringify(updated));
        setClients(updated);

        return { success: true, client: newClient };
      } catch (error) {
        console.error('Erro ao adicionar cliente:', error);
        return { success: false, error: 'Erro ao adicionar cliente' };
      }
    },
    [clients]
  );

  // Atualizar cliente
  const updateClient = useCallback(
    async (clientId: string, updates: Partial<Client>) => {
      try {
        const updated = clients.map((c) =>
          c.id === clientId ? { ...c, ...updates } : c
        );
        await AsyncStorage.setItem('clients_list', JSON.stringify(updated));
        setClients(updated);

        return { success: true };
      } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        return { success: false, error: 'Erro ao atualizar cliente' };
      }
    },
    [clients]
  );

  // Deletar cliente
  const deleteClient = useCallback(
    async (clientId: string) => {
      try {
        const updated = clients.filter((c) => c.id !== clientId);
        await AsyncStorage.setItem('clients_list', JSON.stringify(updated));
        setClients(updated);

        return { success: true };
      } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        return { success: false, error: 'Erro ao deletar cliente' };
      }
    },
    [clients]
  );

  // Buscar clientes
  const searchClients = useCallback(
    (query: string) => {
      if (!query.trim()) return clients;

      const q = query.toLowerCase();
      return clients.filter(
        (c) =>
          c.nome.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.cpf_cnpj.includes(q) ||
          c.telefone.includes(q) ||
          c.celular.includes(q) ||
          c.cidade.toLowerCase().includes(q)
      );
    },
    [clients]
  );

  // Obter cliente por ID
  const getClient = useCallback(
    (clientId: string) => {
      return clients.find((c) => c.id === clientId);
    },
    [clients]
  );

  // Obter estatísticas
  const getStatistics = useCallback(() => {
    return {
      total: clients.length,
      byCity: clients.reduce(
        (acc, c) => {
          acc[c.cidade] = (acc[c.cidade] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byState: clients.reduce(
        (acc, c) => {
          acc[c.uf] = (acc[c.uf] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }, [clients]);

  return {
    clients,
    loading,
    searchQuery,
    setSearchQuery,
    loadClients,
    importClients,
    addClient,
    updateClient,
    deleteClient,
    searchClients,
    getClient,
    getStatistics,
  };
}

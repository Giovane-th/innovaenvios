import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

export interface Client {
  id: number;
  nome: string;
  email: string | null;
  cpf_cnpj: string | null;
  telefone: string | null;
  celular: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  cidade: string | null;
  uf: string | null;
  bairro: string | null;
  cep: string | null;
  ponto_referencia: string | null;
}

export function useClientsAPI() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  // Carregar todos os clientes ao iniciar
  useEffect(() => {
    loadClients();
  }, []);

  // Filtrar clientes quando a busca mudar
  useEffect(() => {
    if (searchQuery.trim()) {
      searchClientsAPI(searchQuery);
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  const loadClients = useCallback(async () => {
    try {
      setLoading(true);
      const result = await (trpc.clients.list as any).query();
      setClients(result);
      setFilteredClients(result);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchClientsAPI = useCallback(async (query: string) => {
    try {
      setLoading(true);
      const result = await (trpc.clients.search as any).query({ query });
      setFilteredClients(result);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setFilteredClients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addClient = useCallback(async (clientData: Omit<Client, 'id'>) => {
    try {
      const result = await (trpc.clients.create as any).mutate(clientData);
      const updated = [...clients, result];
      setClients(updated);
      setFilteredClients(updated);
      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      return { success: false, error: 'Erro ao adicionar cliente' };
    }
  }, [clients]);

  const updateClient = useCallback(async (id: number, clientData: Partial<Client>) => {
    try {
      const result = await (trpc.clients.update as any).mutate({ id, ...clientData });
      const updated = clients.map((c) => (c.id === id ? result : c));
      setClients(updated);
      setFilteredClients(updated);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      return { success: false, error: 'Erro ao atualizar cliente' };
    }
  }, [clients]);

  const deleteClient = useCallback(async (id: number) => {
    try {
      await (trpc.clients.delete as any).mutate({ id });
      const updated = clients.filter((c) => c.id !== id);
      setClients(updated);
      setFilteredClients(updated);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      return { success: false, error: 'Erro ao deletar cliente' };
    }
  }, [clients]);

  const getStatistics = useCallback(() => {
    return {
      total: clients.length,
      withEmail: clients.filter((c) => c.email).length,
      withPhone: clients.filter((c) => c.telefone || c.celular).length,
    };
  }, [clients]);

  return {
    clients: filteredClients,
    allClients: clients,
    loading,
    searchQuery,
    setSearchQuery,
    addClient,
    updateClient,
    deleteClient,
    getStatistics,
    loadClients,
  };
}

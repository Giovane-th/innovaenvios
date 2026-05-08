import { useState, useCallback } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');

  // Carregar todos os clientes
  const { data: clients = [], isLoading: loading } = trpc.clients.list.useQuery();

  // Buscar clientes por query
  const { data: searchResults = [] } = trpc.clients.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.trim().length > 0 }
  );

  // Mutations
  const createMutation = trpc.clients.create.useMutation();
  const updateMutation = trpc.clients.update.useMutation();
  const deleteMutation = trpc.clients.delete.useMutation();

  const filteredClients = searchQuery.trim() ? searchResults : clients;

  const addClient = useCallback(async (clientData: Omit<Client, 'id'>) => {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(clientData).filter(([, v]) => v !== null)
      );
      await createMutation.mutateAsync(cleanData as any);
      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      return { success: false, error: 'Erro ao adicionar cliente' };
    }
  }, [createMutation]);

  const updateClient = useCallback(async (id: number, clientData: Partial<Client>) => {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(clientData).filter(([, v]) => v !== null)
      );
      await updateMutation.mutateAsync({ id, ...cleanData } as any);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      return { success: false, error: 'Erro ao atualizar cliente' };
    }
  }, [updateMutation]);

  const deleteClient = useCallback(async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      return { success: false, error: 'Erro ao deletar cliente' };
    }
  }, [deleteMutation]);

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
  };
}

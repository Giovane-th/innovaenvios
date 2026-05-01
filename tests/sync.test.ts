import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fetch from 'node-fetch';

const API_URL = 'http://127.0.0.1:3000/api/trpc';

describe('Sincronização com Servidor tRPC', () => {
  it('deve listar clientes', async () => {
    try {
      const response = await fetch(`${API_URL}/clients.list?input={}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toBeDefined();
      console.log('✅ Clientes listados:', data);
    } catch (error) {
      console.error('❌ Erro ao listar clientes:', error);
      throw error;
    }
  });

  it('deve criar um cliente', async () => {
    try {
      const response = await fetch(`${API_URL}/clients.create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            nome: 'Cliente Teste',
            email: 'teste@example.com',
            telefone: '(11) 99999-9999',
            endereco: 'Rua Teste, 123',
            cidade: 'São Paulo',
            uf: 'SP',
          },
        }),
      });
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toBeDefined();
      console.log('✅ Cliente criado:', data);
    } catch (error) {
      console.error('❌ Erro ao criar cliente:', error);
      throw error;
    }
  });

  it('deve listar funcionários', async () => {
    try {
      const response = await fetch(`${API_URL}/employees.list?input={}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toBeDefined();
      console.log('✅ Funcionários listados:', data);
    } catch (error) {
      console.error('❌ Erro ao listar funcionários:', error);
      throw error;
    }
  });

  it('deve listar etiquetas', async () => {
    try {
      const response = await fetch(`${API_URL}/shippingLabels.list?input={}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toBeDefined();
      console.log('✅ Etiquetas listadas:', data);
    } catch (error) {
      console.error('❌ Erro ao listar etiquetas:', error);
      throw error;
    }
  });

  it('deve obter configurações', async () => {
    try {
      const response = await fetch(`${API_URL}/settings.get?input={}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toBeDefined();
      console.log('✅ Configurações obtidas:', data);
    } catch (error) {
      console.error('❌ Erro ao obter configurações:', error);
      throw error;
    }
  });
});

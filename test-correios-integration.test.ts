import { describe, it, expect } from 'vitest';
import axios from 'axios';
import base64 from 'base64-js';

describe('Correios API Integration', () => {
  it('should authenticate with Correios API using environment variables', async () => {
    const usuario = process.env.CORREIOS_USUARIO;
    const senha = process.env.CORREIOS_SENHA;

    expect(usuario).toBeDefined();
    expect(senha).toBeDefined();

    // Preparar credenciais em Base64
    const credentials = `${usuario}:${senha}`;
    const encoded = Buffer.from(credentials).toString('base64');

    try {
      const response = await axios.post(
        'https://api.correios.com.br/v1/autenticacao',
        {},
        {
          headers: {
            'Authorization': `Basic ${encoded}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000,
          validateStatus: () => true // Don't throw on any status
        }
      );

      // Verificar se a autenticação foi bem-sucedida
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data.token).toBeTruthy();

      console.log('✅ Autenticação com Correios bem-sucedida!');
    } catch (error) {
      console.error('❌ Erro na autenticação:', error);
      throw error;
    }
  });

  it('should have all required Correios credentials', () => {
    expect(process.env.CORREIOS_USUARIO).toBeDefined();
    expect(process.env.CORREIOS_SENHA).toBeDefined();
    expect(process.env.CORREIOS_CARTAO).toBeDefined();
    expect(process.env.CORREIOS_CONTRATO).toBeDefined();

    expect(process.env.CORREIOS_USUARIO).toBeTruthy();
    expect(process.env.CORREIOS_SENHA).toBeTruthy();
    expect(process.env.CORREIOS_CARTAO).toBeTruthy();
    expect(process.env.CORREIOS_CONTRATO).toBeTruthy();
  });
});

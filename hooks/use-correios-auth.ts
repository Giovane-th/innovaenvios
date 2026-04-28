import { useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { getCorreiosClient, TokenResponse } from "@/lib/services/correios-api";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  cartaoPostagem: string | null;
  contrato: string | null;
  cnpj: string | null;
  loading: boolean;
  error: string | null;
}

const SECURE_KEYS = {
  TOKEN: "correios_token",
  EXPIRATION: "correios_token_expiration",
  CARTAO: "correios_cartao",
  CONTRATO: "correios_contrato",
  CNPJ: "correios_cnpj",
  SENHA: "correios_senha", // Armazenar apenas se necessário para refresh
};

/**
 * Hook para gerenciar autenticação com a API dos Correios
 */
export function useCorreiosAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    cartaoPostagem: null,
    contrato: null,
    cnpj: null,
    loading: false,
    error: null,
  });

  /**
   * Carrega credenciais armazenadas do SecureStore
   */
  const loadStoredCredentials = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync(SECURE_KEYS.TOKEN);
      const expiration = await SecureStore.getItemAsync(
        SECURE_KEYS.EXPIRATION
      );
      const cartao = await SecureStore.getItemAsync(SECURE_KEYS.CARTAO);
      const contrato = await SecureStore.getItemAsync(SECURE_KEYS.CONTRATO);
      const cnpj = await SecureStore.getItemAsync(SECURE_KEYS.CNPJ);

      if (token && expiration && cartao && contrato) {
        const expirationDate = new Date(expiration);

        // Verificar se token ainda é válido
        if (expirationDate > new Date()) {
          const client = getCorreiosClient();
          client.setToken(token, expirationDate);

          setState({
            isAuthenticated: true,
            token,
            cartaoPostagem: cartao,
            contrato,
            cnpj: cnpj || null,
            loading: false,
            error: null,
          });

          return true;
        }
      }

      return false;
    } catch (err) {
      console.error("Erro ao carregar credenciais:", err);
      return false;
    }
  }, []);

  /**
   * Realiza login com as credenciais fornecidas
   */
  const login = useCallback(
    async (
      cartaoPostagem: string,
      contrato: string,
      senha: string,
      cnpj?: string
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const client = getCorreiosClient("homologacao");
        const response = await client.authenticate(cartaoPostagem, senha);

        // Armazenar credenciais de forma segura
        await SecureStore.setItemAsync(SECURE_KEYS.TOKEN, response.token);
        await SecureStore.setItemAsync(
          SECURE_KEYS.EXPIRATION,
          response.expiraEm
        );
        await SecureStore.setItemAsync(SECURE_KEYS.CARTAO, cartaoPostagem);
        await SecureStore.setItemAsync(SECURE_KEYS.CONTRATO, contrato);

        if (cnpj) {
          await SecureStore.setItemAsync(SECURE_KEYS.CNPJ, cnpj);
        }

        setState({
          isAuthenticated: true,
          token: response.token,
          cartaoPostagem,
          contrato,
          cnpj: response.cnpj || cnpj || null,
          loading: false,
          error: null,
        });

        return response;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao fazer login";

        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));

        throw err;
      }
    },
    []
  );

  /**
   * Faz logout e limpa credenciais
   */
  const logout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(SECURE_KEYS.TOKEN);
      await SecureStore.deleteItemAsync(SECURE_KEYS.EXPIRATION);
      await SecureStore.deleteItemAsync(SECURE_KEYS.CARTAO);
      await SecureStore.deleteItemAsync(SECURE_KEYS.CONTRATO);
      await SecureStore.deleteItemAsync(SECURE_KEYS.CNPJ);
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }

    setState({
      isAuthenticated: false,
      token: null,
      cartaoPostagem: null,
      contrato: null,
      cnpj: null,
      loading: false,
      error: null,
    });
  }, []);

  /**
   * Verifica se o token ainda é válido
   */
  const isTokenValid = useCallback(() => {
    const client = getCorreiosClient();
    return client.isTokenValid();
  }, []);

  return {
    ...state,
    login,
    logout,
    loadStoredCredentials,
    isTokenValid,
  };
}

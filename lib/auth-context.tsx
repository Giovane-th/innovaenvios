import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  user: {
    cartaoPostagem: string;
    contrato: string;
    cnpj?: string;
  } | null;
  login: (cartaoPostagem: string, contrato: string, cnpj?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  // Carregar credenciais ao iniciar
  useEffect(() => {
    loadStoredCredentials();
  }, []);

  const loadStoredCredentials = async () => {
    try {
      const cartao = await SecureStore.getItemAsync("auth_cartao");
      const contrato = await SecureStore.getItemAsync("auth_contrato");
      const cnpj = await SecureStore.getItemAsync("auth_cnpj");

      if (cartao && contrato) {
        setUser({
          cartaoPostagem: cartao,
          contrato,
          cnpj: cnpj || undefined,
        });
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Erro ao carregar credenciais:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    cartaoPostagem: string,
    contrato: string,
    cnpj?: string
  ) => {
    try {
      setLoading(true);

      // Armazenar credenciais de forma segura
      await SecureStore.setItemAsync("auth_cartao", cartaoPostagem);
      await SecureStore.setItemAsync("auth_contrato", contrato);
      if (cnpj) {
        await SecureStore.setItemAsync("auth_cnpj", cnpj);
      }

      setUser({
        cartaoPostagem,
        contrato,
        cnpj,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      // Limpar credenciais
      await SecureStore.deleteItemAsync("auth_cartao");
      await SecureStore.deleteItemAsync("auth_contrato");
      await SecureStore.deleteItemAsync("auth_cnpj");

      // Limpar histórico de envios
      await AsyncStorage.removeItem("shipping_history");

      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}

import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export interface NetworkState {
  isOnline: boolean;
  isConnected: boolean;
  type: string;
}

/**
 * Hook para monitorar conectividade de rede
 * Retorna estado de conexão e tipo de rede
 */
export function useNetwork(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: true,
    isConnected: true,
    type: "unknown",
  });

  useEffect(() => {
    // Verificar estado inicial
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      setNetworkState({
        isOnline: state.isConnected ?? false,
        isConnected: state.isConnected ?? false,
        type: state.type ?? "unknown",
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkState;
}

/**
 * Função auxiliar para sincronizar dados offline
 * Retorna true se conseguiu sincronizar, false se está offline
 */
export async function syncOfflineData(
  dataKey: string,
  syncFn: () => Promise<void>
): Promise<boolean> {
  try {
    const state: any = await NetInfo.fetch();
    if (!state.isConnected) {
      console.log(`[Offline] Dados de '${dataKey}' serão sincronizados quando online`);
      return false;
    }

    await syncFn();
    console.log(`[Sync] Dados de '${dataKey}' sincronizados com sucesso`);
    return true;
  } catch (error) {
    console.error(`[Sync Error] Erro ao sincronizar '${dataKey}':`, error);
    return false;
  }
}

import { useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export interface ThermalPrinter {
  id: string;
  name: string;
  ip: string;
  port: number;
  width: 58 | 80; // mm
  isDefault: boolean;
  lastUsed?: number;
}

const PRINTERS_KEY = "@innova_envios_thermal_printers";
const DEFAULT_PRINTER_KEY = "@innova_envios_default_printer";

export function useThermalPrinter() {
  const [printers, setPrinters] = useState<ThermalPrinter[]>([]);
  const [defaultPrinter, setDefaultPrinter] = useState<ThermalPrinter | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Carregar impressoras salvas
  const loadPrinters = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem(PRINTERS_KEY);
      if (data) {
        const loadedPrinters = JSON.parse(data);
        setPrinters(loadedPrinters);

        // Carregar impressora padrão
        const defaultId = await AsyncStorage.getItem(DEFAULT_PRINTER_KEY);
        if (defaultId) {
          const defaultPrn = loadedPrinters.find((p: ThermalPrinter) => p.id === defaultId);
          setDefaultPrinter(defaultPrn || null);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar impressoras:", error);
    }
  }, []);

  // Adicionar impressora manualmente
  const addPrinter = useCallback(
    async (name: string, ip: string, port: number, width: 58 | 80 = 80) => {
      try {
        const newPrinter: ThermalPrinter = {
          id: `${ip}:${port}`,
          name,
          ip,
          port,
          width,
          isDefault: printers.length === 0, // Primeira impressora é padrão
        };

        const updated = [...printers, newPrinter];
        await AsyncStorage.setItem(PRINTERS_KEY, JSON.stringify(updated));
        setPrinters(updated);

        // Se é a primeira, definir como padrão
        if (printers.length === 0) {
          await AsyncStorage.setItem(DEFAULT_PRINTER_KEY, newPrinter.id);
          setDefaultPrinter(newPrinter);
        }

        return newPrinter;
      } catch (error) {
        console.error("Erro ao adicionar impressora:", error);
        throw error;
      }
    },
    [printers]
  );

  // Testar conexão com impressora
  const testConnection = useCallback(async (ip: string, port: number): Promise<boolean> => {
    try {
      // Simular teste de conexão (em produção, usar socket real)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`http://${ip}:${port}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok || response.status === 404; // 404 é ok, significa que o servidor respondeu
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
      return false;
    }
  }, []);

  // Definir impressora padrão
  const setDefault = useCallback(
    async (printerId: string) => {
      try {
        await AsyncStorage.setItem(DEFAULT_PRINTER_KEY, printerId);
        const printer = printers.find((p) => p.id === printerId);
        setDefaultPrinter(printer || null);
      } catch (error) {
        console.error("Erro ao definir impressora padrão:", error);
        throw error;
      }
    },
    [printers]
  );

  // Remover impressora
  const removePrinter = useCallback(
    async (printerId: string) => {
      try {
        const updated = printers.filter((p) => p.id !== printerId);
        await AsyncStorage.setItem(PRINTERS_KEY, JSON.stringify(updated));
        setPrinters(updated);

        // Se era a padrão, definir outra como padrão
        if (defaultPrinter?.id === printerId && updated.length > 0) {
          await setDefault(updated[0].id);
        } else if (updated.length === 0) {
          setDefaultPrinter(null);
          await AsyncStorage.removeItem(DEFAULT_PRINTER_KEY);
        }
      } catch (error) {
        console.error("Erro ao remover impressora:", error);
        throw error;
      }
    },
    [printers, defaultPrinter, setDefault]
  );

  // Gerar comando ESC/POS para impressora térmica
  const generateESCPOSCommand = useCallback(
    (
      labelData: {
        recipientName: string;
        recipientAddress: string;
        recipientNumber: string;
        recipientCity: string;
        recipientState: string;
        recipientCEP: string;
        trackingCode?: string;
      },
      width: 58 | 80 = 80
    ): string => {
      // Comandos ESC/POS básicos
      const ESC = "\x1B";
      const GS = "\x1D";

      let command = "";

      // Inicializar impressora
      command += ESC + "@";

      // Definir tamanho de fonte (2x altura, 2x largura)
      command += ESC + "!" + String.fromCharCode(0x11);

      // Centralizar texto
      command += ESC + "a" + String.fromCharCode(1);

      // Título
      command += "ETIQUETA DE ENVIO\n";
      command += "================\n\n";

      // Voltar ao tamanho normal
      command += ESC + "!" + String.fromCharCode(0x00);

      // Alinhar à esquerda
      command += ESC + "a" + String.fromCharCode(0);

      // Dados do destinatário
      command += "DESTINATÁRIO:\n";
      command += labelData.recipientName + "\n";
      command += labelData.recipientAddress + ", " + labelData.recipientNumber + "\n";
      command += labelData.recipientCity + " - " + labelData.recipientState + "\n";
      command += "CEP: " + labelData.recipientCEP + "\n\n";

      // Código de rastreamento (se disponível)
      if (labelData.trackingCode) {
        command += ESC + "a" + String.fromCharCode(1); // Centralizar
        command += "Código: " + labelData.trackingCode + "\n";
        command += ESC + "a" + String.fromCharCode(0); // Voltar à esquerda
      }

      // Cortar papel
      command += GS + "V" + String.fromCharCode(66);

      return command;
    },
    []
  );

  // Enviar comando para impressora
  const sendToPrinter = useCallback(
    async (
      command: string,
      printer?: ThermalPrinter
    ): Promise<boolean> => {
      const targetPrinter = printer || defaultPrinter;

      if (!targetPrinter) {
        Alert.alert("Erro", "Nenhuma impressora selecionada");
        return false;
      }

      try {
        // Em um app real, usar socket TCP para enviar dados
        // Por enquanto, simular envio
        console.log(`Enviando para ${targetPrinter.name} (${targetPrinter.ip}:${targetPrinter.port})`);
        console.log("Comando ESC/POS:", command);

        // Testar conexão primeiro
        const connected = await testConnection(targetPrinter.ip, targetPrinter.port);
        if (!connected) {
          Alert.alert("Erro", `Não foi possível conectar à impressora ${targetPrinter.name}`);
          return false;
        }

        // Simular envio (em produção, usar socket real)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        return true;
      } catch (error) {
        console.error("Erro ao enviar para impressora:", error);
        Alert.alert("Erro", "Erro ao enviar para impressora");
        return false;
      }
    },
    [defaultPrinter, testConnection]
  );

  // Imprimir etiqueta
  const printLabel = useCallback(
    async (
      labelData: {
        recipientName: string;
        recipientAddress: string;
        recipientNumber: string;
        recipientCity: string;
        recipientState: string;
        recipientCEP: string;
        trackingCode?: string;
      },
      printer?: ThermalPrinter
    ): Promise<boolean> => {
      const targetPrinter = printer || defaultPrinter;

      if (!targetPrinter) {
        Alert.alert("Erro", "Nenhuma impressora selecionada");
        return false;
      }

      try {
        const command = generateESCPOSCommand(labelData, targetPrinter.width);
        const success = await sendToPrinter(command, targetPrinter);

        if (success) {
          Alert.alert("Sucesso", `Etiqueta impressa em ${targetPrinter.name}`);
        }

        return success;
      } catch (error) {
        console.error("Erro ao imprimir etiqueta:", error);
        Alert.alert("Erro", "Erro ao imprimir etiqueta");
        return false;
      }
    },
    [defaultPrinter, generateESCPOSCommand, sendToPrinter]
  );

  return {
    printers,
    defaultPrinter,
    isScanning,
    loadPrinters,
    addPrinter,
    testConnection,
    setDefault,
    removePrinter,
    generateESCPOSCommand,
    sendToPrinter,
    printLabel,
  };
}

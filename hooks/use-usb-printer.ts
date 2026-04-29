import { useState, useCallback } from 'react';

// Tipos WebUSB
interface USBDevice {
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  transferOut(endpointNumber: number, data: Uint8Array): Promise<USBOutTransferResult>;
  productName?: string;
  vendorId: number;
  productId: number;
  configuration: any;
}

interface USBOutTransferResult {
  bytesWritten: number;
  status: string;
}

interface Navigator {
  usb: {
    requestDevice(options: any): Promise<USBDevice>;
    getDevices(): Promise<USBDevice[]>;
  };
}

interface USBPrinter {
  device: USBDevice;
  name: string;
  vendorId: number;
  productId: number;
}

interface PrinterConfig {
  width: number; // em mm
  height: number; // em mm
  dpi: number; // dots per inch
}

// Waytec WLP-200 specifications
const WAYTEC_WLP200_CONFIG: PrinterConfig = {
  width: 101.6, // 4 polegadas
  height: 152.4, // 6 polegadas (padrão Correios)
  dpi: 203, // 203 DPI
};

// Waytec WLP-200 USB IDs
const WAYTEC_VENDOR_ID = 0x0456; // Waytec vendor ID
const WAYTEC_PRODUCT_IDS = [0x0203, 0x0204]; // WLP-200 product IDs

export function useUSBPrinter() {
  const [printer, setPrinter] = useState<USBPrinter | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar se WebUSB está disponível
  const isWebUSBSupported = useCallback(() => {
    if (typeof window === 'undefined') return false;
    return 'usb' in navigator;
  }, []);

  // Listar impressoras disponíveis
  const listPrinters = useCallback(async () => {
    if (!isWebUSBSupported()) {
      setError('WebUSB não é suportado neste navegador');
      return [];
    }

    try {
      const devices = await (navigator as any).usb.getDevices();
      const printers = devices.filter((device: any) =>
        WAYTEC_PRODUCT_IDS.includes(device.productId)
      );
      return printers;
    } catch (err) {
      setError(`Erro ao listar impressoras: ${err}`);
      return [];
    }
  }, [isWebUSBSupported]);

  // Conectar a uma impressora
  const connectPrinter = useCallback(
    async (device?: USBDevice) => {
      if (!isWebUSBSupported()) {
        setError('WebUSB não é suportado neste navegador');
        return false;
      }

      try {
        let selectedDevice = device;

        // Se não especificou device, pedir ao usuário
        if (!selectedDevice) {
          const devices = await (navigator as any).usb.requestDevice({
            filters: [
              {
                vendorId: WAYTEC_VENDOR_ID,
                productId: WAYTEC_PRODUCT_IDS[0],
              },
            ],
          });
          selectedDevice = devices;
        }

        if (!selectedDevice) {
          setError('Nenhuma impressora selecionada');
          return false;
        }

        // Abrir conexão com dispositivo
        await selectedDevice.open();

        // Selecionar configuração
        if (selectedDevice.configuration === null) {
          await selectedDevice.selectConfiguration(1);
        }

        // Reivindicar interface
        try {
          await selectedDevice.claimInterface(0);
        } catch (e) {
          // Interface pode já estar reivindicada
          console.log('Interface já reivindicada');
        }

        setPrinter({
          device: selectedDevice,
          name: selectedDevice.productName || 'Waytec WLP-200',
          vendorId: selectedDevice.vendorId,
          productId: selectedDevice.productId,
        });

        setIsConnected(true);
        setError(null);
        return true;
      } catch (err) {
        setError(`Erro ao conectar impressora: ${err}`);
        setIsConnected(false);
        return false;
      }
    },
    [isWebUSBSupported]
  );

  // Desconectar impressora
  const disconnectPrinter = useCallback(async () => {
    if (!printer) return;

    try {
      await printer.device.close();
      setPrinter(null);
      setIsConnected(false);
      setError(null);
    } catch (err) {
      setError(`Erro ao desconectar: ${err}`);
    }
  }, [printer]);

  // Enviar comando ESC/POS para impressora
  const sendCommand = useCallback(
    async (command: Uint8Array) => {
      if (!printer || !isConnected) {
        setError('Impressora não conectada');
        return false;
      }

      try {
        await printer.device.transferOut(1, command);
        return true;
      } catch (err) {
        setError(`Erro ao enviar comando: ${err}`);
        return false;
      }
    },
    [printer, isConnected]
  );

  // Gerar comando ESC/POS para imprimir etiqueta
  const generateLabelCommand = useCallback(
    (labelData: {
      barcode: string;
      text?: string;
      logo?: string;
    }) => {
      const commands: number[] = [];

      // Reset da impressora
      commands.push(0x1b, 0x40); // ESC @

      // Definir modo de impressão
      commands.push(0x1b, 0x21, 0x00); // ESC ! 0

      // Definir largura de impressão (4 polegadas = 832 dots em 203 DPI)
      commands.push(0x1d, 0x57, 0x40, 0x03); // GS W 832

      // Definir altura de impressão (6 polegadas = 1218 dots em 203 DPI)
      commands.push(0x1d, 0x68, 0xc2, 0x04); // GS h 1218

      // Imprimir código de barras (Code128)
      const barcodeBytes = new TextEncoder().encode(labelData.barcode);
      commands.push(0x1d, 0x6b, 0x49); // GS k I (Code128)
      commands.push(barcodeBytes.length);
      commands.push(...Array.from(barcodeBytes));

      // Quebra de linha
      commands.push(0x0a);

      // Imprimir texto se fornecido
      if (labelData.text) {
        const textBytes = new TextEncoder().encode(labelData.text);
        commands.push(...Array.from(textBytes));
        commands.push(0x0a);
      }

      // Avançar papel e cortar
      commands.push(0x1d, 0x56, 0x41, 0x00); // GS V A (corte parcial)

      return new Uint8Array(commands);
    },
    []
  );

  // Imprimir etiqueta
  const printLabel = useCallback(
    async (labelData: {
      barcode: string;
      text?: string;
      logo?: string;
    }) => {
      try {
        const command = generateLabelCommand(labelData);
        return await sendCommand(command);
      } catch (err) {
        setError(`Erro ao imprimir: ${err}`);
        return false;
      }
    },
    [generateLabelCommand, sendCommand]
  );

  return {
    printer,
    isConnected,
    error,
    isWebUSBSupported,
    listPrinters,
    connectPrinter,
    disconnectPrinter,
    sendCommand,
    printLabel,
    generateLabelCommand,
    printerConfig: WAYTEC_WLP200_CONFIG,
  };
}

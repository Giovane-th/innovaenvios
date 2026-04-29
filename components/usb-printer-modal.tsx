import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useUSBPrinter } from '@/hooks/use-usb-printer';

interface USBPrinterModalProps {
  visible: boolean;
  onClose: () => void;
  onPrint: (barcode: string, text?: string) => Promise<boolean>;
}

export function USBPrinterModal({ visible, onClose, onPrint }: USBPrinterModalProps) {
  const {
    printer,
    isConnected,
    error,
    isWebUSBSupported,
    listPrinters,
    connectPrinter,
    disconnectPrinter,
  } = useUSBPrinter();

  const [availablePrinters, setAvailablePrinters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [text, setText] = useState('');
  const [printing, setPrinting] = useState(false);

  // Carregar impressoras disponíveis
  useEffect(() => {
    if (visible && isWebUSBSupported()) {
      loadPrinters();
    }
  }, [visible]);

  const loadPrinters = async () => {
    setLoading(true);
    const printers = await listPrinters();
    setAvailablePrinters(printers);
    setLoading(false);
  };

  const handleConnect = async () => {
    setLoading(true);
    const success = await connectPrinter();
    setLoading(false);

    if (success) {
      // Conexão bem-sucedida
    }
  };

  const handlePrint = async () => {
    if (!barcode.trim()) {
      alert('Por favor, insira um código de barras');
      return;
    }

    setPrinting(true);
    const success = await onPrint(barcode, text);
    setPrinting(false);

    if (success) {
      alert('Etiqueta impressa com sucesso!');
      setBarcode('');
      setText('');
    } else {
      alert('Erro ao imprimir etiqueta');
    }
  };

  if (!isWebUSBSupported()) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-lg p-6 w-11/12">
            <Text className="text-lg font-bold text-red-600 mb-2">
              WebUSB não suportado
            </Text>
            <Text className="text-gray-600 mb-4">
              Este navegador não suporta WebUSB. Use Chrome, Edge ou Opera.
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-blue-600 rounded-lg p-3"
            >
              <Text className="text-white text-center font-semibold">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-2xl p-6 max-h-4/5">
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-foreground">
                Impressora USB
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Text className="text-2xl text-gray-400">×</Text>
              </TouchableOpacity>
            </View>

            {/* Status */}
            <View className="mb-6 p-4 bg-gray-100 rounded-lg">
              <Text className="text-sm font-semibold text-gray-600 mb-2">
                Status da Conexão
              </Text>
              <View className="flex-row items-center">
                <View
                  className={`w-3 h-3 rounded-full mr-2 ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <Text className="text-gray-800">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </Text>
              </View>

              {printer && (
                <Text className="text-sm text-gray-600 mt-2">
                  Impressora: {printer.name}
                </Text>
              )}

              {error && (
                <Text className="text-sm text-red-600 mt-2">Erro: {error}</Text>
              )}
            </View>

            {/* Conexão */}
            {!isConnected ? (
              <View className="mb-6">
                <TouchableOpacity
                  onPress={handleConnect}
                  disabled={loading}
                  className="bg-blue-600 rounded-lg p-4 flex-row justify-center items-center"
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-semibold text-center">
                      Conectar Impressora
                    </Text>
                  )}
                </TouchableOpacity>

                {availablePrinters.length > 0 && (
                  <View className="mt-4">
                    <Text className="text-sm font-semibold text-gray-600 mb-2">
                      Impressoras Disponíveis:
                    </Text>
                    {availablePrinters.map((p, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => connectPrinter(p)}
                        className="p-3 bg-gray-100 rounded-lg mb-2"
                      >
                        <Text className="text-gray-800">
                          {p.productName || `Impressora ${idx + 1}`}
                        </Text>
                        <Text className="text-xs text-gray-600">
                          Vendor: {p.vendorId}, Product: {p.productId}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View className="mb-6">
                {/* Entrada de Código de Barras */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-600 mb-2">
                    Código de Barras
                  </Text>
                  <View className="border border-gray-300 rounded-lg px-4 py-3">
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="Digite o código de barras"
                      className="w-full"
                      style={{
                        fontSize: 16,
                        padding: 0,
                        border: 'none',
                        outline: 'none',
                      }}
                    />
                  </View>
                </View>

                {/* Entrada de Texto */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-600 mb-2">
                    Texto (Opcional)
                  </Text>
                  <View className="border border-gray-300 rounded-lg px-4 py-3">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Digite o texto para imprimir"
                      className="w-full"
                      style={{
                        fontSize: 16,
                        padding: 0,
                        border: 'none',
                        outline: 'none',
                        minHeight: 80,
                        fontFamily: 'system-ui',
                      }}
                    />
                  </View>
                </View>

                {/* Botões */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handlePrint}
                    disabled={printing}
                    className="flex-1 bg-green-600 rounded-lg p-4"
                  >
                    {printing ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-semibold text-center">
                        Imprimir
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={disconnectPrinter}
                    className="flex-1 bg-red-600 rounded-lg p-4"
                  >
                    <Text className="text-white font-semibold text-center">
                      Desconectar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Botão Fechar */}
            <TouchableOpacity
              onPress={onClose}
              className="bg-gray-200 rounded-lg p-4 mt-4"
            >
              <Text className="text-gray-800 font-semibold text-center">
                Fechar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

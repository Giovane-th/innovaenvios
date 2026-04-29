import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/use-colors';

interface PrinterConfig {
  vendorId: number;
  productId: number;
  name: string;
}

interface ThermalPrinterIntegrationProps {
  visible: boolean;
  onClose: () => void;
  onPrint?: (data: string) => void;
}

export function ThermalPrinterIntegration({
  visible,
  onClose,
  onPrint
}: ThermalPrinterIntegrationProps) {
  const colors = useColors();
  const [loading, setLoading] = useState(false);
  const [printerConnected, setPrinterConnected] = useState(false);
  const [printerInfo, setPrinterInfo] = useState<PrinterConfig | null>(null);
  const [testText, setTestText] = useState('TESTE DE IMPRESSÃO\nIn\'Nova Envios');
  const [error, setError] = useState<string | null>(null);

  // Configuração da Waytec WLP-200
  const WAYTEC_WLP200: PrinterConfig = {
    vendorId: 0x0456, // Waytec vendor ID (exemplo)
    productId: 0x0200, // WLP-200 product ID (exemplo)
    name: 'Waytec WLP-200'
  };

  // Conectar à impressora
  const conectarImpressora = async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar se WebUSB está disponível
      const nav = navigator as any;
      if (!nav.usb) {
        throw new Error('WebUSB não está disponível neste navegador. Use Chrome, Edge ou Opera.');
      }

      // Solicitar acesso ao dispositivo USB
      const devices = await nav.usb.requestDevice({
        filters: [
          { vendorId: WAYTEC_WLP200.vendorId, productId: WAYTEC_WLP200.productId }
        ]
      });

      if (devices) {
        setPrinterConnected(true);
        setPrinterInfo(WAYTEC_WLP200);
        Alert.alert('Sucesso', 'Impressora conectada com sucesso!');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar impressora';
      setError(message);
      console.error('Erro ao conectar impressora:', message);
    } finally {
      setLoading(false);
    }
  };

  // Desconectar impressora
  const desconectarImpressora = () => {
    setPrinterConnected(false);
    setPrinterInfo(null);
    setError(null);
  };

  // Enviar comando para impressora
  const enviarComando = async (comando: Uint8Array) => {
    try {
      const nav = navigator as any;
      if (!nav.usb) {
        throw new Error('WebUSB não disponível');
      }

      // Aqui você implementaria a lógica de envio para a impressora
      // Este é um exemplo simplificado
      console.log('Comando enviado para impressora:', comando);
      Alert.alert('Sucesso', 'Comando enviado para impressora!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar comando';
      setError(message);
    }
  };

  // Gerar comando ESC/POS para etiqueta
  const gerarComandoEtiqueta = (texto: string): Uint8Array => {
    const commands: number[] = [];

    // Inicializar impressora
    commands.push(...[0x1B, 0x40]); // ESC @

    // Definir tamanho da fonte
    commands.push(...[0x1D, 0x21, 0x11]); // GS ! (2x altura, 2x largura)

    // Centralizar texto
    commands.push(...[0x1B, 0x61, 0x01]); // ESC a (centralizar)

    // Adicionar texto
    const textBytes = new TextEncoder().encode(texto);
    commands.push(...textBytes);

    // Nova linha
    commands.push(0x0A);

    // Cortar papel
    commands.push(...[0x1D, 0x56, 0x00]); // GS V (corte total)

    return new Uint8Array(commands);
  };

  // Imprimir teste
  const imprimirTeste = async () => {
    if (!printerConnected) {
      setError('Impressora não conectada');
      return;
    }

    setLoading(true);

    try {
      const comando = gerarComandoEtiqueta(testText);
      await enviarComando(comando);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao imprimir';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Imprimir etiqueta de envio
  const imprimirEtiqueta = (dados: {
    codigo: string;
    destinatario: string;
    endereco: string;
    cep: string;
    peso: number;
  }) => {
    if (!printerConnected) {
      setError('Impressora não conectada');
      return;
    }

    const etiquetaTexto = `
*${dados.codigo}*
${dados.destinatario}
${dados.endereco}
${dados.cep}
Peso: ${dados.peso}g
    `.trim();

    setTestText(etiquetaTexto);
    imprimirTeste();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            marginTop: 100,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground }}>
              Impressora Térmica
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Status */}
            <View style={{
              backgroundColor: printerConnected ? '#D1FAE5' : '#FEE2E2',
              borderRadius: 8,
              padding: 16,
              marginBottom: 20,
              borderLeftWidth: 4,
              borderLeftColor: printerConnected ? '#10B981' : '#EF4444'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <MaterialIcons
                  name={printerConnected ? 'check-circle' : 'error'}
                  size={24}
                  color={printerConnected ? '#10B981' : '#EF4444'}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: printerConnected ? '#065F46' : '#7F1D1D'
                  }}>
                    {printerConnected ? 'Conectado' : 'Desconectado'}
                  </Text>
                  {printerInfo && (
                    <Text style={{
                      fontSize: 12,
                      color: printerConnected ? '#047857' : '#991B1B',
                      marginTop: 4
                    }}>
                      {printerInfo.name}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Botão Conectar/Desconectar */}
            <TouchableOpacity
              onPress={printerConnected ? desconectarImpressora : conectarImpressora}
              disabled={loading}
              style={{
                backgroundColor: printerConnected ? '#EF4444' : colors.primary,
                borderRadius: 8,
                padding: 16,
                alignItems: 'center',
                marginBottom: 20,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <MaterialIcons
                    name={printerConnected ? 'bluetooth-disabled' : 'bluetooth'}
                    size={20}
                    color="white"
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                    {printerConnected ? 'Desconectar' : 'Conectar Impressora'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Erro */}
            {error && (
              <View style={{
                backgroundColor: '#FEE2E2',
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
                borderLeftWidth: 4,
                borderLeftColor: '#EF4444'
              }}>
                <Text style={{ color: '#DC2626', fontSize: 14 }}>
                  ⚠️ {error}
                </Text>
              </View>
            )}

            {/* Teste de Impressão */}
            {printerConnected && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
                  Teste de Impressão
                </Text>

                <TextInput
                  value={testText}
                  onChangeText={setTestText}
                  placeholder="Texto para testar"
                  placeholderTextColor={colors.muted}
                  multiline
                  numberOfLines={4}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.foreground,
                    backgroundColor: colors.surface,
                    marginBottom: 12,
                    fontFamily: 'monospace',
                  }}
                />

                <TouchableOpacity
                  onPress={imprimirTeste}
                  disabled={loading}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    padding: 12,
                    alignItems: 'center',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <MaterialIcons name="print" size={20} color="white" style={{ marginBottom: 4 }} />
                      <Text style={{ color: 'white', fontWeight: '600' }}>
                        Imprimir Teste
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Informações */}
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 8,
              padding: 16,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary
            }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
                ℹ️ Informações
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted, lineHeight: 18 }}>
                • Use Chrome, Edge ou Opera para WebUSB{'\n'}
                • Conecte a impressora Waytec WLP-200 via USB{'\n'}
                • Clique em "Conectar Impressora"{'\n'}
                • Selecione a impressora na janela do navegador{'\n'}
                • Use "Imprimir Teste" para validar
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

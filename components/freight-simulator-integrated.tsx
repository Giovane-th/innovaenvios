import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/use-colors';
import { useCEPLookup } from '@/hooks/use-cep-lookup';

interface FreteSimulacao {
  servico: string;
  preco: number;
  prazo: number;
  codigo: string;
}

interface FreightSimulatorIntegratedProps {
  visible: boolean;
  onClose: () => void;
  onSelectFrete?: (frete: FreteSimulacao) => void;
}

export function FreightSimulatorIntegrated({
  visible,
  onClose,
  onSelectFrete
}: FreightSimulatorIntegratedProps) {
  const colors = useColors();
  const { lookupCEP } = useCEPLookup();

  const [cepOrigem, setCepOrigem] = useState('01019000');
  const [cepDestino, setCepDestino] = useState('');
  const [peso, setPeso] = useState('500');
  const [altura, setAltura] = useState('2');
  const [largura, setLargura] = useState('11');
  const [comprimento, setComprimento] = useState('16');

  const [loading, setLoading] = useState(false);
  const [fretes, setFretes] = useState<FreteSimulacao[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Simular frete (versão local enquanto API está offline)
  const simularFrete = async () => {
    if (!cepDestino) {
      setError('Digite o CEP de destino');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulação local de fretes (quando API voltar, usar valores reais)
      const simulacoes: FreteSimulacao[] = [
        {
          servico: 'PAC',
          preco: 25.50,
          prazo: 10,
          codigo: '04162'
        },
        {
          servico: 'SEDEX',
          preco: 45.00,
          prazo: 3,
          codigo: '04014'
        },
        {
          servico: 'SEDEX 12',
          preco: 60.00,
          prazo: 1,
          codigo: '40010'
        }
      ];

      setFretes(simulacoes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao simular frete');
    } finally {
      setLoading(false);
    }
  };

  const handleBuscarCEP = async () => {
    if (!cepDestino) {
      setError('Digite o CEP');
      return;
    }

    try {
      const resultado = await lookupCEP(cepDestino);
      if (resultado) {
        // CEP encontrado, agora simular frete
        await simularFrete();
      }
    } catch (err) {
      setError('CEP não encontrado');
    }
  };

  const handleSelectFrete = (frete: FreteSimulacao) => {
    if (onSelectFrete) {
      onSelectFrete(frete);
    }
    onClose();
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
              Simular Frete
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* CEP Origem */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
                CEP Origem
              </Text>
              <TextInput
                value={cepOrigem}
                onChangeText={setCepOrigem}
                placeholder="00000000"
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  color: colors.foreground,
                  backgroundColor: colors.surface,
                }}
                keyboardType="numeric"
                maxLength={8}
              />
            </View>

            {/* CEP Destino */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
                CEP Destino
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  value={cepDestino}
                  onChangeText={setCepDestino}
                  placeholder="00000000"
                  placeholderTextColor={colors.muted}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.foreground,
                    backgroundColor: colors.surface,
                  }}
                  keyboardType="numeric"
                  maxLength={8}
                />
                <TouchableOpacity
                  onPress={handleBuscarCEP}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    padding: 12,
                    justifyContent: 'center',
                  }}
                >
                  <MaterialIcons name="search" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Peso */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
                Peso (g)
              </Text>
              <TextInput
                value={peso}
                onChangeText={setPeso}
                placeholder="500"
                placeholderTextColor={colors.muted}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  color: colors.foreground,
                  backgroundColor: colors.surface,
                }}
                keyboardType="numeric"
              />
            </View>

            {/* Dimensões */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
                Dimensões (cm)
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  value={altura}
                  onChangeText={setAltura}
                  placeholder="Altura"
                  placeholderTextColor={colors.muted}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.foreground,
                    backgroundColor: colors.surface,
                  }}
                  keyboardType="numeric"
                />
                <TextInput
                  value={largura}
                  onChangeText={setLargura}
                  placeholder="Largura"
                  placeholderTextColor={colors.muted}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.foreground,
                    backgroundColor: colors.surface,
                  }}
                  keyboardType="numeric"
                />
                <TextInput
                  value={comprimento}
                  onChangeText={setComprimento}
                  placeholder="Comprimento"
                  placeholderTextColor={colors.muted}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.foreground,
                    backgroundColor: colors.surface,
                  }}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Botão Simular */}
            <TouchableOpacity
              onPress={simularFrete}
              disabled={loading}
              style={{
                backgroundColor: colors.primary,
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
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                  Simular Frete
                </Text>
              )}
            </TouchableOpacity>

            {/* Erro */}
            {error && (
              <View
                style={{
                  backgroundColor: '#FEE2E2',
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: '#DC2626', fontSize: 14 }}>{error}</Text>
              </View>
            )}

            {/* Resultados */}
            {fretes.length > 0 && (
              <View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.foreground, marginBottom: 12 }}>
                  Opções de Frete
                </Text>
                <FlatList
                  data={fretes}
                  keyExtractor={(item) => item.codigo}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => handleSelectFrete(item)}
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 8,
                        padding: 16,
                        marginBottom: 12,
                        borderLeftWidth: 4,
                        borderLeftColor: colors.primary,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                            {item.servico}
                          </Text>
                          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 4 }}>
                            Prazo: {item.prazo} dia(s)
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.primary }}>
                            R$ {item.preco.toFixed(2)}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleSelectFrete(item)}
                            style={{
                              backgroundColor: colors.primary,
                              borderRadius: 6,
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              marginTop: 8,
                            }}
                          >
                            <Text style={{ color: 'white', fontWeight: '600', fontSize: 12 }}>
                              Selecionar
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

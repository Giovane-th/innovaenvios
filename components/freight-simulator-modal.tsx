import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFreightSimulator, FreightQuote } from '@/hooks/use-freight-simulator';

interface FreightSimulatorModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FreightSimulatorModal({ visible, onClose }: FreightSimulatorModalProps) {
  const { loading, simulateFreightLocal } = useFreightSimulator();
  const [originZip, setOriginZip] = useState('');
  const [destinationZip, setDestinationZip] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [quotes, setQuotes] = useState<FreightQuote[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSimulate = () => {
    // Validar campos
    if (!originZip || !destinationZip || !weight || !length || !width || !height) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    const weightNum = parseFloat(weight);
    const lengthNum = parseFloat(length);
    const widthNum = parseFloat(width);
    const heightNum = parseFloat(height);

    if (weightNum <= 0 || lengthNum <= 0 || widthNum <= 0 || heightNum <= 0) {
      Alert.alert('Erro', 'Valores devem ser maiores que zero');
      return;
    }

    // Simular frete
    const result = simulateFreightLocal(originZip, destinationZip, weightNum, lengthNum, widthNum, heightNum);
    setQuotes(result);
    setShowResults(true);
  };

  const handleReset = () => {
    setOriginZip('');
    setDestinationZip('');
    setWeight('');
    setLength('');
    setWidth('');
    setHeight('');
    setQuotes([]);
    setShowResults(false);
  };

  const formatCEP = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 bg-white rounded-t-3xl mt-auto">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-2xl font-bold text-foreground">Simulador de Frete</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {!showResults ? (
              <View className="gap-4">
                {/* CEP Origem */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">CEP Origem</Text>
                  <TextInput
                    placeholder="00000-000"
                    value={originZip}
                    onChangeText={(text) => setOriginZip(formatCEP(text))}
                    keyboardType="numeric"
                    maxLength={9}
                    className="border border-gray-300 rounded-lg p-3 text-base"
                  />
                </View>

                {/* CEP Destino */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">CEP Destino</Text>
                  <TextInput
                    placeholder="00000-000"
                    value={destinationZip}
                    onChangeText={(text) => setDestinationZip(formatCEP(text))}
                    keyboardType="numeric"
                    maxLength={9}
                    className="border border-gray-300 rounded-lg p-3 text-base"
                  />
                </View>

                {/* Peso */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Peso (gramas)</Text>
                  <TextInput
                    placeholder="500"
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    className="border border-gray-300 rounded-lg p-3 text-base"
                  />
                </View>

                {/* Dimensões */}
                <View>
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Dimensões (cm)</Text>
                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <Text className="text-xs text-gray-600 mb-1">Comprimento</Text>
                      <TextInput
                        placeholder="20"
                        value={length}
                        onChangeText={setLength}
                        keyboardType="decimal-pad"
                        className="border border-gray-300 rounded-lg p-2 text-base"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-gray-600 mb-1">Largura</Text>
                      <TextInput
                        placeholder="15"
                        value={width}
                        onChangeText={setWidth}
                        keyboardType="decimal-pad"
                        className="border border-gray-300 rounded-lg p-2 text-base"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-gray-600 mb-1">Altura</Text>
                      <TextInput
                        placeholder="10"
                        value={height}
                        onChangeText={setHeight}
                        keyboardType="decimal-pad"
                        className="border border-gray-300 rounded-lg p-2 text-base"
                      />
                    </View>
                  </View>
                </View>

                {/* Botão Simular */}
                <TouchableOpacity
                  onPress={handleSimulate}
                  disabled={loading}
                  className={`rounded-lg p-4 flex-row items-center justify-center gap-2 ${
                    loading ? 'bg-gray-400' : 'bg-blue-600'
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <MaterialIcons name="calculate" size={20} color="white" />
                      <Text className="text-white font-semibold">Simular Frete</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View className="gap-4">
                {/* Resumo da Simulação */}
                <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <Text className="text-sm text-gray-600">De: {originZip}</Text>
                  <Text className="text-sm text-gray-600">Para: {destinationZip}</Text>
                  <Text className="text-sm text-gray-600">Peso: {weight}g | Dimensões: {length}x{width}x{height}cm</Text>
                </View>

                {/* Resultados */}
                <View>
                  <Text className="text-lg font-bold text-foreground mb-3">Opções de Frete</Text>
                  <FlatList
                    data={quotes}
                    keyExtractor={(_, index) => index.toString()}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                      <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
                        <View className="flex-row justify-between items-start mb-2">
                          <Text className="font-semibold text-foreground flex-1">{item.service}</Text>
                          <Text className="text-2xl font-bold text-green-600">R$ {item.price}</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons name="schedule" size={16} color="#666" />
                          <Text className="text-sm text-gray-600">{item.deadline}</Text>
                        </View>
                        {item.error && (
                          <Text className="text-sm text-red-600 mt-2">{item.error}</Text>
                        )}
                      </View>
                    )}
                  />
                </View>

                {/* Botões de Ação */}
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={handleReset}
                    className="flex-1 bg-gray-200 rounded-lg p-3"
                  >
                    <Text className="text-center font-semibold text-gray-700">Nova Simulação</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onClose}
                    className="flex-1 bg-blue-600 rounded-lg p-3"
                  >
                    <Text className="text-center font-semibold text-white">Fechar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

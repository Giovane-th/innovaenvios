import { ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function TrackingScreen() {
  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-4">
          <Text className="text-2xl font-bold text-foreground">Rastreamento</Text>
          <Text className="text-base text-muted">
            Tela de rastreamento de envios
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

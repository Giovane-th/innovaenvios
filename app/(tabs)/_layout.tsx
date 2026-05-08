import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = Dimensions.get("window");
  
  // Detectar se é desktop (width > 768px)
  const isDesktop = Platform.OS === "web" && width > 768;
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 56 + bottomPadding;

  // Se for desktop, renderizar com sidebar
  if (isDesktop) {
    return (
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Sidebar */}
        <View
          style={{
            width: 280,
            backgroundColor: colors.background,
            borderRightWidth: 1,
            borderRightColor: colors.border,
            paddingTop: 20,
          }}
        >
          {/* Logo/Header */}
          <View style={{ paddingHorizontal: 16, marginBottom: 32 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground }}>
              InNova Envios
            </Text>
          </View>

          {/* Menu Items */}
          <View>
            <SidebarItem
              icon="home"
              label="Home"
              onPress={() => router.push("/(tabs)")}
              colors={colors}
            />
            <SidebarItem
              icon="people"
              label="Clientes"
              onPress={() => router.push("/clients")}
              colors={colors}
            />
            <SidebarItem
              icon="bar-chart"
              label="Relatórios"
              onPress={() => router.push("/reports")}
              colors={colors}
            />
            <SidebarItem
              icon="local-shipping"
              label="Rastreamento"
              onPress={() => router.push("/tracking")}
              colors={colors}
            />
            <SidebarItem
              icon="person-add"
              label="Funcionários"
              onPress={() => router.push("/employees")}
              colors={colors}
            />
          </View>
        </View>

        {/* Main Content */}
        <View style={{ flex: 1 }}>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: colors.tint,
              headerShown: false,
              tabBarButton: HapticTab,
              tabBarStyle: { display: "none" }, // Esconder tab bar no desktop
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Home",
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
              }}
            />
            <Tabs.Screen
              name="clients"
              options={{
                title: "Clientes",
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
              }}
            />
            <Tabs.Screen
              name="reports"
              options={{
                title: "Relatórios",
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
              }}
            />
            <Tabs.Screen
              name="tracking"
              options={{
                title: "Rastreamento",
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
              }}
            />
            <Tabs.Screen
              name="employees"
              options={{
                title: "Funcionários",
                tabBarIcon: ({ color }) => <MaterialIcons name="person-add" size={28} color={color} />,
              }}
            />
          </Tabs>
        </View>
      </View>
    );
  }

  // Se for mobile, renderizar com tab bar no rodapé
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="../clients"
        options={{
          title: "Clientes",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="../reports"
        options={{
          title: "Relatórios",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
            <Tabs.Screen
              name="../tracking"
              options={{
                title: "Rastreamento",
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
              }}
            />
            <Tabs.Screen
              name="../employees"
              options={{
                title: "Funcionários",
                tabBarIcon: ({ color }) => <MaterialIcons name="person-add" size={28} color={color} />,
              }}
            />
          </Tabs>
  );
}

// Componente do item da sidebar
function SidebarItem({ icon, label, onPress, colors }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 8,
        marginVertical: 4,
        borderRadius: 8,
      }}
      activeOpacity={0.7}
    >
      <MaterialIcons name={icon} size={24} color={colors.primary} />
      <Text
        style={{
          marginLeft: 12,
          fontSize: 16,
          fontWeight: "500",
          color: colors.foreground,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

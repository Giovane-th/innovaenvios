import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/use-colors";

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
  rightAction?: {
    label: string;
    onPress: () => void;
    loading?: boolean;
  };
}

/**
 * ModalHeader Component
 * 
 * Componente reutilizável para headers de modais com:
 * - Título centralizado
 * - Botão de fechar (X) no canto esquerdo
 * - Ação opcional no canto direito (ex: "Salvar")
 * 
 * Uso:
 * ```tsx
 * <ModalHeader 
 *   title="Editar Configurações"
 *   onClose={() => setShowModal(false)}
 *   rightAction={{
 *     label: "Salvar",
 *     onPress: handleSave,
 *     loading: isSaving
 *   }}
 * />
 * ```
 */
export function ModalHeader({ title, onClose, rightAction }: ModalHeaderProps) {
  const colors = useColors();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
      }}
    >
      {/* Botão de Fechar (Esquerda) */}
      <TouchableOpacity
        onPress={onClose}
        style={{
          padding: 8,
          marginLeft: -8,
        }}
        activeOpacity={0.7}
      >
        <MaterialIcons name="close" size={24} color={colors.foreground} />
      </TouchableOpacity>

      {/* Título (Centro) */}
      <Text
        style={{
          flex: 1,
          fontSize: 18,
          fontWeight: "600",
          color: colors.foreground,
          textAlign: "center",
          marginHorizontal: 12,
        }}
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* Ação Direita ou Espaço Vazio */}
      {rightAction ? (
        <TouchableOpacity
          onPress={rightAction.onPress}
          disabled={rightAction.loading}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 8,
            opacity: rightAction.loading ? 0.6 : 1,
          }}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.primary,
            }}
          >
            {rightAction.label}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40 }} />
      )}
    </View>
  );
}

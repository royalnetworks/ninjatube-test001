import { TouchableOpacity, Text, StyleSheet, type GestureResponderEvent, type ViewStyle } from "react-native"
import { colors } from "../theme/colors"

type Props = {
  title: string
  onPress?: (e: GestureResponderEvent) => void
  variant?: "primary" | "ghost"
  style?: ViewStyle
  disabled?: boolean
}

export function Button({ title, onPress, variant = "primary", style, disabled }: Props) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.base,
        variant === "primary" ? styles.primary : styles.ghost,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <Text style={variant === "primary" ? styles.primaryText : styles.ghostText}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  ghost: {
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.6,
  },
  primaryText: { color: colors.text, fontWeight: "600" },
  ghostText: { color: colors.text, fontWeight: "600" },
})

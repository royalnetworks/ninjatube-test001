import { Text, View, StyleSheet } from "react-native"
import { colors } from "../theme/colors"

export function HeroLogo() {
  return (
    <View style={styles.wrap} accessibilityRole="header">
      <Text style={styles.logo}>Ninja Tube</Text>
      <Text style={styles.tagline}>Watch. Earn. Rise.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 8 },
  logo: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  tagline: { color: "#D1D5DB", fontSize: 14 },
})

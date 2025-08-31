import { View, Text, StyleSheet } from "react-native"
import { colors } from "../theme/colors"

export function XpBarPlaceholder() {
  return (
    <View accessible accessibilityLabel="XP Progress" style={styles.xpWrap}>
      <View style={styles.xpFill} />
      <Text style={styles.xpText}>XP 0 / 100</Text>
    </View>
  )
}

export function CoinCounterPlaceholder() {
  return (
    <View style={styles.coinWrap}>
      <Text style={styles.coinText}>Coins: 0</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  xpWrap: {
    width: "100%",
    height: 14,
    borderRadius: 999,
    backgroundColor: "#1F2937",
    position: "relative",
    overflow: "hidden",
  },
  xpFill: {
    width: "10%",
    height: "100%",
    backgroundColor: colors.accent,
  },
  xpText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    color: colors.text,
    fontSize: 12,
  },
  coinWrap: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#1F2937",
    borderRadius: 999,
    alignSelf: "flex-end",
  },
  coinText: { color: colors.text, fontWeight: "600" },
})

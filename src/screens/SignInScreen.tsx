import { SafeAreaView } from "react-native-safe-area-context"
import { View, Text, StyleSheet } from "react-native"
import { colors } from "../theme/colors"
import { HeroLogo } from "../components/HeroLogo"
import { XpBarPlaceholder, CoinCounterPlaceholder } from "../components/HudPlaceholders"
import { Button } from "../components/Button"
import { useGoogleAuth } from "../auth/google"

export default function SignInScreen() {
  const { signInWithGoogle, signInGuest } = useGoogleAuth()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <CoinCounterPlaceholder />
        <View style={styles.center}>
          <HeroLogo />
          <View style={styles.panel}>
            <Button title="Sign in with Google" onPress={signInWithGoogle} />
            <Button title="Continue as Guest" variant="ghost" onPress={signInGuest} style={{ marginTop: 12 }} />
            <Button title="Quick Tour" variant="ghost" onPress={() => {}} style={{ marginTop: 12 }} />
            <Text style={styles.tos}>By continuing, you agree to our Terms & Conditions.</Text>
          </View>
          <View style={{ width: "100%", marginTop: 16 }}>
            <XpBarPlaceholder />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.themeToggleLabel}>Theme</Text>
          <View style={styles.themeDot} />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, padding: 16, gap: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24 },
  panel: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  tos: { color: "#9CA3AF", fontSize: 12, textAlign: "center", marginTop: 8 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  themeToggleLabel: { color: "#9CA3AF", fontSize: 12 },
  themeDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary },
})

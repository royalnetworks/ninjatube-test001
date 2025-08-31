import * as WebBrowser from "expo-web-browser"
import * as Google from "expo-auth-session/providers/google"
import { makeRedirectUri } from "expo-auth-session"
import { GoogleAuthProvider, signInWithCredential, signInAnonymously, signOut } from "firebase/auth"
import { auth } from "../firebase/client"

WebBrowser.maybeCompleteAuthSession()

export function useGoogleAuth() {
  const redirectUri = makeRedirectUri({
    native: "com.ninjatube:/oauthredirect",
    useProxy: true,
  })

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
    responseType: "id_token",
    selectAccount: true,
    scopes: ["profile", "email"],
  })

  async function signInWithGoogle() {
    const res = await promptAsync({ useProxy: true })
    if (res.type === "success" && res.params.id_token) {
      const credential = GoogleAuthProvider.credential(res.params.id_token)
      return await signInWithCredential(auth, credential)
    }
    throw new Error("Google sign-in canceled")
  }

  async function signInGuest() {
    return await signInAnonymously(auth)
  }

  return { request, response, signInWithGoogle, signInGuest, signOut: () => signOut(auth) }
}

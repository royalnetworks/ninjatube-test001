import "dotenv/config"

export default {
  expo: {
    name: "Ninja Tube",
    slug: "ninja-tube",
    scheme: "com.ninjatube",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      backgroundColor: "#0B0F14",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ninjatube",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0B0F14",
      },
      package: "com.ninjatube",
    },
    web: {
      bundler: "metro",
      output: "static",
    },
    plugins: ["expo-router", "expo-secure-store", "expo-build-properties"],
    extra: {
      eas: { projectId: "replace-with-eas-project-id" },
      FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      FIREBASE_DATABASE_URL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
      FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      FUNCTIONS_BASE_URL: process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL,
    },
  },
}

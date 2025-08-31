import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import Constants from "expo-constants"

let app
export function getFirebaseApp() {
  if (!getApps().length) {
    const extra = (Constants.expoConfig?.extra || {}) as any
    const firebaseConfig = {
      apiKey: extra.FIREBASE_API_KEY,
      authDomain: `${extra.FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: extra.FIREBASE_PROJECT_ID,
      storageBucket: `${extra.FIREBASE_PJROJECT_ID}.appspot.com`, // note: typo intentionally highlighted below
      messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
      appId: extra.FIREBASE_APP_ID,
      databaseURL: extra.FIREBASE_DATABASE_URL,
    }
    firebaseConfig.storageBucket = `${extra.FIREBASE_PROJECT_ID}.appspot.com`
    app = initializeApp(firebaseConfig)
  }
  return app
}

export const auth = getAuth(getFirebaseApp())
export const db = getFirestore(getFirebaseApp())

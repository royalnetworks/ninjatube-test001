import { auth } from "../firebase/client"

const base = (global as any)?.expoConfig?.extra?.FUNCTIONS_BASE_URL || process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL

async function authedFetch(path: string, body: any) {
  const user = auth.currentUser
  if (!user) throw new Error("Not signed in")
  const idToken = await user.getIdToken()
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const j = await res.json()
      message = j.error || message
    } catch {}
    throw new Error(message)
  }
  return res.json()
}

export async function claimDailyReward() {
  return authedFetch("/dailyCheckIn", {})
}

export async function spend(amount: number, reason: string, eventId: string) {
  return authedFetch("/spendCoins", { amount, reason, eventId })
}

export async function addXp(amount: number, eventId: string) {
  return authedFetch("/awardXp", { amount, eventId })
}

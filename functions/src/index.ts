import { onRequest } from "firebase-functions/v2/https"
import { onUserCreated } from "firebase-functions/v2/identity"
import { logger } from "firebase-functions"
import * as admin from "firebase-admin"
import type { Timestamp } from "firebase-admin/firestore"

try {
  admin.initializeApp()
} catch (e) {
  // no-op when already initialized
}

const db = admin.firestore()

type Role = "viewer" | "creator" | "vip" | "partner" | "admin" | "supervisor" | "manager" | "owner" | "founder"

const DEFAULT_PROFILE = {
  coins: 0,
  blackGems: 0,
  xp: 0,
  clan: null as string | null,
  roles: ["viewer"] as Role[],
  badges: [] as string[],
  publicStats: {
    videosWatched: 0,
    coinsEarned: 0,
    referrals: 0,
    level: 1,
  },
}

// Initialize profile and wallet on first auth
export const initUserOnCreate = onUserCreated(async (event) => {
  const user = event.data
  if (!user) return

  const uid = user.uid
  const profileRef = db.collection("users").doc(uid)
  const walletRef = db.collection("wallets").doc(uid)

  await db.runTransaction(async (tx) => {
    const profileSnap = await tx.get(profileRef)
    if (!profileSnap.exists) {
      tx.set(profileRef, {
        uid,
        name: user.displayName || "Ninja",
        email: user.email || null,
        avatarUrl: user.photoURL || null,
        bannerUrl: null,
        bio: "",
        ...DEFAULT_PROFILE,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    }
    const walletSnap = await tx.get(walletRef)
    if (!walletSnap.exists) {
      tx.set(walletRef, {
        coins: 0,
        blackGems: 0,
        clanTokens: 0,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    }
  })

  logger.info("Initialized profile and wallet for", uid)
})

// Callable: Redeem coupon (coins/gems/vip/item)
// IMPORTANT: enforce server-authoritative writes; no client balance mutation.
export const redeemCoupon = onRequest(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed")
  const auth = req.headers.authorization || ""
  const idToken = auth.startsWith("Bearer ") ? auth.substring(7) : null
  if (!idToken) return res.status(401).send("Unauthorized")

  let decoded: admin.auth.DecodedIdToken
  try {
    decoded = await admin.auth().verifyIdToken(idToken)
  } catch {
    return res.status(401).send("Invalid token")
  }

  const { code } = req.body as { code: string }
  if (!code) return res.status(400).send("Missing code")

  const couponRef = db.collection("coupons").doc(code)
  const walletRef = db.collection("wallets").doc(decoded.uid)
  const txRef = db.collection("transactions").doc()

  try {
    await db.runTransaction(async (tx) => {
      const couponSnap = await tx.get(couponRef)
      if (!couponSnap.exists) throw new Error("Invalid coupon")
      const coupon = couponSnap.data() as {
        type: "coins" | "gems" | "vip" | "item"
        value: number
        usesLeft: number
        expiresAt?: Timestamp
        scopes?: string[]
      }

      if (coupon.expiresAt && coupon.expiresAt.toMillis() < Date.now()) {
        throw new Error("Coupon expired")
      }
      if (coupon.usesLeft <= 0) throw new Error("No uses left")

      const walletSnap = await tx.get(walletRef)
      if (!walletSnap.exists) throw new Error("Wallet missing")

      // Apply reward
      switch (coupon.type) {
        case "coins":
          tx.update(walletRef, {
            coins: admin.firestore.FieldValue.increment(coupon.value),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })
          break
        case "gems":
          tx.update(walletRef, {
            blackGems: admin.firestore.FieldValue.increment(coupon.value),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })
          break
        case "vip":
          // Mark entitlement on user profile for 30 days
          tx.update(db.collection("users").doc(decoded.uid), {
            vipUntil: admin.firestore.Timestamp.fromMillis(Date.now() + 30 * 24 * 60 * 60 * 1000),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })
          break
        case "item":
          // Grant an item in inventory collection
          const invRef = db.collection("users").doc(decoded.uid).collection("inventory").doc()
          tx.set(invRef, {
            itemCode: code,
            grantedAt: admin.firestore.FieldValue.serverTimestamp(),
          })
          break
      }

      // Decrement coupon
      tx.update(couponRef, {
        usesLeft: admin.firestore.FieldValue.increment(-1),
      })

      // Append transaction
      tx.set(txRef, {
        uid: decoded.uid,
        type: "redeem",
        currency: coupon.type === "coins" ? "coins" : coupon.type === "gems" ? "blackGems" : "entitlement",
        amount: coupon.type === "coins" || coupon.type === "gems" ? coupon.value : 0,
        refId: code,
        reason: "coupon",
        status: "success",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    })

    return res.status(200).json({ ok: true })
  } catch (e: any) {
    logger.error("redeemCoupon failed", e)
    return res.status(400).json({ ok: false, error: e.message })
  }
})

// Callable: Set user role (admin-only)
// Custom claims are used for elevated roles; mirror in Firestore profile.
export const setUserRole = onRequest(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed")
  const auth = req.headers.authorization || ""
  const idToken = auth.startsWith("Bearer ") ? auth.substring(7) : null
  if (!idToken) return res.status(401).send("Unauthorized")

  let caller: admin.auth.DecodedIdToken
  try {
    caller = await admin.auth().verifyIdToken(idToken)
  } catch {
    return res.status(401).send("Invalid token")
  }

  const callerClaims = caller.firebase?.sign_in_provider
  // NOTE: In production, check custom claims like caller.customClaims?.role
  // Here, require 'owner' or 'founder' custom claim explicitly.
  const isElevated = (caller as any)?.role === "owner" || (caller as any)?.role === "founder"
  if (!isElevated) return res.status(403).send("Forbidden")

  const { targetUid, role } = req.body as { targetUid: string; role: Role }
  if (!targetUid || !role) return res.status(400).send("Missing params")

  await admin.auth().setCustomUserClaims(targetUid, { role })
  await db
    .collection("users")
    .doc(targetUid)
    .update({
      roles: admin.firestore.FieldValue.arrayUnion(role),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

  return res.status(200).json({ ok: true })
})

// Callable: Award coins (placeholder integrity checks)
// WARNING: Tying rewards to YouTube watch-time may violate policies.
// Keep this generic for non-incentivized actions or mini-games.
export const awardCoins = onRequest(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed")
  const auth = req.headers.authorization || ""
  const idToken = auth.startsWith("Bearer ") ? auth.substring(7) : null
  if (!idToken) return res.status(401).send("Unauthorized")

  let decoded: admin.auth.DecodedIdToken
  try {
    decoded = await admin.auth().verifyIdToken(idToken)
  } catch {
    return res.status(401).send("Invalid token")
  }

  const { amount, reason, eventId } = req.body as {
    amount: number
    reason: string
    eventId: string
  }
  if (!amount || amount <= 0 || !eventId) {
    return res.status(400).send("Invalid params")
  }

  const walletRef = db.collection("wallets").doc(decoded.uid)
  const txRef = db.collection("transactions").doc()
  const dedupeRef = db.collection("eventDedupe").doc(eventId)

  try {
    await db.runTransaction(async (tx) => {
      const dupe = await tx.get(dedupeRef)
      if (dupe.exists) throw new Error("Duplicate event")

      tx.set(dedupeRef, {
        uid: decoded.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      tx.update(walletRef, {
        coins: admin.firestore.FieldValue.increment(amount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      tx.set(txRef, {
        uid: decoded.uid,
        type: "earn",
        currency: "coins",
        amount,
        refId: eventId,
        reason,
        status: "success",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    })

    return res.status(200).json({ ok: true })
  } catch (e: any) {
    logger.error("awardCoins failed", e)
    return res.status(400).json({ ok: false, error: e.message })
  }
})

// Callable: Daily check-in reward with idempotency over a rolling day
export const dailyCheckIn = onRequest(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed")
  const auth = req.headers.authorization || ""
  const idToken = auth.startsWith("Bearer ") ? auth.substring(7) : null
  if (!idToken) return res.status(401).send("Unauthorized")

  let decoded: admin.auth.DecodedIdToken
  try {
    decoded = await admin.auth().verifyIdToken(idToken)
  } catch {
    return res.status(401).send("Invalid token")
  }

  const uid = decoded.uid
  const econRef = db.collection("users").doc(uid).collection("economy").doc("stats")
  const walletRef = db.collection("wallets").doc(uid)
  const txRef = db.collection("transactions").doc()

  const now = Date.now()
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const startMs = startOfToday.getTime()

  try {
    let rewardGranted = 0
    await db.runTransaction(async (tx) => {
      const econSnap = await tx.get(econRef)
      const econ = econSnap.exists
        ? (econSnap.data() as { lastClaimAt?: admin.firestore.Timestamp; streak?: number })
        : {}

      const lastClaim = econ.lastClaimAt?.toMillis() ?? 0
      // Already claimed today?
      if (lastClaim >= startMs) throw new Error("Already claimed")

      // Determine streak
      const claimedYesterday = lastClaim > 0 && startMs - lastClaim <= 24 * 60 * 60 * 1000 + 1000
      const newStreak = claimedYesterday ? (econ.streak ?? 0) + 1 : 1

      // Base + streak bonus (cap streak bonus)
      const base = 20
      const streakBonus = Math.min(newStreak - 1, 7) * 5
      rewardGranted = base + streakBonus

      // Update econ stats
      tx.set(
        econRef,
        {
          lastClaimAt: admin.firestore.FieldValue.serverTimestamp(),
          streak: newStreak,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )

      // Credit wallet
      tx.update(walletRef, {
        coins: admin.firestore.FieldValue.increment(rewardGranted),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      // Append transaction
      tx.set(txRef, {
        uid,
        type: "earn",
        currency: "coins",
        amount: rewardGranted,
        refId: "daily-check-in",
        reason: "daily",
        status: "success",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      // Mirror public coinsEarned counter
      tx.update(db.collection("users").doc(uid), {
        "publicStats.coinsEarned": admin.firestore.FieldValue.increment(rewardGranted),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    })

    return res.status(200).json({ ok: true, reward: rewardGranted })
  } catch (e: any) {
    return res.status(400).json({ ok: false, error: e.message })
  }
})

// Callable: Spend coins endpoint for server-authoritative deductions
export const spendCoins = onRequest(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed")
  const auth = req.headers.authorization || ""
  const idToken = auth.startsWith("Bearer ") ? auth.substring(7) : null
  if (!idToken) return res.status(401).send("Unauthorized")

  let decoded: admin.auth.DecodedIdToken
  try {
    decoded = await admin.auth().verifyIdToken(idToken)
  } catch {
    return res.status(401).send("Invalid token")
  }

  const { amount, reason, eventId } = req.body as { amount: number; reason: string; eventId: string }
  if (!amount || amount <= 0 || !eventId) return res.status(400).send("Invalid params")

  const uid = decoded.uid
  const walletRef = db.collection("wallets").doc(uid)
  const txRef = db.collection("transactions").doc()
  const dedupeRef = db.collection("eventDedupe").doc(eventId)

  try {
    await db.runTransaction(async (tx) => {
      const dupe = await tx.get(dedupeRef)
      if (dupe.exists) throw new Error("Duplicate event")

      const walletSnap = await tx.get(walletRef)
      if (!walletSnap.exists) throw new Error("Wallet missing")
      const currentCoins = (walletSnap.data()?.coins as number) ?? 0
      if (currentCoins < amount) throw new Error("Insufficient balance")

      tx.set(dedupeRef, { uid, createdAt: admin.firestore.FieldValue.serverTimestamp() })

      tx.update(walletRef, {
        coins: admin.firestore.FieldValue.increment(-amount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      tx.set(txRef, {
        uid,
        type: "spend",
        currency: "coins",
        amount,
        refId: eventId,
        reason,
        status: "success",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    })

    return res.status(200).json({ ok: true })
  } catch (e: any) {
    return res.status(400).json({ ok: false, error: e.message })
  }
})

// Callable: Award XP and auto-level-up with mirrored publicStats.level
export const awardXp = onRequest(async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed")
  const auth = req.headers.authorization || ""
  const idToken = auth.startsWith("Bearer ") ? auth.substring(7) : null
  if (!idToken) return res.status(401).send("Unauthorized")

  let decoded: admin.auth.DecodedIdToken
  try {
    decoded = await admin.auth().verifyIdToken(idToken)
  } catch {
    return res.status(401).send("Invalid token")
  }

  const { amount, eventId } = req.body as { amount: number; eventId: string }
  if (!amount || amount <= 0 || !eventId) return res.status(400).send("Invalid params")

  const uid = decoded.uid
  const userRef = db.collection("users").doc(uid)
  const txRef = db.collection("transactions").doc()
  const dedupeRef = db.collection("eventDedupe").doc(eventId)

  try {
    await db.runTransaction(async (tx) => {
      const dupe = await tx.get(dedupeRef)
      if (dupe.exists) throw new Error("Duplicate event")

      const userSnap = await tx.get(userRef)
      if (!userSnap.exists) throw new Error("User missing")
      const data = userSnap.data() as any
      const currentXp = (data?.xp as number) ?? 0
      const newXp = currentXp + amount
      const { level } = computeLevel(newXp)

      tx.set(dedupeRef, { uid, createdAt: admin.firestore.FieldValue.serverTimestamp() })

      tx.update(userRef, {
        xp: newXp,
        "publicStats.level": level,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })

      tx.set(txRef, {
        uid,
        type: "xp",
        currency: "xp",
        amount,
        refId: eventId,
        reason: "xp-award",
        status: "success",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    })

    return res.status(200).json({ ok: true })
  } catch (e: any) {
    return res.status(400).json({ ok: false, error: e.message })
  }
})

// Helper to compute level from XP
function computeLevel(xp: number) {
  // Simple progression: Level 1 at 0 XP, each level requires +100 more XP than previous.
  // Total required to reach level N is N*(N-1)/2 * 100
  let level = 1
  let neededForNext = 100
  let remaining = xp
  while (remaining >= neededForNext) {
    remaining -= neededForNext
    level += 1
    neededForNext += 100
    if (level >= 1000) break
  }
  return { level, progressToNext: remaining, nextLevelRequirement: neededForNext }
}

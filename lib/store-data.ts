// Simple in-memory store for demo; replace with Firestore/Functions in production.

export type Currency = "coins" | "gems"
export type ItemType = "consumable" | "durable" | "subscription"

export type StoreItem = {
  id: string
  name: string
  description: string
  type: ItemType
  rarity: "common" | "rare" | "epic" | "legendary"
  price: { currency: Currency; amount: number }
  badge?: string
}

export type Purchase = {
  id: string
  itemId: string
  currency: Currency
  amount: number
  createdAt: number
  status: "success" | "failed"
  entitlement: {
    kind: "grant" | "unlock" | "subscription"
    ref: string
    expiresAt?: number
  } | null
}

const items: StoreItem[] = [
  {
    id: "boost-xp-30",
    name: "XP Boost (30m)",
    description: "Increase XP gains by 2x for 30 minutes.",
    type: "consumable",
    rarity: "common",
    price: { currency: "coins", amount: 250 },
    badge: "Popular",
  },
  {
    id: "no-ads-week",
    name: "No Ads (7 days)",
    description: "Disable in-app ads for a week.",
    type: "subscription",
    rarity: "rare",
    price: { currency: "gems", amount: 40 },
  },
  {
    id: "vip-pass-month",
    name: "VIP Pass (30 days)",
    description: "Exclusive perks and skins for a month.",
    type: "subscription",
    rarity: "epic",
    price: { currency: "gems", amount: 120 },
    badge: "VIP",
  },
  {
    id: "skin-dragon",
    name: "Dragon Aura Skin",
    description: "Legendary animated aura for your profile.",
    type: "durable",
    rarity: "legendary",
    price: { currency: "gems", amount: 250 },
  },
  {
    id: "streak-protector",
    name: "Streak Protector",
    description: "Protects your daily streak once.",
    type: "consumable",
    rarity: "rare",
    price: { currency: "coins", amount: 500 },
  },
]

const purchases: Purchase[] = []

export function getItems(): StoreItem[] {
  return items
}

export function getPurchases() {
  return purchases
}

export function createPurchase(input: {
  itemId: string
  currency: Currency
}): Purchase | { error: string } {
  const item = items.find((i) => i.id === input.itemId)
  if (!item) return { error: "Item not found" }

  if (item.price.currency !== input.currency) {
    return { error: "This item requires a different currency" }
  }

  // Demo: generate entitlement based on item type
  const now = Date.now()
  const purchaseId = `${item.id}-${now}`
  let entitlement: Purchase["entitlement"] = null

  if (item.type === "consumable") {
    entitlement = { kind: "grant", ref: `grant:${item.id}` }
  } else if (item.type === "durable") {
    entitlement = { kind: "unlock", ref: `unlock:${item.id}` }
  } else if (item.type === "subscription") {
    // 30 days default unless item specifies otherwise via id
    const days = item.id.includes("week") ? 7 : 30
    entitlement = {
      kind: "subscription",
      ref: `sub:${item.id}`,
      expiresAt: now + days * 24 * 60 * 60 * 1000,
    }
  }

  const p: Purchase = {
    id: purchaseId,
    itemId: item.id,
    currency: input.currency,
    amount: item.price.amount,
    createdAt: now,
    status: "success",
    entitlement,
  }
  purchases.push(p)
  return p
}

export type CouponResult =
  | { ok: true; reward: { currency?: Currency; amount?: number; unlockItemId?: string; vipDays?: number } }
  | { ok: false; error: string }

// Simple in-memory idempotency and rate limiting for coupons (demo-only).
// Keyed by `${code}:${ip}` for 10 minutes.
const couponKeyTs = new Map<string, number>()
const TEN_MIN = 10 * 60 * 1000

export function redeemCoupon(code: string): CouponResult {
  const normalized = code.trim().toUpperCase()
  // Demo coupon logic
  if (normalized === "NINJA10") {
    return { ok: true, reward: { currency: "coins", amount: 10 } }
  }
  if (normalized === "GEMS25") {
    return { ok: true, reward: { currency: "gems", amount: 25 } }
  }
  if (normalized === "VIPPASS") {
    return { ok: true, reward: { vipDays: 7 } }
  }
  if (normalized === "DRAGON") {
    return { ok: true, reward: { unlockItemId: "skin-dragon" } }
  }
  return { ok: false, error: "Invalid or expired coupon" }
}

export function redeemCouponWithIdempotency(code: string, ip: string | null) {
  const key = `${code.trim().toUpperCase()}:${ip ?? "unknown"}`
  const now = Date.now()
  const last = couponKeyTs.get(key)
  if (last && now - last < TEN_MIN) {
    return { ok: false as const, error: "Coupon already used recently. Try again later." }
  }
  const res = redeemCoupon(code)
  if (!res.ok) return res
  couponKeyTs.set(key, now)
  return res
}

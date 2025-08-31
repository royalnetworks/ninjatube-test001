// In-memory promotion store for demo purposes.
// NOTE: This resets on server reload. Replace with Firestore/DB in production.

export type Promotion = {
  id: string
  ownerUid: string | null
  platform: "youtube" | "twitch" | "kick" | "rumble"
  videoId: string
  title: string
  tags: string[]
  startAt: number // ms epoch
  endAt: number // ms epoch
  priority: number // 1=normal, 2=vip, 3=premium
  status: "active" | "expired"
  metrics: {
    impressions: number
    clicks: number
  }
}

const promotions: Promotion[] = []

export function rankPromotions(list: Promotion[], now = Date.now()): Promotion[] {
  const active = list.filter((p) => p.status === "active" && p.startAt <= now && p.endAt > now)
  // Higher priority first, then more recent start time
  return active.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    return b.startAt - a.startAt
  })
}

export function getActivePromotions(): Promotion[] {
  return rankPromotions(promotions, Date.now())
}

export function addPromotion(p: Promotion): Promotion {
  promotions.push(p)
  return p
}

export function expireOld(now = Date.now()) {
  for (const p of promotions) {
    if (p.status === "active" && p.endAt <= now) {
      p.status = "expired"
    }
  }
}

export function toThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export const PromotionsStore = {
  list: () => promotions.slice(),
  add: addPromotion,
  active: getActivePromotions,
  expire: expireOld,
  rank: rankPromotions,
}

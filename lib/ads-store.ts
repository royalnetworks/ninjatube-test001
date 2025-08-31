// In-memory Ad Store for demo. Replace with Firestore/Functions in production.

export type AdType = "image" | "video" | "html"
export type Placement = "homepage" | "feed" | "dojo" | "watch" | "leaderboard" | "profile"

export type Ad = {
  id: string
  title: string
  description?: string
  type: AdType
  // For image ads
  imageUrl?: string
  ctaLabel?: string
  ctaUrl?: string

  // For video ads
  videoUrl?: string // mp4/webm
  reward?: { type: "coins" | "xp" | "gems"; amount: number } | null

  // For HTML ads
  html?: string // will be rendered inside sandboxed iframe via srcDoc

  placements: Placement[]
  category?: string
  target: {
    minLevel?: number
    region?: string
    device?: "mobile" | "desktop"
  }
  schedule: {
    startAt: number // ms epoch
    endAt: number // ms epoch
  }
  frequencyCapPerDay: number // impressions per user/IP per day
  createdAt: number
  metrics: {
    impressions: number
    clicks: number
    completions: number
  }
}

const ads: Ad[] = []

// Simple per-IP frequency cap memory store: {`${adId}:${YYYY-MM-DD}:${ip}`: count}
const freqMap = new Map<string, number>()

// Impressions log (demo). In production, write to Firestore/BigQuery.
export type AdEvent = {
  id: string
  adId: string
  placement: Placement
  type: "impression" | "click" | "completion"
  ip?: string | null
  createdAt: number
}
const events: AdEvent[] = []

export function listAds() {
  return ads
}

export function createAd(input: Omit<Ad, "id" | "createdAt" | "metrics">) {
  const id = `ad_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const ad: Ad = {
    id,
    createdAt: Date.now(),
    metrics: { impressions: 0, clicks: 0, completions: 0 },
    ...input,
  }
  ads.push(ad)
  return ad
}

export function recordEvent(ev: Omit<AdEvent, "id" | "createdAt">) {
  const rec: AdEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    ...ev,
  }
  events.push(rec)
  const ad = ads.find((a) => a.id === ev.adId)
  if (ad) {
    if (ev.type === "impression") ad.metrics.impressions++
    if (ev.type === "click") ad.metrics.clicks++
    if (ev.type === "completion") ad.metrics.completions++
  }
  return rec
}

function dateKey(ts: number) {
  const d = new Date(ts)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function ipKey(adId: string, ip: string | null | undefined, now: number) {
  return `${adId}:${dateKey(now)}:${ip ?? "unknown"}`
}

function withinSchedule(ad: Ad, now: number) {
  return now >= ad.schedule.startAt && now < ad.schedule.endAt
}

// Basic targeting: placement match, schedule, and device hint.
export function chooseAd(args: {
  placement: Placement
  ip?: string | null
  device?: "mobile" | "desktop"
}): Ad | null {
  const now = Date.now()
  const candidates = ads.filter((a) => a.placements.includes(args.placement) && withinSchedule(a, now))

  for (const ad of candidates) {
    // Device targeting check (optional)
    if (ad.target.device && args.device && ad.target.device !== args.device) continue

    // Frequency cap check per IP/day
    const key = ipKey(ad.id, args.ip, now)
    const count = freqMap.get(key) ?? 0
    if (count >= ad.frequencyCapPerDay) {
      continue
    }

    // Accept this ad; increment cap counter
    freqMap.set(key, count + 1)
    return ad
  }
  return null
}

export const AdsStore = {
  list: listAds,
  create: createAd,
  recordEvent,
  choose: chooseAd,
}

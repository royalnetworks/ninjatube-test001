import { NextResponse } from "next/server"
import { addPromotion, expireOld, getActivePromotions } from "@/lib/promotions-store"
import { extractYouTubeVideoId } from "@/lib/validation"

type PostBody = {
  url: string
  title?: string
  tags?: string[]
  durationMinutes?: number
  priority?: number
  platform?: "youtube" | "twitch" | "kick" | "rumble"
}

export async function GET() {
  expireOld()
  const items = getActivePromotions()
  return NextResponse.json({ items }, { status: 200 })
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PostBody
    const platform = (body.platform || "youtube") as PostBody["platform"]
    let videoId = ""
    if (platform === "youtube") {
      videoId = extractYouTubeVideoId(body.url || "") || ""
      if (!videoId) {
        return NextResponse.json({ error: "Invalid YouTube URL or ID." }, { status: 400 })
      }
    } else {
      // For non-YouTube platforms, store a minimal identifier:
      // - if a full URL is provided, try to store the path after domain; otherwise store as-is
      try {
        const u = new URL(body.url || "")
        // e.g. twitch.tv/{path...} → "{path...}"
        videoId = u.hostname.replace(/^www\./, "") + u.pathname
      } catch {
        // fallback to raw
        videoId = (body.url || "").trim()
      }
      if (!videoId) {
        return NextResponse.json({ error: "Invalid URL." }, { status: 400 })
      }
    }
    const durationMinutes = Math.min(Math.max(body.durationMinutes ?? 30, 1), 120)
    const priority = Math.min(Math.max(body.priority ?? 1, 1), 3)
    const now = Date.now()
    const endAt = now + durationMinutes * 60 * 1000

    const id = `${videoId}-${now}`
    const tags = (body.tags ?? []).map((t) => t.trim()).filter(Boolean)

    const promo = addPromotion({
      id,
      ownerUid: null, // Replace with authenticated UID when auth is wired
      platform,
      videoId,
      title: (body.title || "").trim().slice(0, 140),
      tags,
      startAt: now,
      endAt,
      priority,
      status: "active",
      metrics: { impressions: 0, clicks: 0 },
    })

    return NextResponse.json({ item: promo }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }
}

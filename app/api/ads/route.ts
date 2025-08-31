// GET = ad decision per placement; POST = create ad (admin stub)
import { NextResponse } from "next/server"
import { type Ad, type Placement, chooseAd, createAd } from "@/lib/ads-store"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const placement = (searchParams.get("placement") || "homepage") as Placement
  const ua = req.headers.get("user-agent") || ""
  const isMobile = /Mobi|Android/i.test(ua)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || (req as any).ip || null

  const ad = chooseAd({
    placement,
    device: isMobile ? "mobile" : "desktop",
    ip: typeof ip === "string" ? ip : null,
  })
  if (!ad) return NextResponse.json({ ad: null })
  return NextResponse.json({ ad })
}

export async function POST(req: Request) {
  // NOTE: In production, restrict to admin via auth/role check.
  try {
    const body = (await req.json()) as Partial<Ad> & {
      schedule?: { startAt?: number; endAt?: number }
    }
    if (!body?.type || !body?.placements?.length || !body?.schedule) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const startAt = Number(body.schedule.startAt ?? Date.now())
    const endAt = Number(body.schedule.endAt ?? Date.now() + 60 * 60 * 1000)
    if (Number.isNaN(startAt) || Number.isNaN(endAt) || endAt <= startAt) {
      return NextResponse.json({ error: "Invalid schedule" }, { status: 400 })
    }
    const ad = createAd({
      title: body.title || "Untitled Ad",
      description: body.description || "",
      type: body.type,
      imageUrl: body.imageUrl,
      videoUrl: body.videoUrl,
      ctaLabel: body.ctaLabel,
      ctaUrl: body.ctaUrl,
      html: body.html,
      placements: body.placements,
      category: body.category,
      target: body.target || {},
      schedule: { startAt, endAt },
      frequencyCapPerDay: Math.max(1, Math.min(10, Number(body.frequencyCapPerDay ?? 3))),
      reward: body.reward ?? null,
    } as any)
    return NextResponse.json({ ad }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

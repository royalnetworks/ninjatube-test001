import { type NextRequest, NextResponse } from "next/server"
import { limiter } from "@/lib/rate-limit"

// Simple in-memory idempotency store for demo
const claimed = new Set<string>()

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1"
  const limited = limiter.take(`earn:${ip}`, { intervalMs: 60_000, max: 5 })
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const body = (await req.json().catch(() => null)) as { eventId?: string; secondsWatched?: number } | null
  if (!body?.eventId || typeof body?.secondsWatched !== "number") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }
  if (claimed.has(body.eventId)) {
    return NextResponse.json({ error: "Already claimed" }, { status: 409 })
  }
  // Demo-only gating
  const secs = Math.max(0, Math.floor(body.secondsWatched || 0))
  if (secs < 30) {
    return NextResponse.json({ error: "Watch at least 30 seconds" }, { status: 400 })
  }

  // Reward curve (demo)
  const coins = Math.min(50, 10 + Math.floor(secs / 15) * 5)
  claimed.add(body.eventId)

  return NextResponse.json({ coins })
}

// Logs ad impressions/clicks/completions
import { NextResponse } from "next/server"
import { type Placement, recordEvent } from "@/lib/ads-store"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      adId?: string
      placement?: Placement
      type?: "impression" | "click" | "completion"
    }
    if (!body?.adId || !body?.placement || !body?.type) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      (req as any).ip ||
      null
    const rec = recordEvent({ adId: body.adId, placement: body.placement, type: body.type, ip })
    return NextResponse.json({ ok: true, event: rec })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

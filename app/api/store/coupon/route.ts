import { NextResponse } from "next/server"
import { redeemCouponWithIdempotency } from "@/lib/store-data"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { code?: string }
    const code = body?.code?.trim()
    if (!code) return NextResponse.json({ error: "Missing coupon code" }, { status: 400 })
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      // Not ideal, but keeps demo functional:
      (req as any).ip ||
      null
    const res = redeemCouponWithIdempotency(code, typeof ip === "string" ? ip : null)
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 })
    return NextResponse.json({ reward: res.reward })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

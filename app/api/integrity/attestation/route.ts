import { NextResponse } from "next/server"
import { enforceRateLimit } from "@/lib/rate-limit"

type AttestBody = {
  token?: string
  platform?: "android" | "ios" | "web"
  nonce?: string
}

export async function POST(req: Request) {
  const rl = await enforceRateLimit(req, { key: "integrity:attest", limit: 10, windowMs: 60_000 })
  if (!rl.ok) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })
  }

  try {
    const body = (await req.json()) as AttestBody
    const platform = body.platform || "web"

    if (!["android", "ios", "web"].includes(platform)) {
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 })
    }

    // Demo scoring heuristic (stub): prefer long-ish tokens for mobile, allow tokenless for web
    let score = 50
    if (platform === "web") {
      score = 60 // web demo score
    } else {
      const len = body.token?.length ?? 0
      score = len > 40 ? 85 : len > 20 ? 70 : 25
    }

    return NextResponse.json({
      ok: true,
      status: "stubbed",
      platform,
      score,
      nonce: body.nonce ?? null,
      receivedToken: Boolean(body.token),
      message:
        "Demo attestation accepted. For production, verify tokens with Play Integrity (Android) or DeviceCheck/App Attest (iOS).",
    })
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
}

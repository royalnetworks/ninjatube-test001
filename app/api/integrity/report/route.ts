import { NextResponse } from "next/server"
import { enforceRateLimit } from "@/lib/rate-limit"
import { IntegrityStore, type IntegritySignals } from "@/lib/integrity-store"

export async function POST(req: Request) {
  const rl = await enforceRateLimit(req, { key: "integrity:report", limit: 6, windowMs: 60_000 })
  if (!rl.ok) return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })

  try {
    const body = (await req.json()) as IntegritySignals
    const saved = IntegrityStore.add(body)
    return NextResponse.json({ ok: true, score: saved.score })
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
}

export async function GET(req: Request) {
  // simple list for debugging (also rate limited)
  const rl = await enforceRateLimit(req, { key: "integrity:list", limit: 30, windowMs: 60_000 })
  if (!rl.ok) return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })

  return NextResponse.json({ reports: IntegrityStore.list() })
}

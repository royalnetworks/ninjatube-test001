import { NextResponse } from "next/server"
import { PresenceStore } from "@/lib/presence-store"
import { enforceRateLimit } from "@/lib/rate-limit"

export async function GET(req: Request) {
  const rl = await enforceRateLimit(req, { key: "presence:get", limit: 60, windowMs: 60_000 })
  if (!rl.ok) return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })
  return NextResponse.json({ count: PresenceStore.count(), list: PresenceStore.list() })
}

export async function POST(req: Request) {
  const rl = await enforceRateLimit(req, { key: "presence:post", limit: 120, windowMs: 60_000 })
  if (!rl.ok) return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })
  try {
    const { uid } = (await req.json()) as { uid: string }
    if (!uid) return NextResponse.json({ error: "Bad Request" }, { status: 400 })
    const res = PresenceStore.heartbeat(uid)
    return NextResponse.json({ ok: true, ...res })
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
}

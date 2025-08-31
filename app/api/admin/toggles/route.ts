import { NextResponse } from "next/server"
import { TogglesStore, type ToggleKey } from "@/lib/toggles-store"
import { enforceRateLimit } from "@/lib/rate-limit"

export async function GET(request: Request) {
  const rl = await enforceRateLimit(request, { key: "admin:toggles:get", limit: 60, windowMs: 60_000 })
  if (!("ok" in rl) || rl.ok === false)
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })

  return NextResponse.json({ toggles: TogglesStore.getAll() })
}

export async function POST(request: Request) {
  const rl = await enforceRateLimit(request, { key: "admin:toggles:post", limit: 30, windowMs: 60_000 })
  if (!("ok" in rl) || rl.ok === false)
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })

  try {
    const body = await request.json()
    const { key, value } = body as { key: ToggleKey; value: boolean }
    if (!key || typeof value !== "boolean") return NextResponse.json({ error: "Bad Request" }, { status: 400 })
    const res = TogglesStore.set(key, value)
    return NextResponse.json({ updated: res })
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
}

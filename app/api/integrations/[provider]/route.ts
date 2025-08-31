import { NextResponse } from "next/server"
import { IntegrationsStore, type Provider } from "@/lib/integrations-store"
import { enforceRateLimit } from "@/lib/rate-limit"

export async function GET(req: Request, { params }: { params: { provider: string } }) {
  const rl = await enforceRateLimit(req, { key: "integrations:get", limit: 60, windowMs: 60_000 })
  if (!rl.ok) return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })

  const { searchParams } = new URL(req.url)
  const uid = searchParams.get("uid") || "guest"
  const provider = params.provider as Provider
  return NextResponse.json({ accounts: IntegrationsStore.list(uid).filter((a) => a.provider === provider) })
}

export async function POST(req: Request, { params }: { params: { provider: string } }) {
  const rl = await enforceRateLimit(req, { key: "integrations:post", limit: 20, windowMs: 60_000 })
  if (!rl.ok) return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })

  try {
    const body = (await req.json()) as { uid?: string; handle?: string; action?: "link" | "unlink" }
    const uid = body.uid || "guest"
    const provider = params.provider as Provider
    if (body.action === "unlink") {
      IntegrationsStore.unlink(uid, provider)
      return NextResponse.json({ ok: true })
    }
    if (!body.handle) return NextResponse.json({ error: "Bad Request" }, { status: 400 })
    const entry = IntegrationsStore.link(uid, provider, body.handle)
    return NextResponse.json({ account: entry }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
}

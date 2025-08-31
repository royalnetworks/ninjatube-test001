import { NextResponse } from "next/server"
import { TicketsStore, type TicketSeverity, type TicketStatus } from "@/lib/tickets-store"
import { enforceRateLimit } from "@/lib/rate-limit"

export async function GET(request: Request) {
  const rl = await enforceRateLimit(request, { key: "tickets:get", limit: 60, windowMs: 60_000 })
  if (!("ok" in rl) || rl.ok === false)
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") as TicketStatus | null
  const data = TicketsStore.list(status ?? undefined)
  return NextResponse.json({ tickets: data })
}

export async function POST(request: Request) {
  const rl = await enforceRateLimit(request, { key: "tickets:post", limit: 5, windowMs: 60_000 })
  if (!("ok" in rl) || rl.ok === false)
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })

  try {
    const body = await request.json()
    const { uid, subject, message, category, severity } = body as {
      uid?: string
      subject: string
      message: string
      category: string
      severity: TicketSeverity
    }
    if (!subject || !message || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const sev: TicketSeverity = ["low", "medium", "high"].includes(severity) ? severity : "low"
    const t = TicketsStore.create({ uid, subject, message, category, severity: sev })
    return NextResponse.json({ ticket: t }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
}

import { NextResponse } from "next/server"
import { TicketsStore, type TicketRole, type TicketStatus } from "@/lib/tickets-store"
import { enforceRateLimit } from "@/lib/rate-limit"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const rl = await enforceRateLimit(req, { key: "tickets:patch", limit: 20, windowMs: 60_000 })
  if (!("ok" in rl) || rl.ok === false)
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })

  const id = params.id
  try {
    const body = await req.json()
    const { status, assignedRole, reply, by } = body as {
      status?: TicketStatus
      assignedRole?: TicketRole
      reply?: string
      by?: string
    }
    const updated = TicketsStore.update(id, { status, assignedRole, reply, by })
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ticket: updated })
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
}

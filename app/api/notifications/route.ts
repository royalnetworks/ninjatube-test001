import { NextResponse } from "next/server"
import { enforceRateLimit } from "@/lib/rate-limit"

interface Note {
  id: string
  message: string
  createdAt: number
}
let notes: Note[] = []
const genId = () => Math.random().toString(36).slice(2, 10)

export async function GET(req: Request) {
  const rl = await enforceRateLimit(req, { key: "notes:get", limit: 120, windowMs: 60_000 })
  if (!rl.ok) return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })
  return NextResponse.json({ notifications: notes.slice(0, 10) })
}

export async function POST(req: Request) {
  const rl = await enforceRateLimit(req, { key: "notes:post", limit: 10, windowMs: 60_000 })
  if (!rl.ok) return NextResponse.json({ error: "Too Many Requests" }, { status: 429, headers: rl.headers })
  try {
    const { message } = (await req.json()) as { message: string }
    if (!message) return NextResponse.json({ error: "Bad Request" }, { status: 400 })
    const n: Note = { id: genId(), message, createdAt: Date.now() }
    notes.unshift(n)
    notes = notes.slice(0, 100)
    return NextResponse.json({ ok: true, notification: n }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
}

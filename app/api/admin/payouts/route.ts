import { NextResponse } from "next/server"
import { PayoutsStore, type PayoutStatus } from "@/lib/payouts-store"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") as PayoutStatus | null
  return NextResponse.json({ payouts: PayoutsStore.list(status ?? undefined) })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { uid, upiId, amountINR } = body as { uid: string; upiId: string; amountINR: number }
    if (!uid || !upiId || !amountINR || amountINR <= 0)
      return NextResponse.json({ error: "Bad Request" }, { status: 400 })
    const p = PayoutsStore.create(uid, upiId, amountINR)
    return NextResponse.json({ payout: p }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body as { id: string; status: PayoutStatus }
    if (!id || !status) return NextResponse.json({ error: "Bad Request" }, { status: 400 })
    const updated = PayoutsStore.update(id, { status })
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ payout: updated })
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
}

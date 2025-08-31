// Confirms a donation record (demo). In production, this happens via gateway webhook verification.
import { NextResponse } from "next/server"
import { markDonationReceived } from "@/lib/donations-store"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { donationId?: string }
    const id = body?.donationId
    if (!id) return NextResponse.json({ error: "Missing donationId" }, { status: 400 })
    const rec = markDonationReceived(id)
    if (!rec) return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    return NextResponse.json({ ok: true, donation: rec })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

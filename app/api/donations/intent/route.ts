// Generates a UPI intent deep link for donations (demo).
// In production, use a PSP/gateway to create orders and verify payment webhooks.

import { NextResponse } from "next/server"
import { createDonationRecord } from "@/lib/donations-store"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { amount?: number; donorName?: string; note?: string }
    const amount = Number(body?.amount ?? 0)
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    const donorName = (body?.donorName || "Anonymous").slice(0, 60)
    const note = (body?.note || "Ninja Tube Donation").slice(0, 120)

    const pa = process.env.UPI_ID || "demo@upi" // Configure UPI_ID in project settings
    const pn = encodeURIComponent("Ninja Tube")
    const am = encodeURIComponent(amount.toFixed(2))
    const tn = encodeURIComponent(note)
    const cu = "INR"
    const link = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&tn=${tn}&cu=${cu}`

    // Create a pending record (demo); mark received via /confirm stub.
    const rec = createDonationRecord({
      donorName,
      amount,
      currency: "INR",
      method: "upi",
      status: "pending",
      note,
      txnId: null,
    })

    return NextResponse.json({ link, donationId: rec.id })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

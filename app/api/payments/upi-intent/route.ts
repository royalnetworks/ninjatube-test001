import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { amount?: number; note?: string; payeeName?: string }
    const amount = Number(body?.amount ?? 0)
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    const pa = process.env.UPI_ID || "demo@upi" // Configure this in Project Settings
    const pn = encodeURIComponent(body?.payeeName || "Ninja Tube")
    const am = encodeURIComponent(amount.toFixed(2))
    const tn = encodeURIComponent(body?.note || "Ninja Tube Top-up")
    const cu = "INR"
    const link = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&tn=${tn}&cu=${cu}`
    return NextResponse.json({ link })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

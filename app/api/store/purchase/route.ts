import { NextResponse } from "next/server"
import { createPurchase } from "@/lib/store-data"

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { itemId?: string; currency?: "coins" | "gems" }
    if (!body?.itemId || !body?.currency) {
      return NextResponse.json({ error: "Missing itemId or currency" }, { status: 400 })
    }
    const result = createPurchase({ itemId: body.itemId, currency: body.currency })
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ purchase: result })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

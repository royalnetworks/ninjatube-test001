import { NextResponse } from "next/server"
import { getItems } from "@/lib/store-data"

export async function GET() {
  const items = getItems()
  return NextResponse.json({ items })
}

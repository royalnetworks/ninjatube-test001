import { NextResponse } from "next/server"
import { RolesStore, type AppRole } from "@/lib/roles-store"

export async function GET() {
  return NextResponse.json({ roles: RolesStore.list() })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { uid, role } = body as { uid: string; role: AppRole }
    if (!uid || !role) return NextResponse.json({ error: "Bad Request" }, { status: 400 })
    const updated = RolesStore.set(uid, role)
    return NextResponse.json({ role: updated })
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
}

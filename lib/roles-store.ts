export type AppRole =
  | "Viewer"
  | "Creator"
  | "VIP"
  | "Partner"
  | "Admin"
  | "Supervisor"
  | "Manager"
  | "Owner"
  | "Founder"

export interface RoleEntry {
  uid: string
  role: AppRole
  updatedAt: number
}

let roles: RoleEntry[] = []

export const RolesStore = {
  list: () => roles.slice().sort((a, b) => b.updatedAt - a.updatedAt),
  set: (uid: string, role: AppRole) => {
    const now = Date.now()
    const idx = roles.findIndex((r) => r.uid === uid)
    if (idx >= 0) roles[idx] = { uid, role, updatedAt: now }
    else roles.unshift({ uid, role, updatedAt: now })
    return { uid, role, updatedAt: now }
  },
  remove: (uid: string) => {
    roles = roles.filter((r) => r.uid !== uid)
    return true
  },
}

import { RolesManager } from "@/components/roles-manager"

export default function AdminRolesPage() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Roles</h1>
        <p className="text-sm text-muted-foreground">Assign roles to users (demo-only, in-memory).</p>
      </header>
      <RolesManager />
    </main>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminHome() {
  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Manage tickets, toggles, donations, and payouts.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Tickets" desc="View and triage support tickets" href="/admin/tickets" />
        <SectionCard title="Toggles" desc="Control app-wide feature toggles" href="/admin/toggles" />
        <SectionCard title="Donations" desc="View donation logs (demo)" href="/admin/donations" />
        <SectionCard title="Payouts" desc="Manage withdrawals (coming soon)" href="/admin/payouts" />
        <SectionCard title="Roles" desc="Assign roles to users" href="/admin/roles" />
        <SectionCard title="Analytics" desc="Overview of key metrics" href="/admin/analytics" />
      </div>
    </main>
  )
}

function SectionCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <div className="border rounded-md p-4 space-y-3">
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <Button asChild>
        <Link href={href}>Open</Link>
      </Button>
    </div>
  )
}

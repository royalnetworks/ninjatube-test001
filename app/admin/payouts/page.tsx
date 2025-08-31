import { PayoutsTable } from "@/components/payouts-table"

export default function AdminPayoutsPage() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Payouts</h1>
        <p className="text-sm text-muted-foreground">Approve or reject payout requests (demo-only).</p>
      </header>
      <PayoutsTable />
    </main>
  )
}

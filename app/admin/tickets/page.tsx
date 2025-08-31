import { TicketsTable } from "@/components/tickets-table"

export default function AdminTicketsPage() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <p className="text-sm text-muted-foreground">Filter, assign, and reply to support tickets.</p>
      </header>
      <TicketsTable />
    </main>
  )
}

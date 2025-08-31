import { TicketComposer } from "@/components/ticket-composer"

export default function SupportPage() {
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-balance">Support & Tickets</h1>
        <p className="text-sm text-muted-foreground">
          Submit an issue, request a feature, or ask for help. Our team will respond soon.
        </p>
      </header>
      <TicketComposer />
    </main>
  )
}

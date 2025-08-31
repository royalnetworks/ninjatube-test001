import { IntegrationCard } from "@/components/integration-card"

export default function IntegrationsPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Cross-Platform Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Link your streaming accounts to enable promotion slots. This demo uses in-memory linking.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        <IntegrationCard provider="twitch" label="Twitch" />
        <IntegrationCard provider="kick" label="Kick" />
        <IntegrationCard provider="rumble" label="Rumble" />
      </div>
    </main>
  )
}

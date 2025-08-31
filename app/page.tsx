import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Page() {
  return (
    <main className="min-h-dvh w-full">
      <section className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-balance text-3xl font-semibold tracking-tight">Ninja Tube – Dev Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            This is a minimal web preview to verify the project builds and renders. Mobile app code (Expo) and Firebase
            Functions live in the repository but are not executed here.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>Milestones overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Auth & Profiles</span>
                <span className="text-emerald-600 dark:text-emerald-400">Done</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Economy Core</span>
                <span className="text-emerald-600 dark:text-emerald-400">Done</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Promotion Directory</span>
                <span className="text-emerald-600 dark:text-emerald-400">Done</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Store & Payments</span>
                <span className="text-emerald-600 dark:text-emerald-400">Done</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Ad Container</span>
                <span className="text-emerald-600 dark:text-emerald-400">Done</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Donations System</span>
                <span className="text-emerald-600 dark:text-emerald-400">Done</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Admin & Support</span>
                <span className="text-emerald-600 dark:text-emerald-400">Done</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Integrity & Anti-Abuse</span>
                <span className="text-muted-foreground">In progress</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Analytics & Presence</span>
                <span className="text-muted-foreground">Todo</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Cross-Platform Integrations</span>
                <span className="text-emerald-600 dark:text-emerald-400">Done</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next steps</CardTitle>
              <CardDescription>What I’ll implement next</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <ul className="list-disc pl-5 space-y-1">
                <li>Integrity & Anti-abuse stubs (attestation, rate limits)</li>
                <li>Analytics & Presence (dashboards, leaderboards)</li>
              </ul>
              <div className="pt-2 flex items-center gap-2">
                <Button asChild>
                  <a href="https://v0.dev" target="_blank" rel="noreferrer">
                    Open preview
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/promotions">Go to Promotion Directory</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/store">Go to Store</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/ads">Go to Ads</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/donations">Go to Donations</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/support">Support</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/admin">Admin</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/integrations">Integrations</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}

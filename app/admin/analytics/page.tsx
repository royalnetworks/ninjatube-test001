"use client"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function AdminAnalyticsPage() {
  const { data: summary } = useSWR("/api/analytics/summary", fetcher)
  const { data: lb } = useSWR("/api/leaderboards", fetcher)

  const s = summary || {}
  const donors = lb?.topDonors || []

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground">High-level metrics (demo, aggregated from in-memory endpoints).</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Tickets" value={s.tickets ?? 0} />
        <MetricCard label="Promotions" value={s.promotions ?? 0} />
        <MetricCard label="Donations" value={s.donations ?? 0} />
        <MetricCard label="Donation Total (₹)" value={s.donationTotal ?? 0} />
        <MetricCard label="Ads" value={s.ads ?? 0} />
        <MetricCard label="Ad Impressions" value={s.adImpressions ?? 0} />
        <MetricCard label="Ad Clicks" value={s.adClicks ?? 0} />
        <MetricCard label="Integrity Reports" value={s.integrityReports ?? 0} />
        <MetricCard label="Online Now" value={s.onlineCount ?? 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2">
              {donors.length === 0 && <li className="text-muted-foreground">No donations yet</li>}
              {donors.map((d: any) => (
                <li key={d.uid} className="flex items-center justify-between">
                  <span>{d.uid}</span>
                  <span className="font-medium">₹{d.totalINR}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        {/* Placeholder for future leaderboards (e.g., top viewers, promoters) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Leaderboards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">More leaderboards coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}

"use client"
import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const fetcher = (url: string) => fetch(url).then((r) => r.json())
async function setToggle(url: string, { arg }: { arg: { key: string; value: boolean } }) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(arg),
  })
  if (!res.ok) throw new Error("Failed to update")
  return res.json()
}

export default function AdminTogglesPage() {
  const { data, mutate } = useSWR("/api/admin/toggles", fetcher)
  const { trigger } = useSWRMutation("/api/admin/toggles", setToggle)
  const t = data?.toggles || {}

  const onToggle = async (key: string, value: boolean) => {
    await trigger({ key, value })
    mutate()
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Feature Toggles</h1>
        <p className="text-sm text-muted-foreground">Control global features (demo only).</p>
      </header>
      <div className="space-y-4">
        <ToggleRow
          label="Weekend Double Bonus"
          value={!!t.weekendDoubleBonus}
          onChange={(v) => onToggle("weekendDoubleBonus", v)}
        />
        <ToggleRow label="Store Open" value={!!t.storeOpen} onChange={(v) => onToggle("storeOpen", v)} />
        <ToggleRow
          label="Ad Rewards Enabled"
          value={!!t.adRewardsEnabled}
          onChange={(v) => onToggle("adRewardsEnabled", v)}
        />
      </div>
    </main>
  )
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between border rounded-md p-4">
      <Label className="text-sm">{label}</Label>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  )
}

"use client"

import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

type Item = {
  id: string
  name: string
  description: string
  type: "consumable" | "durable" | "subscription"
  rarity: "common" | "rare" | "epic" | "legendary"
  price: { currency: "coins" | "gems"; amount: number }
  badge?: string
}

type ItemsResp = { items: Item[] }

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<ItemsResp>)
const poster = (url: string, { arg }: { arg: any }) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(arg) }).then((r) =>
    r.json(),
  )

function rarityColor(r: Item["rarity"]) {
  switch (r) {
    case "legendary":
      return "bg-amber-500/15 text-amber-700 border-amber-300"
    case "epic":
      return "bg-fuchsia-500/15 text-fuchsia-700 border-fuchsia-300"
    case "rare":
      return "bg-sky-500/15 text-sky-700 border-sky-300"
    default:
      return "bg-slate-100 text-slate-700 border-slate-300"
  }
}

export function StoreList() {
  const { data, isLoading } = useSWR<ItemsResp>("/api/store/items", fetcher, { refreshInterval: 30000 })
  const { toast } = useToast()
  const [currency, setCurrency] = useState<"coins" | "gems">("coins")

  const { trigger, isMutating } = useSWRMutation("/api/store/purchase", poster)

  async function buy(item: Item) {
    try {
      const res = await trigger({ itemId: item.id, currency })
      if (res?.error) {
        toast({ title: "Purchase failed", description: res.error })
        return
      }
      toast({
        title: "Purchase successful",
        description:
          res?.purchase?.entitlement?.kind === "subscription"
            ? `Subscribed: ${item.name}`
            : res?.purchase?.entitlement?.kind === "unlock"
              ? `Unlocked: ${item.name}`
              : `Granted: ${item.name}`,
      })
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message })
    }
  }

  if (isLoading) return <div className="text-sm text-slate-500">Loading store...</div>

  const items = data?.items ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border p-4">
        <div className="mb-2 text-sm font-medium">Choose payment currency</div>
        <RadioGroup
          value={currency}
          onValueChange={(v) => setCurrency(v as "coins" | "gems")}
          className="grid grid-cols-2 gap-3"
        >
          <div className="flex items-center space-x-2 rounded-md border p-3">
            <RadioGroupItem value="coins" id="coins" />
            <Label htmlFor="coins">Coins</Label>
          </div>
          <div className="flex items-center space-x-2 rounded-md border p-3">
            <RadioGroupItem value="gems" id="gems" />
            <Label htmlFor="gems">Gems</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {items.map((it) => (
          <Card key={it.id} className="flex flex-col">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{it.name}</CardTitle>
                {it.badge ? <Badge variant="secondary">{it.badge}</Badge> : null}
              </div>
              <CardDescription className="text-xs">{it.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto space-y-3">
              <div className="flex items-center justify-between text-sm">
                <Badge className={`border ${rarityColor(it.rarity)}`}>{it.rarity}</Badge>
                <span className="font-medium">
                  {it.price.amount} {it.price.currency === "coins" ? "Coins" : "Gems"}
                </span>
              </div>
              <Button onClick={() => buy(it)} disabled={isMutating}>
                {isMutating ? "Processing..." : "Buy"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

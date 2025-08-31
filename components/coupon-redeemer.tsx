"use client"

import { useState } from "react"
import useSWRMutation from "swr/mutation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const poster = (url: string, { arg }: { arg: any }) =>
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(arg) }).then((r) =>
    r.json(),
  )

export function CouponRedeemer() {
  const [code, setCode] = useState("")
  const { toast } = useToast()
  const { trigger, isMutating } = useSWRMutation("/api/store/coupon", poster)

  async function redeem() {
    try {
      const res = await trigger({ code })
      if (res?.error) {
        toast({ title: "Coupon failed", description: res.error })
        return
      }
      const reward = res?.reward
      let desc = "Reward applied."
      if (reward?.currency && reward?.amount) {
        desc = `+${reward.amount} ${reward.currency === "coins" ? "Coins" : "Gems"}`
      } else if (reward?.unlockItemId) {
        desc = `Unlocked item: ${reward.unlockItemId}`
      } else if (reward?.vipDays) {
        desc = `VIP granted for ${reward.vipDays} days`
      }
      toast({ title: "Coupon redeemed", description: desc })
      setCode("")
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redeem Coupon</CardTitle>
        <CardDescription>Enter a coupon code to claim rewards.</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Input
          placeholder="Enter coupon (e.g., NINJA10, GEMS25, VIPPASS, DRAGON)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Button onClick={redeem} disabled={isMutating}>
          {isMutating ? "Redeeming..." : "Redeem"}
        </Button>
      </CardContent>
    </Card>
  )
}

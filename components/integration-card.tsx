"use client"
import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const fetcher = (u: string) => fetch(u).then((r) => r.json())

export function IntegrationCard({ provider, label }: { provider: "twitch" | "kick" | "rumble"; label: string }) {
  const uid = "guest" // replace with real auth uid when available
  const { data, mutate } = useSWR(`/api/integrations/${provider}?uid=${uid}`, fetcher)
  const { trigger, isMutating } = useSWRMutation(
    `/api/integrations/${provider}`,
    async (url, { arg }: { arg: any }) => {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arg),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  )
  const linked = (data?.accounts || [])[0]
  const [handle, setHandle] = useState(linked?.handle || "")

  const link = async () => {
    await trigger({ uid, handle, action: "link" })
    setHandle("")
    mutate()
  }
  const unlink = async () => {
    await trigger({ uid, action: "unlink" })
    mutate()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {linked ? (
          <div className="flex items-center justify-between">
            <div className="text-sm">
              Linked as <span className="font-medium">{linked.handle}</span>
            </div>
            <Button variant="secondary" size="sm" onClick={unlink} disabled={isMutating}>
              Unlink
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Input placeholder="Channel handle" value={handle} onChange={(e) => setHandle(e.target.value)} />
            <Button size="sm" onClick={link} disabled={!handle || isMutating}>
              Link
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

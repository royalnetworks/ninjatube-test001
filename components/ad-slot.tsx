"use client"

import { useEffect } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"

type Placement = "homepage" | "feed" | "dojo" | "watch" | "leaderboard" | "profile"

type Ad = {
  id: string
  title: string
  description?: string
  type: "image" | "video" | "html"
  imageUrl?: string
  ctaLabel?: string
  ctaUrl?: string
  videoUrl?: string
  html?: string
  reward?: { type: "coins" | "xp" | "gems"; amount: number } | null
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

async function logEvent(payload: { adId: string; placement: Placement; type: "impression" | "click" | "completion" }) {
  await fetch("/api/ads/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
}

export function AdSlot({ placement }: { placement: Placement }) {
  const { data } = useSWR<{ ad: Ad | null }>(`/api/ads?placement=${placement}`, fetcher, { refreshInterval: 30000 })
  const ad = data?.ad ?? null

  useEffect(() => {
    if (ad) {
      logEvent({ adId: ad.id, placement, type: "impression" })
    }
  }, [ad, placement])

  if (!ad) {
    return (
      <div className="rounded-md border p-4 text-sm text-slate-600">No ad available for this placement right now.</div>
    )
  }

  return (
    <div className="rounded-md border p-4 space-y-3">
      <div className="text-sm font-medium">{ad.title}</div>
      {ad.description ? <p className="text-xs text-slate-600">{ad.description}</p> : null}

      {ad.type === "image" && ad.imageUrl ? (
        <div className="flex flex-col gap-3">
          <img src={ad.imageUrl || "/placeholder.svg"} alt={ad.title} className="w-full rounded-md" />
          {ad.ctaUrl ? (
            <Button
              onClick={() => {
                logEvent({ adId: ad.id, placement, type: "click" })
                window.open(ad.ctaUrl!, "_blank", "noopener,noreferrer")
              }}
            >
              {ad.ctaLabel || "Learn more"}
            </Button>
          ) : null}
        </div>
      ) : null}

      {ad.type === "video" && ad.videoUrl ? (
        <div className="flex flex-col gap-3">
          <video src={ad.videoUrl} className="w-full rounded-md" controls playsInline />
          {ad.ctaUrl ? (
            <Button
              onClick={() => {
                logEvent({ adId: ad.id, placement, type: "click" })
                window.open(ad.ctaUrl!, "_blank", "noopener,noreferrer")
              }}
            >
              {ad.ctaLabel || "Learn more"}
            </Button>
          ) : null}
        </div>
      ) : null}

      {ad.type === "html" && ad.html ? (
        <div className="w-full">
          <iframe
            title={ad.title}
            srcDoc={ad.html}
            sandbox="allow-forms allow-pointer-lock allow-scripts allow-popups"
            className="w-full h-64 rounded-md border"
          />
        </div>
      ) : null}

      {ad.reward ? (
        <div className="text-xs text-slate-600">
          Reward: {ad.reward.amount} {ad.reward.type}
        </div>
      ) : null}
    </div>
  )
}

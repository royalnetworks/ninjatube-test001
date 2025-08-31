"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { extractYouTubeVideoId } from "@/lib/validation"

export function WatchEarn() {
  const [url, setUrl] = useState("")
  const [videoId, setVideoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [coins, setCoins] = useState(0)
  const timerRef = useRef<number | null>(null)

  const canClaim = seconds >= 30 && !claimed

  useEffect(() => {
    if (!running) return
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [running])

  const thumbnail = useMemo(() => {
    if (!videoId) return null
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  }, [videoId])

  function startSession() {
    setError(null)
    const id = extractYouTubeVideoId(url.trim())
    if (!id) {
      setError("Enter a valid YouTube URL or ID")
      return
    }
    setVideoId(id)
    setSeconds(0)
    setClaimed(false)
    setRunning(true)
  }

  function togglePause() {
    setRunning((r) => !r)
  }

  function resetSession() {
    setRunning(false)
    setSeconds(0)
    setClaimed(false)
  }

  async function claimReward() {
    if (!canClaim || !videoId) return
    setClaiming(true)
    try {
      const res = await fetch("/api/earn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: `watch-${videoId}-${Math.floor(Date.now() / 1000)}`,
          secondsWatched: seconds,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to claim")
      setCoins((c) => c + (data?.coins || 0))
      setClaimed(true)
    } catch (e: any) {
      setError(e.message || "Failed to claim")
    } finally {
      setClaiming(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur p-4">
        <label htmlFor="yt-url" className="block text-sm font-medium text-white/90">
          YouTube URL or ID
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="yt-url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-md bg-white/90 px-3 py-2 text-slate-900 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
            aria-invalid={!!error}
          />
          <button
            onClick={startSession}
            className="rounded-md bg-purple-600 px-3 py-2 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            Start
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-white">{error}</p>}
      </div>

      {videoId && (
        <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur p-4">
          <div className="aspect-video w-full overflow-hidden rounded-md border border-white/10">
            <iframe
              title="YouTube Player"
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${videoId}?rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-white/10 px-2 py-1 text-sm text-white/90">Watched: {seconds}s</span>
            <span className="rounded-md bg-white/10 px-2 py-1 text-sm text-white/90">Demo Coins: {coins}</span>
            <button
              type="button"
              onClick={togglePause}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/40",
                running ? "bg-white/20 text-white hover:bg-white/30" : "bg-purple-600 text-white hover:bg-purple-700",
              )}
              aria-pressed={running}
            >
              {running ? "Pause" : "Resume"}
            </button>
            <button
              type="button"
              onClick={resetSession}
              className="rounded-md px-3 py-2 text-sm font-medium bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Reset
            </button>
            <button
              disabled={!canClaim || claiming}
              onClick={claimReward}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/40",
                canClaim && !claiming
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-white/20 text-white/70 cursor-not-allowed",
              )}
            >
              {claiming ? "Claiming..." : "Claim demo reward"}
            </button>
          </div>

          <p className="mt-2 text-xs text-white/70">
            Demo only: Rewards are simulated and rate-limited on the server. For production, move rewards to
            server-authoritative Functions and comply with YouTube policies.
          </p>
        </div>
      )}
    </div>
  )
}

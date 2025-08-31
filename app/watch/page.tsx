import { WatchEarn } from "@/components/watch-earn"

export default function Page() {
  return (
    <main className="mx-auto max-w-4xl p-4 md:p-6">
      <h1 className="text-balance text-2xl font-semibold text-slate-900">Watch & Earn (Demo)</h1>
      <p className="mt-1 text-sm text-slate-700">
        Paste a YouTube link, watch for at least 30 seconds, then claim a demo reward.
      </p>
      <div className="mt-4">
        <WatchEarn />
      </div>
    </main>
  )
}

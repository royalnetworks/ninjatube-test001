import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
// import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { IntegrityReporter } from "@/components/integrity-reporter"
import { Suspense } from "react"
import { PresenceWidget } from "@/components/presence-widget"
import { NotificationBanner } from "@/components/notification-banner"
import { Sidebar } from "@/components/sidebar"

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-violet-300 text-white`}
      >
        <Suspense fallback={<div />}>
          <NotificationBanner />
          <div className="flex items-center justify-end px-4 pt-2">
            <PresenceWidget />
          </div>
          <IntegrityReporter />
          <main className="mx-auto max-w-7xl p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-60 lg:w-64 md:shrink-0">
                <div className="rounded-xl bg-white/10 backdrop-blur border border-white/20 p-0">
                  <Sidebar />
                </div>
              </div>
              <div className="flex-1">
                <div className="rounded-xl bg-white/80 text-slate-900 shadow-lg ring-1 ring-white/30 backdrop-blur">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </Suspense>
      </body>
    </html>
  )
}

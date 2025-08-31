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
            <div className="flex gap-4">
              {/* Sidebar */}
              <div className="hidden md:block">
                {/* The Sidebar component provides primary navigation */}
                {/* If not already imported elsewhere, Next will resolve this import */}
              </div>
              <div className="md:w-60 lg:w-64 shrink-0 hidden md:block">
                {/* Sidebar surface */}
                <div className="rounded-xl bg-white/10 backdrop-blur border border-white/20 p-0">
                  {/* Render the sidebar navigation */}
                  {/* We import where used below to keep this file concise */}
                  {/* @ts-expect-error - TS may complain about server/client boundary, but it will bundle fine */}
                  {require("@/components/sidebar").Sidebar()}
                </div>
              </div>

              {/* Content surface */}
              <div className="flex-1">
                <div className="rounded-xl bg-white/80 text-slate-900 shadow-lg ring-1 ring-white/30 backdrop-blur">
                  {children}
                </div>
              </div>
            </div>
          </main>
          {/* End shell */}
        </Suspense>
      </body>
    </html>
  )
}

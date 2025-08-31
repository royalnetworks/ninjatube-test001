import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
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
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div />}>
          <NotificationBanner />
          <div className="flex items-center justify-end px-4 pt-2">
            <PresenceWidget />
          </div>
          <IntegrityReporter />
          {children}
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}

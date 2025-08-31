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
import { ThemeProvider } from "@/components/theme-provider"

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
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-violet-300 text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 rounded-md bg-white/20 px-3 py-2 text-sm backdrop-blur"
          >
            Skip to content
          </a>
          <Suspense fallback={<div />}>
            <NotificationBanner />
            <div className="flex items-center justify-end px-4 pt-2">
              <PresenceWidget />
            </div>
            <IntegrityReporter />
            <main className="mx-auto max-w-7xl p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-60 lg:w-64 md:shrink-0">
                  <Sidebar />
                </div>
                <div className="flex-1">
                  <div
                    id="main-content"
                    className="rounded-xl bg-card text-card-foreground shadow-lg ring-1 ring-white/30 backdrop-blur p-4 md:p-6"
                  >
                    {children}
                  </div>
                </div>
              </div>
            </main>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  )
}

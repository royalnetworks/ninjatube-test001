"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home" },
  { href: "/promotions", label: "Promotions" },
  { href: "/store", label: "Store" },
  { href: "/ads", label: "Ads" },
  { href: "/donations", label: "Donations" },
  { href: "/integrations", label: "Integrations" },
  { href: "/support", label: "Support" },
  { href: "/admin", label: "Admin" },
  { href: "/watch", label: "Watch & Earn" },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <aside className="text-foreground">
      {/* Mobile toggle */}
      <div className="md:hidden p-3">
        <button
          aria-expanded={open}
          aria-controls="sidebar-nav"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm backdrop-blur hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
        >
          {open ? "Close Menu" : "Open Menu"}
        </button>
      </div>

      <nav
        id="sidebar-nav"
        className={cn("md:block md:w-60 lg:w-64 md:shrink-0", open ? "block" : "hidden")}
        aria-label="Primary"
      >
        <div className="md:sticky md:top-4 mx-3 md:mx-0 rounded-xl bg-white/10 backdrop-blur border border-white/20 p-3 md:p-4">
          <div className="mb-3 md:mb-4">
            <span className="block text-sm font-semibold text-white/90">Ninja Tube</span>
            <span className="block text-xs text-white/70">Watch. Earn. Rise.</span>
          </div>
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/40",
                      active ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
    </aside>
  )
}

"use client"

import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"

interface NavItem {
  href?: string
  label: string
  icon: string
  action?: () => void
  isLogout?: boolean
}

export function Sidebar() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/tasks", label: "Tarefas", icon: "📝" },
    { href: "/settings", label: "Configurações", icon: "⚙️" },
    { label: "Sair", icon: "🚪", action: handleLogout, isLogout: true },
  ]

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-500 to-purple-600 text-white flex flex-col h-220 p-6 shadow-xl">
      <Link
        href="/dashboard"
        className="flex items-center gap-3 mb-12 text-2xl font-bold hover:opacity-90 transition-opacity"
      >
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold">
          ✓
        </div>
        <span
          className="text-black drop-shadow-[2px_2px_4px_rgba(0,0,0,0.4)] shadow-[inset_2px_2px_5px_rgba(255,255,255,0.3),inset_-2px_-2px_5px_rgba(0,0,0,0.2)]"
          style={{
            textShadow:
              "2px 2px 6px rgba(0,0,0,0.4), -2px -2px 6px rgba(255,255,255,0.6)",
          }}
        >
          Taskly
        </span>
      </Link>

      <nav className="flex-1 space-y-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          if (item.isLogout) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                disabled={isLoading}
                className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left hover:bg-white/20 transition-all font-semibold"
              >
                {isLoading ? (
                  <Spinner />
                ) : (
                  <>
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-black">{item.label}</span>
                  </>
                )}
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive ? "bg-white/30 font-bold" : "hover:bg-white/20"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-black">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
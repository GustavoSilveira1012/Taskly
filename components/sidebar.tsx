"use client"

import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"

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

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/tasks", label: "Tasks", icon: "✓" },
    { href: "/analytics", label: "Analytics", icon: "📈" },
    { href: "/settings", label: "Configurações", icon: "⚙️" },
  ]

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-500 to-purple-600 text-white flex flex-col h-screen p-6 shadow-xl md:w-64 sm:w-20">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 mb-12 text-2xl font-bold hover:opacity-90 transition-opacity"
      >
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold">✓</div>
        <span className="sm:hidden">Taskly</span>
      </Link>

      <nav className="flex-1 space-y-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive ? "bg-white/30 font-bold" : "hover:bg-white/20"
              }`}
              title={item.label}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="sm:hidden">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <button
        onClick={handleLogout}
        disabled={isLoading}
        className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        title="Sair"
      >
        {isLoading ? <Spinner /> : "🚪"}
        <span className="sm:hidden">Sair</span>
      </button>
    </aside>
  )
}

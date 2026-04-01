'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquare,
  BookOpen,
  BarChart3,
  Settings,
  LayoutDashboard,
  Bot,
} from 'lucide-react'

const navItems = [
  { href: '/saas', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/saas/chatbots', label: 'Chatbots', icon: Bot },
  { href: '/saas/knowledge', label: 'Knowledge Base', icon: BookOpen },
  { href: '/analytics-dashboard', label: 'Analytics', icon: BarChart3 },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-200">
        <Link href="/saas" className="text-lg font-bold text-slate-800">
          SaaS Dashboard
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/saas' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-slate-200">
        <Link
          href="/saas/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </aside>
  )
}

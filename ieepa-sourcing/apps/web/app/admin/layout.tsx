import Link from 'next/link'
import { LayoutDashboard, FileText, Users, Mail, BarChart3, Bell } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Pipeline', icon: LayoutDashboard, exact: true },
  { href: '/admin/contacts', label: 'Contacts', icon: Users },
  { href: '/admin/outreach', label: 'Outreach', icon: Mail },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/alerts', label: 'Alerts', icon: Bell },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-navy-500 text-white flex flex-col shrink-0">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-gold-400 flex items-center justify-center">
              <span className="text-navy-500 font-bold text-xs">IC</span>
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight">IEEPA Claims</p>
              <p className="text-white/40 text-xs">Admin</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            ← View Public Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

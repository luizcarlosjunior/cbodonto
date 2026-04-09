'use client'
// src/components/admin/AdminSidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Calendar, Users, Star,
  UserCog, LogOut, ExternalLink, Menu, X, Settings, Stethoscope,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/agendamentos', label: 'Agendamentos', icon: Calendar },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/dentistas', label: 'Dentistas', icon: UserCog },
  { href: '/admin/servicos', label: 'Serviços', icon: Stethoscope },
  { href: '/admin/depoimentos', label: 'Depoimentos', icon: Star },
  { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

interface Props {
  user?: { name?: string | null; email?: string | null }
}

export default function AdminSidebar({ user }: Props) {
  const path = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string, exact?: boolean) =>
    exact ? path === href : path.startsWith(href)

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 500 500" fill="none">
            <path d="M250 80 C170 80 110 160 110 260 C110 360 170 420 250 420 C290 420 310 400 320 390" stroke="#c4a97d" strokeWidth="24" strokeLinecap="round" />
            <path d="M280 90 C280 90 280 250 280 420" stroke="#c4a97d" strokeWidth="20" strokeLinecap="round" />
            <path d="M280 90 C330 90 390 110 390 175 C390 240 330 255 280 255" stroke="#c4a97d" strokeWidth="20" strokeLinecap="round" />
            <path d="M280 255 C340 255 400 278 400 340 C400 400 340 420 280 420" stroke="#c4a97d" strokeWidth="20" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-white font-serif text-sm font-semibold leading-none">CB Odonto</p>
            <p className="text-stone-500 text-[0.6rem] tracking-widest uppercase mt-0.5">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors',
              isActive(href, exact)
                ? 'bg-burgundy text-white'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            )}
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-stone-800 space-y-0.5">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <ExternalLink size={16} strokeWidth={1.5} />
          Ver Site
        </a>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sair
        </button>

        {/* User */}
        <div className="px-3 pt-3 mt-2 border-t border-stone-800">
          <p className="text-white text-xs font-medium truncate">{user?.name}</p>
          <p className="text-stone-500 text-[0.65rem] truncate mt-0.5">{user?.email}</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-stone-950 border-r border-stone-800 shrink-0 fixed h-full z-30">
        <SidebarContent />
      </aside>
      {/* Spacer */}
      <div className="hidden lg:block w-56 shrink-0" />

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-stone-950 border-b border-stone-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 500 500" fill="none">
            <path d="M250 80 C170 80 110 160 110 260 C110 360 170 420 250 420 C290 420 310 400 320 390" stroke="#c4a97d" strokeWidth="24" strokeLinecap="round" />
            <path d="M280 90 C280 90 280 250 280 420" stroke="#c4a97d" strokeWidth="20" strokeLinecap="round" />
            <path d="M280 90 C330 90 390 110 390 175 C390 240 330 255 280 255" stroke="#c4a97d" strokeWidth="20" strokeLinecap="round" />
            <path d="M280 255 C340 255 400 278 400 340 C400 400 340 420 280 420" stroke="#c4a97d" strokeWidth="20" strokeLinecap="round" />
          </svg>
          <span className="text-white font-serif text-sm">CB Odonto Admin</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-stone-400 p-1">
          <Menu size={20} />
        </button>
      </div>
      <div className="lg:hidden h-14" />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-56 bg-stone-950 h-full flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}

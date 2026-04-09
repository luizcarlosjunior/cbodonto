'use client'
// src/components/site/Navbar.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { waLink } from '@/lib/utils'

interface NavbarProps {
  waNumber: string
}

const links = [
  { href: '#servicos', label: 'Serviços' },
  { href: '#sobre', label: 'Sobre' },
  { href: '#agendamento', label: 'Agendar' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#localizacao', label: 'Localização' },
]

export default function Navbar({ waNumber }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // On hero: transparent bg, white text/logo
  // On scroll: cream bg, dark text
  const isLight = scrolled

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5%] py-4 transition-all duration-500 ${
          isLight
            ? 'bg-cream/95 backdrop-blur-md shadow-sm border-b border-gold/20'
            : 'bg-transparent'
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <svg width="40" height="40" viewBox="0 0 500 500" fill="none">
            <path
              d="M250 80 C170 80 110 160 110 260 C110 360 170 420 250 420 C290 420 310 400 320 390"
              stroke={isLight ? '#6b2737' : '#c4a97d'}
              strokeWidth="22" strokeLinecap="round"
              className="transition-all duration-500"
            />
            <path
              d="M280 90 C280 90 280 250 280 420"
              stroke={isLight ? '#6b2737' : '#c4a97d'}
              strokeWidth="18" strokeLinecap="round"
              className="transition-all duration-500"
            />
            <path
              d="M280 90 C330 90 390 110 390 175 C390 240 330 255 280 255"
              stroke={isLight ? '#6b2737' : '#c4a97d'}
              strokeWidth="18" strokeLinecap="round"
              className="transition-all duration-500"
            />
            <path
              d="M280 255 C340 255 400 278 400 340 C400 400 340 420 280 420"
              stroke={isLight ? '#6b2737' : '#c4a97d'}
              strokeWidth="18" strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="leading-tight">
            <span className={`block font-serif text-sm font-semibold tracking-wide transition-colors duration-500 ${isLight ? 'text-stone-900' : 'text-white'}`}>
              Campozano &amp; Barcellos
            </span>
            <span className={`block text-[0.58rem] tracking-widest uppercase font-sans transition-colors duration-500 ${isLight ? 'text-burgundy' : 'text-gold'}`}>
              Odontologia
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`text-[0.68rem] tracking-widest uppercase font-medium transition-colors duration-300 ${
                  isLight
                    ? 'text-stone-500 hover:text-burgundy'
                    : 'text-white/80 hover:text-gold'
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={waLink(waNumber, 'Olá, vim do site! Quero agendar uma consulta.')}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-5 py-2.5 text-[0.68rem] tracking-widest uppercase font-medium transition-all duration-300 rounded-sm ${
                isLight
                  ? 'bg-burgundy text-white hover:bg-burgundy-light'
                  : 'bg-white/10 border border-white/30 text-white hover:bg-burgundy hover:border-burgundy'
              }`}
            >
              Agendar Consulta
            </a>
          </li>
        </ul>

        {/* Hamburger */}
        <button
          className={`md:hidden p-2 transition-colors duration-300 ${isLight ? 'text-stone-700' : 'text-white'}`}
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
      </nav>

      {/* Mobile full-screen menu */}
      <div
        className={`fixed inset-0 z-[60] bg-stone-950/98 backdrop-blur-sm flex flex-col items-center justify-center gap-8 transition-all duration-500 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          className="absolute top-5 right-5 p-2 text-white/60 hover:text-white transition-colors"
          onClick={() => setOpen(false)}
        >
          <X size={24} />
        </button>

        {/* Mobile logo */}
        <div className="flex flex-col items-center mb-4">
          <svg width="48" height="48" viewBox="0 0 500 500" fill="none" className="mb-2">
            <path d="M250 80 C170 80 110 160 110 260 C110 360 170 420 250 420 C290 420 310 400 320 390" stroke="#c4a97d" strokeWidth="22" strokeLinecap="round"/>
            <path d="M280 90 C280 90 280 250 280 420" stroke="#c4a97d" strokeWidth="18" strokeLinecap="round"/>
            <path d="M280 90 C330 90 390 110 390 175 C390 240 330 255 280 255" stroke="#c4a97d" strokeWidth="18" strokeLinecap="round"/>
            <path d="M280 255 C340 255 400 278 400 340 C400 400 340 420 280 420" stroke="#c4a97d" strokeWidth="18" strokeLinecap="round"/>
          </svg>
          <p className="font-serif text-white text-lg tracking-wide">Campozano &amp; Barcellos</p>
          <p className="text-gold text-[0.6rem] tracking-widest uppercase">Odontologia</p>
        </div>

        {links.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="font-serif text-2xl text-white/80 hover:text-gold transition-colors"
            style={{ transitionDelay: open ? `${i * 60}ms` : '0ms' }}
          >
            {l.label}
          </a>
        ))}

        <a
          href={waLink(waNumber, 'Olá, vim do site! Quero agendar uma consulta.')}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 bg-burgundy text-white px-8 py-3.5 text-[0.72rem] tracking-widest uppercase font-medium hover:bg-burgundy-light transition-colors rounded-sm"
          onClick={() => setOpen(false)}
        >
          Agendar pelo WhatsApp
        </a>

        <p className="absolute bottom-6 text-stone-600 text-[0.65rem] tracking-widest uppercase">
          cbodonto.com.br
        </p>
      </div>
    </>
  )
}

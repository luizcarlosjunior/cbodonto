'use client'
// src/components/site/Navbar.tsx
import { waLink } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface NavbarProps {
  waNumber: string
  forceLight?: boolean
  instagramUrl?: string | null
  facebookUrl?: string | null
}

const links = [
  { href: '#servicos', label: 'Serviços' },
  { href: '#sobre', label: 'Sobre' },
  { href: '#agendamento', label: 'Agendar' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#localizacao', label: 'Localização' },
]

export default function Navbar({ waNumber, forceLight = false, instagramUrl, facebookUrl }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isLight = forceLight || scrolled

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isLight
            ? 'bg-cream/95 backdrop-blur-md shadow-sm border-b border-gold/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1700px] mx-auto flex items-center justify-between px-[5%] py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <svg id="logo" width="50" height="50" viewBox="0 0 500 500">
            <path strokeWidth="10" strokeLinecap="round" stroke='#21A8A0' fill='#21A8A0' className="transition-all duration-500" d="M385.67,179.93c-25.19,24.49-72.12,60.59-104.91,69.24-4.05,1.07-5.22,1.05-6.13,5.55l-5.3,26.29c-2.36,11.7-.5,16.67-5.72,35.44-.96,3.46-2.59,6.86-3.25,10.45l-10.81,58.33c-4.03,21.73-7.35,42.78-10.21,64.82,3.39-1.98,6.09-3.09,8.3-1.99,3.1,1.55,3.85,5.45,2.47,8.37-3.45,7.31-8.52,21.59-16.55,20.47-3.02-.42-4.58-3.53-5.92-6.85-.28-9.45-.24-18.35,1.37-28.08l16.38-98.6c-19.11,22.97-36.06,44.58-56.84,64.1-25.47,23.94-68.42,59.16-105.36,44.42-26.83-10.71-36.13-45.93-38.2-72.11-5.3-67.1,18.48-143.36,45.9-204.46,21.06-46.93,52.01-104.6,90.75-138.59,6.95-6.1,14.67-10.97,23.42-13.08,11.39-2.75,21.19,3.59,24.78,14.42,4.51,13.6,4.12,27.22,2.25,42.25l12.61-13.77c24-26.21,62.92-29,63.56-36.31.32-3.71,2.91-6.03,5.97-5.91,3.7.15,5.44,3.58,5.58,7.65,29.6-4.31,67.14.35,89.75,20.98,36.87,33.63,10.23,85.54-15.17,117,39.76,9.67,59.12,39.61,61.21,77.52,2.19,40.86-16.81,82.09-44.26,111.82-35.35,38.3-87.53,59.78-139.07,62.47-2.18.11-4.82-3.5-4.98-5.28-.17-1.95,2.31-5.74,5.05-5.96,28.31-2.28,55.29-8.85,80.81-21.69,32.87-16.55,59.5-42.07,76.05-74.94,14.04-27.89,20.87-61.38,10.37-91.25-8.23-23.4-28.06-39.47-53.88-42.72ZM264.43,247.67c-7.95-7.6,5.28-26.79,5.77-29.17l35.04-171.93c-38.77,9.08-71.05,35.29-76.99,75.65l-11.09,32.14-30.72,89.69c-1.2,3.52-4.64,5.37-8.19,3.85-2.45-1.05-4.18-4.5-2.91-7.95,16.77-45.78,53.18-149.02,44.38-194.53-.74-3.83-3.9-9.24-7.82-10.08-11.64-2.47-32.89,19.78-40.21,28.35-17.62,20.62-32.05,42.88-45.09,66.86-21.1,38.79-38.77,78.51-51.68,120.79-14.15,46.36-25.24,103.79-13.97,151.16,5.23,21.99,19.92,44.23,45.33,40.87,27.53-3.64,55.53-26.11,74.72-45.12,9.42-9.33,18.2-18.08,26.87-28.13,15.5-17.98,29.68-36.17,43.43-55.52l13.14-66.9ZM399.93,59.5c-21.21-17.36-56.7-20.47-82.79-15.58l-31.04,154.43c28.69-22.86,59.28-31.3,94.79-30.31,23.96-26.53,55.06-79.06,19.04-108.54ZM278.99,238.29c11.83-4.26,20.97-8.87,30.75-14.63,21.25-12.52,41.19-26.31,59.56-44.09-30.18-.89-73.71,16.48-87.68,42.91-2.27,4.29-2.55,10.28-2.63,15.82Z"/>
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
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div
        className={`fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-8 transition-all duration-500 ${
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
          <svg id="logo" width="50" height="50" viewBox="0 0 500 500">
            <path strokeWidth="10" strokeLinecap="round" stroke='#21A8A0' fill='#21A8A0' className="transition-all duration-500" d="M385.67,179.93c-25.19,24.49-72.12,60.59-104.91,69.24-4.05,1.07-5.22,1.05-6.13,5.55l-5.3,26.29c-2.36,11.7-.5,16.67-5.72,35.44-.96,3.46-2.59,6.86-3.25,10.45l-10.81,58.33c-4.03,21.73-7.35,42.78-10.21,64.82,3.39-1.98,6.09-3.09,8.3-1.99,3.1,1.55,3.85,5.45,2.47,8.37-3.45,7.31-8.52,21.59-16.55,20.47-3.02-.42-4.58-3.53-5.92-6.85-.28-9.45-.24-18.35,1.37-28.08l16.38-98.6c-19.11,22.97-36.06,44.58-56.84,64.1-25.47,23.94-68.42,59.16-105.36,44.42-26.83-10.71-36.13-45.93-38.2-72.11-5.3-67.1,18.48-143.36,45.9-204.46,21.06-46.93,52.01-104.6,90.75-138.59,6.95-6.1,14.67-10.97,23.42-13.08,11.39-2.75,21.19,3.59,24.78,14.42,4.51,13.6,4.12,27.22,2.25,42.25l12.61-13.77c24-26.21,62.92-29,63.56-36.31.32-3.71,2.91-6.03,5.97-5.91,3.7.15,5.44,3.58,5.58,7.65,29.6-4.31,67.14.35,89.75,20.98,36.87,33.63,10.23,85.54-15.17,117,39.76,9.67,59.12,39.61,61.21,77.52,2.19,40.86-16.81,82.09-44.26,111.82-35.35,38.3-87.53,59.78-139.07,62.47-2.18.11-4.82-3.5-4.98-5.28-.17-1.95,2.31-5.74,5.05-5.96,28.31-2.28,55.29-8.85,80.81-21.69,32.87-16.55,59.5-42.07,76.05-74.94,14.04-27.89,20.87-61.38,10.37-91.25-8.23-23.4-28.06-39.47-53.88-42.72ZM264.43,247.67c-7.95-7.6,5.28-26.79,5.77-29.17l35.04-171.93c-38.77,9.08-71.05,35.29-76.99,75.65l-11.09,32.14-30.72,89.69c-1.2,3.52-4.64,5.37-8.19,3.85-2.45-1.05-4.18-4.5-2.91-7.95,16.77-45.78,53.18-149.02,44.38-194.53-.74-3.83-3.9-9.24-7.82-10.08-11.64-2.47-32.89,19.78-40.21,28.35-17.62,20.62-32.05,42.88-45.09,66.86-21.1,38.79-38.77,78.51-51.68,120.79-14.15,46.36-25.24,103.79-13.97,151.16,5.23,21.99,19.92,44.23,45.33,40.87,27.53-3.64,55.53-26.11,74.72-45.12,9.42-9.33,18.2-18.08,26.87-28.13,15.5-17.98,29.68-36.17,43.43-55.52l13.14-66.9ZM399.93,59.5c-21.21-17.36-56.7-20.47-82.79-15.58l-31.04,154.43c28.69-22.86,59.28-31.3,94.79-30.31,23.96-26.53,55.06-79.06,19.04-108.54ZM278.99,238.29c11.83-4.26,20.97-8.87,30.75-14.63,21.25-12.52,41.19-26.31,59.56-44.09-30.18-.89-73.71,16.48-87.68,42.91-2.27,4.29-2.55,10.28-2.63,15.82Z"/>
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

        {/* Social links */}
        {(instagramUrl || facebookUrl) && (
          <div className="flex items-center gap-5">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                aria-label="Instagram"
                className="text-stone-500 hover:text-gold transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
            {facebookUrl && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                aria-label="Facebook"
                className="text-stone-500 hover:text-gold transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
          </div>
        )}

        <p className="absolute bottom-6 text-stone-600 text-[0.65rem] tracking-widest uppercase">
          cbodonto.com.br
        </p>
      </div>
    </>
  )
}

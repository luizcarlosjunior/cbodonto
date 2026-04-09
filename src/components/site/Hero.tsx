'use client'
// src/components/site/Hero.tsx
import { waLink } from '@/lib/utils'
import { useEffect, useState } from 'react'

// Unsplash placeholder — troque por /hero-bg.jpg quando tiver a imagem definitiva
const HERO_IMAGE = 'bg3.avif'

export default function Hero({ waNumber }: { waNumber: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Small delay to let the browser paint first, then trigger all animations
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  // Staggered animation helper – mirrors Concept HOF's entrance sequence
  const fadeUp = (delay: number) =>
    `transition-all duration-700 ease-out ${
      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`
  const fadeUpStyle = (delay: number): React.CSSProperties => ({
    transitionDelay: mounted ? `${delay}ms` : '0ms',
  })

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">

      {/* ── Full-bleed background image ── */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMAGE}
          alt="CB Odonto – Campozano & Barcellos"
          className="w-full h-full object-cover object-center"
          fetchPriority="high"
        />
        {/* Dark gradient overlay — stronger at bottom for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-950/55 to-stone-950/80" />
        {/* Left vignette — content side */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/60 via-transparent to-transparent" />
      </div>

      {/* ── Promo badge top-center (like Concept HOF's "15% OFF") ── */}
      <div
        className={`absolute top-24 left-1/2 -translate-x-1/2 z-20 ${fadeUp(0)}`}
        style={fadeUpStyle(0)}
      >
        {/* <div className="flex items-center gap-2 bg-burgundy/90 backdrop-blur-sm text-white text-[0.65rem] tracking-[0.2em] uppercase font-medium px-5 py-2 border border-burgundy-light/40">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          Cirurgiões-Dentistas
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
        </div> */}
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 w-full px-6 md:px-[8%] pt-28 pb-32 md:pt-36 md:pb-40">
        <div className="max-w-3xl">

          {/* Eyebrow */}
          <p
            className={`text-gold text-[0.7rem] tracking-[0.25em] uppercase font-sans mb-5 flex items-center gap-3 ${fadeUp(100)}`}
            style={fadeUpStyle(100)}
          >
            <span className="block h-px w-8 bg-gold" />
            
          </p>

          {/* Headline — mirrors Concept HOF's large serif treatment */}
          <h1
            className={`font-serif font-light text-white leading-[1.05] mb-4 ${fadeUp(200)}`}
            style={{ ...fadeUpStyle(200), fontSize: 'clamp(2.6rem, 6vw, 5.5rem)' }}
          >
            Você merece o<br />
            melhor{' '}
            <em className="italic text-gold not-italic">sorriso</em>
            <br />
            <span className="italic">da sua vida</span>
          </h1>

          {/* Sub-headline */}
          <p
            className={`text-stone-300 text-sm md:text-base leading-relaxed max-w-md mb-3 ${fadeUp(300)}`}
            style={fadeUpStyle(300)}
          >
            Você merece esse cuidado
          </p>
          <p
            className={`text-stone-400 text-sm leading-relaxed max-w-md mb-10 ${fadeUp(380)}`}
            style={fadeUpStyle(380)}
          >
            Tratamentos odontológicos personalizados com excelência, tecnologia e o carinho de especialistas.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row gap-3 ${fadeUp(480)}`}
            style={fadeUpStyle(480)}
          >
            <a
              href={waLink(waNumber, 'Olá, vim do site! Quero agendar meu horário.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 bg-burgundy hover:bg-burgundy-light text-white px-8 py-4 text-[0.72rem] tracking-[0.15em] uppercase font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-burgundy/30 rounded-sm"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Quero agendar meu horário ➞
            </a>
            <a
              href="#servicos"
              className="inline-flex items-center justify-center gap-2 border border-white/25 text-white hover:border-gold hover:text-gold px-8 py-4 text-[0.72rem] tracking-[0.15em] uppercase font-medium transition-all duration-300 rounded-sm"
            >
              Conhecer Serviços
            </a>
          </div>
        </div>
      </div>

      {/* ── Bottom info strip — like Concept HOF's footer bar ── */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 backdrop-blur-sm bg-stone-950/40 ${fadeUp(600)}`}
        style={fadeUpStyle(600)}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 md:px-[8%] py-4 gap-3">
          {[
            { num: '2+', label: 'Anos de Experiência' },
            { num: '500+', label: 'Pacientes Atendidos' },
            { num: '98%', label: 'Satisfação' },
          ].map(({ num, label }) => (
            <div key={label} className="flex items-center gap-3 text-white">
              <span className="font-serif text-2xl text-gold leading-none">{num}</span>
              <span className="text-[0.65rem] tracking-widest uppercase text-stone-400 leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scroll indicator (animated bounce) ── */}
      <div
        className={`absolute bottom-24 right-8 z-10 hidden md:flex flex-col items-center gap-2 ${fadeUp(700)}`}
        style={fadeUpStyle(700)}
      >
        <span className="text-[0.58rem] tracking-[0.2em] uppercase text-stone-400 rotate-90 origin-center mb-4">
          Scroll
        </span>
        <div className="w-px h-14 bg-gradient-to-b from-transparent via-gold/60 to-transparent animate-[scrollPulse_2s_ease-in-out_infinite]" />
      </div>

      <style jsx global>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; transform: scaleY(0.6) translateY(-20%); }
          50% { opacity: 1; transform: scaleY(1) translateY(0); }
        }
      `}</style>
    </section>
  )
}

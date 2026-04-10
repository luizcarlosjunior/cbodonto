'use client'
// src/components/site/Testimonials.tsx
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { Testimonial } from '@prisma/client'
import TestimonialForm from '@/components/site/TestimonialForm'

interface Props {
  testimonials: Testimonial[]
}

const INTERVAL_MS = 10_000
const ANIM_MS = 320

export default function Testimonials({ testimonials }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const count = testimonials.length

  // idxRef keeps the "truth" so interval/prev/next closures never go stale
  const idxRef = useRef(0)
  const [idx, setIdx] = useState(0)
  const [show, setShow] = useState(true)
  const pausedRef = useRef(false)
  const [paused, setPaused] = useState(false)

  // keep pausedRef in sync
  useEffect(() => { pausedRef.current = paused }, [paused])

  const goTo = useCallback((newIdx: number) => {
    setShow(false)
    setTimeout(() => {
      idxRef.current = newIdx
      setIdx(newIdx)
      setShow(true)
    }, ANIM_MS)
  }, [])

  const prev = useCallback(() =>
    goTo((idxRef.current - 1 + count) % count), [count, goTo])

  const next = useCallback(() =>
    goTo((idxRef.current + 1) % count), [count, goTo])

  useEffect(() => {
    if (count <= 1) return
    const id = setInterval(() => { if (!pausedRef.current) next() }, INTERVAL_MS)
    return () => clearInterval(id)
  }, [count, next])

  if (!count) return null

  const t = testimonials[idx]

  return (
    <>
    <section id="depoimentos" className="py-20 bg-cream-dark">
      <div className="max-w-[1600px] mx-auto px-[8%]">
      <div className="text-center mb-12">
        <p className="section-tag justify-center mb-3">O que dizem nossos pacientes</p>
        <h2 className="section-title">
          Depoimentos <em className="italic text-burgundy">reais</em>
        </h2>
      </div>

      <div
        className="max-w-2xl mx-auto relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Prev arrow */}
        {count > 1 && (
          <button
            onClick={prev}
            aria-label="Depoimento anterior"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 flex items-center justify-center w-9 h-9 rounded-full border border-gold/30 bg-white text-stone-400 hover:text-burgundy hover:border-burgundy transition-colors z-10"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Next arrow */}
        {count > 1 && (
          <button
            onClick={next}
            aria-label="Próximo depoimento"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 flex items-center justify-center w-9 h-9 rounded-full border border-gold/30 bg-white text-stone-400 hover:text-burgundy hover:border-burgundy transition-colors z-10"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Card */}
        <div className="bg-white border border-gold/20 p-10 relative overflow-hidden">
          {/* Quote mark */}
          <span className="absolute top-4 left-6 font-serif text-8xl text-gold/20 leading-none select-none">"</span>

          {/* Animated content */}
          <div
            style={{ transition: `opacity ${ANIM_MS}ms ease, transform ${ANIM_MS}ms ease` }}
            className={show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}
          >
            <div className="flex gap-1 mb-5">
              {Array.from({ length: t?.rating ?? 5 }).map((_, i) => (
                <svg key={i} className="w-4 h-4 fill-amber-400" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <p className="text-stone-600 text-sm leading-relaxed italic relative z-10 mb-8">
              {t?.text}
            </p>

            <div className="border-t border-gold/20 pt-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {t?.photoUrl ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gold/30 shrink-0">
                    <Image
                      src={t.photoUrl}
                      alt={t.patientName}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-stone-100 border border-gold/20 flex items-center justify-center text-stone-400 font-serif text-lg shrink-0">
                    {t?.patientName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-serif text-lg text-stone-900">{t?.patientName}</p>
                  <p className="text-[0.7rem] tracking-wide text-stone-400 mt-0.5">
                    Paciente · {t?.source}
                  </p>
                </div>
              </div>

              {count > 1 && (
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${i === idx ? 'bg-burgundy' : 'bg-stone-300'}`}
                      aria-label={`Depoimento ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {count > 1 && !paused && (
          <div className="h-0.5 bg-gold/20 mt-0 overflow-hidden">
            <div
              key={idx}
              className="h-full bg-burgundy/50 origin-left"
              style={{ animation: `progress ${INTERVAL_MS}ms linear forwards` }}
            />
          </div>
        )}
      </div>

      {/* Subtle link */}
      <div className="text-center mt-8">
        <button
          onClick={() => setModalOpen(true)}
          className="text-stone-400 text-xs tracking-wide hover:text-burgundy transition-colors underline underline-offset-4 decoration-dotted"
        >
          deixe aqui o seu depoimento...
        </button>
      </div>

      <style>{`
        @keyframes progress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
      </div>
    </section>

    {/* Modal */}
    {modalOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={() => setModalOpen(false)}
      >
        <div
          className="bg-white w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
            <div>
              <h2 className="font-serif text-lg text-stone-900">Deixe seu depoimento</h2>
              <p className="text-stone-400 text-xs mt-0.5">Sua opinião nos ajuda a melhorar sempre</p>
            </div>
            <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-600 transition-colors">
              <X size={18} />
            </button>
          </div>
          <TestimonialForm onSuccess={() => setTimeout(() => setModalOpen(false), 2500)} />
        </div>
      </div>
    )}
    </>
  )
}

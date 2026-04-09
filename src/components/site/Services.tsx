'use client'
// src/components/site/Services.tsx
import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { waLink } from '@/lib/utils'

interface ServiceImage {
  id: string
  imageUrl: string
}

interface Service {
  id: string
  title: string
  shortDesc: string
  longDesc: string
  imageUrl: string | null
  images: ServiceImage[]
}

interface Props {
  waNumber: string
  services: Service[]
}

// ─── Service detail modal ─────────────────────────────────────────────────────

function ServiceModal({ service, waNumber, onClose }: { service: Service; waNumber: string; onClose: () => void }) {
  // Combine main image + gallery images for carousel
  const slides = [
    ...(service.imageUrl ? [service.imageUrl] : []),
    ...service.images.map((i) => i.imageUrl),
  ]
  const [slide, setSlide] = useState(0)
  const count = slides.length

  const prev = () => setSlide((i) => (i - 1 + count) % count)
  const next = () => setSlide((i) => (i + 1) % count)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Carousel */}
        {slides.length > 0 && (
          <div className="relative aspect-video bg-stone-900 overflow-hidden">
            <Image
              key={slide}
              src={slides[slide]}
              alt={service.title}
              fill
              className="object-cover"
              unoptimized
            />

            {count > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                >
                  <ChevronRight size={18} />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlide(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === slide ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>

                {/* Counter */}
                <span className="absolute top-3 right-3 bg-black/50 text-white text-[0.65rem] px-2 py-0.5 rounded-full font-mono">
                  {slide + 1}/{count}
                </span>
              </>
            )}

            {/* Thumbnail strip */}
            {count > 1 && (
              <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-2 overflow-x-auto bg-gradient-to-t from-black/60 to-transparent">
                {slides.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className={`shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-colors ${i === slide ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <Image src={src} alt="" width={48} height={48} className="object-cover w-full h-full" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="font-serif text-2xl text-stone-900">{service.title}</h2>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 shrink-0 mt-1">
              <X size={20} />
            </button>
          </div>

          <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{service.longDesc}</p>

          <div className="mt-8 pt-6 border-t border-stone-100">
            <a
              href={waLink(waNumber, `Olá, vim do site! Quero saber sobre ${service.title}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full justify-center"
            >
              Agendar este tratamento →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Page section ─────────────────────────────────────────────────────────────

export default function Services({ waNumber, services }: Props) {
  const [showAll, setShowAll] = useState(false)
  const [selected, setSelected] = useState<Service | null>(null)

  const visible = showAll ? services : services.slice(0, 6)
  const hasMore = services.length > 6

  if (!services.length) return null

  return (
    <>
      <section id="servicos" className="bg-white py-20 px-[8%]">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="section-tag mb-3">Os mais procurados</p>
            <h2 className="section-title">
              Nossos <em className="italic text-burgundy">tratamentos</em>
            </h2>
          </div>
          <a
            href={waLink(waNumber, 'Olá, vim do site! Quero saber sobre os tratamentos.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary shrink-0"
          >
            Quero atendimento →
          </a>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gold/20 border border-gold/20">
          {visible.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="bg-white hover:bg-cream transition-colors group relative overflow-hidden flex flex-col text-left cursor-pointer"
            >
              {/* 1:1 image */}
              <div className="relative aspect-square w-full overflow-hidden bg-stone-100">
                {s.imageUrl ? (
                  <Image
                    src={s.imageUrl}
                    alt={s.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-stone-50">
                    <span className="font-serif text-5xl text-stone-200">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                )}
                <span className="absolute top-3 left-3 font-serif text-[0.65rem] tracking-widest text-white bg-burgundy/80 px-2 py-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {s.images.length > 0 && (
                  <span className="absolute bottom-3 right-3 bg-black/50 text-white text-[0.6rem] px-2 py-0.5 rounded-full">
                    +{s.images.length} foto{s.images.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-7 flex flex-col flex-1">
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-burgundy scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                <h3 className="font-serif text-xl font-semibold text-stone-900 mb-2">{s.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-5 flex-1">{s.shortDesc}</p>
                <span className="text-[0.72rem] tracking-widest uppercase text-burgundy font-medium inline-flex items-center gap-1.5 group-hover:gap-3 transition-all">
                  Saiba mais →
                </span>
              </div>
            </button>
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-8">
            <button onClick={() => setShowAll((v) => !v)} className="btn-outline">
              {showAll ? '← Ver menos' : `Ver todos os ${services.length} tratamentos →`}
            </button>
          </div>
        )}
      </section>

      {selected && (
        <ServiceModal
          service={selected}
          waNumber={waNumber}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}

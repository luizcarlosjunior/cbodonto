// src/components/site/Clinic.tsx
import Image from 'next/image'
import { Sparkles, Cpu, Users } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'Ambiente sofisticado e acolhedor',
    desc: 'Nossa clínica oferece um espaço moderno e elegante, projetado para proporcionar conforto e tranquilidade durante todo o atendimento.',
  },
  {
    icon: Cpu,
    title: 'Tecnologia de ponta',
    desc: 'Utilizamos os mais avançados equipamentos e técnicas odontológicas para garantir tratamentos precisos e resultados duradouros.',
  },
  {
    icon: Users,
    title: 'Equipe altamente qualificada',
    desc: 'Contamos com profissionais experientes e especializados, comprometidos com a excelência em cada procedimento.',
  },
]

const photos = [
  { src: '/clinica/clinica-1.jpg', alt: 'Recepção da CB Odonto' },
  { src: '/clinica/clinica-2.jpg', alt: 'Sala de atendimento' },
  { src: '/clinica/clinica-3.jpg', alt: 'Equipamentos modernos' },
  { src: '/clinica/clinica-4.jpg', alt: 'Ambiente da clínica' },
]

export default function Clinic() {
  return (
    <section id="clinica" className="py-20 px-[8%] bg-white overflow-hidden">
      <div className="text-center mb-14">
        <p className="section-tag justify-center mb-3">Conheça nosso espaço</p>
        <h2 className="section-title">
          Nossa <em className="italic text-burgundy">clínica</em>
        </h2>
        <p className="text-stone-500 text-sm leading-relaxed mt-4 max-w-xl mx-auto">
          Aqui, cada detalhe é pensado para proporcionar tratamentos de excelência,
          com resultados naturais e duradouros.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center">

        {/* Photo grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Large photo — spans 2 rows */}
          <div className="row-span-2 relative aspect-[3/4] overflow-hidden rounded-sm bg-stone-100">
            <Image
              src={photos[0].src}
              alt={photos[0].alt}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          {/* 3 smaller photos */}
          {photos.slice(1).map((p) => (
            <div key={p.src} className="relative aspect-square overflow-hidden rounded-sm bg-stone-100">
              <Image
                src={p.src}
                alt={p.alt}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="flex flex-col gap-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-5">
              <div className="shrink-0 w-11 h-11 rounded-full border border-gold/40 flex items-center justify-center text-gold mt-0.5">
                <Icon size={18} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-serif text-lg text-stone-900 mb-1.5">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}

          <blockquote className="border-l-4 border-gold pl-5 mt-2 font-serif text-base italic text-stone-600 leading-relaxed">
            "Cada detalhe foi pensado para que você se sinta acolhido e seguro desde o momento em que entra pela nossa porta."
          </blockquote>
        </div>
      </div>
    </section>
  )
}

// src/components/site/About.tsx
import { waLink } from '@/lib/utils'

const tags = [
  'Atualização Contínua',
  'Tecnologia Moderna',
  'Atendimento Humanizado',
  'Parcelamento Facilitado',
]

export default function About({ waNumber }: { waNumber: string }) {
  return (
    <section id="sobre" className="py-20">
      <div className="max-w-[1600px] mx-auto px-[8%]">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        {/* Image */}
        <div className="relative">
          <div className="absolute -top-5 -left-5 -right-5 -bottom-5 border border-gold/30 rounded-sm -z-10" />
          <img
            src="/dentistas.png"
            alt="Dra. Samara Z. Barcellos e Dr. Samuel Campozano"
            className="w-full object-cover rounded-sm"
          />
          <div className="absolute -bottom-5 -right-5 bg-burgundy text-white px-7 py-5 text-center">
            <p className="text-[0.62rem] tracking-widest uppercase opacity-80 mt-1.5">
              CB Odonto
            </p>
          </div>
        </div>

        {/* Content */}
        <div>
          <p className="section-tag mb-4">Sobre a clínica</p>
          <h2 className="section-title mb-5">
            Conheça os <em className="italic text-burgundy">especialistas</em>
            <br />que vão cuidar de você
          </h2>
          <p className="text-stone-500 text-sm leading-relaxed mb-4">
            A CB Odonto é uma clínica odontológica localizada no coração de Colombo, Paraná.
            Fundada pelo Dr. Samuel Campozano e pela Dra. Samara Z. Barcellos, ambos
            cirurgiões-dentistas.
          </p>
          <blockquote className="border-l-4 border-gold pl-4 my-6 font-serif text-lg italic text-stone-700 leading-relaxed">
            "Cada sorriso é único e merece um cuidado especial. Tratamos cada paciente como se
            fosse da nossa família."
          </blockquote>
          <p className="text-stone-500 text-sm leading-relaxed mb-7">
            Nosso compromisso é com resultados reais, tratamentos personalizados e um ambiente
            acolhedor onde você se sentirá seguro e bem cuidado desde o primeiro momento.
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((t) => (
              <span
                key={t}
                className="w-full sm:w-auto text-center text-[0.68rem] tracking-widest uppercase border border-gold/40 text-stone-500 px-3 py-1.5 rounded-sm"
              >
                {t}
              </span>
            ))}
          </div>
          <a
            href={waLink(waNumber, 'Olá, vim do site! Quero agendar minha primeira consulta.')}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full sm:w-auto justify-center"
          >
            Agendar Minha Consulta →
          </a>
        </div>
      </div>
      </div>
    </section>
  )
}

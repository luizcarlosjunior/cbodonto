// src/components/site/Pillars.tsx
import { ShieldCheck, Heart, Clock } from 'lucide-react'

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Sem Exageros',
    desc: 'Tratamentos realizados por especialistas que garantem um resultado harmônico e natural, priorizando sempre a sua saúde bucal.',
  },
  {
    icon: Heart,
    title: 'Autoestima & Confiança',
    desc: 'Além da saúde, nossos tratamentos proporcionam autoestima e confiança para você sorrir sem hesitar em qualquer situação.',
  },
  {
    icon: Clock,
    title: 'Atendimento Humanizado',
    desc: 'Cada paciente é único. Dedicamos tempo para entender suas necessidades e oferecer um atendimento personalizado e acolhedor.',
  },
]

export default function Pillars() {
  return (
    <section className="bg-stone-900 py-20 px-[8%]">
      <div className="mb-10">
        <p className="section-tag mb-3" style={{ color: '#c4a97d' }}>
          <span className="block w-7 h-px bg-gold mr-2 flex-shrink-0" />
          O que esperar dos resultados
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-light text-white">
          Nossa <em className="italic text-gold">promessa</em> para você
        </h2>
        <p className="text-stone-400 text-sm leading-relaxed mt-3 max-w-lg">
          Na CB Odonto, cada tratamento é adaptado às suas necessidades, garantindo um plano
          odontológico exclusivo para você.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-px bg-gold/10">
        {pillars.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="bg-stone-900 border border-gold/10 p-10 hover:bg-gold/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center mb-6 text-gold">
              <Icon size={18} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-xl text-white mb-3">{title}</h3>
            <p className="text-stone-400 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// src/components/site/Location.tsx
import { waLink } from '@/lib/utils'

interface LocationProps {
  settings: {
    whatsappNumber: string
    addressLine1?: string | null
    addressLine2?: string | null
    openHours?: string | null
  }
}

export default function Location({ settings }: LocationProps) {
  const { whatsappNumber: waNumber, addressLine1, addressLine2, openHours } = settings

  const addressText = addressLine1 && addressLine2 
    ? `${addressLine1}\n${addressLine2}`
    : settings.addressLine1 || 'R. Casemiro de Abreu, 238 – Maracanã\nColombo – PR, 83409-070'

  return (
    <section id="localizacao" className="bg-stone-900">
      <div className="max-w-[1600px] mx-auto grid md:grid-cols-2 min-h-[480px]">
      <div className="py-16 px-[8%] flex flex-col justify-center">
        <p className="section-tag mb-4" style={{ color: '#21A8A0' }}>Onde nos encontrar</p>
        <h2 className="font-serif text-4xl font-light text-white mb-8">
          Venha nos <em className="italic text-gold">visitar</em>
        </h2>

        {[
          {
            label: 'Endereço',
            text: addressText,
            icon: (
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
            ),
          },
          {
            label: 'WhatsApp & Telefone',
            text: `(${waNumber.slice(2, 4)}) ${waNumber.slice(4, 9)}-${waNumber.slice(9)}`,
            href: `https://wa.me/${waNumber}`,
            icon: (
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.42 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            ),
          },
          {
            label: 'Horário de Atendimento',
            text: openHours || 'Segunda a Sexta: 08h – 18h\nSábado: mediante agendamento',
            icon: (
              <>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </>
            ),
          },
        ].map((item) => (
          <div key={item.label} className="flex gap-4 mb-6">
            <div className="w-9 h-9 rounded-full border border-gold/30 flex items-center justify-center shrink-0 mt-0.5">
              <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-gold fill-none" strokeWidth={1.5}>
                {item.icon}
              </svg>
            </div>
            <div>
              <p className="text-[0.65rem] tracking-widest uppercase text-gold mb-1">{item.label}</p>
              {item.href ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer"
                   className="text-stone-400 text-sm hover:text-gold transition-colors">
                  {item.text}
                </a>
              ) : (
                <p className="text-stone-400 text-sm whitespace-pre-line">{item.text}</p>
              )}
            </div>
          </div>
        ))}

        <a
          href={waLink(waNumber, 'Olá, vim do site! Quero agendar.')}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-2 self-start"
        >
          Falar pelo WhatsApp →
        </a>
      </div>

      <div className="min-h-[320px] md:min-h-0">
        <iframe
          src="https://maps.google.com/maps?q=R.+Casemiro+de+Abreu,+238,+Colombo,+PR&output=embed&z=16"
          className="w-full h-full min-h-[320px]"
          loading="lazy"
          title="CB Odonto – Localização"
          style={{ filter: 'grayscale(20%) contrast(1.05)' }}
        />
      </div>
      </div>
    </section>
  )
}

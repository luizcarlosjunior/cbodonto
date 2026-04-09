// src/components/site/Footer.tsx

export default function Footer({ waNumber }: { waNumber: string }) {
  return (
    <footer className="bg-[#0f0d0b] border-t border-gold/10 px-[8%] py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 500 500" fill="none" opacity={0.5}>
            <path d="M250 80 C170 80 110 160 110 260 C110 360 170 420 250 420 C290 420 310 400 320 390" stroke="white" strokeWidth="22" strokeLinecap="round" />
            <path d="M280 90 C280 90 280 250 280 420" stroke="white" strokeWidth="18" strokeLinecap="round" />
            <path d="M280 90 C330 90 390 110 390 175 C390 240 330 255 280 255" stroke="white" strokeWidth="18" strokeLinecap="round" />
            <path d="M280 255 C340 255 400 278 400 340 C400 400 340 420 280 420" stroke="white" strokeWidth="18" strokeLinecap="round" />
          </svg>
          <span className="font-serif text-stone-500 text-sm">CB Odonto</span>
        </div>
        <p className="text-stone-600 text-[0.7rem] tracking-wide">
          © {new Date().getFullYear()} Campozano &amp; Barcellos Odontologia · Colombo, PR
        </p>
        <div className="flex gap-6">
          {[
            ['#servicos', 'Serviços'],
            ['#sobre', 'Sobre'],
            ['#agendamento', 'Agendar'],
            [`https://wa.me/${waNumber}`, 'WhatsApp'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="text-stone-600 text-[0.7rem] tracking-widest uppercase hover:text-gold transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

// src/app/layout.tsx
import { GoogleTagManager } from '@next/third-parties/google'
import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: 'CB Odonto – Campozano & Barcellos Odontologia | Colombo, PR',
  description:
    'Clínica odontológica em Colombo-PR com cirurgiões-dentistas. Clínica geral, estética, harmonização orofacial e muito mais. Agende pelo WhatsApp.',
  keywords: 'dentista colombo, odontologia colombo pr, harmonização orofacial, clínica dentária',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${dmSans.variable}`}>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID!} />
      <body className="font-sans bg-cream text-stone-800 antialiased overflow-x-hidden">{children}</body>
    </html>
  )
}

'use client'
// src/components/site/BookingSection.tsx
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { SERVICES, DAY_NAMES_SHORT } from '@/lib/utils'
import type { Dentist, WeeklySchedule } from '@prisma/client'

type DentistWithSchedule = Dentist & { weeklySchedule: WeeklySchedule[] }

interface Props {
  dentists: DentistWithSchedule[]
}

export default function BookingSection({ dentists }: Props) {
  const [form, setForm] = useState({
    dentistId: '',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    service: '',
    date: '',
    startTime: '',
    notes: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')
  const [takenSlots, setTakenSlots] = useState<string[]>([])

  const selectedDentist = dentists.find((d) => d.id === form.dentistId)

  // Calculate min date (today)
  const today = new Date().toISOString().split('T')[0]

  // Get available days for selected dentist
  const availableDays = selectedDentist?.weeklySchedule.map((s) => s.dayOfWeek) ?? []

  // Fetch taken slots when dentist + date change
  useEffect(() => {
    if (!form.dentistId || !form.date) { setTakenSlots([]); return }
    fetch(`/api/slots?dentistId=${form.dentistId}&date=${form.date}`)
      .then((r) => r.json())
      .then((d) => setTakenSlots(d.takenSlots ?? []))
      .catch(() => setTakenSlots([]))
  }, [form.dentistId, form.date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao agendar')
      setStatus('success')
      setMsg('Agendamento solicitado com sucesso! Entraremos em contato para confirmar.')
      setForm({ dentistId: '', guestName: '', guestPhone: '', guestEmail: '', service: '', date: '', startTime: '', notes: '' })
    } catch (err: any) {
      setStatus('error')
      setMsg(err.message)
    }
  }

  return (
    <section id="agendamento" className="bg-stone-900 py-20">
      <div className="max-w-[1600px] mx-auto px-[8%]">
      <div className="grid md:grid-cols-2 gap-14 items-start">
        {/* Left */}
        <div>
          <p className="section-tag mb-4" style={{ color: '#21A8A0' }}>Agende sua consulta</p>
          <h2 className="font-serif text-4xl font-light text-white mb-5">
            Reserve seu <em className="italic text-gold">horário</em>
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed mb-8">
            Preencha o formulário e nossa equipe entrará em contato para confirmar o horário.
            Atendemos de segunda a sexta das 08h às 18h.
          </p>

          {/* Dentists cards */}
          <div className="space-y-4">
            {dentists.map((d) => (
              <div key={d.id} className="flex items-start gap-4 p-4 border border-gold/10 bg-white/5">
                <div className="w-10 h-10 rounded-full border border-burgundy/50 overflow-hidden shrink-0 bg-burgundy/30 flex items-center justify-center">
                  {d.photoUrl ? (
                    <Image src={d.photoUrl} alt={d.name} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <span className="text-white font-serif text-lg">{d.name.charAt(d.name.indexOf('.') + 2)}</span>
                  )}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{d.name}</p>
                  <p className="text-stone-400 text-xs mt-0.5">{d.specialty}</p>
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4,5,6,0].map((day) => (
                      <span
                        key={day}
                        className={`text-[0.6rem] px-1.5 py-0.5 rounded-sm ${
                          d.weeklySchedule.some((s) => s.dayOfWeek === day)
                            ? 'bg-burgundy/40 text-white'
                            : 'bg-white/5 text-stone-600'
                        }`}
                      >
                        {DAY_NAMES_SHORT[day]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-cream p-8">
          {status === 'success' ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-serif text-xl text-stone-800 mb-2">Solicitação enviada!</p>
              <p className="text-stone-500 text-sm leading-relaxed">{msg}</p>
              <button
                onClick={() => setStatus('idle')}
                className="btn-primary mt-6 mx-auto"
              >
                Novo agendamento
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-serif text-xl text-stone-900 mb-6">Dados do agendamento</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">Nome completo *</label>
                  <input
                    required
                    value={form.guestName}
                    onChange={(e) => setForm((f) => ({ ...f, guestName: e.target.value }))}
                    className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy bg-white"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">WhatsApp *</label>
                  <input
                    required
                    value={form.guestPhone}
                    onChange={(e) => setForm((f) => ({ ...f, guestPhone: e.target.value }))}
                    className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy bg-white"
                    placeholder="(41) 99999-9999"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">E-mail</label>
                  <input
                    type="email"
                    value={form.guestEmail}
                    onChange={(e) => setForm((f) => ({ ...f, guestEmail: e.target.value }))}
                    className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy bg-white"
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">Dentista *</label>
                  <select
                    required
                    value={form.dentistId}
                    onChange={(e) => setForm((f) => ({ ...f, dentistId: e.target.value }))}
                    className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy bg-white"
                  >
                    <option value="">Selecionar dentista</option>
                    {dentists.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">Serviço *</label>
                  <select
                    required
                    value={form.service}
                    onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                    className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy bg-white"
                  >
                    <option value="">Selecionar serviço</option>
                    {SERVICES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">Data preferida *</label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">Horário preferido</label>
                  <select
                    value={form.startTime}
                    onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                    className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy bg-white"
                  >
                    <option value="">Qualquer horário</option>
                    {['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
                      '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'].map((t) => {
                      const taken = takenSlots.includes(t)
                      return (
                        <option key={t} value={t} disabled={taken}>
                          {t}{taken ? ' — Ocupado' : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">Observações</label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy bg-white resize-none"
                    placeholder="Alguma informação adicional..."
                  />
                </div>
              </div>

              {status === 'error' && (
                <p className="text-red-600 text-xs bg-red-50 px-3 py-2 border border-red-200">{msg}</p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-primary w-full justify-center"
              >
                {status === 'loading' ? 'Enviando...' : 'Solicitar Agendamento'}
              </button>
              <p className="text-[0.65rem] text-stone-400 text-center">
                Confirmaremos seu horário por WhatsApp em até 2h durante o horário de atendimento.
              </p>
            </form>
          )}
        </div>
      </div>
      </div>
    </section>
  )
}

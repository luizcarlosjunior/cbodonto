'use client'
// src/components/site/BookingSection.tsx
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { SERVICES, DAY_NAMES_SHORT, cn } from '@/lib/utils'
import type { Dentist, WeeklySchedule } from '@prisma/client'

type DentistWithSchedule = Dentist & { weeklySchedule: WeeklySchedule[] }

interface Props {
  dentists: DentistWithSchedule[]
}

// ─── Module-level helpers ─────────────────────────────────────────────────────

const ALL_SLOTS = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
]

/** Safe local-date ISO string — avoids UTC offset shifting the day (Brazil UTC-3) */
function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Today + next 15 days = 16 total */
function generateDateStrip(): Date[] {
  const base = new Date()
  base.setHours(0, 0, 0, 0)
  return Array.from({ length: 16 }, (_, i) => {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    return d
  })
}

/** Returns available slots for a given schedule, minus taken ones.
 *  Prefers the granular `slots` field; falls back to startTime/endTime range. */
function getDaySlots(schedule: (WeeklySchedule & { slots?: string | null }) | undefined, taken: string[]): string[] {
  if (!schedule) return []
  let base: string[]
  if (schedule.slots) {
    base = schedule.slots.split(',').filter(Boolean)
  } else {
    const mins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
    const start = mins(schedule.startTime)
    const end   = mins(schedule.endTime)
    base = ALL_SLOTS.filter((s) => mins(s) >= start && mins(s) < end)
  }
  return base.filter((s) => !taken.includes(s))
}

/** "Qui 10/04" */
function formatDayLabel(d: Date): string {
  return `${DAY_NAMES_SHORT[d.getDay()]} ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ─── Component ────────────────────────────────────────────────────────────────

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
  const [slotsLoading, setSlotsLoading] = useState(false)

  const selectedDentist = dentists.find((d) => d.id === form.dentistId)

  // Derived: date strip + available slots
  const dateStrip = generateDateStrip()

  const scheduleForDate = (form.date && selectedDentist)
    ? selectedDentist.weeklySchedule.find(
        (s) => s.dayOfWeek === new Date(form.date + 'T00:00:00').getDay()
      )
    : undefined

  const availableSlots = getDaySlots(scheduleForDate, takenSlots)

  // Fetch taken slots when dentist + date change
  useEffect(() => {
    if (!form.dentistId || !form.date) {
      setTakenSlots([])
      setSlotsLoading(false)
      return
    }
    setSlotsLoading(true)
    fetch(`/api/slots?dentistId=${form.dentistId}&date=${form.date}`)
      .then((r) => r.json())
      .then((d) => { setTakenSlots(d.takenSlots ?? []); setSlotsLoading(false) })
      .catch(() => { setTakenSlots([]); setSlotsLoading(false) })
  }, [form.dentistId, form.date])

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleDentistSelect = (id: string) =>
    setForm((f) => ({ ...f, dentistId: id, date: '', startTime: '' }))

  const handleDateSelect = (date: Date) => {
    const works = selectedDentist?.weeklySchedule.some((s) => s.dayOfWeek === date.getDay())
    if (!works) return
    setForm((f) => ({ ...f, date: toISODate(date), startTime: '' }))
  }

  const handleSlotSelect = (slot: string) =>
    setForm((f) => ({ ...f, startTime: slot }))

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

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <section id="agendamento" className="bg-stone-900 py-20">
      <div className="max-w-[1600px] mx-auto px-[8%]">
      <div className="grid md:grid-cols-2 gap-14 items-start">

        {/* ── Left panel ─────────────────────────────────────────────────── */}
        <div>
          <p className="section-tag mb-4" style={{ color: '#21A8A0' }}>Agende sua consulta</p>
          <h2 className="font-serif text-4xl font-light text-white mb-5">
            Reserve seu <em className="italic text-gold">horário</em>
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed mb-8">
            Preencha o formulário e nossa equipe entrará em contato para confirmar o horário.
            Atendemos de segunda a sexta das 08h às 18h.
          </p>

          {/* Dentist cards — clickable */}
          <div className="space-y-3">
            {dentists.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleDentistSelect(d.id)}
                className={cn(
                  'flex items-start gap-4 p-4 border text-left w-full transition-all',
                  form.dentistId === d.id
                    ? 'border-burgundy/70 bg-white/10'
                    : 'border-gold/10 bg-white/5 hover:border-gold/30 hover:bg-white/8'
                )}
              >
                <div className="w-10 h-10 rounded-full border border-burgundy/50 overflow-hidden shrink-0 bg-burgundy/30 flex items-center justify-center">
                  {d.photoUrl ? (
                    <Image src={d.photoUrl} alt={d.name} width={40} height={40} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <span className="text-white font-serif text-lg">{d.name.charAt(d.name.indexOf('.') + 2)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">{d.name}</p>
                    {form.dentistId === d.id && (
                      <span className="text-[0.55rem] bg-burgundy/80 text-white px-1.5 py-0.5 rounded-sm tracking-wide">Selecionado</span>
                    )}
                  </div>
                  <p className="text-stone-400 text-xs mt-0.5">{d.specialty}</p>
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4,5,6,0].map((day) => (
                      <span
                        key={day}
                        className={cn(
                          'text-[0.6rem] px-1.5 py-0.5 rounded-sm',
                          d.weeklySchedule.some((s) => s.dayOfWeek === day)
                            ? 'bg-burgundy/40 text-white'
                            : 'bg-white/5 text-stone-600'
                        )}
                      >
                        {DAY_NAMES_SHORT[day]}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Right panel — form ──────────────────────────────────────────── */}
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
              <button onClick={() => setStatus('idle')} className="btn-primary mt-6 mx-auto">
                Novo agendamento
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-serif text-xl text-stone-900 mb-6">Dados do agendamento</h3>

              <div className="grid grid-cols-2 gap-4">

                {/* Name */}
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

                {/* Phone */}
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

                {/* Email */}
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

                {/* Dentist dropdown (synced with card clicks) */}
                <div className="col-span-2">
                  <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">Dentista *</label>
                  <select
                    required
                    value={form.dentistId}
                    onChange={(e) => handleDentistSelect(e.target.value)}
                    className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy bg-white"
                  >
                    <option value="">Selecionar dentista</option>
                    {dentists.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Service */}
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

                {/* Date select — only after dentist selected */}
                {selectedDentist && (
                  <div className="col-span-2">
                    <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">
                      Data preferida *
                    </label>
                    <select
                      required
                      value={form.date}
                      onChange={(e) => {
                        const date = dateStrip.find((d) => toISODate(d) === e.target.value)
                        if (date) handleDateSelect(date)
                      }}
                      className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy bg-white"
                    >
                      <option value="">Selecionar data</option>
                      {dateStrip.map((date) => {
                        const works = selectedDentist.weeklySchedule.some((s) => s.dayOfWeek === date.getDay())
                        const iso   = toISODate(date)
                        return (
                          <option key={iso} value={iso} disabled={!works}>
                            {formatDayLabel(date)}{!works ? ' — Indisponível' : ''}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                )}

                {/* Time slot buttons — only after date selected */}
                {form.date && (
                  <div className="col-span-2">
                    <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">
                      Horário *
                    </label>
                    {slotsLoading ? (
                      <p className="text-xs text-stone-400 py-1.5">Verificando disponibilidade...</p>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-xs text-stone-500 bg-stone-100 border border-stone-200 px-3 py-2">
                        Nenhum horário disponível para este dia. Selecione outra data.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleSlotSelect(slot)}
                            className={cn(
                              'px-3 py-1.5 text-xs font-medium border transition-all rounded-sm',
                              form.startTime === slot
                                ? 'bg-burgundy border-burgundy text-white'
                                : 'border-stone-200 bg-white text-stone-700 hover:border-burgundy hover:text-burgundy'
                            )}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}
                    {/* Hidden required input to trigger form validation */}
                    <input
                      required
                      readOnly
                      value={form.startTime}
                      className="sr-only"
                      tabIndex={-1}
                      aria-hidden
                    />
                  </div>
                )}

                {/* Notes */}
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
                disabled={status === 'loading' || !form.startTime}
                className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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

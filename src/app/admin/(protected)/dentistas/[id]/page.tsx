'use client'
// src/app/admin/dentistas/[id]/page.tsx
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save, AlertTriangle } from 'lucide-react'
import Switch from '@/components/admin/Switch'
import { DAY_NAMES, formatDate, cn } from '@/lib/utils'
import Link from 'next/link'

// Same slots shown to the client on the public booking form
const ALL_SLOTS = [
  '08:00','08:30','09:00','09:30','10:00','10:30',
  '11:00','11:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30',
]

const TIMES = Array.from({ length: 24 }, (_, h) =>
  [`${String(h).padStart(2,'0')}:00`, `${String(h).padStart(2,'0')}:30`]
).flat()

function toMins(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function addThirtyMin(t: string): string {
  const total = toMins(t) + 30
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** Derive selected slots from a startTime–endTime range */
function slotsFromRange(startTime: string, endTime: string): string[] {
  if (!startTime || !endTime) return []
  const s = toMins(startTime)
  const e = toMins(endTime)
  return ALL_SLOTS.filter((slot) => toMins(slot) >= s && toMins(slot) < e)
}

/** Compute startTime / endTime from an ordered selection of slots */
function rangeFromSlots(slots: string[]): { startTime: string; endTime: string } {
  if (slots.length === 0) return { startTime: '08:00', endTime: '18:00' }
  const sorted = [...slots].sort((a, b) => toMins(a) - toMins(b))
  return { startTime: sorted[0], endTime: addThirtyMin(sorted[sorted.length - 1]) }
}

// ─── Schedule row state ────────────────────────────────────────────────────────

interface DaySchedule {
  dayOfWeek: number
  active: boolean
  slots: string[]   // selected 30-min blocks
}

export default function DentistSchedulePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [dentist, setDentist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schedules, setSchedules] = useState<DaySchedule[]>([])
  const [unavailables, setUnavailables] = useState<any[]>([])
  const [msg, setMsg] = useState('')
  const [newUnavail, setNewUnavail] = useState({ date: '', startTime: '', endTime: '', reason: '' })
  const [addingUnavail, setAddingUnavail] = useState(false)

  const fetchDentist = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/dentists/${id}`)
    if (!res.ok) { router.push('/admin/dentistas'); return }
    const data = await res.json()
    setDentist(data)

    const grid: DaySchedule[] = [1,2,3,4,5,6,0].map((day) => {
      const existing = data.weeklySchedule?.find((s: any) => s.dayOfWeek === day)
      // Prefer the granular `slots` field if present; fall back to deriving from range
      const loadedSlots = existing?.active
        ? (existing.slots
            ? existing.slots.split(',').filter(Boolean)
            : slotsFromRange(existing.startTime ?? '08:00', existing.endTime ?? '18:00'))
        : []
      return {
        dayOfWeek: day,
        active: existing?.active ?? false,
        slots: loadedSlots,
      }
    })
    setSchedules(grid)
    setUnavailables(data.unavailableDates ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchDentist() }, [id])

  const toggleActive = (dayOfWeek: number, active: boolean) => {
    setSchedules((prev) => prev.map((s) =>
      s.dayOfWeek === dayOfWeek
        ? { ...s, active, slots: active && s.slots.length === 0
            ? slotsFromRange('08:00', '18:00')  // default full day on first activation
            : s.slots }
        : s
    ))
  }

  const toggleSlot = (dayOfWeek: number, slot: string) => {
    setSchedules((prev) => prev.map((s) => {
      if (s.dayOfWeek !== dayOfWeek) return s
      const has = s.slots.includes(slot)
      return { ...s, slots: has ? s.slots.filter((x) => x !== slot) : [...s.slots, slot] }
    }))
  }

  const saveSchedules = async () => {
    setSaving(true)
    setMsg('')
    // Convert slots → startTime/endTime range + save exact slots CSV
    const payload = schedules.map((s) => {
      const { startTime, endTime } = rangeFromSlots(s.slots)
      const sorted = [...s.slots].sort((a, b) => toMins(a) - toMins(b))
      return { dayOfWeek: s.dayOfWeek, active: s.active, startTime, endTime, slots: sorted.join(',') }
    })
    const res = await fetch(`/api/admin/dentists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weeklySchedule: payload }),
    })
    setSaving(false)
    setMsg(res.ok ? 'Horários salvos com sucesso!' : 'Erro ao salvar.')
    setTimeout(() => setMsg(''), 3000)
  }

  const addUnavailable = async () => {
    if (!newUnavail.date) return
    setAddingUnavail(true)
    const res = await fetch(`/api/admin/dentists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addUnavailable: newUnavail }),
    })
    if (res.ok) {
      await fetchDentist()
      setNewUnavail({ date: '', startTime: '', endTime: '', reason: '' })
    }
    setAddingUnavail(false)
  }

  const removeUnavailable = async (unavailId: string) => {
    if (!confirm('Remover esta indisponibilidade?')) return
    await fetch(`/api/admin/dentists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ removeUnavailableId: unavailId }),
    })
    fetchDentist()
  }

  if (loading) return <div className="p-8"><div className="h-8 w-64 bg-stone-200 rounded animate-pulse" /></div>

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/dentistas" className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-sm transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-serif text-3xl text-stone-900">{dentist?.name}</h1>
          <p className="text-stone-400 text-sm">{dentist?.title} · {dentist?.cro}</p>
        </div>
      </div>

      {/* ── Weekly schedule ──────────────────────────────────────────────── */}
      <div className="bg-white border border-stone-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-serif text-xl text-stone-900">Disponibilidade Semanal</h2>
            <p className="text-stone-400 text-xs mt-0.5">
              Ative os dias e selecione os horários disponíveis — os mesmos blocos que o paciente verá ao agendar.
            </p>
          </div>
          <button onClick={saveSchedules} disabled={saving} className="btn-primary gap-2">
            <Save size={13} />
            {saving ? 'Salvando...' : 'Salvar Horários'}
          </button>
        </div>

        {msg && (
          <div className={cn(
            'mb-4 px-4 py-2.5 text-sm border rounded-sm',
            msg.includes('sucesso') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
          )}>
            {msg}
          </div>
        )}

        <div className="space-y-3">
          {schedules.map((s) => (
            <div
              key={s.dayOfWeek}
              className={cn(
                'border rounded-sm p-4 transition-colors',
                s.active ? 'border-burgundy/20 bg-burgundy/5' : 'border-stone-100 bg-stone-50'
              )}
            >
              {/* Day header */}
              <div className="flex items-center gap-3 mb-3">
                <Switch
                  checked={s.active}
                  onChange={(v) => toggleActive(s.dayOfWeek, v)}
                />
                <span className={cn('text-sm font-medium w-20', s.active ? 'text-stone-800' : 'text-stone-400')}>
                  {DAY_NAMES[s.dayOfWeek]}
                </span>
                {s.active && s.slots.length > 0 && (
                  <span className="text-[0.65rem] text-stone-400 ml-1">
                    {s.slots.length} horário{s.slots.length !== 1 ? 's' : ''}
                    {' · '}
                    {(() => { const { startTime, endTime } = rangeFromSlots(s.slots); return `${startTime} – ${endTime}` })()}
                  </span>
                )}
                {s.active && s.slots.length === 0 && (
                  <span className="text-[0.65rem] text-amber-500">Nenhum horário selecionado</span>
                )}
                {!s.active && (
                  <span className="text-[0.65rem] text-stone-400">Fechado</span>
                )}
              </div>

              {/* Slot grid */}
              {s.active && (
                <div className="flex flex-wrap gap-1.5">
                  {ALL_SLOTS.map((slot) => {
                    const selected = s.slots.includes(slot)
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleSlot(s.dayOfWeek, slot)}
                        className={cn(
                          'px-3 py-1.5 text-xs font-medium border transition-all rounded-sm',
                          selected
                            ? 'bg-burgundy border-burgundy text-white'
                            : 'border-stone-200 bg-white text-stone-500 hover:border-burgundy hover:text-burgundy'
                        )}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Unavailable dates ─────────────────────────────────────────────── */}
      <div className="bg-white border border-stone-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={16} className="text-amber-500" />
          <h2 className="font-serif text-xl text-stone-900">Indisponibilidades</h2>
        </div>
        <p className="text-stone-400 text-xs mb-5">Datas ou períodos específicos em que o dentista não atenderá (férias, emergências, etc).</p>

        {/* Add new */}
        <div className="bg-stone-50 border border-stone-200 p-4 mb-5">
          <p className="text-[0.7rem] tracking-widest uppercase text-stone-400 mb-3">Adicionar Indisponibilidade</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="text-[0.65rem] text-stone-400 block mb-1">Data *</label>
              <input type="date" value={newUnavail.date}
                onChange={(e) => setNewUnavail((f) => ({ ...f, date: e.target.value }))}
                className="w-full border border-stone-200 px-2.5 py-2 text-sm focus:outline-none focus:border-burgundy bg-white" />
            </div>
            <div>
              <label className="text-[0.65rem] text-stone-400 block mb-1">Início (vazio = dia todo)</label>
              <select value={newUnavail.startTime}
                onChange={(e) => setNewUnavail((f) => ({ ...f, startTime: e.target.value }))}
                className="w-full border border-stone-200 px-2.5 py-2 text-sm focus:outline-none focus:border-burgundy bg-white">
                <option value="">Dia inteiro</option>
                {TIMES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[0.65rem] text-stone-400 block mb-1">Fim</label>
              <select value={newUnavail.endTime}
                onChange={(e) => setNewUnavail((f) => ({ ...f, endTime: e.target.value }))}
                className="w-full border border-stone-200 px-2.5 py-2 text-sm focus:outline-none focus:border-burgundy bg-white">
                <option value="">—</option>
                {TIMES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[0.65rem] text-stone-400 block mb-1">Motivo</label>
              <input value={newUnavail.reason}
                onChange={(e) => setNewUnavail((f) => ({ ...f, reason: e.target.value }))}
                placeholder="Opcional"
                className="w-full border border-stone-200 px-2.5 py-2 text-sm focus:outline-none focus:border-burgundy bg-white" />
            </div>
          </div>
          <button onClick={addUnavailable} disabled={!newUnavail.date || addingUnavail} className="btn-primary">
            <Plus size={13} />
            {addingUnavail ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>

        {/* List */}
        {unavailables.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-4">Nenhuma indisponibilidade registrada.</p>
        ) : (
          <div className="space-y-2">
            {unavailables.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                  <div>
                    <p className="text-sm text-stone-800 font-medium">{formatDate(u.date)}</p>
                    <p className="text-xs text-stone-500">
                      {u.startTime ? `${u.startTime}–${u.endTime || '?'}` : 'Dia inteiro'}
                      {u.reason && ` · ${u.reason}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => removeUnavailable(u.id)} className="p-1.5 text-stone-400 hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

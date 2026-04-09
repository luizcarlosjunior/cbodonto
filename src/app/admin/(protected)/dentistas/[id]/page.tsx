'use client'
// src/app/admin/dentistas/[id]/page.tsx
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Save, AlertTriangle } from 'lucide-react'
import Switch from '@/components/admin/Switch'
import { DAY_NAMES, formatDate } from '@/lib/utils'
import Link from 'next/link'

const TIMES = Array.from({ length: 24 }, (_, h) =>
  [`${String(h).padStart(2,'0')}:00`, `${String(h).padStart(2,'0')}:30`]
).flat()

export default function DentistSchedulePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [dentist, setDentist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [schedules, setSchedules] = useState<any[]>([])
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
    // Build 7-day schedule grid
    const grid = [1,2,3,4,5,6,0].map((day) => {
      const existing = data.weeklySchedule?.find((s: any) => s.dayOfWeek === day)
      return {
        dayOfWeek: day,
        startTime: existing?.startTime ?? '08:00',
        endTime: existing?.endTime ?? '18:00',
        active: existing?.active ?? false,
      }
    })
    setSchedules(grid)
    setUnavailables(data.unavailableDates ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchDentist() }, [id])

  const updateScheduleField = (dayOfWeek: number, field: string, value: any) => {
    setSchedules((prev) => prev.map((s) => s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s))
  }

  const saveSchedules = async () => {
    setSaving(true)
    setMsg('')
    const res = await fetch(`/api/admin/dentists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weeklySchedule: schedules }),
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

      {/* Weekly schedule */}
      <div className="bg-white border border-stone-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-serif text-xl text-stone-900">Disponibilidade Semanal</h2>
            <p className="text-stone-400 text-xs mt-0.5">Configure os horários de atendimento por dia da semana.</p>
          </div>
          <button onClick={saveSchedules} disabled={saving} className="btn-primary gap-2">
            <Save size={13} />
            {saving ? 'Salvando...' : 'Salvar Horários'}
          </button>
        </div>

        {msg && (
          <div className={`mb-4 px-4 py-2.5 text-sm border rounded-sm ${msg.includes('sucesso') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
            {msg}
          </div>
        )}

        <div className="space-y-2">
          {schedules.map((s) => (
            <div key={s.dayOfWeek} className={`grid grid-cols-[120px_1fr_1fr_80px] gap-3 items-center p-3 rounded-sm border transition-colors ${s.active ? 'border-burgundy/20 bg-burgundy/5' : 'border-stone-100 bg-stone-50'}`}>
              <div className="flex items-center gap-2">
                <Switch
                  checked={s.active}
                  onChange={(v) => updateScheduleField(s.dayOfWeek, 'active', v)}
                />
                <span className={`text-sm font-medium ${s.active ? 'text-stone-800' : 'text-stone-400'}`}>
                  {DAY_NAMES[s.dayOfWeek]}
                </span>
              </div>
              <div>
                <label className="text-[0.65rem] text-stone-400 block mb-0.5">Início</label>
                <select
                  disabled={!s.active}
                  value={s.startTime}
                  onChange={(e) => updateScheduleField(s.dayOfWeek, 'startTime', e.target.value)}
                  className="border border-stone-200 px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-burgundy disabled:opacity-40 w-24"
                >
                  {TIMES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[0.65rem] text-stone-400 block mb-0.5">Fim</label>
                <select
                  disabled={!s.active}
                  value={s.endTime}
                  onChange={(e) => updateScheduleField(s.dayOfWeek, 'endTime', e.target.value)}
                  className="border border-stone-200 px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-burgundy disabled:opacity-40 w-24"
                >
                  {TIMES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="text-xs text-stone-400 text-center">
                {s.active ? `${s.startTime}–${s.endTime}` : 'Fechado'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Unavailable dates */}
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

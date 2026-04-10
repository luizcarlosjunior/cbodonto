'use client'
// src/app/admin/(protected)/agendamentos/[id]/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Check, X, Clock, Calendar, User, Phone, Mail, Stethoscope, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { STATUS_LABELS, STATUS_COLORS, formatDate, SERVICES } from '@/lib/utils'

const ALL_SLOTS = [
  '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30',
]

function addThirtyMin(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + 30
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [appointment, setAppointment] = useState<any>(null)
  const [dentists, setDentists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<any>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [aRes, dRes] = await Promise.all([
      fetch(`/api/admin/appointments/${id}`),
      fetch('/api/admin/dentists'),
    ])
    if (aRes.ok) {
      const a = await aRes.json()
      setAppointment(a)
      setForm({
        dentistId: a.dentistId,
        guestName: a.guestName ?? '',
        guestPhone: a.guestPhone ?? '',
        guestEmail: a.guestEmail ?? '',
        service: a.service,
        date: a.date ? a.date.slice(0, 10) : '',
        startTime: a.startTime ?? '',
        endTime: a.endTime ?? '',
        status: a.status,
        notes: a.notes ?? '',
      })
    }
    if (dRes.ok) {
      const data = await dRes.json()
      setDentists(data.dentists ?? data)
    }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const set = (k: string, v: string) => {
    setForm((f: any) => {
      const updated = { ...f, [k]: v }
      if (k === 'startTime' && v) updated.endTime = addThirtyMin(v)
      return updated
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      await load()
    } catch (err: any) {
      setError(err.message)
    }
    setSaving(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      await load()
    } catch (err: any) {
      setError(err.message)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto">
        <div className="h-8 w-40 bg-stone-200 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-20 bg-stone-200 rounded animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto text-center text-stone-400 mt-20">
        <AlertCircle size={32} className="mx-auto mb-3" />
        <p>Agendamento não encontrado.</p>
        <Link href="/admin/agendamentos" className="mt-4 inline-block text-burgundy hover:underline text-sm">
          ← Voltar à lista
        </Link>
      </div>
    )
  }

  const statusActions: { status: string; label: string; color: string }[] = [
    { status: 'CONFIRMED', label: 'Aprovar', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    { status: 'COMPLETED', label: 'Concluir', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { status: 'CANCELLED', label: 'Cancelar', color: 'bg-red-600 hover:bg-red-700 text-white' },
    { status: 'NO_SHOW', label: 'Não compareceu', color: 'bg-stone-600 hover:bg-stone-700 text-white' },
    { status: 'PENDING', label: 'Voltar para Pendente', color: 'bg-amber-500 hover:bg-amber-600 text-white' },
  ].filter((a) => a.status !== appointment.status)

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      {/* Back */}
      <Link href="/admin/agendamentos" className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-700 text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> Agendamentos
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl text-stone-900">
            {appointment.patient?.name ?? appointment.guestName ?? 'Sem nome'}
          </h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[0.65rem] px-2.5 py-1 rounded-full font-medium tracking-wide ${STATUS_COLORS[appointment.status]}`}>
              {STATUS_LABELS[appointment.status]}
            </span>
            <span className="text-stone-400 text-xs">#{id.slice(-8).toUpperCase()}</span>
          </div>
        </div>

        {/* Quick status actions */}
        <div className="flex flex-wrap gap-2">
          {statusActions.map((a) => (
            <button
              key={a.status}
              onClick={() => handleStatusChange(a.status)}
              disabled={saving}
              className={`text-xs px-4 py-2 rounded-sm font-medium transition-colors disabled:opacity-50 ${a.color}`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Approval notice */}
      {appointment.status === 'CONFIRMED' && (
        <div className="mb-4 bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-xs flex items-center gap-2">
          <Clock size={13} className="shrink-0" />
          Horário <strong>{appointment.startTime}</strong> de <strong>{formatDate(appointment.date)}</strong> está bloqueado na área pública.
        </div>
      )}

      <div className="grid gap-4">
        {/* Info card */}
        <div className="bg-white border border-stone-200 p-5 grid grid-cols-2 gap-4">
          <div className="col-span-2 pb-4 border-b border-stone-100">
            <p className="text-[0.65rem] tracking-widest uppercase text-stone-400 mb-3">Informações do agendamento</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Calendar size={14} className="text-stone-400 shrink-0" />
                {formatDate(appointment.date)}
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Clock size={14} className="text-stone-400 shrink-0" />
                {appointment.startTime}{appointment.endTime ? ` – ${appointment.endTime}` : ''}
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <Stethoscope size={14} className="text-stone-400 shrink-0" />
                {appointment.dentist?.name}
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-600 col-span-1 truncate">
                <FileText size={14} className="text-stone-400 shrink-0" />
                {appointment.service}
              </div>
            </div>
          </div>

          <div className="col-span-2">
            <p className="text-[0.65rem] tracking-widest uppercase text-stone-400 mb-3">Paciente</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <User size={14} className="text-stone-400 shrink-0" />
                {appointment.patient?.name ?? appointment.guestName ?? '—'}
              </div>
              {(appointment.patient?.phone ?? appointment.guestPhone) && (
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Phone size={14} className="text-stone-400 shrink-0" />
                  {appointment.patient?.phone ?? appointment.guestPhone}
                </div>
              )}
              {(appointment.patient?.email ?? appointment.guestEmail) && (
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Mail size={14} className="text-stone-400 shrink-0" />
                  {appointment.patient?.email ?? appointment.guestEmail}
                </div>
              )}
            </div>
          </div>

          {appointment.notes && (
            <div className="col-span-2 border-t border-stone-100 pt-4">
              <p className="text-[0.65rem] tracking-widest uppercase text-stone-400 mb-2">Observações</p>
              <p className="text-sm text-stone-600">{appointment.notes}</p>
            </div>
          )}
        </div>

        {/* Edit form */}
        <div className="bg-white border border-stone-200 p-5">
          <p className="text-[0.65rem] tracking-widest uppercase text-stone-400 mb-4">Editar</p>
          {form && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="admin-label">Dentista *</label>
                <select required value={form.dentistId} onChange={(e) => set('dentistId', e.target.value)} className="admin-input">
                  {dentists.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="admin-label">Nome do paciente</label>
                <input value={form.guestName} onChange={(e) => set('guestName', e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Telefone</label>
                <input value={form.guestPhone} onChange={(e) => set('guestPhone', e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">E-mail</label>
                <input type="email" value={form.guestEmail} onChange={(e) => set('guestEmail', e.target.value)} className="admin-input" />
              </div>
              <div className="col-span-2">
                <label className="admin-label">Serviço *</label>
                <select required value={form.service} onChange={(e) => set('service', e.target.value)} className="admin-input">
                  {SERVICES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="admin-label">Data *</label>
                <input type="date" required value={form.date} onChange={(e) => set('date', e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="admin-label">Status</label>
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className="admin-input">
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v as string}</option>)}
                </select>
              </div>
              <div>
                <label className="admin-label">Início</label>
                <select value={form.startTime} onChange={(e) => set('startTime', e.target.value)} className="admin-input">
                  <option value="">—</option>
                  {ALL_SLOTS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="admin-label">Fim</label>
                <input type="time" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} className="admin-input" />
              </div>
              <div className="col-span-2">
                <label className="admin-label">Observações</label>
                <textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} className="admin-input resize-none" />
              </div>

              <div className="col-span-2 flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => load()} className="btn-outline">Descartar</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

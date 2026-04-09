'use client'
// src/components/admin/AppointmentModal.tsx
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { SERVICES, STATUS_LABELS } from '@/lib/utils'

interface Props {
  data?: any
  dentists: any[]
  onClose: () => void
  onSave: () => void
}

export default function AppointmentModal({ data, dentists, onClose, onSave }: Props) {
  const isEdit = !!data?.id
  const [form, setForm] = useState({
    dentistId: data?.dentistId ?? '',
    guestName: data?.guestName ?? '',
    guestPhone: data?.guestPhone ?? '',
    guestEmail: data?.guestEmail ?? '',
    service: data?.service ?? '',
    date: data?.date ? data.date.slice(0, 10) : '',
    startTime: data?.startTime ?? '',
    endTime: data?.endTime ?? '',
    status: data?.status ?? 'PENDING',
    notes: data?.notes ?? '',
    source: data?.source ?? 'ADMIN',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url = isEdit ? `/api/admin/appointments/${data.id}` : '/api/admin/appointments'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Erro')
      }
      onSave()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white">
          <h2 className="font-serif text-lg text-stone-900">
            {isEdit ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="admin-label">Dentista *</label>
              <select required value={form.dentistId} onChange={(e) => set('dentistId', e.target.value)} className="admin-input">
                <option value="">Selecionar</option>
                {dentists.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="admin-label">Paciente (nome)</label>
              <input value={form.guestName} onChange={(e) => set('guestName', e.target.value)} className="admin-input" placeholder="Nome do paciente" />
            </div>
            <div>
              <label className="admin-label">Telefone</label>
              <input value={form.guestPhone} onChange={(e) => set('guestPhone', e.target.value)} className="admin-input" placeholder="(41) 99999-9999" />
            </div>
            <div>
              <label className="admin-label">E-mail</label>
              <input type="email" value={form.guestEmail} onChange={(e) => set('guestEmail', e.target.value)} className="admin-input" placeholder="email@exemplo.com" />
            </div>
            <div className="col-span-2">
              <label className="admin-label">Serviço *</label>
              <select required value={form.service} onChange={(e) => set('service', e.target.value)} className="admin-input">
                <option value="">Selecionar</option>
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
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Início</label>
              <input type="time" value={form.startTime} onChange={(e) => set('startTime', e.target.value)} className="admin-input" />
            </div>
            <div>
              <label className="admin-label">Fim</label>
              <input type="time" value={form.endTime} onChange={(e) => set('endTime', e.target.value)} className="admin-input" />
            </div>
            <div className="col-span-2">
              <label className="admin-label">Observações</label>
              <textarea rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} className="admin-input resize-none" />
            </div>
          </div>

          {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

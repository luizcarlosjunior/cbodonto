'use client'
// src/app/admin/depoimentos/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { Plus, Check, X, Star, Trash2, Upload } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'
import Switch from '@/components/admin/Switch'
import PhotoPicker from '@/components/admin/PhotoPicker'

// ─── Add/Edit modal ───────────────────────────────────────────────────────────

interface ModalForm {
  patientName: string
  text: string
  rating: number
  source: string
  photoUrl: string
  approved: boolean
}

const EMPTY_FORM: ModalForm = { patientName: '', text: '', rating: 5, source: 'Google', photoUrl: '', approved: true }

interface TestimonialModalProps {
  initial?: any
  onClose: () => void
  onSave: () => void
}

function TestimonialModal({ initial, onClose, onSave }: TestimonialModalProps) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState<ModalForm>(
    initial
      ? { patientName: initial.patientName, text: initial.text, rating: initial.rating,
          source: initial.source, photoUrl: initial.photoUrl ?? '', approved: initial.approved }
      : EMPTY_FORM
  )
  const [saving, setSaving] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const set = <K extends keyof ModalForm>(k: K, v: ModalForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const url = isEdit ? `/api/admin/testimonials/${initial.id}` : '/api/admin/testimonials'
    await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, photoUrl: form.photoUrl || null }),
    })
    setSaving(false)
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-lg shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
          <h2 className="font-serif text-lg">{isEdit ? 'Editar Depoimento' : 'Adicionar Depoimento'}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Photo + Name/Rating/Source — 1/3 | 2/3 */}
          <div className="flex gap-4 items-start">
            {/* Photo — 1/3 width, 1:1 */}
            <div className="w-1/3 shrink-0">
              <PhotoPicker
                value={form.photoUrl}
                onChange={(url) => set('photoUrl', url)}
                onError={setUploadError}
                label="Foto do paciente"
                folder="testimonials"
              />
              {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
            </div>

            {/* Name + Rating/Source — 2/3 width */}
            <div className="flex-1 flex flex-col gap-3">
              {/* Row 1: Name */}
              <div>
                <label className="admin-label">Nome do paciente *</label>
                <input
                  required
                  value={form.patientName}
                  onChange={(e) => set('patientName', e.target.value)}
                  className="admin-input"
                  placeholder="Nome completo"
                />
              </div>

              {/* Row 2: Star rating + Source */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="admin-label">Avaliação</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => set('rating', n)}
                        className="p-0.5 focus:outline-none"
                      >
                        <Star
                          size={22}
                          className={n <= form.rating ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1">
                  <label className="admin-label">Fonte</label>
                  <select value={form.source} onChange={(e) => set('source', e.target.value)} className="admin-input">
                    {['Google', 'Facebook', 'Instagram', 'Indicação', 'Outro'].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial text */}
          <div>
            <label className="admin-label">Depoimento *</label>
            <textarea
              required
              rows={4}
              value={form.text}
              onChange={(e) => set('text', e.target.value)}
              className="admin-input resize-none"
              placeholder="Texto do depoimento..."
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.approved} onChange={(v) => set('approved', v)} />
            <span className="text-sm text-stone-600">Publicar imediatamente</span>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Salvando...' : isEdit ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DepoimentosPage() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [modal, setModal] = useState<{ open: boolean; data?: any }>({ open: false })

  const fetch_ = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/testimonials')
    if (res.ok) setTestimonials(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetch_() }, [fetch_])

  const toggle = async (id: string, approved: boolean) => {
    await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved }),
    })
    fetch_()
  }

  const remove = async (id: string) => {
    if (!confirm('Excluir este depoimento? A foto também será removida.')) return
    await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' })
    fetch_()
  }

  const filtered = testimonials.filter((t) =>
    filter === 'all' ? true : filter === 'pending' ? !t.approved : t.approved
  )
  const pending = testimonials.filter((t) => !t.approved).length

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Depoimentos</h1>
          <p className="text-stone-500 text-sm mt-0.5">{testimonials.length} total · {pending} pendente(s)</p>
        </div>
        <button onClick={() => setModal({ open: true })} className="btn-primary">
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-sm w-fit mb-6">
        {([['all', 'Todos'], ['pending', 'Pendentes'], ['approved', 'Aprovados']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-1.5 text-xs tracking-wide rounded-sm transition-colors ${
              filter === val ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {label}
            {val === 'pending' && pending > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[0.6rem] px-1.5 py-0.5 rounded-full">{pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-stone-200 rounded animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-stone-200 p-10 text-center text-stone-400">
          Nenhum depoimento {filter !== 'all' ? (filter === 'pending' ? 'pendente' : 'aprovado') : ''}.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div
              key={t.id}
              className={`bg-white border p-5 ${t.approved ? 'border-stone-200' : 'border-amber-200 bg-amber-50/50'}`}
            >
              <div className="flex items-start gap-4">
                {/* Photo thumbnail */}
                {t.photoUrl ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-stone-200">
                    <Image src={t.photoUrl} alt={t.patientName} width={48} height={48} className="object-cover w-full h-full" unoptimized />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full shrink-0 bg-stone-100 flex items-center justify-center text-stone-400 text-lg font-serif">
                    {t.patientName.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <span className="font-serif text-stone-900">{t.patientName}</span>
                    <span className="text-[0.65rem] tracking-wide text-stone-400">{t.source}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={11} className={i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200 fill-stone-200'} />
                      ))}
                    </div>
                    {!t.approved
                      ? <span className="text-[0.6rem] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pendente</span>
                      : <span className="text-[0.6rem] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Aprovado</span>
                    }
                  </div>
                  <p className="text-stone-600 text-sm leading-relaxed italic">"{t.text}"</p>
                  <p className="text-stone-400 text-xs mt-2">{formatDate(t.createdAt)}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setModal({ open: true, data: t })}
                    className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-sm transition-colors"
                    title="Editar"
                  >
                    <Upload size={14} />
                  </button>
                  {!t.approved ? (
                    <button onClick={() => toggle(t.id, true)} title="Aprovar"
                      className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-sm transition-colors">
                      <Check size={16} />
                    </button>
                  ) : (
                    <button onClick={() => toggle(t.id, false)} title="Desaprovar"
                      className="p-1.5 text-stone-400 hover:bg-stone-100 rounded-sm transition-colors">
                      <X size={16} />
                    </button>
                  )}
                  <button onClick={() => remove(t.id)} title="Excluir"
                    className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <TestimonialModal
          initial={modal.data}
          onClose={() => setModal({ open: false })}
          onSave={() => { setModal({ open: false }); fetch_() }}
        />
      )}
    </div>
  )
}

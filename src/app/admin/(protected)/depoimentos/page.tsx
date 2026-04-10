'use client'
// src/app/admin/depoimentos/page.tsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Check, X, Star, Trash2, Upload, Search, AlertTriangle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'
import Switch from '@/components/admin/Switch'
import PhotoPicker from '@/components/admin/PhotoPicker'
import Pagination from '@/components/admin/Pagination'

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
          <div className="flex gap-4 items-start">
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

            <div className="flex-1 flex flex-col gap-3">
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

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="admin-label">Avaliação</label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" onClick={() => set('rating', n)} className="p-0.5 focus:outline-none">
                        <Star size={22} className={n <= form.rating ? 'fill-amber-400 text-amber-400' : 'fill-stone-200 text-stone-200'} />
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

          <div>
            <label className="admin-label">Depoimento *</label>
            <textarea
              required rows={4}
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

// ─── Confirm reject modal ─────────────────────────────────────────────────────

interface RejectConfirmProps {
  name: string
  onConfirm: () => void
  onCancel: () => void
}

function RejectConfirmModal({ name, onConfirm, onCancel }: RejectConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-sm shadow-xl p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-stone-900 leading-tight">Reprovar depoimento</h3>
            <p className="text-stone-500 text-sm mt-1">
              Tem certeza que deseja reprovar o depoimento de <strong className="text-stone-700">{name}</strong>?
              O depoimento será movido para a lista de negados.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-outline">Cancelar</button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 text-xs tracking-widest uppercase font-medium transition-colors rounded-sm"
          >
            Reprovar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

interface DeleteConfirmProps {
  name: string
  onConfirm: () => void
  onCancel: () => void
}

function DeleteConfirmModal({ name, onConfirm, onCancel }: DeleteConfirmProps) {
  const [countdown, setCountdown] = useState(3)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-sm shadow-xl p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-serif text-lg text-stone-900 leading-tight">Excluir depoimento</h3>
            <p className="text-stone-500 text-sm mt-1">
              Tem certeza que deseja excluir permanentemente o depoimento de{' '}
              <strong className="text-stone-700">{name}</strong>?
              Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-outline">Cancelar</button>
          <button
            onClick={onConfirm}
            disabled={countdown > 0}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs tracking-widest uppercase font-medium transition-colors rounded-sm ${
              countdown > 0
                ? 'bg-red-200 text-red-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {countdown > 0 ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-red-400 flex items-center justify-center text-[0.6rem] font-bold leading-none">
                  {countdown}
                </span>
                Excluir
              </>
            ) : (
              <>
                <Trash2 size={13} />
                Excluir
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PER_PAGE = 10
type FilterTab = 'all' | 'pending' | 'approved' | 'rejected'

export default function DepoimentosPage() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [pages, setPages]   = useState(1)
  const [pendingCount, setPendingCount]   = useState(0)
  const [rejectedCount, setRejectedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ open: boolean; data?: any }>({ open: false })
  const [rejectTarget, setRejectTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const fetch_ = useCallback(async (pg = page) => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(pg),
      filter,
      ...(search ? { search } : {}),
    })
    const res = await fetch(`/api/admin/testimonials?${params}`)
    if (res.ok) {
      const data = await res.json()
      setTestimonials(data.testimonials)
      setTotal(data.total)
      setPage(data.page)
      setPages(data.pages)
      setPendingCount(data.pendingCount)
      setRejectedCount(data.rejectedCount)
    }
    setLoading(false)
  }, [filter, search, page])

  useEffect(() => { fetch_(1) }, [filter, search]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { fetch_() }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (f: FilterTab) => { setFilter(f); setPage(1) }
  const handleSearchChange = (v: string) => { setSearch(v); setPage(1) }
  const handlePage = (p: number) => setPage(p)

  const approve = async (id: string) => {
    await fetch(`/api/admin/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: true, rejected: false }),
    })
    fetch_()
  }

  const confirmReject = async () => {
    if (!rejectTarget) return
    await fetch(`/api/admin/testimonials/${rejectTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approved: false, rejected: true }),
    })
    setRejectTarget(null)
    fetch_()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await fetch(`/api/admin/testimonials/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleteTarget(null)
    fetch_()
  }

  const tabs: [FilterTab, string][] = [
    ['all', 'Todos'],
    ['pending', 'Pendentes'],
    ['approved', 'Aprovados'],
    ['rejected', 'Reprovados'],
  ]

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Depoimentos</h1>
          <p className="text-stone-500 text-sm mt-0.5">{total} total · {pendingCount} pendente(s)</p>
        </div>
        <button onClick={() => setModal({ open: true })} className="btn-primary">
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar por nome ou trecho do depoimento..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 focus:outline-none focus:border-burgundy bg-white"
        />
        {search && (
          <button onClick={() => handleSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-sm w-fit mb-6">
        {tabs.map(([val, label]) => (
          <button
            key={val}
            onClick={() => handleFilterChange(val)}
            className={`px-4 py-1.5 text-xs tracking-wide rounded-sm transition-colors ${
              filter === val ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {label}
            {val === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[0.6rem] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
            {val === 'rejected' && rejectedCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[0.6rem] px-1.5 py-0.5 rounded-full">{rejectedCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-stone-200 rounded animate-pulse" />)}
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white border border-stone-200 p-10 text-center text-stone-400">
          {search ? `Nenhum resultado para "${search}".` :
           filter === 'pending'  ? 'Nenhum depoimento pendente.' :
           filter === 'approved' ? 'Nenhum depoimento aprovado.' :
           filter === 'rejected' ? 'Nenhum depoimento negado.' :
           'Nenhum depoimento.'}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className={`bg-white border p-5 ${
                  t.rejected ? 'border-red-200 bg-red-50/40' :
                  t.approved ? 'border-stone-200' :
                  'border-amber-200 bg-amber-50/50'
                }`}
              >
                <div className="flex items-start gap-4">
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
                      {t.rejected
                        ? <span className="text-[0.6rem] bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Reprovado</span>
                        : t.approved
                          ? <span className="text-[0.6rem] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Aprovado</span>
                          : <span className="text-[0.6rem] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pendente</span>
                      }
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed italic">"{t.text}"</p>
                    <p className="text-stone-400 text-xs mt-2">{formatDate(t.createdAt)}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Edit — not shown for rejected */}
                    {!t.rejected && (
                      <button
                        onClick={() => setModal({ open: true, data: t })}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-sm transition-colors"
                        title="Editar"
                      >
                        <Upload size={14} />
                      </button>
                    )}

                    {/* Approve / Disapprove / Restore */}
                    {t.rejected ? (
                      <button onClick={() => approve(t.id)} title="Aprovar"
                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-sm transition-colors">
                        <Check size={16} />
                      </button>
                    ) : t.approved ? (
                      <button onClick={() => setRejectTarget({ id: t.id, name: t.patientName })} title="Reprovar"
                        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors">
                        <X size={16} />
                      </button>
                    ) : (
                      <>
                        <button onClick={() => approve(t.id)} title="Aprovar"
                          className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-sm transition-colors">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setRejectTarget({ id: t.id, name: t.patientName })} title="Reprovar"
                          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors">
                          <X size={16} />
                        </button>
                      </>
                    )}

                    <button onClick={() => setDeleteTarget({ id: t.id, name: t.patientName })} title="Excluir"
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            pages={pages}
            total={total}
            perPage={PER_PAGE}
            onPage={handlePage}
          />
        </>
      )}

      {modal.open && (
        <TestimonialModal
          initial={modal.data}
          onClose={() => setModal({ open: false })}
          onSave={() => { setModal({ open: false }); fetch_() }}
        />
      )}

      {rejectTarget && (
        <RejectConfirmModal
          name={rejectTarget.name}
          onConfirm={confirmReject}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          name={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

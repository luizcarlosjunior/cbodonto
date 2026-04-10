'use client'
// src/app/admin/(protected)/paginas/page.tsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, X, Trash2, Pencil, Eye, EyeOff, ChevronDown, ChevronUp, Search } from 'lucide-react'
import Pagination from '@/components/admin/Pagination'
import dynamic from 'next/dynamic'
import Switch from '@/components/admin/Switch'

const RichEditor = dynamic(() => import('@/components/admin/RichEditor'), { ssr: false })

// ─── Types ────────────────────────────────────────────────────────────────────

interface Page {
  id: string
  title: string
  slug: string
  seoTitle: string | null
  seoDesc: string | null
  seoTags: string | null
  content: string | null
  active: boolean
  updatedAt: string
}

// ─── Slug helper ──────────────────────────────────────────────────────────────

function toSlug(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  initial?: Page
  onClose: () => void
  onSave: () => void
}

function PageModal({ initial, onClose, onSave }: ModalProps) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    seoTitle: initial?.seoTitle ?? '',
    seoDesc: initial?.seoDesc ?? '',
    seoTags: initial?.seoTags ?? '',
    content: initial?.content ?? '',
    active: initial?.active ?? true,
  })
  const [slugManual, setSlugManual] = useState(isEdit)
  const [seoOpen, setSeoOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleTitleChange = (v: string) => {
    set('title', v)
    if (!slugManual) set('slug', toSlug(v))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const url = isEdit ? `/api/admin/pages/${initial!.id}` : '/api/admin/pages'
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          seoTitle: form.seoTitle || null,
          seoDesc: form.seoDesc || null,
          seoTags: form.seoTags || null,
          content: form.content || null,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      onSave()
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-4xl shadow-xl max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <h2 className="font-serif text-lg">{isEdit ? 'Editar Página' : 'Nova Página'}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto flex-1 p-6 space-y-5">
            {/* Title + Slug */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Título da página *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="admin-input"
                  placeholder="Ex: Sobre Nós"
                />
              </div>
              <div>
                <label className="admin-label">
                  Slug (URL) *
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={() => setSlugManual((v) => !v)}
                      className="ml-2 text-[0.65rem] text-stone-400 hover:text-burgundy transition-colors"
                    >
                      {slugManual ? 'auto' : 'editar'}
                    </button>
                  )}
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-stone-400 text-sm shrink-0">/</span>
                  <input
                    required
                    value={form.slug}
                    readOnly={!slugManual && !isEdit}
                    onChange={(e) => { setSlugManual(true); set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')) }}
                    className={['admin-input flex-1', !slugManual && !isEdit ? 'bg-stone-50 text-stone-400' : ''].join(' ')}
                    placeholder="sobre-nos"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <Switch checked={form.active} onChange={(v) => set('active', v)} />
              <span className="text-sm text-stone-600">{form.active ? 'Página ativa (visível no site)' : 'Página inativa (oculta)'}</span>
            </div>

            {/* SEO accordion */}
            <div className="border border-stone-200 rounded-sm">
              <button
                type="button"
                onClick={() => setSeoOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <span className="font-medium tracking-wide">SEO — Título, Descrição e Tags</span>
                {seoOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {seoOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-stone-100">
                  <div className="pt-3">
                    <label className="admin-label">Título SEO</label>
                    <input
                      value={form.seoTitle}
                      onChange={(e) => set('seoTitle', e.target.value)}
                      className="admin-input"
                      placeholder={form.title || 'Título que aparece na aba do navegador e no Google'}
                      maxLength={70}
                    />
                    <p className="text-[0.65rem] text-stone-400 mt-1">{form.seoTitle.length}/70 caracteres recomendados</p>
                  </div>
                  <div>
                    <label className="admin-label">Meta description</label>
                    <textarea
                      rows={2}
                      value={form.seoDesc}
                      onChange={(e) => set('seoDesc', e.target.value)}
                      className="admin-input resize-none"
                      placeholder="Resumo exibido nos resultados de busca (~155 caracteres)"
                      maxLength={160}
                    />
                    <p className="text-[0.65rem] text-stone-400 mt-1">{form.seoDesc.length}/160 caracteres recomendados</p>
                  </div>
                  <div>
                    <label className="admin-label">Tags / Keywords</label>
                    <input
                      value={form.seoTags}
                      onChange={(e) => set('seoTags', e.target.value)}
                      className="admin-input"
                      placeholder="dentista, clareamento, ortodontia (separadas por vírgula)"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="admin-label mb-2 block">Conteúdo</label>
              <RichEditor
                value={form.content}
                onChange={(html) => set('content', html)}
                placeholder="Escreva o conteúdo da página..."
              />
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-stone-100 px-6 py-4 flex items-center justify-between gap-3 bg-white">
            {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-1.5 flex-1">{error}</p>}
            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Criar página'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

interface DeleteConfirmProps {
  title: string
  onConfirm: () => void
  onCancel: () => void
}

function DeleteConfirmModal({ title, onConfirm, onCancel }: DeleteConfirmProps) {
  const [countdown, setCountdown] = useState(3)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(intervalRef.current!); return 0 }
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
            <h3 className="font-serif text-lg text-stone-900 leading-tight">Excluir página</h3>
            <p className="text-stone-500 text-sm mt-1">
              Tem certeza que deseja excluir permanentemente a página{' '}
              <strong className="text-stone-700">"{title}"</strong>?
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

export default function PaginasPage() {
  const [pageItems, setPageItems] = useState<Page[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; data?: Page }>({ open: false })
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null)
  const [search, setSearch] = useState('')

  const load = useCallback(async (pg = page) => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(pg),
      ...(search ? { search } : {}),
    })
    const res = await fetch(`/api/admin/pages?${params}`)
    if (res.ok) {
      const data = await res.json()
      setPageItems(data.pages)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
    }
    setLoading(false)
  }, [search, page])

  useEffect(() => { load(1) }, [search]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [page])    // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (v: string) => { setSearch(v); setPage(1) }

  const toggleActive = async (p: Page) => {
    await fetch(`/api/admin/pages/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    })
    load()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    await fetch(`/api/admin/pages/${deleteTarget.id}`, { method: 'DELETE' })
    setDeleteTarget(null)
    load()
  }

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Páginas</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {total} página{total !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setModal({ open: true })} className="btn-primary">
          <Plus size={14} /> Nova Página
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Buscar por título ou slug..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-stone-200 focus:outline-none focus:border-burgundy bg-white"
        />
        {search && (
          <button onClick={() => handleSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
            <X size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-stone-200 rounded animate-pulse" />)}
        </div>
      ) : pageItems.length === 0 ? (
        <div className="bg-white border border-stone-200 p-10 text-center text-stone-400">
          {search ? `Nenhum resultado para "${search}".` : 'Nenhuma página cadastrada.'}
        </div>
      ) : (
        <>
        <div className="space-y-2">
          {pageItems.map((p) => (
            <div
              key={p.id}
              className={[
                'bg-white border border-stone-200 px-5 py-4 flex items-center gap-4 hover:border-stone-300 transition-colors',
                !p.active ? 'opacity-60' : '',
              ].join(' ')}
            >
              {/* Status dot */}
              <div className={`w-2 h-2 rounded-full shrink-0 ${p.active ? 'bg-emerald-400' : 'bg-stone-300'}`} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-serif text-stone-900">{p.title}</p>
                  {!p.active && (
                    <span className="text-[0.6rem] bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full">Inativa</span>
                  )}
                  {(p.seoTitle || p.seoDesc || p.seoTags) && (
                    <span className="text-[0.6rem] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">SEO</span>
                  )}
                </div>
                <p className="text-stone-400 text-xs mt-0.5 font-mono">/{p.slug}</p>
              </div>

              {/* Date */}
              <p className="text-stone-400 text-xs shrink-0 hidden sm:block">{fmt(p.updatedAt)}</p>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleActive(p)}
                  title={p.active ? 'Desativar' : 'Ativar'}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-sm transition-colors"
                >
                  {p.active ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  onClick={() => setModal({ open: true, data: p })}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-sm transition-colors"
                  title="Editar"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteTarget(p)}
                  className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <Pagination
          page={page}
          pages={totalPages}
          total={total}
          perPage={PER_PAGE}
          onPage={(p) => setPage(p)}
        />
        </>
      )}

      {modal.open && (
        <PageModal
          initial={modal.data}
          onClose={() => setModal({ open: false })}
          onSave={() => { setModal({ open: false }); load() }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          title={deleteTarget.title}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

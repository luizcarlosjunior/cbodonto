'use client'
// src/app/admin/(protected)/servicos/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { Plus, X, Trash2, Pencil, GripVertical, Eye, EyeOff } from 'lucide-react'
import Pagination from '@/components/admin/Pagination'
import Image from 'next/image'
import Switch from '@/components/admin/Switch'
import PhotoPicker from '@/components/admin/PhotoPicker'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceImage {
  id: string
  imageUrl: string
  position: number
  active: boolean
}

interface Service {
  id: string
  title: string
  shortDesc: string
  longDesc: string
  imageUrl: string | null
  active: boolean
  position: number
  images?: ServiceImage[]
}

// ─── Inline gallery (used inside ServiceModal when editing) ───────────────────

function ServiceGallery({ serviceId }: { serviceId: string }) {
  const [images, setImages] = useState<ServiceImage[]>([])
  const [loading, setLoading] = useState(true)
  const [pickerKey, setPickerKey] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/services/${serviceId}/images`)
    if (res.ok) setImages(await res.json())
    setLoading(false)
  }, [serviceId])

  useEffect(() => { load() }, [load])

  const handlePhotoUploaded = async (url: string) => {
    await fetch(`/api/admin/services/${serviceId}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: url }),
    })
    setPickerKey((k) => k + 1) // remount PhotoPicker → limpa preview interno
    load()
  }

  const toggleActive = async (img: ServiceImage) => {
    await fetch(`/api/admin/services/${serviceId}/images/${img.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !img.active }),
    })
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Remover esta imagem?')) return
    await fetch(`/api/admin/services/${serviceId}/images/${id}`, { method: 'DELETE' })
    load()
  }

  const handleDrop = async (targetId: string) => {
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return }
    const list = [...images]
    const fromIdx = list.findIndex((i) => i.id === dragging)
    const toIdx = list.findIndex((i) => i.id === targetId)
    const [item] = list.splice(fromIdx, 1)
    list.splice(toIdx, 0, item)
    const updated = list.map((img, i) => ({ ...img, position: i }))
    setImages(updated)
    setDragging(null)
    setDragOver(null)
    await fetch(`/api/admin/services/${serviceId}/images/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated.map(({ id, position }) => ({ id, position }))),
    })
  }

  return (
    <div>
      <p className="text-[0.65rem] tracking-widest uppercase text-stone-400 mb-3 border-b border-stone-100 pb-2">
        Galeria de imagens
      </p>

      <div className="grid grid-cols-4 gap-3">
        {/* Add new — always first */}
        <div>
          <PhotoPicker
            key={pickerKey}
            value=""
            onChange={handlePhotoUploaded}
            onError={setUploadError}
            label=""
            folder="services"
          />
          {uploadError && <p className="text-red-500 text-[0.65rem] mt-1">{uploadError}</p>}
        </div>

        {/* Existing images */}
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-stone-100 rounded animate-pulse" />
          ))
        ) : (
          images.map((img, i) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => setDragging(img.id)}
              onDragOver={(e) => { e.preventDefault(); setDragOver(img.id) }}
              onDrop={() => handleDrop(img.id)}
              onDragEnd={() => { setDragging(null); setDragOver(null) }}
              className={[
                'relative aspect-square rounded-sm overflow-hidden border-2 cursor-grab active:cursor-grabbing group transition-all',
                dragOver === img.id ? 'border-burgundy scale-[1.03]' : 'border-stone-200',
                !img.active ? 'opacity-50' : '',
              ].join(' ')}
            >
              <Image src={img.imageUrl} alt={`Imagem ${i + 1}`} fill className="object-cover" unoptimized />

              {/* Position badge */}
              <span className="absolute top-1 left-1 bg-black/60 text-white text-[0.55rem] px-1 py-0.5 rounded font-mono leading-none">
                {i + 1}
              </span>

              {/* Drag handle */}
              <div className="absolute top-1 right-1 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={12} />
              </div>

              {/* Actions */}
              <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent pt-4">
                <button
                  type="button"
                  onClick={() => toggleActive(img)}
                  title={img.active ? 'Ocultar' : 'Exibir'}
                  className="flex-1 flex items-center justify-center bg-white/90 hover:bg-white text-stone-700 rounded text-[0.55rem] py-0.5 gap-0.5 transition-colors"
                >
                  {img.active ? <Eye size={9} /> : <EyeOff size={9} />}
                  {img.active ? 'Ocultar' : 'Exibir'}
                </button>
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  title="Remover"
                  className="flex items-center justify-center bg-red-500/90 hover:bg-red-500 text-white rounded px-1.5 py-0.5 transition-colors"
                >
                  <Trash2 size={9} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <p className="text-stone-400 text-[0.65rem] mt-2">Arraste as imagens para reordenar · {images.length} foto{images.length !== 1 ? 's' : ''} na galeria</p>
    </div>
  )
}

// ─── Service modal ────────────────────────────────────────────────────────────

interface ModalForm {
  title: string
  shortDesc: string
  longDesc: string
  imageUrl: string
  active: boolean
}

const EMPTY: ModalForm = { title: '', shortDesc: '', longDesc: '', imageUrl: '', active: true }

function ServiceModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: Service
  onClose: () => void
  onSave: () => void
}) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState<ModalForm>(
    initial
      ? { title: initial.title, shortDesc: initial.shortDesc, longDesc: initial.longDesc, imageUrl: initial.imageUrl ?? '', active: initial.active }
      : EMPTY
  )
  const [saving, setSaving] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const set = <K extends keyof ModalForm>(k: K, v: ModalForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const url = isEdit ? `/api/admin/services/${initial!.id}` : '/api/admin/services'
    await fetch(url, {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, imageUrl: form.imageUrl || null }),
    })
    setSaving(false)
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-2xl shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
          <h2 className="font-serif text-lg">{isEdit ? 'Editar Serviço' : 'Novo Serviço'}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Main image + title/descriptions */}
          <div className="flex gap-4 items-start">
            <div className="w-1/3 shrink-0">
              <PhotoPicker
                value={form.imageUrl}
                onChange={(url) => set('imageUrl', url)}
                onError={setUploadError}
                label="Imagem principal (1:1)"
                folder="services"
              />
              {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <label className="admin-label">Título *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  className="admin-input"
                  placeholder="Ex: Clareamento Dental"
                />
              </div>
              <div>
                <label className="admin-label">Descrição curta *</label>
                <textarea
                  required
                  rows={3}
                  value={form.shortDesc}
                  onChange={(e) => set('shortDesc', e.target.value)}
                  className="admin-input resize-none"
                  placeholder="Resumo exibido no card da home (~120 caracteres)"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="admin-label">Descrição completa *</label>
            <textarea
              required
              rows={4}
              value={form.longDesc}
              onChange={(e) => set('longDesc', e.target.value)}
              className="admin-input resize-none"
              placeholder="Descrição detalhada exibida no modal do serviço..."
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.active} onChange={(v) => set('active', v)} />
            <span className="text-sm text-stone-600">Visível no site</span>
          </div>

          {/* Gallery — only available after service is created */}
          {isEdit && (
            <ServiceGallery serviceId={initial!.id} />
          )}

          {!isEdit && (
            <p className="text-stone-400 text-xs bg-stone-50 border border-stone-100 px-3 py-2 rounded-sm">
              💡 Salve o serviço primeiro para adicionar imagens à galeria.
            </p>
          )}

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

const PER_PAGE = 10

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [pages, setPages]   = useState(1)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; data?: Service }>({ open: false })
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)

  const load = useCallback(async (pg = page) => {
    setLoading(true)
    const res = await fetch(`/api/admin/services?page=${pg}`)
    if (res.ok) {
      const data = await res.json()
      setServices(data.services)
      setTotal(data.total)
      setPage(data.page)
      setPages(data.pages)
    }
    setLoading(false)
  }, [page])

  useEffect(() => { load() }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleActive = async (s: Service) => {
    await fetch(`/api/admin/services/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !s.active }),
    })
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('Excluir este serviço?')) return
    await fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
    load()
  }

  const handleDragStart = (id: string) => setDragging(id)
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOver(id) }

  const handleDrop = async (targetId: string) => {
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return }
    const list = [...services]
    const fromIdx = list.findIndex((s) => s.id === dragging)
    const toIdx = list.findIndex((s) => s.id === targetId)
    const [item] = list.splice(fromIdx, 1)
    list.splice(toIdx, 0, item)
    const updated = list.map((s, i) => ({ ...s, position: i }))
    setServices(updated)
    setDragging(null)
    setDragOver(null)
    await fetch('/api/admin/services/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated.map(({ id, position }) => ({ id, position }))),
    })
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Serviços</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {total} total · {services.filter((s) => s.active).length} visíveis nesta página · arraste para reordenar
          </p>
        </div>
        <button onClick={() => setModal({ open: true })} className="btn-primary">
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-stone-200 rounded animate-pulse" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white border border-stone-200 p-10 text-center text-stone-400">
          Nenhum serviço cadastrado.
        </div>
      ) : (
        <>
        <div className="space-y-2">
          {services.map((s, i) => (
            <div
              key={s.id}
              draggable
              onDragStart={() => handleDragStart(s.id)}
              onDragOver={(e) => handleDragOver(e, s.id)}
              onDrop={() => handleDrop(s.id)}
              onDragEnd={() => { setDragging(null); setDragOver(null) }}
              className={[
                'bg-white border p-4 flex items-center gap-4 transition-all cursor-grab active:cursor-grabbing',
                dragOver === s.id ? 'border-burgundy/50 bg-burgundy/5 scale-[1.01]' : 'border-stone-200',
                !s.active ? 'opacity-60' : '',
              ].join(' ')}
            >
              <div className="flex flex-col items-center gap-1 shrink-0 text-stone-300">
                <GripVertical size={16} />
                <span className="text-[0.6rem] font-mono">{i + 1}</span>
              </div>

              <div className="w-14 h-14 rounded-sm overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                {s.imageUrl ? (
                  <Image src={s.imageUrl} alt={s.title} width={56} height={56} className="object-cover w-full h-full" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300 text-xl font-serif">
                    {s.title.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-serif text-stone-900 truncate">{s.title}</p>
                  {!s.active && (
                    <span className="text-[0.6rem] bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full shrink-0">Oculto</span>
                  )}
                  {(s.images?.length ?? 0) > 0 && (
                    <span className="text-[0.6rem] bg-burgundy/10 text-burgundy px-2 py-0.5 rounded-full shrink-0">
                      {s.images!.length} foto{s.images!.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-stone-400 text-xs mt-0.5 truncate">{s.shortDesc}</p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleActive(s)}
                  title={s.active ? 'Ocultar do site' : 'Exibir no site'}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-sm transition-colors"
                >
                  {s.active ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button
                  onClick={() => setModal({ open: true, data: s })}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-sm transition-colors"
                  title="Editar"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => remove(s.id)}
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
          pages={pages}
          total={total}
          perPage={PER_PAGE}
          onPage={(p) => setPage(p)}
        />
        </>
      )}

      {modal.open && (
        <ServiceModal
          initial={modal.data}
          onClose={() => setModal({ open: false })}
          onSave={() => { setModal({ open: false }); load() }}
        />
      )}
    </div>
  )
}

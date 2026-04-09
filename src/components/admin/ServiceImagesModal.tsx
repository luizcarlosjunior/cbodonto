'use client'
// src/components/admin/ServiceImagesModal.tsx
import { useState, useEffect, useCallback } from 'react'
import { X, Trash2, Eye, EyeOff, GripVertical, Plus } from 'lucide-react'
import Image from 'next/image'
import PhotoPicker from '@/components/admin/PhotoPicker'

interface ServiceImage {
  id: string
  imageUrl: string
  position: number
  active: boolean
}

interface Props {
  serviceId: string
  serviceTitle: string
  onClose: () => void
}

export default function ServiceImagesModal({ serviceId, serviceTitle, onClose }: Props) {
  const [images, setImages] = useState<ServiceImage[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newUrl, setNewUrl] = useState('')
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
    setNewUrl(url)
    setAdding(true)
    await fetch(`/api/admin/services/${serviceId}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: url }),
    })
    setNewUrl('')
    setAdding(false)
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

  // ── Drag to reorder ─────────────────────────────────────────────────────────

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white w-full max-w-2xl shadow-xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <div>
            <h2 className="font-serif text-lg">Galeria de imagens</h2>
            <p className="text-stone-400 text-xs mt-0.5">{serviceTitle}</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Add new image */}
          <div>
            <p className="admin-label mb-2 flex items-center gap-1.5"><Plus size={12} /> Adicionar imagem</p>
            <div className="w-40">
              <PhotoPicker
                value={newUrl}
                onChange={handlePhotoUploaded}
                onError={setUploadError}
                label=""
                folder="services"
              />
              {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
              {adding && <p className="text-stone-400 text-xs mt-1">Salvando...</p>}
            </div>
          </div>

          {/* Image list */}
          {loading ? (
            <div className="grid grid-cols-3 gap-3">
              {[1,2,3].map((i) => <div key={i} className="aspect-square bg-stone-100 rounded animate-pulse" />)}
            </div>
          ) : images.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-6">Nenhuma imagem na galeria ainda.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => setDragging(img.id)}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(img.id) }}
                  onDrop={() => handleDrop(img.id)}
                  onDragEnd={() => { setDragging(null); setDragOver(null) }}
                  className={[
                    'relative aspect-square rounded-sm overflow-hidden border-2 cursor-grab active:cursor-grabbing group transition-all',
                    dragOver === img.id ? 'border-burgundy scale-105' : 'border-transparent',
                    !img.active ? 'opacity-50' : '',
                  ].join(' ')}
                >
                  <Image src={img.imageUrl} alt={`Imagem ${i + 1}`} fill className="object-cover" unoptimized />

                  {/* Overlay controls */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col">
                    {/* Position badge */}
                    <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[0.6rem] px-1.5 py-0.5 rounded font-mono">
                      {i + 1}
                    </div>

                    {/* Drag handle */}
                    <div className="absolute top-1.5 right-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical size={14} />
                    </div>

                    {/* Action buttons */}
                    <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleActive(img)}
                        title={img.active ? 'Ocultar' : 'Exibir'}
                        className="flex-1 flex items-center justify-center gap-1 bg-white/90 hover:bg-white text-stone-700 rounded text-[0.6rem] py-1 transition-colors"
                      >
                        {img.active ? <Eye size={10} /> : <EyeOff size={10} />}
                        {img.active ? 'Ocultar' : 'Exibir'}
                      </button>
                      <button
                        onClick={() => remove(img.id)}
                        title="Remover"
                        className="flex items-center justify-center bg-red-500/90 hover:bg-red-500 text-white rounded px-2 py-1 transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-stone-100 shrink-0 flex justify-end">
          <button onClick={onClose} className="btn-primary">Concluído</button>
        </div>
      </div>
    </div>
  )
}

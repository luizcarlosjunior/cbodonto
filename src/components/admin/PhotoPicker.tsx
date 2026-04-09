'use client'
// src/components/admin/PhotoPicker.tsx
import { useRef, useState } from 'react'
import { X, Loader2, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import CropModal from '@/components/admin/CropModal'

interface Props {
  value: string
  onChange: (url: string) => void
  onError: (msg: string) => void
  label?: string
  folder?: string // upload sub-folder (default: 'testimonials')
}

async function uploadPhoto(file: File, folder: string): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`/api/admin/upload?folder=${encodeURIComponent(folder)}`, { method: 'POST', body: form })
  if (!res.ok) {
    const d = await res.json()
    throw new Error(d.error || 'Falha ao enviar imagem')
  }
  const { publicUrl } = await res.json()
  return publicUrl
}

export default function PhotoPicker({ value, onChange, onError, label = 'Foto', folder = 'testimonials' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState(value)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const openCrop = (file: File) => setCropSrc(URL.createObjectURL(file))

  const handleCropConfirm = async (croppedFile: File) => {
    setCropSrc(null)
    setPreview(URL.createObjectURL(croppedFile))
    setUploading(true)
    try {
      const url = await uploadPhoto(croppedFile, folder)
      onChange(url)
    } catch (err: any) {
      onError(err.message)
      setPreview(value)
    } finally {
      setUploading(false)
    }
  }

  const handleCropCancel = () => {
    setCropSrc(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <>
      <div>
        {label && <label className="admin-label">{label}</label>}
        <div
          className="relative border-2 border-dashed border-stone-200 rounded-sm overflow-hidden cursor-pointer hover:border-stone-400 transition-colors aspect-square w-full"
          onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) openCrop(f) }}
          onDragOver={(e) => e.preventDefault()}
        >
          {preview ? (
            <Image src={preview} alt="Foto" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-stone-400 p-2">
              <ImageIcon size={24} strokeWidth={1.5} />
              <span className="text-xs text-center">Clique ou arraste</span>
              <span className="text-[0.65rem] text-center">JPG, PNG, WebP · máx. 5 MB</span>
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin text-stone-500" />
              <span className="text-xs text-stone-500">Enviando...</span>
            </div>
          )}

          {preview && !uploading && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setPreview(''); onChange('') }}
              className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) openCrop(f) }}
        />
      </div>

      {cropSrc && (
        <CropModal imageSrc={cropSrc} onConfirm={handleCropConfirm} onCancel={handleCropCancel} />
      )}
    </>
  )
}

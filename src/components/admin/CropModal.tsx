'use client'
// src/components/admin/CropModal.tsx
import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import { X, ZoomIn, ZoomOut, Check } from 'lucide-react'

// ─── Canvas crop → 500×500 WebP ──────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = src
  })
}

export async function cropToWebP(imageSrc: string, pixelCrop: Area): Promise<File> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = 500
  canvas.height = 500
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    500,
    500,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('Falha ao processar imagem')); return }
        resolve(new File([blob], 'photo.webp', { type: 'image/webp' }))
      },
      'image/webp',
      0.92,
    )
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  imageSrc: string          // object URL or data URL of the original file
  onConfirm: (file: File) => void
  onCancel: () => void
}

export default function CropModal({ imageSrc, onConfirm, onCancel }: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels)
  }, [])

  const handleConfirm = async () => {
    if (!croppedArea) return
    setProcessing(true)
    try {
      const file = await cropToWebP(imageSrc, croppedArea)
      onConfirm(file)
    } catch {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70">
      <div className="bg-white w-full max-w-md shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <div>
            <h3 className="font-serif text-base text-stone-900">Recortar foto</h3>
            <p className="text-[0.65rem] text-stone-400 tracking-wide mt-0.5">
              Arraste e ajuste · resultado: 500 × 500 px WebP
            </p>
          </div>
          <button onClick={onCancel} className="text-stone-400 hover:text-stone-600">
            <X size={18} />
          </button>
        </div>

        {/* Cropper area */}
        <div className="relative bg-stone-900" style={{ height: 360 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { borderRadius: 0 },
              cropAreaStyle: { border: '2px solid #c4a97d', boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 px-5 py-3 border-t border-stone-100 bg-stone-50">
          <button
            onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
            className="text-stone-400 hover:text-stone-700"
          >
            <ZoomOut size={16} />
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-burgundy h-1"
          />
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            className="text-stone-400 hover:text-stone-700"
          >
            <ZoomIn size={16} />
          </button>
          <span className="text-xs text-stone-400 w-10 text-right tabular-nums">
            {zoom.toFixed(1)}×
          </span>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-stone-100">
          <button onClick={onCancel} className="btn-outline">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing || !croppedArea}
            className="btn-primary"
          >
            {processing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processando…
              </>
            ) : (
              <>
                <Check size={14} />
                Recortar e usar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

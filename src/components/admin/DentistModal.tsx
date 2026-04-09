'use client'
// src/components/admin/DentistModal.tsx
import { useState } from 'react'
import { X } from 'lucide-react'
import Switch from '@/components/admin/Switch'
import PhotoPicker from '@/components/admin/PhotoPicker'

interface Props {
  data?: any
  onClose: () => void
  onSave: () => void
}

export default function DentistModal({ data, onClose, onSave }: Props) {
  const isEdit = !!data?.id
  const [form, setForm] = useState({
    name: data?.name ?? '',
    title: data?.title ?? 'Cirurgião-Dentista',
    specialty: data?.specialty ?? '',
    cro: data?.cro ?? '',
    bio: data?.bio ?? '',
    photoUrl: data?.photoUrl ?? '',
    email: data?.email ?? '',
    phone: data?.phone ?? '',
    active: data?.active ?? true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url = isEdit ? `/api/admin/dentists/${data.id}` : '/api/admin/dentists'
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, photoUrl: form.photoUrl || null }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      onSave()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-lg shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
          <h2 className="font-serif text-lg">{isEdit ? 'Editar Dentista' : 'Novo Dentista'}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Photo + Name/Title/CRO — 1/3 | 2/3 */}
          <div className="flex gap-4 items-start">
            {/* Photo — 1/3 width, 1:1 */}
            <div className="w-1/3 shrink-0">
              <PhotoPicker
                value={form.photoUrl}
                onChange={(url) => set('photoUrl', url)}
                onError={setUploadError}
                label="Foto"
                folder="dentists"
              />
              {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
            </div>

            {/* Name + Title/CRO — 2/3 width */}
            <div className="flex-1 flex flex-col gap-3">
              <div>
                <label className="admin-label">Nome completo *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  className="admin-input"
                  placeholder="Dr. / Dra. Nome Sobrenome"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="admin-label">Título *</label>
                  <select value={form.title} onChange={(e) => set('title', e.target.value)} className="admin-input">
                    <option>Cirurgião-Dentista</option>
                    <option>Cirurgiã-Dentista</option>
                    <option>Especialista</option>
                  </select>
                </div>
                <div>
                  <label className="admin-label">CRO *</label>
                  <input
                    required
                    value={form.cro}
                    onChange={(e) => set('cro', e.target.value)}
                    className="admin-input"
                    placeholder="CRO-PR 00000"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="admin-label">Especialidade</label>
            <input
              value={form.specialty}
              onChange={(e) => set('specialty', e.target.value)}
              className="admin-input"
              placeholder="Ex: Dentística, Ortodontia"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="admin-label">E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="admin-input"
                placeholder="dentista@exemplo.com"
              />
            </div>
            <div>
              <label className="admin-label">Telefone / WhatsApp</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                className="admin-input"
                placeholder="(41) 99999-0000"
              />
            </div>
          </div>

          <div>
            <label className="admin-label">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              className="admin-input resize-none"
              placeholder="Breve descrição sobre o profissional..."
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={form.active} onChange={(v) => set('active', v)} />
            <span className="text-sm text-stone-600">{form.active ? 'Ativo' : 'Inativo'}</span>
          </div>

          {error && <p className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

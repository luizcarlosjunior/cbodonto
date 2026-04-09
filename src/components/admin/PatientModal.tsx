'use client'
// src/components/admin/PatientModal.tsx
import { useState, useRef, useCallback } from 'react'
import { X, Search, Loader2 } from 'lucide-react'
import PhotoPicker from '@/components/admin/PhotoPicker'

// ─── CPF ─────────────────────────────────────────────────────────────────────

function maskCPF(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function validateCPF(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += +d[i] * (10 - i)
  let r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  if (r !== +d[9]) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += +d[i] * (11 - i)
  r = (sum * 10) % 11
  if (r === 10 || r === 11) r = 0
  return r === +d[10]
}

// ─── Idade ───────────────────────────────────────────────────────────────────

function calcAge(iso: string): number | null {
  if (!iso) return null
  const birth = new Date(iso)
  if (isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age >= 0 ? age : null
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface AddressState {
  cep: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
}

interface FormState {
  name: string
  phone: string
  email: string
  cpf: string
  birthDate: string
  photoUrl: string
  notes: string
  address: AddressState
}

function buildForm(data?: any): FormState {
  return {
    name: data?.name ?? '',
    phone: data?.phone ?? '',
    email: data?.email ?? '',
    cpf: data?.cpf ? maskCPF(data.cpf) : '',
    birthDate: data?.birthDate ? data.birthDate.slice(0, 10) : '',
    photoUrl: data?.photoUrl ?? '',
    notes: data?.notes ?? '',
    address: {
      cep: data?.cep ?? '',
      logradouro: data?.logradouro ?? '',
      numero: data?.numero ?? '',
      complemento: data?.complemento ?? '',
      bairro: data?.bairro ?? '',
      cidade: data?.cidade ?? '',
      estado: data?.estado ?? '',
    },
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  data?: any
  onClose: () => void
  onSave: () => void
}

export default function PatientModal({ data, onClose, onSave }: Props) {
  const isEdit = !!data?.id
  const [form, setForm] = useState<FormState>(buildForm(data))
  const [cpfError, setCpfError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const numeroRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof Omit<FormState, 'address'>, v: string) =>
    setForm((f) => ({ ...f, [k]: v }))

  const setAddr = (k: keyof AddressState, v: string) =>
    setForm((f) => ({ ...f, address: { ...f.address, [k]: v } }))

  // ─── CPF handler ─────────────────────────────────────────────────────────

  const handleCPF = (raw: string) => {
    const masked = maskCPF(raw)
    set('cpf', masked)
    const digits = masked.replace(/\D/g, '')
    if (digits.length === 11) {
      setCpfError(validateCPF(masked) ? '' : 'CPF inválido')
    } else {
      setCpfError('')
    }
  }

  // ─── CEP lookup ──────────────────────────────────────────────────────────

  const lookupCEP = useCallback(async (cep: string) => {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    setCepError('')
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`)
      if (!res.ok) throw new Error('CEP não encontrado')
      const d = await res.json()
      setForm((f) => ({
        ...f,
        address: {
          ...f.address,
          cep: digits,
          logradouro: d.street ?? '',
          bairro: d.neighborhood ?? '',
          cidade: d.city ?? '',
          estado: d.state ?? '',
        },
      }))
      setTimeout(() => numeroRef.current?.focus(), 50)
    } catch {
      setCepError('CEP não encontrado')
    } finally {
      setCepLoading(false)
    }
  }, [])

  const handleCEPChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 8)
    const masked = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
    setAddr('cep', masked)
    if (digits.length === 8) lookupCEP(digits)
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cpfDigits = form.cpf.replace(/\D/g, '')
    if (cpfDigits && !validateCPF(form.cpf)) {
      setCpfError('CPF inválido')
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        cpf: cpfDigits || null,
        birthDate: form.birthDate || null,
        photoUrl: form.photoUrl || null,
        notes: form.notes || null,
        ...form.address,
        cep: form.address.cep.replace(/\D/g, '') || null,
      }
      const url = isEdit ? `/api/admin/patients/${data.id}` : '/api/admin/patients'
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  const age = calcAge(form.birthDate)
  const cpfDigits = form.cpf.replace(/\D/g, '')
  const cpfOk = cpfDigits.length === 11 && validateCPF(form.cpf)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 sticky top-0 bg-white z-10">
          <h2 className="font-serif text-lg">{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* ── Dados pessoais ── */}
          <div className="flex gap-4 items-start">
            {/* Photo — 1/3 */}
            <div className="w-1/3 shrink-0">
              <PhotoPicker
                value={form.photoUrl}
                onChange={(url) => set('photoUrl', url)}
                onError={setUploadError}
                label="Foto"
                folder="patients"
              />
              {uploadError && <p className="text-red-500 text-xs mt-1">{uploadError}</p>}
            </div>

            {/* Fields — 2/3 */}
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="admin-label">Nome completo *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  className="admin-input"
                  placeholder="Nome do paciente"
                />
              </div>

              <div>
                <label className="admin-label">Telefone *</label>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className="admin-input"
                  placeholder="(41) 99999-9999"
                />
              </div>

              <div>
                <label className="admin-label">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className="admin-input"
                  placeholder="email@exemplo.com"
                />
              </div>

              {/* CPF */}
              <div>
                <label className="admin-label">
                  CPF
                  {cpfDigits.length === 11 && (
                    <span className={`ml-2 text-[0.65rem] font-medium ${cpfOk ? 'text-emerald-600' : 'text-red-500'}`}>
                      {cpfOk ? '✓ válido' : '✗ inválido'}
                    </span>
                  )}
                </label>
                <input
                  value={form.cpf}
                  onChange={(e) => handleCPF(e.target.value)}
                  className={`admin-input font-mono ${cpfError ? 'border-red-400 focus:border-red-400' : ''}`}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  inputMode="numeric"
                />
              </div>

              {/* Data de nascimento + Idade */}
              <div>
                <label className="admin-label">
                  Data de Nascimento
                  {age !== null && (
                    <span className="ml-2 text-[0.65rem] font-medium text-stone-500">{age} anos</span>
                  )}
                </label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => {
                    const v = e.target.value
                    const [y] = v.split('-')
                    if (y && y.length > 4) return
                    set('birthDate', v)
                  }}
                  onKeyDown={(e) => {
                    const v = (e.target as HTMLInputElement).value
                    const year = v.split('-')[0] ?? ''
                    if (year.length >= 4 && /^\d$/.test(e.key) && e.target === document.activeElement) {
                      const sel = (e.target as HTMLInputElement).selectionStart ?? 0
                      if (sel <= 3) e.preventDefault()
                    }
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className="admin-input"
                />
              </div>
            </div>
          </div>

          {/* ── Endereço ── */}
          <div>
            <p className="text-[0.65rem] tracking-widest uppercase text-stone-400 mb-3 border-b border-stone-100 pb-2">
              Endereço
            </p>
            <div className="grid grid-cols-6 gap-3">

              {/* CEP */}
              <div className="col-span-2">
                <label className="admin-label flex items-center gap-1.5">
                  CEP
                  {cepLoading && <Loader2 size={11} className="animate-spin text-stone-400" />}
                </label>
                <div className="relative">
                  <input
                    value={form.address.cep}
                    onChange={(e) => handleCEPChange(e.target.value)}
                    className={`admin-input pr-8 font-mono ${cepError ? 'border-red-400' : ''}`}
                    placeholder="00000-000"
                    maxLength={9}
                    inputMode="numeric"
                  />
                  <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-300" />
                </div>
                {cepError && <p className="text-red-500 text-[0.65rem] mt-0.5">{cepError}</p>}
              </div>

              {/* Logradouro */}
              <div className="col-span-4">
                <label className="admin-label">Logradouro</label>
                <input
                  value={form.address.logradouro}
                  onChange={(e) => setAddr('logradouro', e.target.value)}
                  className="admin-input"
                  placeholder="Rua, Avenida..."
                />
              </div>

              {/* Número */}
              <div className="col-span-2">
                <label className="admin-label">Número</label>
                <input
                  ref={numeroRef}
                  value={form.address.numero}
                  onChange={(e) => setAddr('numero', e.target.value)}
                  className="admin-input"
                  placeholder="123"
                />
              </div>

              {/* Complemento */}
              <div className="col-span-4">
                <label className="admin-label">Complemento</label>
                <input
                  value={form.address.complemento}
                  onChange={(e) => setAddr('complemento', e.target.value)}
                  className="admin-input"
                  placeholder="Apto, Bloco, Casa..."
                />
              </div>

              {/* Bairro */}
              <div className="col-span-2">
                <label className="admin-label">Bairro</label>
                <input
                  value={form.address.bairro}
                  onChange={(e) => setAddr('bairro', e.target.value)}
                  className="admin-input"
                  placeholder="Bairro"
                />
              </div>

              {/* Cidade */}
              <div className="col-span-3">
                <label className="admin-label">Cidade</label>
                <input
                  value={form.address.cidade}
                  onChange={(e) => setAddr('cidade', e.target.value)}
                  className="admin-input"
                  placeholder="Cidade"
                />
              </div>

              {/* Estado */}
              <div className="col-span-1">
                <label className="admin-label">UF</label>
                <input
                  value={form.address.estado}
                  onChange={(e) => setAddr('estado', e.target.value.toUpperCase().slice(0, 2))}
                  className="admin-input uppercase text-center font-mono"
                  placeholder="PR"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* ── Observações ── */}
          <div>
            <label className="admin-label">Observações</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              className="admin-input resize-none"
              placeholder="Alergias, condições especiais, etc."
            />
          </div>

          {error && (
            <p className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
            <button type="submit" disabled={loading || !!cpfError} className="btn-primary">
              {loading ? 'Salvando...' : isEdit ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

'use client'
// src/components/site/TestimonialForm.tsx
import { useState } from 'react'
import { Star } from 'lucide-react'

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
          aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
        >
          <Star
            size={28}
            className={`transition-colors ${
              n <= (hovered || value)
                ? 'fill-amber-400 text-amber-400'
                : 'text-stone-300 fill-stone-100'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

// ─── Validation helpers ───────────────────────────────────────────────────────

function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false
  const calc = (len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += Number(digits[i]) * (len + 1 - i)
    const r = (sum * 10) % 11
    return r === 10 || r === 11 ? 0 : r
  }
  return calc(9) === Number(digits[9]) && calc(10) === Number(digits[10])
}

function validatePhone(phone: string): boolean {
  // Accepts (XX) 9XXXX-XXXX — cell with DDD, 9 mandatory as first digit
  const digits = phone.replace(/\D/g, '')
  return digits.length === 11 && digits[2] === '9'
}

function validateName(name: string): string | null {
  const trimmed = name.trim()
  if (!trimmed) return 'Nome obrigatório.'
  const parts = trimmed.split(/\s+/)
  if (parts.length < 2) return 'Informe nome e sobrenome.'
  return null
}

function validateEmail(email: string): string | null {
  if (!email) return 'E-mail obrigatório.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'E-mail inválido.'
  return null
}

function validateBirthDate(value: string): string | null {
  if (!value) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Data inválida.'
  const year = Number(value.slice(0, 4))
  if (year < 1000 || year > 9999) return 'O ano deve ter 4 dígitos.'
  const birth = new Date(value)
  if (isNaN(birth.getTime())) return 'Data inválida.'
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear() -
    (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0)
  if (age < 15) return 'É necessário ter pelo menos 15 anos.'
  if (age > 100) return 'Data de nascimento inválida.'
  return null
}

// Mask helpers
function maskPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

function maskCPF(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

const TEXT_MAX = 1000

// ─────────────────────────────────────────────────────────────────────────────

const EMPTY = { name: '', email: '', phone: '', cpf: '', birthDate: '', rating: 5, text: '' }

type FieldErrors = {
  name?: string
  email?: string
  phone?: string
  cpf?: string
  birthDate?: string
}

interface Props {
  onSuccess?: () => void
}

export default function TestimonialForm({ onSuccess }: Props) {
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const setErr = (k: keyof FieldErrors, msg?: string) =>
    setFieldErrors((e) => ({ ...e, [k]: msg }))

  // ── Field handlers ─────────────────────────────────────────────────────────

  const handleNameChange = (raw: string) => {
    // Collapse multiple spaces to single, no leading spaces while typing
    const cleaned = raw.replace(/  +/g, ' ').replace(/^\s/, '')
    set('name', cleaned)
    if (fieldErrors.name) setErr('name', undefined)
  }

  const handleNameBlur = () => {
    setErr('name', validateName(form.name) ?? undefined)
  }

  const handlePhoneChange = (raw: string) => {
    set('phone', maskPhone(raw))
    if (fieldErrors.phone) setErr('phone', undefined)
  }

  const handlePhoneBlur = () => {
    if (!form.phone) return setErr('phone', 'WhatsApp obrigatório.')
    setErr('phone', validatePhone(form.phone) ? undefined : 'Celular inválido. Ex: (41) 91234-1234')
  }

  const handleEmailChange = (raw: string) => {
    set('email', raw)
    if (fieldErrors.email) setErr('email', undefined)
  }

  const handleEmailBlur = () => {
    setErr('email', validateEmail(form.email) ?? undefined)
  }

  const handleCPFChange = (raw: string) => {
    const masked = maskCPF(raw)
    set('cpf', masked)
    // Validate on-the-fly only when full length is reached
    const digits = masked.replace(/\D/g, '')
    if (digits.length === 11) {
      setErr('cpf', validateCPF(masked) ? undefined : 'CPF inválido.')
    } else {
      setErr('cpf', undefined)
    }
  }

  const handleCPFBlur = () => {
    if (!form.cpf) return setErr('cpf', undefined)
    setErr('cpf', validateCPF(form.cpf) ? undefined : 'CPF inválido.')
  }

  const handleBirthBlur = () => {
    setErr('birthDate', validateBirthDate(form.birthDate) ?? undefined)
  }

  const handleTextChange = (raw: string) => {
    if (raw.length <= TEXT_MAX) set('text', raw)
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const errors: FieldErrors = {
      name: validateName(form.name) ?? undefined,
      email: validateEmail(form.email) ?? undefined,
      phone: !form.phone ? 'WhatsApp obrigatório.' : (!validatePhone(form.phone) ? 'Celular inválido. Ex: (41) 91234-1234' : undefined),
      cpf: form.cpf && !validateCPF(form.cpf) ? 'CPF inválido.' : undefined,
      birthDate: validateBirthDate(form.birthDate) ?? undefined,
    }

    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors)
      return
    }

    // Sanitize text: trim, collapse line breaks to spaces, collapse double spaces
    const cleanText = form.text
      .replace(/[\r\n]+/g, ' ')
      .replace(/  +/g, ' ')
      .trim()

    const cleanName = form.name.trim().replace(/  +/g, ' ')

    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, name: cleanName, text: cleanText, rating: Number(form.rating) }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setStatus('success')
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar. Tente novamente.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-serif text-xl text-stone-900 mb-2">Obrigado pelo seu depoimento!</h3>
        <p className="text-stone-500 text-sm leading-relaxed">
          Seu comentário foi recebido e será publicado após análise da nossa equipe.
        </p>
      </div>
    )
  }

  const inputCls = (err?: string) =>
    `w-full border px-3 py-2.5 text-sm focus:outline-none ${err ? 'border-red-400 focus:border-red-400' : 'border-stone-200 focus:border-burgundy'}`

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      {/* Rating */}
      <div>
        <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-2">
          Sua avaliação *
        </label>
        <StarPicker value={form.rating} onChange={(v) => set('rating', v)} />
      </div>

      {/* Text */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500">
            Depoimento *
          </label>
          <span className={`text-[0.65rem] tabular-nums ${form.text.length >= TEXT_MAX ? 'text-red-500' : 'text-stone-400'}`}>
            {form.text.length}/{TEXT_MAX}
          </span>
        </div>
        <textarea
          required
          rows={3}
          value={form.text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy resize-none"
          placeholder="Conte como foi sua experiência na CB Odonto..."
          minLength={10}
          maxLength={TEXT_MAX}
        />
      </div>

      {/* Divider */}
      <div className="border-t border-stone-100 pt-4">
        <p className="text-[0.65rem] tracking-wider uppercase text-stone-400 mb-3">
          Seus dados — para seu cadastro na clínica
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">Nome completo *</label>
            <input
              required
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={handleNameBlur}
              className={inputCls(fieldErrors.name)}
              placeholder="Nome Sobrenome"
            />
            {fieldErrors.name && <p className="text-red-500 text-[0.65rem] mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">WhatsApp *</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={handlePhoneBlur}
              className={inputCls(fieldErrors.phone)}
              placeholder="(41) 91234-1234"
            />
            {fieldErrors.phone && <p className="text-red-500 text-[0.65rem] mt-1">{fieldErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">E-mail *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={handleEmailBlur}
              className={inputCls(fieldErrors.email)}
              placeholder="seu@email.com"
            />
            {fieldErrors.email && <p className="text-red-500 text-[0.65rem] mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">CPF</label>
            <input
              value={form.cpf}
              onChange={(e) => handleCPFChange(e.target.value)}
              onBlur={handleCPFBlur}
              className={inputCls(fieldErrors.cpf)}
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
            {fieldErrors.cpf && <p className="text-red-500 text-[0.65rem] mt-1">{fieldErrors.cpf}</p>}
          </div>

          <div>
            <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">Nascimento</label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => { set('birthDate', e.target.value); setErr('birthDate', undefined) }}
              onBlur={handleBirthBlur}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 15)).toISOString().split('T')[0]}
              min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
              className={inputCls(fieldErrors.birthDate)}
            />
            {fieldErrors.birthDate && <p className="text-red-500 text-[0.65rem] mt-1">{fieldErrors.birthDate}</p>}
          </div>
        </div>
      </div>

      {status === 'error' && (
        <p className="text-red-600 text-xs bg-red-50 border border-red-200 px-3 py-2">{error}</p>
      )}

      <button type="submit" disabled={status === 'loading'} className="btn-primary w-full justify-center">
        {status === 'loading' ? 'Enviando...' : 'Enviar depoimento'}
      </button>

      <p className="text-[0.6rem] text-stone-400 text-center leading-relaxed">
        Seus dados são usados exclusivamente para seu cadastro na clínica.
        O depoimento será publicado após aprovação da nossa equipe.
      </p>
    </form>
  )
}

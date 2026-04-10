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

function validateBirthDate(value: string): string | null {
  if (!value) return null
  // Must be exactly YYYY-MM-DD and year must be 4 digits
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

// ─────────────────────────────────────────────────────────────────────────────

const EMPTY = { name: '', email: '', phone: '', cpf: '', birthDate: '', rating: 5, text: '' }

interface Props {
  onSuccess?: () => void
}

export default function TestimonialForm({ onSuccess }: Props) {
  const [form, setForm] = useState(EMPTY)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ cpf?: string; birthDate?: string }>({})

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const handleCPFBlur = () => {
    if (!form.cpf) return setFieldErrors((e) => ({ ...e, cpf: undefined }))
    setFieldErrors((e) => ({
      ...e,
      cpf: validateCPF(form.cpf) ? undefined : 'CPF inválido.',
    }))
  }

  const handleBirthBlur = () => {
    setFieldErrors((e) => ({
      ...e,
      birthDate: validateBirthDate(form.birthDate) ?? undefined,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Client-side validation before sending
    const cpfErr = form.cpf && !validateCPF(form.cpf) ? 'CPF inválido.' : undefined
    const birthErr = validateBirthDate(form.birthDate) ?? undefined
    if (cpfErr || birthErr) {
      setFieldErrors({ cpf: cpfErr, birthDate: birthErr })
      return
    }

    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, rating: Number(form.rating) }),
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
        <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">
          Depoimento *
        </label>
        <textarea
          required
          rows={3}
          value={form.text}
          onChange={(e) => set('text', e.target.value)}
          className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy resize-none"
          placeholder="Conte como foi sua experiência na CB Odonto..."
          minLength={10}
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
              onChange={(e) => set('name', e.target.value)}
              className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">WhatsApp *</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy"
              placeholder="(41) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">E-mail *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="w-full border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:border-burgundy"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">CPF</label>
            <input
              value={form.cpf}
              onChange={(e) => { set('cpf', e.target.value); setFieldErrors((err) => ({ ...err, cpf: undefined })) }}
              onBlur={handleCPFBlur}
              className={`w-full border px-3 py-2.5 text-sm focus:outline-none ${fieldErrors.cpf ? 'border-red-400 focus:border-red-400' : 'border-stone-200 focus:border-burgundy'}`}
              placeholder="000.000.000-00"
            />
            {fieldErrors.cpf && <p className="text-red-500 text-[0.65rem] mt-1">{fieldErrors.cpf}</p>}
          </div>

          <div>
            <label className="block text-[0.7rem] tracking-wider uppercase text-stone-500 mb-1.5">Nascimento</label>
            <input
              type="date"
              value={form.birthDate}
              onChange={(e) => { set('birthDate', e.target.value); setFieldErrors((err) => ({ ...err, birthDate: undefined })) }}
              onBlur={handleBirthBlur}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 15)).toISOString().split('T')[0]}
              min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
              className={`w-full border px-3 py-2.5 text-sm focus:outline-none ${fieldErrors.birthDate ? 'border-red-400 focus:border-red-400' : 'border-stone-200 focus:border-burgundy'}`}
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

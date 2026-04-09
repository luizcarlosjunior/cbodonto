'use client'
// src/app/admin/login/page.tsx
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    setLoading(false)
    if (res?.error) {
      setError('E-mail ou senha inválidos.')
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <svg width="52" height="52" viewBox="0 0 500 500" fill="none" className="mb-4">
            <path d="M250 80 C170 80 110 160 110 260 C110 360 170 420 250 420 C290 420 310 400 320 390" stroke="#c4a97d" strokeWidth="22" strokeLinecap="round" />
            <path d="M280 90 C280 90 280 250 280 420" stroke="#c4a97d" strokeWidth="18" strokeLinecap="round" />
            <path d="M280 90 C330 90 390 110 390 175 C390 240 330 255 280 255" stroke="#c4a97d" strokeWidth="18" strokeLinecap="round" />
            <path d="M280 255 C340 255 400 278 400 340 C400 400 340 420 280 420" stroke="#c4a97d" strokeWidth="18" strokeLinecap="round" />
          </svg>
          <h1 className="font-serif text-2xl text-white">CB Odonto</h1>
          <p className="text-stone-500 text-xs tracking-widest uppercase mt-1">Área Administrativa</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 p-8 space-y-5">
          <div>
            <label className="block text-[0.7rem] tracking-wider uppercase text-stone-400 mb-2">
              E-mail
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-gold placeholder-stone-600"
              placeholder="admin@cbodonto.com.br"
            />
          </div>
          <div>
            <label className="block text-[0.7rem] tracking-wider uppercase text-stone-400 mb-2">
              Senha
            </label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-gold placeholder-stone-600"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-950/50 border border-red-900 px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-burgundy hover:bg-burgundy-light text-white py-3 text-xs tracking-widest uppercase font-medium transition-colors disabled:opacity-60"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-stone-700 text-xs mt-6 tracking-wide">
          cbodonto.com.br © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

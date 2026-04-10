'use client'
// src/app/admin/login/page.tsx
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
          <svg id="logo" width="50" height="50" viewBox="0 0 500 500">
            <path strokeWidth="10" strokeLinecap="round" stroke={'#21A8A0'} fill={'#21A8A0'} className="transition-all duration-500" d="M385.67,179.93c-25.19,24.49-72.12,60.59-104.91,69.24-4.05,1.07-5.22,1.05-6.13,5.55l-5.3,26.29c-2.36,11.7-.5,16.67-5.72,35.44-.96,3.46-2.59,6.86-3.25,10.45l-10.81,58.33c-4.03,21.73-7.35,42.78-10.21,64.82,3.39-1.98,6.09-3.09,8.3-1.99,3.1,1.55,3.85,5.45,2.47,8.37-3.45,7.31-8.52,21.59-16.55,20.47-3.02-.42-4.58-3.53-5.92-6.85-.28-9.45-.24-18.35,1.37-28.08l16.38-98.6c-19.11,22.97-36.06,44.58-56.84,64.1-25.47,23.94-68.42,59.16-105.36,44.42-26.83-10.71-36.13-45.93-38.2-72.11-5.3-67.1,18.48-143.36,45.9-204.46,21.06-46.93,52.01-104.6,90.75-138.59,6.95-6.1,14.67-10.97,23.42-13.08,11.39-2.75,21.19,3.59,24.78,14.42,4.51,13.6,4.12,27.22,2.25,42.25l12.61-13.77c24-26.21,62.92-29,63.56-36.31.32-3.71,2.91-6.03,5.97-5.91,3.7.15,5.44,3.58,5.58,7.65,29.6-4.31,67.14.35,89.75,20.98,36.87,33.63,10.23,85.54-15.17,117,39.76,9.67,59.12,39.61,61.21,77.52,2.19,40.86-16.81,82.09-44.26,111.82-35.35,38.3-87.53,59.78-139.07,62.47-2.18.11-4.82-3.5-4.98-5.28-.17-1.95,2.31-5.74,5.05-5.96,28.31-2.28,55.29-8.85,80.81-21.69,32.87-16.55,59.5-42.07,76.05-74.94,14.04-27.89,20.87-61.38,10.37-91.25-8.23-23.4-28.06-39.47-53.88-42.72ZM264.43,247.67c-7.95-7.6,5.28-26.79,5.77-29.17l35.04-171.93c-38.77,9.08-71.05,35.29-76.99,75.65l-11.09,32.14-30.72,89.69c-1.2,3.52-4.64,5.37-8.19,3.85-2.45-1.05-4.18-4.5-2.91-7.95,16.77-45.78,53.18-149.02,44.38-194.53-.74-3.83-3.9-9.24-7.82-10.08-11.64-2.47-32.89,19.78-40.21,28.35-17.62,20.62-32.05,42.88-45.09,66.86-21.1,38.79-38.77,78.51-51.68,120.79-14.15,46.36-25.24,103.79-13.97,151.16,5.23,21.99,19.92,44.23,45.33,40.87,27.53-3.64,55.53-26.11,74.72-45.12,9.42-9.33,18.2-18.08,26.87-28.13,15.5-17.98,29.68-36.17,43.43-55.52l13.14-66.9ZM399.93,59.5c-21.21-17.36-56.7-20.47-82.79-15.58l-31.04,154.43c28.69-22.86,59.28-31.3,94.79-30.31,23.96-26.53,55.06-79.06,19.04-108.54ZM278.99,238.29c11.83-4.26,20.97-8.87,30.75-14.63,21.25-12.52,41.19-26.31,59.56-44.09-30.18-.89-73.71,16.48-87.68,42.91-2.27,4.29-2.55,10.28-2.63,15.82Z"/>
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full bg-stone-800 border border-stone-700 text-white px-4 py-3 pr-11 text-sm focus:outline-none focus:border-gold placeholder-stone-600"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
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

          <div className="text-center">
            <Link
              href="/admin/esqueci-senha"
              className="text-stone-500 hover:text-stone-300 text-xs transition-colors"
            >
              Esqueci minha senha
            </Link>
          </div>
        </form>

        <p className="text-center text-stone-700 text-xs mt-6 tracking-wide">
          cbodonto.com.br © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

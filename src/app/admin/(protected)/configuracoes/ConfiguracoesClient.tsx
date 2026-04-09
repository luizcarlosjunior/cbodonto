'use client'
// src/app/admin/(protected)/configuracoes/ConfiguracoesClient.tsx
import { useState } from 'react'
import { RefreshCw, CheckCircle, AlertCircle, Database, Phone, Save } from 'lucide-react'
import { ALL_TAGS } from '@/lib/cache-tags'

interface Settings {
  whatsappNumber: string
  address: string
  openHours: string
  instagramUrl: string | null
  facebookUrl: string | null
}

export default function ConfiguracoesClient({ settings }: { settings: Settings }) {
  const [waNumber, setWaNumber] = useState(settings.whatsappNumber)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [cacheStatus, setCacheStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSaveStatus('loading')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsappNumber: waNumber }),
      })
      if (!res.ok) throw new Error()
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 4000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 4000)
    }
  }

  async function handleRevalidate() {
    setCacheStatus('loading')
    try {
      const res = await fetch('/api/admin/cache', { method: 'POST' })
      if (!res.ok) throw new Error()
      setCacheStatus('success')
      setTimeout(() => setCacheStatus('idle'), 4000)
    } catch {
      setCacheStatus('error')
      setTimeout(() => setCacheStatus('idle'), 4000)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-900">Configurações</h1>
        <p className="text-stone-500 text-sm mt-1">Gerenciamento do sistema</p>
      </div>

      {/* WhatsApp card */}
      <div className="bg-white border border-stone-200">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-3">
          <Phone size={18} className="text-stone-500" strokeWidth={1.5} />
          <h2 className="font-serif text-lg text-stone-900">WhatsApp & Contato</h2>
        </div>

        <form onSubmit={handleSaveSettings} className="px-6 py-5">
          <p className="text-sm text-stone-500 mb-4">
            Número usado em todos os links e botões de WhatsApp do site. Formato: <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-xs">5541999999999</span> (código do país + DDD + número, sem espaços ou traços).
          </p>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-[0.7rem] tracking-widest uppercase text-stone-400 mb-1.5">
                Número WhatsApp
              </label>
              <input
                type="text"
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="5541999999999"
                className="w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={saveStatus === 'loading'}
              className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-5"
            >
              <Save size={14} strokeWidth={1.5} />
              {saveStatus === 'loading' ? 'Salvando…' : 'Salvar'}
            </button>
          </div>

          {saveStatus === 'success' && (
            <p className="flex items-center gap-1.5 text-sm text-emerald-700 mt-3">
              <CheckCircle size={15} strokeWidth={1.5} />
              Número salvo. O site será atualizado na próxima visita.
            </p>
          )}
          {saveStatus === 'error' && (
            <p className="flex items-center gap-1.5 text-sm text-red-600 mt-3">
              <AlertCircle size={15} strokeWidth={1.5} />
              Erro ao salvar. Tente novamente.
            </p>
          )}
        </form>
      </div>

      {/* Cache card */}
      <div className="bg-white border border-stone-200">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-3">
          <Database size={18} className="text-stone-500" strokeWidth={1.5} />
          <h2 className="font-serif text-lg text-stone-900">Cache do Site</h2>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-stone-600 mb-1">
            O site utiliza cache de longa duração para responder mais rápido e reduzir consultas ao banco de dados.
            O cache é atualizado automaticamente quando você salva alterações no painel admin.
          </p>
          <p className="text-sm text-stone-500 mb-5">
            Use o botão abaixo para forçar a atualização de todos os caches manualmente.
            Tags ativas:{' '}
            <span className="font-mono text-xs bg-stone-100 px-1.5 py-0.5 rounded">
              {ALL_TAGS.join(', ')}
            </span>
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRevalidate}
              disabled={cacheStatus === 'loading'}
              className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw
                size={15}
                strokeWidth={1.5}
                className={cacheStatus === 'loading' ? 'animate-spin' : ''}
              />
              {cacheStatus === 'loading' ? 'Atualizando…' : 'Zerar e Atualizar Caches'}
            </button>

            {cacheStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700">
                <CheckCircle size={15} strokeWidth={1.5} />
                Caches zerados com sucesso
              </span>
            )}
            {cacheStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle size={15} strokeWidth={1.5} />
                Erro ao zerar caches
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

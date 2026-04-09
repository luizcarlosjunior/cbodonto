'use client'
// src/app/admin/(protected)/configuracoes/ConfiguracoesClient.tsx
import { useState } from 'react'
import { RefreshCw, CheckCircle, AlertCircle, Database, Phone, Save } from 'lucide-react'
import { ALL_TAGS } from '@/lib/cache-tags'

interface Settings {
  whatsappNumber: string
  addressLine1: string | null
  addressLine2: string | null
  cnpj: string | null
  legalName: string | null
  tradeName: string | null
  footerText: string | null
  customerServiceEmail: string | null
  openHours: string
  instagramUrl: string | null
  facebookUrl: string | null
}

export default function ConfiguracoesClient({ settings }: { settings: Settings }) {
  const [formData, setFormData] = useState<Settings>(settings)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [cacheStatus, setCacheStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault()
    setSaveStatus('loading')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

  const inputClasses = "w-full border border-stone-200 px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-stone-400"
  const labelClasses = "block text-[0.65rem] tracking-widest uppercase text-stone-400 mb-1.5"

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-900">Configurações</h1>
        <p className="text-stone-500 text-sm mt-1">Gerenciamento do sistema e informações do site</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Contato & Redes Sociais */}
        <div className="bg-white border border-stone-200">
          <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-3">
            <Phone size={18} className="text-stone-500" strokeWidth={1.5} />
            <h2 className="font-serif text-lg text-stone-900">Contato & Redes Sociais</h2>
          </div>
          <div className="px-6 py-5 grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClasses}>Número WhatsApp (Somente números)</label>
              <input
                type="text"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value.replace(/\D/g, '') })}
                placeholder="5541999999999"
                className={inputClasses + " font-mono"}
              />
            </div>
            <div>
              <label className={labelClasses}>Instagram URL</label>
              <input
                type="text"
                value={formData.instagramUrl || ''}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/seu-perfil"
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Facebook URL</label>
              <input
                type="text"
                value={formData.facebookUrl || ''}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/seu-perfil"
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* Endereço & Horário */}
        <div className="bg-white border border-stone-200">
          <div className="px-6 py-5 border-b border-stone-100">
            <h2 className="font-serif text-lg text-stone-900">Endereço & Horário</h2>
          </div>
          <div className="px-6 py-5 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClasses}>Endereço Linha 1</label>
                <input
                  type="text"
                  value={formData.addressLine1 || ''}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="Ex: R. Casemiro de Abreu, 238 – Maracanã"
                  className={inputClasses}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>Endereço Linha 2</label>
                <input
                  type="text"
                  value={formData.addressLine2 || ''}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  placeholder="Ex: Colombo – PR, 83409-070"
                  className={inputClasses}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>Horário de Funcionamento</label>
                <input
                  type="text"
                  value={formData.openHours || ''}
                  onChange={(e) => setFormData({ ...formData, openHours: e.target.value })}
                  placeholder="Ex: Segunda a Sexta: 08h – 18h"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Informações Legais & Rodapé */}
        <div className="bg-white border border-stone-200">
          <div className="px-6 py-5 border-b border-stone-100">
            <h2 className="font-serif text-lg text-stone-900">Informações Legais & Rodapé</h2>
          </div>
          <div className="px-6 py-5 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>CNPJ</label>
                <input
                  type="text"
                  value={formData.cnpj || ''}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>E-mail de Atendimento</label>
                <input
                  type="email"
                  value={formData.customerServiceEmail || ''}
                  onChange={(e) => setFormData({ ...formData, customerServiceEmail: e.target.value })}
                  placeholder="atendimento@cbodonto.com.br"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Razão Social</label>
                <input
                  type="text"
                  value={formData.legalName || ''}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Nome Fantasia</label>
                <input
                  type="text"
                  value={formData.tradeName || ''}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClasses}>Texto de Rodapé (Breve frase sobre a clínica)</label>
                <textarea
                  value={formData.footerText || ''}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  rows={2}
                  className={inputClasses + " resize-none"}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white border border-stone-200 p-6">
          <div>
            {saveStatus === 'success' && (
              <p className="flex items-center gap-1.5 text-sm text-emerald-700">
                <CheckCircle size={15} strokeWidth={1.5} />
                Configurações salvas com sucesso.
              </p>
            )}
            {saveStatus === 'error' && (
              <p className="flex items-center gap-1.5 text-sm text-red-600">
                <AlertCircle size={15} strokeWidth={1.5} />
                Erro ao salvar as configurações.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={saveStatus === 'loading'}
            className="flex items-center gap-2 px-8 py-2.5 bg-stone-900 text-white text-sm hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} strokeWidth={1.5} />
            {saveStatus === 'loading' ? 'Salvando…' : 'Salvar Alterações'}
          </button>
        </div>
      </form>

      {/* Cache card */}
      <div className="bg-white border border-stone-200">
        <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-3">
          <Database size={18} className="text-stone-500" strokeWidth={1.5} />
          <h2 className="font-serif text-lg text-stone-900">Cache do Site</h2>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-stone-600 mb-1">
            O site utiliza cache de longa duração para responder mais rápido.
            Use o botão abaixo para forçar a atualização manual se necessário.
          </p>
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={handleRevalidate}
              disabled={cacheStatus === 'loading'}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 text-sm hover:bg-stone-200 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                size={15}
                strokeWidth={1.5}
                className={cacheStatus === 'loading' ? 'animate-spin' : ''}
              />
              {cacheStatus === 'loading' ? 'Atualizando…' : 'Limpar Caches do Site'}
            </button>

            {cacheStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-700">
                <CheckCircle size={15} strokeWidth={1.5} />
                Caches zerados
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

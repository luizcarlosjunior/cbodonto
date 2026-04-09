'use client'
// src/app/admin/clientes/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import PatientModal from '@/components/admin/PatientModal'
import Link from 'next/link'

export default function ClientesPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [modal, setModal] = useState<{ open: boolean; data?: any }>({ open: false })

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/patients?${params}`)
    if (res.ok) {
      const data = await res.json()
      setPatients(data.patients)
      setTotal(data.total)
      setPages(data.pages)
    }
    setLoading(false)
  }, [page, search])

  useEffect(() => { fetchPatients() }, [fetchPatients])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir o paciente "${name}"? Esta ação não pode ser desfeita.`)) return
    await fetch(`/api/admin/patients/${id}`, { method: 'DELETE' })
    fetchPatients()
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Clientes</h1>
          <p className="text-stone-500 text-sm mt-0.5">{total} pacientes cadastrados</p>
        </div>
        <button onClick={() => setModal({ open: true })} className="btn-primary">
          <Plus size={14} /> Novo Cliente
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome, telefone, e-mail ou CPF..."
            className="w-full border border-stone-200 pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-burgundy rounded-sm"
          />
        </div>
        <button type="submit" className="btn-primary">Buscar</button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1) }}
            className="btn-outline">Limpar</button>
        )}
        <button type="button" onClick={fetchPatients} className="p-2.5 text-stone-400 hover:text-stone-600 border border-stone-200 rounded-sm">
          <RefreshCw size={14} />
        </button>
      </form>

      {/* Table */}
      <div className="bg-white border border-stone-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                {['Nome', 'Telefone', 'E-mail', 'CPF', 'Consultas', 'Cadastro', 'Ações'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[0.7rem] tracking-widest uppercase text-stone-400 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-stone-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-stone-100 rounded animate-pulse" style={{ width: `${50 + Math.random() * 50}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-stone-400">
                    {search ? 'Nenhum paciente encontrado para essa busca.' : 'Nenhum paciente cadastrado ainda.'}
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-stone-800">{p.name}</td>
                    <td className="px-5 py-3.5 text-stone-500">{p.phone}</td>
                    <td className="px-5 py-3.5 text-stone-500 max-w-[180px] truncate">{p.email ?? '—'}</td>
                    <td className="px-5 py-3.5 text-stone-500">{p.cpf ?? '—'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                        {p._count?.appointments ?? 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-500 whitespace-nowrap">{formatDate(p.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/clientes/${p.id}`} className="text-xs text-stone-400 hover:text-burgundy transition-colors">
                          Ver
                        </Link>
                        <span className="text-stone-200">|</span>
                        <button onClick={() => setModal({ open: true, data: p })} className="text-xs text-stone-400 hover:text-burgundy transition-colors">
                          Editar
                        </button>
                        <span className="text-stone-200">|</span>
                        <button onClick={() => handleDelete(p.id, p.name)} className="text-xs text-stone-400 hover:text-red-500 transition-colors">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 bg-stone-50">
            <span className="text-xs text-stone-400">Página {page} de {pages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 text-stone-400 hover:text-stone-600 disabled:opacity-30">
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 text-stone-400 hover:text-stone-600 disabled:opacity-30">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {modal.open && (
        <PatientModal
          data={modal.data}
          onClose={() => setModal({ open: false })}
          onSave={() => { setModal({ open: false }); fetchPatients() }}
        />
      )}
    </div>
  )
}

'use client'
// src/app/admin/agendamentos/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS, formatDate, cn } from '@/lib/utils'
import AppointmentModal from '@/components/admin/AppointmentModal'

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [dentistId, setDentistId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [dentists, setDentists] = useState<any[]>([])
  const [modal, setModal] = useState<{ open: boolean; data?: any }>({ open: false })

  const fetchDentists = useCallback(async () => {
    const res = await fetch('/api/admin/dentists')
    if (res.ok) {
      const data = await res.json()
      setDentists(data.dentists ?? data)
    }
  }, [])

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (status) params.set('status', status)
    if (dentistId) params.set('dentistId', dentistId)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    const res = await fetch(`/api/admin/appointments?${params}`)
    if (res.ok) {
      const data = await res.json()
      setAppointments(data.appointments)
      setTotal(data.total)
      setPages(data.pages)
    }
    setLoading(false)
  }, [page, status, dentistId, dateFrom, dateTo])

  useEffect(() => { fetchDentists() }, [fetchDentists])
  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    fetchAppointments()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este agendamento?')) return
    await fetch(`/api/admin/appointments/${id}`, { method: 'DELETE' })
    fetchAppointments()
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Agendamentos</h1>
          <p className="text-stone-500 text-sm mt-0.5">{total} registros encontrados</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="btn-primary"
        >
          <Plus size={14} /> Novo Agendamento
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone-200 p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex items-center gap-2 text-stone-400">
          <Filter size={14} />
          <span className="text-xs uppercase tracking-wider">Filtros</span>
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-burgundy bg-white rounded-sm"
        >
          <option value="">Todos os status</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        <select
          value={dentistId}
          onChange={(e) => { setDentistId(e.target.value); setPage(1) }}
          className="border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-burgundy bg-white rounded-sm"
        >
          <option value="">Todos os dentistas</option>
          {dentists.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-burgundy rounded-sm" />
          <span className="text-stone-400 text-sm">até</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-burgundy rounded-sm" />
        </div>
        <button onClick={() => { setStatus(''); setDentistId(''); setDateFrom(''); setDateTo(''); setPage(1) }}
          className="text-xs text-stone-400 hover:text-stone-600 underline">
          Limpar
        </button>
        <button onClick={fetchAppointments} className="ml-auto p-2 text-stone-400 hover:text-stone-600">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                {['Paciente', 'Dentista', 'Serviço', 'Data', 'Horário', 'Status', 'Ações'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[0.7rem] tracking-widest uppercase text-stone-400 font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-stone-50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-stone-100 rounded animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-stone-400">
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-stone-800">
                      {a.patient?.name ?? a.guestName ?? '—'}
                      {!a.patient && a.guestPhone && (
                        <span className="block text-xs text-stone-400 font-normal">{a.guestPhone}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-stone-500 whitespace-nowrap">
                      {a.dentist.name.replace('Dr. ', '').replace('Dra. ', '')}
                    </td>
                    <td className="px-5 py-3.5 text-stone-500 max-w-[150px] truncate">{a.service}</td>
                    <td className="px-5 py-3.5 text-stone-500 whitespace-nowrap">{formatDate(a.date)}</td>
                    <td className="px-5 py-3.5 text-stone-500">{a.startTime}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={a.status}
                        onChange={(e) => handleStatusChange(a.id, e.target.value)}
                        className={cn(
                          'text-[0.65rem] px-2.5 py-1 rounded-full font-medium tracking-wide border-0 cursor-pointer focus:outline-none',
                          STATUS_COLORS[a.status]
                        )}
                      >
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal({ open: true, data: a })}
                          className="text-xs text-stone-400 hover:text-burgundy transition-colors"
                        >
                          Editar
                        </button>
                        <span className="text-stone-200">|</span>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="text-xs text-stone-400 hover:text-red-500 transition-colors"
                        >
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

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 bg-stone-50">
            <span className="text-xs text-stone-400">Página {page} de {pages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 text-stone-400 hover:text-stone-600 disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-1.5 text-stone-400 hover:text-stone-600 disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {modal.open && (
        <AppointmentModal
          data={modal.data}
          dentists={dentists}
          onClose={() => setModal({ open: false })}
          onSave={() => { setModal({ open: false }); fetchAppointments() }}
        />
      )}
    </div>
  )
}

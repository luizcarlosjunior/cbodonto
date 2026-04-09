'use client'
// src/app/admin/clientes/[id]/page.tsx
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Phone, Mail, Calendar, Edit } from 'lucide-react'
import { formatDate, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import PatientModal from '@/components/admin/PatientModal'
import Link from 'next/link'

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  const fetchPatient = async () => {
    const res = await fetch(`/api/admin/patients/${id}`)
    if (res.ok) setPatient(await res.json())
    else router.push('/admin/clientes')
    setLoading(false)
  }

  useEffect(() => { fetchPatient() }, [id])

  if (loading) return (
    <div className="p-8">
      <div className="h-8 w-48 bg-stone-200 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-stone-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  )

  if (!patient) return null

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/clientes" className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-sm transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1">
          <h1 className="font-serif text-3xl text-stone-900">{patient.name}</h1>
          <p className="text-stone-400 text-sm mt-0.5">Cadastrado em {formatDate(patient.createdAt)}</p>
        </div>
        <button onClick={() => setEditOpen(true)} className="btn-outline gap-2">
          <Edit size={13} /> Editar
        </button>
      </div>

      {/* Info cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Phone, label: 'Telefone', value: patient.phone },
          { icon: Mail, label: 'E-mail', value: patient.email ?? '—' },
          { icon: Calendar, label: 'Nascimento', value: patient.birthDate ? formatDate(patient.birthDate) : '—' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white border border-stone-200 p-5 flex items-start gap-3">
            <div className="w-8 h-8 bg-stone-100 rounded-sm flex items-center justify-center shrink-0">
              <Icon size={14} className="text-stone-500" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[0.65rem] tracking-widest uppercase text-stone-400">{label}</p>
              <p className="text-stone-800 text-sm mt-0.5">{value}</p>
            </div>
          </div>
        ))}
        {patient.cpf && (
          <div className="bg-white border border-stone-200 p-5">
            <p className="text-[0.65rem] tracking-widest uppercase text-stone-400">CPF</p>
            <p className="text-stone-800 text-sm mt-0.5 font-mono">
              {patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
            </p>
          </div>
        )}
        {(patient.logradouro || patient.cep) && (
          <div className="bg-white border border-stone-200 p-5 sm:col-span-2 lg:col-span-3">
            <p className="text-[0.65rem] tracking-widest uppercase text-stone-400 mb-1">Endereço</p>
            <p className="text-stone-800 text-sm">
              {[patient.logradouro, patient.numero, patient.complemento].filter(Boolean).join(', ')}
            </p>
            <p className="text-stone-500 text-sm">
              {[patient.bairro, patient.cidade, patient.estado].filter(Boolean).join(' · ')}
              {patient.cep ? ` · CEP ${patient.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}` : ''}
            </p>
          </div>
        )}
        <div className="bg-white border border-stone-200 p-5">
          <p className="text-[0.65rem] tracking-widest uppercase text-stone-400">Total de Consultas</p>
          <p className="font-serif text-3xl text-stone-900 mt-1">{patient.appointments?.length ?? 0}</p>
        </div>
      </div>

      {/* Notes */}
      {patient.notes && (
        <div className="bg-amber-50 border border-amber-200 p-5 mb-8">
          <p className="text-[0.65rem] tracking-widest uppercase text-amber-600 mb-1">Observações</p>
          <p className="text-stone-700 text-sm leading-relaxed">{patient.notes}</p>
        </div>
      )}

      {/* Appointments history */}
      <div className="bg-white border border-stone-200">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="font-serif text-lg text-stone-900">Histórico de Consultas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                {['Data', 'Dentista', 'Serviço', 'Horário', 'Status'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[0.7rem] tracking-widest uppercase text-stone-400 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patient.appointments?.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-stone-400">Nenhuma consulta registrada.</td></tr>
              ) : (
                patient.appointments?.map((a: any) => (
                  <tr key={a.id} className="border-b border-stone-50 hover:bg-stone-50">
                    <td className="px-5 py-3 text-stone-600 whitespace-nowrap">{formatDate(a.date)}</td>
                    <td className="px-5 py-3 text-stone-600">{a.dentist?.name}</td>
                    <td className="px-5 py-3 text-stone-600 max-w-[160px] truncate">{a.service}</td>
                    <td className="px-5 py-3 text-stone-500">{a.startTime}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[0.65rem] px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[a.status]}`}>
                        {STATUS_LABELS[a.status]}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editOpen && (
        <PatientModal
          data={patient}
          onClose={() => setEditOpen(false)}
          onSave={() => { setEditOpen(false); fetchPatient() }}
        />
      )}
    </div>
  )
}

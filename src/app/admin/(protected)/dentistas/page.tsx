'use client'
// src/app/admin/dentistas/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { Plus, UserCheck, UserX, Calendar, Mail, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import DentistModal from '@/components/admin/DentistModal'

export default function DentistasPage() {
  const [dentists, setDentists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; data?: any }>({ open: false })

  const fetchDentists = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/dentists')
    if (res.ok) setDentists(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchDentists() }, [fetchDentists])

  const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">Dentistas</h1>
          <p className="text-stone-500 text-sm mt-0.5">{dentists.length} profissional(is) cadastrado(s)</p>
        </div>
        <button onClick={() => setModal({ open: true })} className="btn-primary">
          <Plus size={14} /> Novo Dentista
        </button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2].map((i) => (
            <div key={i} className="h-48 bg-stone-200 rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {dentists.map((d) => (
            <div key={d.id} className="bg-white border border-stone-200 p-6 hover:border-stone-300 transition-colors">
              <div className="flex items-start gap-4 mb-4">
                {/* Photo */}
                <div className="w-14 h-14 shrink-0 rounded-full overflow-hidden bg-stone-100 border border-stone-200">
                  {d.photoUrl ? (
                    <Image src={d.photoUrl} alt={d.name} width={56} height={56} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                      <UserCheck size={24} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-serif text-xl text-stone-900">{d.name}</h3>
                        {d.active
                          ? <UserCheck size={14} className="text-emerald-500" />
                          : <UserX size={14} className="text-red-400" />
                        }
                      </div>
                      <p className="text-stone-400 text-xs tracking-wide">{d.title} · {d.cro}</p>
                      {d.specialty && <p className="text-stone-500 text-xs mt-1">{d.specialty}</p>}
                    </div>
                    <span className={`shrink-0 text-[0.6rem] px-2 py-0.5 rounded-full tracking-wide font-medium ${d.active ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-500'}`}>
                      {d.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  {/* Contact info */}
                  {(d.email || d.phone) && (
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      {d.email && (
                        <a href={`mailto:${d.email}`} className="flex items-center gap-1 text-xs text-stone-400 hover:text-burgundy transition-colors">
                          <Mail size={11} />
                          <span className="truncate max-w-[160px]">{d.email}</span>
                        </a>
                      )}
                      {d.phone && (
                        <a href={`tel:${d.phone}`} className="flex items-center gap-1 text-xs text-stone-400 hover:text-burgundy transition-colors">
                          <Phone size={11} />
                          {d.phone}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Weekly schedule preview */}
              <div className="mb-4">
                <p className="text-[0.65rem] tracking-widest uppercase text-stone-400 mb-2">Disponibilidade</p>
                <div className="flex gap-1.5 flex-wrap">
                  {[1,2,3,4,5,6,0].map((day) => {
                    const sched = d.weeklySchedule?.find((s: any) => s.dayOfWeek === day && s.active)
                    return (
                      <div
                        key={day}
                        className={`text-center px-2 py-1.5 text-[0.6rem] rounded-sm min-w-[38px] ${
                          sched ? 'bg-burgundy/10 text-burgundy border border-burgundy/20' : 'bg-stone-100 text-stone-400'
                        }`}
                      >
                        <div className="font-medium">{DAY_NAMES[day]}</div>
                        {sched && <div className="opacity-70">{sched.startTime}</div>}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <div className="flex items-center gap-1 text-stone-400 text-xs">
                  <Calendar size={12} />
                  <span>{d._count?.appointments ?? 0} consultas</span>
                </div>
                <div className="flex gap-3">
                  <Link href={`/admin/dentistas/${d.id}`} className="text-xs text-stone-400 hover:text-burgundy transition-colors">
                    Gerenciar Horários
                  </Link>
                  <span className="text-stone-200">|</span>
                  <button onClick={() => setModal({ open: true, data: d })} className="text-xs text-stone-400 hover:text-burgundy transition-colors">
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <DentistModal
          data={modal.data}
          onClose={() => setModal({ open: false })}
          onSave={() => { setModal({ open: false }); fetchDentists() }}
        />
      )}
    </div>
  )
}

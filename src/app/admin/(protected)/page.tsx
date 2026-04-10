// src/app/admin/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Calendar, Users, Star, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { STATUS_LABELS, STATUS_COLORS, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { getCachedStats } from '@/lib/cache'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const [
    totalPatients,
    ,
    todayAppointments,
    weekAppointments,
    pendingAppointments,
    pendingTestimonials,
    recentAppointments,
    monthCompleted,
  ] = await getCachedStats()
  const stats = { totalPatients, todayAppointments, weekAppointments, pendingAppointments, pendingTestimonials, recentAppointments, monthCompleted }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const firstName = session?.user?.name?.split(' ')[0] ?? 'Admin'

  const cards = [
    { label: 'Pacientes Cadastrados', value: stats.totalPatients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/clientes' },
    { label: 'Agendamentos Hoje', value: stats.todayAppointments, icon: Calendar, color: 'text-burgundy', bg: 'bg-red-50', href: '/admin/agendamentos' },
    { label: 'Essa Semana', value: stats.weekAppointments, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/admin/agendamentos' },
    { label: 'Pendentes Aprovação', value: stats.pendingAppointments, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', href: '/admin/agendamentos?status=PENDING' },
    { label: 'Concluídos no Mês', value: stats.monthCompleted, icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-50', href: '/admin/agendamentos' },
    { label: 'Depoimentos Pendentes', value: stats.pendingTestimonials, icon: Star, color: 'text-purple-600', bg: 'bg-purple-50', href: '/admin/depoimentos' },
  ]

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-stone-900">
          {greeting}, {firstName}!
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white border border-stone-200 p-5 hover:border-stone-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-stone-500 text-xs tracking-wide mb-2">{label}</p>
                <p className="text-3xl font-serif text-stone-900">{value}</p>
              </div>
              <div className={`${bg} p-2.5 rounded-sm`}>
                <Icon size={18} className={color} strokeWidth={1.5} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      {(stats.pendingAppointments > 0 || stats.pendingTestimonials > 0) && (
        <div className="space-y-2 mb-8">
          {stats.pendingAppointments > 0 && (
            <Link href="/admin/agendamentos?status=PENDING" className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 hover:bg-amber-100 transition-colors">
              <AlertCircle size={16} className="shrink-0" />
              <span><strong>{stats.pendingAppointments}</strong> agendamento(s) aguardando confirmação.</span>
            </Link>
          )}
          {stats.pendingTestimonials > 0 && (
            <Link href="/admin/depoimentos" className="flex items-center gap-3 bg-purple-50 border border-purple-200 px-4 py-3 text-sm text-purple-800 hover:bg-purple-100 transition-colors">
              <Star size={16} className="shrink-0" />
              <span><strong>{stats.pendingTestimonials}</strong> depoimento(s) aguardando aprovação.</span>
            </Link>
          )}
        </div>
      )}

      {/* Recent appointments */}
      <div className="bg-white border border-stone-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="font-serif text-lg text-stone-900">Agendamentos Recentes</h2>
          <Link href="/admin/agendamentos" className="text-xs text-burgundy hover:underline tracking-wide">
            Ver todos →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                {['Paciente', 'Dentista', 'Serviço', 'Data', 'Horário', 'Status', ''].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-[0.7rem] tracking-widest uppercase text-stone-400 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentAppointments.map((a) => (
                <tr key={a.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors group">
                  <td className="px-6 py-3 text-stone-800 font-medium">
                    <Link href={`/admin/agendamentos/${a.id}`} className="hover:text-burgundy transition-colors">
                      {a.patient?.name ?? a.guestName ?? '—'}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-stone-500">{a.dentist.name.replace('Dr. ', '').replace('Dra. ', '')}</td>
                  <td className="px-6 py-3 text-stone-500 max-w-[140px] truncate">{a.service}</td>
                  <td className="px-6 py-3 text-stone-500">{formatDate(a.date)}</td>
                  <td className="px-6 py-3 text-stone-500">{a.startTime}</td>
                  <td className="px-6 py-3">
                    <span className={`text-[0.65rem] px-2.5 py-1 rounded-full font-medium tracking-wide ${STATUS_COLORS[a.status]}`}>
                      {STATUS_LABELS[a.status]}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <Link href={`/admin/agendamentos/${a.id}`} className="text-xs text-stone-400 hover:text-burgundy transition-colors opacity-0 group-hover:opacity-100">
                      Ver detalhes →
                    </Link>
                  </td>
                </tr>
              ))}
              {stats.recentAppointments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-stone-400 text-sm">
                    Nenhum agendamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

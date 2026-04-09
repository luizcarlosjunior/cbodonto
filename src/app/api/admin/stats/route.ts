// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCachedStats } from '@/lib/cache'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const [
    totalPatients,
    totalAppointments,
    todayAppointments,
    weekAppointments,
    pendingAppointments,
    pendingTestimonials,
    ,
    monthCompleted,
  ] = await getCachedStats()

  return NextResponse.json({
    totalPatients,
    totalAppointments,
    todayAppointments,
    weekAppointments,
    pendingAppointments,
    pendingTestimonials,
    monthCompleted,
  })
}

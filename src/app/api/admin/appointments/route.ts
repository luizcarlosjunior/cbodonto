// src/app/api/admin/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCachedAppointments, TAGS } from '@/lib/cache'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const params = {
    status: searchParams.get('status') || undefined,
    dentistId: searchParams.get('dentistId') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
    page: Number(searchParams.get('page') || '1'),
  }

  const [appointments, total] = await getCachedAppointments(params)
  const limit = 25

  return NextResponse.json({ appointments, total, page: params.page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const appointment = await db.appointment.create({
      data: { ...body, date: new Date(body.date), source: 'ADMIN' },
      include: {
        dentist: { select: { name: true } },
        patient: { select: { name: true } },
      },
    })
    revalidateTag(TAGS.appointments)
    revalidateTag(TAGS.stats)
    return NextResponse.json(appointment, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

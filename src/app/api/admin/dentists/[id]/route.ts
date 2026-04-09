// src/app/api/admin/dentists/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCachedAdminDentist, TAGS } from '@/lib/cache'

type Params = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dentist = await getCachedAdminDentist(params.id)
  if (!dentist) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(dentist)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()

    // Handle weekly schedule update
    if (body.weeklySchedule !== undefined) {
      const schedules: Array<{ dayOfWeek: number; startTime: string; endTime: string; active: boolean }> = body.weeklySchedule

      for (const s of schedules) {
        await db.weeklySchedule.upsert({
          where: { dentistId_dayOfWeek: { dentistId: params.id, dayOfWeek: s.dayOfWeek } },
          update: { startTime: s.startTime, endTime: s.endTime, active: s.active },
          create: { dentistId: params.id, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, active: s.active },
        })
      }
      const updated = await db.dentist.findUnique({
        where: { id: params.id },
        include: { weeklySchedule: { orderBy: { dayOfWeek: 'asc' } }, unavailableDates: { orderBy: { date: 'asc' } } },
      })
      revalidateTag(TAGS.dentists)
      return NextResponse.json(updated)
    }

    // Handle unavailable date add
    if (body.addUnavailable !== undefined) {
      const { date, startTime, endTime, reason } = body.addUnavailable
      const unavailable = await db.unavailableDate.create({
        data: {
          dentistId: params.id,
          date: new Date(date),
          startTime: startTime || null,
          endTime: endTime || null,
          reason: reason || null,
        },
      })
      revalidateTag(TAGS.dentists)
      return NextResponse.json(unavailable)
    }

    // Handle unavailable date remove
    if (body.removeUnavailableId !== undefined) {
      await db.unavailableDate.delete({ where: { id: body.removeUnavailableId } })
      revalidateTag(TAGS.dentists)
      return NextResponse.json({ success: true })
    }

    // Regular dentist update
    const { weeklySchedule: _, addUnavailable: __, removeUnavailableId: ___, ...dentistData } = body
    const dentist = await db.dentist.update({ where: { id: params.id }, data: dentistData })
    revalidateTag(TAGS.dentists)
    return NextResponse.json(dentist)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  await db.dentist.delete({ where: { id: params.id } })
  revalidateTag(TAGS.dentists)
  return NextResponse.json({ success: true })
}

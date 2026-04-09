// src/app/api/admin/appointments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { TAGS } from '@/lib/cache'

type Params = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const data: any = { ...body }
    if (body.date) data.date = new Date(body.date)

    const appointment = await db.appointment.update({
      where: { id: params.id },
      data,
      include: {
        dentist: { select: { name: true } },
        patient: { select: { name: true } },
      },
    })
    revalidateTag(TAGS.appointments)
    revalidateTag(TAGS.stats)
    return NextResponse.json(appointment)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  await db.appointment.delete({ where: { id: params.id } })
  revalidateTag(TAGS.appointments)
  revalidateTag(TAGS.stats)
  return NextResponse.json({ success: true })
}

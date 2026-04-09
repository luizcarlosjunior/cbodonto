// src/app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  dentistId: z.string().min(1, 'Selecione um dentista'),
  guestName: z.string().min(2, 'Nome obrigatório'),
  guestPhone: z.string().min(8, 'Telefone obrigatório'),
  guestEmail: z.string().email().optional().or(z.literal('')),
  service: z.string().min(1, 'Selecione um serviço'),
  date: z.string().min(1, 'Data obrigatória'),
  startTime: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    // Check dentist exists
    const dentist = await db.dentist.findUnique({ where: { id: data.dentistId } })
    if (!dentist) return NextResponse.json({ error: 'Dentista não encontrado' }, { status: 404 })

    const appointment = await db.appointment.create({
      data: {
        dentistId: data.dentistId,
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        guestEmail: data.guestEmail || null,
        service: data.service,
        date: new Date(data.date),
        startTime: data.startTime || '09:00',
        endTime: data.startTime ? addThirtyMin(data.startTime) : '09:30',
        notes: data.notes || null,
        status: 'PENDING',
        source: 'WEBSITE',
      },
    })

    return NextResponse.json({ success: true, id: appointment.id })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

function addThirtyMin(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + 30
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// src/app/api/slots/route.ts
// Public endpoint — returns taken startTimes for a dentist on a given date
// Blocks slots where status is CONFIRMED or PENDING
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const dentistId = searchParams.get('dentistId')
  const date      = searchParams.get('date') // YYYY-MM-DD

  if (!dentistId || !date) {
    return NextResponse.json({ takenSlots: [] })
  }

  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  const appointments = await db.appointment.findMany({
    where: {
      dentistId,
      date: { gte: start, lte: end },
      status: { in: ['CONFIRMED', 'PENDING'] },
    },
    select: { startTime: true },
  })

  const takenSlots = appointments.map((a) => a.startTime).filter(Boolean)
  return NextResponse.json({ takenSlots })
}

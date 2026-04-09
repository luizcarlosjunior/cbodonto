// src/app/api/testimonials/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  patientName: z.string().min(2),
  text: z.string().min(10),
  rating: z.number().min(1).max(5).default(5),
  source: z.string().default('Google'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)
    const t = await db.testimonial.create({ data: { ...data, approved: false } })
    return NextResponse.json({ success: true, id: t.id })
  } catch (err: any) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }
}

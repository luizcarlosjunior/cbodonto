// src/app/api/testimonials/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(8),
  cpf: z.string().optional().or(z.literal('')),
  birthDate: z.string().optional().or(z.literal('')),
  rating: z.number().min(1).max(5).default(5),
  text: z.string().min(10),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = schema.parse(body)

    const { name, email, phone, cpf, birthDate, rating, text } = data

    // ── Upsert patient ────────────────────────────────────────────────────────
    // Look up by CPF if provided, otherwise just create
    let patient = cpf
      ? await db.patient.findFirst({ where: { cpf } })
      : null

    if (!patient) {
      try {
        patient = await db.patient.create({
          data: {
            name,
            phone,
            email: email || null,
            cpf: cpf || null,
            birthDate: birthDate ? new Date(birthDate) : null,
          },
        })
      } catch {
        // If unique constraint fails (email/CPF duplicate), find the existing record
        patient = await db.patient.findFirst({
          where: {
            OR: [
              ...(cpf ? [{ cpf }] : []),
              ...(email ? [{ email }] : []),
            ],
          },
        })
      }
    } else {
      // Update existing patient with any new info
      await db.patient.update({
        where: { id: patient.id },
        data: {
          name,
          phone,
          email: email || patient.email,
          birthDate: birthDate ? new Date(birthDate) : patient.birthDate,
        },
      })
    }

    // ── Create testimonial ────────────────────────────────────────────────────
    await db.testimonial.create({
      data: {
        patientName: name,
        text,
        rating,
        source: 'Site',
        approved: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Dados inválidos' }, { status: 400 })
  }
}

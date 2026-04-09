// src/app/api/admin/patients/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCachedPatients, queryPatients, TAGS } from '@/lib/cache'
import { z } from 'zod'

const nullableStr = z.string().optional().nullable().transform((v) => v || null)

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal('')).nullable(),
  cpf: nullableStr,
  birthDate: nullableStr,
  photoUrl: nullableStr,
  cep: nullableStr,
  logradouro: nullableStr,
  numero: nullableStr,
  complemento: nullableStr,
  bairro: nullableStr,
  cidade: nullableStr,
  estado: nullableStr,
  notes: nullableStr,
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const params = {
    search: searchParams.get('search') || undefined,
    page: Number(searchParams.get('page') || '1'),
  }

  const limit = 20
  // Bypass cache when searching so results are always fresh
  const [patients, total] = await (params.search ? queryPatients(params) : getCachedPatients(params))

  return NextResponse.json({ patients, total, page: params.page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const patient = await db.patient.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        cpf: data.cpf || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        photoUrl: data.photoUrl,
        cep: data.cep,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        notes: data.notes,
      },
    })
    revalidateTag(TAGS.patients)
    revalidateTag(TAGS.stats)
    return NextResponse.json(patient, { status: 201 })
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ error: 'E-mail ou CPF já cadastrado' }, { status: 409 })
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

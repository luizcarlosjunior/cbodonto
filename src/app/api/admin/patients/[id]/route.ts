// src/app/api/admin/patients/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCachedPatient, TAGS } from '@/lib/cache'

type Params = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const patient = await getCachedPatient(params.id)
  if (!patient) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(patient)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const { email, cpf, birthDate, photoUrl, cep, logradouro, numero, complemento, bairro, cidade, estado, notes, name, phone } = body
    const patient = await db.patient.update({
      where: { id: params.id },
      data: {
        name,
        phone,
        email: email || null,
        cpf: cpf || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        photoUrl: photoUrl ?? null,
        cep: cep || null,
        logradouro: logradouro || null,
        numero: numero || null,
        complemento: complemento || null,
        bairro: bairro || null,
        cidade: cidade || null,
        estado: estado || null,
        notes: notes || null,
      },
    })
    revalidateTag(TAGS.patients)
    return NextResponse.json(patient)
  } catch (err: any) {
    if (err.code === 'P2002') return NextResponse.json({ error: 'E-mail ou CPF já cadastrado' }, { status: 409 })
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  await db.patient.delete({ where: { id: params.id } })
  revalidateTag(TAGS.patients)
  revalidateTag(TAGS.stats)
  return NextResponse.json({ success: true })
}

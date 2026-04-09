// src/app/api/admin/dentists/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCachedAdminDentists, TAGS } from '@/lib/cache'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  title: z.string().min(2),
  specialty: z.string().optional(),
  cro: z.string().min(2),
  bio: z.string().optional(),
  photoUrl: z.string().optional(),
  active: z.boolean().default(true),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const dentists = await getCachedAdminDentists()
  return NextResponse.json(dentists)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)
    const dentist = await db.dentist.create({ data })
    revalidateTag(TAGS.dentists)
    return NextResponse.json(dentist, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

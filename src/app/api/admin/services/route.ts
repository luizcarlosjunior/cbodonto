// src/app/api/admin/services/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCachedAdminServices, TAGS } from '@/lib/cache'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(2),
  shortDesc: z.string().min(2),
  longDesc: z.string().min(2),
  imageUrl: z.string().nullable().optional(),
  active: z.boolean().default(true),
  position: z.number().int().default(0),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))

  const [services, total] = await getCachedAdminServices({ page })

  const perPage = 10
  return NextResponse.json({
    services,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    // auto-assign next position if not provided
    if (!body.position) {
      const last = await db.service.findFirst({ orderBy: { position: 'desc' } })
      data.position = (last?.position ?? -1) + 1
    }

    const service = await db.service.create({ data })
    revalidateTag(TAGS.services)
    return NextResponse.json(service, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

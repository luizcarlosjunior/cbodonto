// src/app/api/admin/pages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCachedAdminPages, TAGS } from '@/lib/cache'
import { z } from 'zod'

const schema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
  seoTags: z.string().optional(),
  content: z.string().optional(),
  active: z.boolean().default(true),
})

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const page   = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const search = searchParams.get('search') ?? ''

  const [items, total] = await getCachedAdminPages({ page, search: search || undefined })

  const perPage = 10
  return NextResponse.json({
    pages: items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)
    const page = await db.page.create({ data })
    revalidateTag(TAGS.pages)
    return NextResponse.json(page, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

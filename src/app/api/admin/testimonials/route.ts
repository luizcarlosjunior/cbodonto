// src/app/api/admin/testimonials/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCachedAdminTestimonials, TAGS } from '@/lib/cache'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const page   = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const filter = searchParams.get('filter') ?? 'all'
  const search = searchParams.get('search') ?? ''

  const [testimonials, total, pendingCount, rejectedCount] =
    await getCachedAdminTestimonials({ page, filter, search: search || undefined })

  const perPage = 10
  return NextResponse.json({
    testimonials,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
    pendingCount,
    rejectedCount,
  })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const t = await db.testimonial.create({ data: body })
  revalidateTag(TAGS.testimonials)
  return NextResponse.json(t, { status: 201 })
}

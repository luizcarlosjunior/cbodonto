// src/app/api/admin/testimonials/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCachedAdminTestimonials, TAGS } from '@/lib/cache'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const testimonials = await getCachedAdminTestimonials()
  return NextResponse.json(testimonials)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const t = await db.testimonial.create({ data: body })
  revalidateTag(TAGS.testimonials)
  return NextResponse.json(t, { status: 201 })
}

// src/app/api/admin/testimonials/[id]/route.ts is separate file

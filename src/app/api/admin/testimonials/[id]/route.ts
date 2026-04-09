// src/app/api/admin/testimonials/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { TAGS } from '@/lib/cache'
import { deleteS3Object, s3KeyFromUrl } from '@/lib/s3'

type Params = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const t = await db.testimonial.update({ where: { id: params.id }, data: body })
  revalidateTag(TAGS.testimonials)
  return NextResponse.json(t)
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const t = await db.testimonial.findUnique({ where: { id: params.id }, select: { photoUrl: true } })
  await db.testimonial.delete({ where: { id: params.id } })

  if (t?.photoUrl) {
    const key = s3KeyFromUrl(t.photoUrl)
    if (key) await deleteS3Object(key).catch(() => {})
  }

  revalidateTag(TAGS.testimonials)
  return NextResponse.json({ success: true })
}

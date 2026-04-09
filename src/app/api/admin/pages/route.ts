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

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const pages = await getCachedAdminPages()
  return NextResponse.json(pages)
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

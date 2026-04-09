// src/app/api/admin/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getCachedSiteSettings, TAGS } from '@/lib/cache'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const settings = await getCachedSiteSettings()
  return NextResponse.json(settings)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const existing = await db.siteSettings.findFirst()

    const settings = existing
      ? await db.siteSettings.update({ where: { id: existing.id }, data: body })
      : await db.siteSettings.create({ data: body })

    revalidateTag(TAGS.settings)
    return NextResponse.json(settings)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

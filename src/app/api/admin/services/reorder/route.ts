// src/app/api/admin/services/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { TAGS } from '@/lib/cache'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const items: { id: string; position: number }[] = await req.json()
    await Promise.all(
      items.map(({ id, position }) =>
        db.service.update({ where: { id }, data: { position } })
      )
    )
    revalidateTag(TAGS.services)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

// src/app/api/admin/services/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { TAGS } from '@/lib/cache'

type Params = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const service = await db.service.update({
      where: { id: params.id },
      data: body,
    })
    revalidateTag(TAGS.services)
    return NextResponse.json(service)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  await db.service.delete({ where: { id: params.id } })
  revalidateTag(TAGS.services)
  return NextResponse.json({ success: true })
}

// PATCH bulk positions: body = [{ id, position }]
export async function PUT(req: NextRequest) {
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

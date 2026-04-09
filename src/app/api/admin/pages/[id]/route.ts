// src/app/api/admin/pages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { TAGS } from '@/lib/cache'

type Params = { params: { id: string } }

export async function GET(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const page = await db.page.findUnique({ where: { id: params.id } })
  if (!page) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(page)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const page = await db.page.update({ where: { id: params.id }, data: body })
    revalidateTag(TAGS.pages)
    return NextResponse.json(page)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  await db.page.delete({ where: { id: params.id } })
  revalidateTag(TAGS.pages)
  return NextResponse.json({ success: true })
}

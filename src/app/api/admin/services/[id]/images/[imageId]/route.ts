// src/app/api/admin/services/[id]/images/[imageId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { TAGS } from '@/lib/cache'

type Params = { params: { id: string; imageId: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const image = await db.serviceImage.update({
      where: { id: params.imageId },
      data: body,
    })
    revalidateTag(TAGS.services)
    return NextResponse.json(image)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  await db.serviceImage.delete({ where: { id: params.imageId } })
  revalidateTag(TAGS.services)
  return NextResponse.json({ success: true })
}

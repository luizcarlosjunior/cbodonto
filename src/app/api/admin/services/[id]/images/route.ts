// src/app/api/admin/services/[id]/images/route.ts
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

  const images = await db.serviceImage.findMany({
    where: { serviceId: params.id },
    orderBy: { position: 'asc' },
  })
  return NextResponse.json(images)
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const { imageUrl } = await req.json()
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl obrigatório' }, { status: 400 })

    const last = await db.serviceImage.findFirst({
      where: { serviceId: params.id },
      orderBy: { position: 'desc' },
    })
    const image = await db.serviceImage.create({
      data: { serviceId: params.id, imageUrl, position: (last?.position ?? -1) + 1 },
    })
    revalidateTag(TAGS.services)
    return NextResponse.json(image, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

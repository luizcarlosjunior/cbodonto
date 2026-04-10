// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

type Params = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if ((session.user as any).role !== 'SUPER_ADMIN')
    return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 })

  try {
    const body = await req.json()

    // Change password only
    if (body.password !== undefined) {
      if (body.password.length < 6)
        return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 })
      const hashed = await bcrypt.hash(body.password, 10)
      await db.user.update({ where: { id: params.id }, data: { password: hashed } })
      return NextResponse.json({ success: true })
    }

    // Update profile fields (name, email, role)
    const { name, email, role } = body
    if (email) {
      const conflict = await db.user.findFirst({ where: { email, NOT: { id: params.id } } })
      if (conflict) return NextResponse.json({ error: 'E-mail já em uso' }, { status: 400 })
    }
    const updated = await db.user.update({
      where: { id: params.id },
      data: { ...(name && { name }), ...(email && { email }), ...(role && { role }) },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    return NextResponse.json(updated)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if ((session.user as any).role !== 'SUPER_ADMIN')
    return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 })

  const currentUserId = (session.user as any).id
  if (params.id === currentUserId)
    return NextResponse.json({ error: 'Você não pode excluir sua própria conta' }, { status: 400 })

  // Prevent deleting last SUPER_ADMIN
  const target = await db.user.findUnique({ where: { id: params.id } })
  if (target?.role === 'SUPER_ADMIN') {
    const count = await db.user.count({ where: { role: 'SUPER_ADMIN' } })
    if (count <= 1)
      return NextResponse.json({ error: 'Não é possível excluir o único Super Admin' }, { status: 400 })
  }

  await db.user.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}

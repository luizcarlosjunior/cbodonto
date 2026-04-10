// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(_: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if ((session.user as any).role !== 'SUPER_ADMIN')
    return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 })

  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json({ users })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  if ((session.user as any).role !== 'SUPER_ADMIN')
    return NextResponse.json({ error: 'Acesso restrito' }, { status: 403 })

  try {
    const { name, email, password, role } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios' }, { status: 400 })
    }

    const exists = await db.user.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 })

    const hashed = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: { name, email, password: hashed, role: role ?? 'ADMIN' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    return NextResponse.json(user, { status: 201 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}

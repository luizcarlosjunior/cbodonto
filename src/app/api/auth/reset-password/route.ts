// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres' }, { status: 400 })

    const record = await db.passwordResetToken.findUnique({ where: { token } })

    if (!record || record.used) {
      return NextResponse.json({ error: 'Link inválido ou já utilizado' }, { status: 400 })
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Link expirado. Solicite um novo.' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)

    await db.$transaction([
      db.user.update({ where: { id: record.userId }, data: { password: hashed } }),
      db.passwordResetToken.update({ where: { token }, data: { used: true } }),
    ])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('reset-password error:', err)
    return NextResponse.json({ error: 'Erro ao redefinir senha' }, { status: 500 })
  }
}

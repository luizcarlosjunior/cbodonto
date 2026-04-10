// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 })

    const user = await db.user.findUnique({ where: { email } })

    // Always return success to avoid user enumeration
    if (!user) return NextResponse.json({ success: true })

    // Invalidate any existing unused tokens for this user
    await db.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    })

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await db.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    })

    const siteUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const resetUrl = `${siteUrl}/admin/nova-senha?token=${token}`

    await sendPasswordResetEmail(user.email, user.name, resetUrl)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('forgot-password error:', err)
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 })
  }
}

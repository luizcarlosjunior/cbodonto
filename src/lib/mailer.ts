// src/lib/mailer.ts
import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT ?? 587),
  secure: process.env.MAIL_ENCRYPTION === 'ssl',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
})

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  await transporter.sendMail({
    from: `"CB Odonto" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'Redefinição de senha — CB Odonto Admin',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fafaf9;border:1px solid #e7e5e4;">
        <h2 style="font-size:20px;color:#1c1917;margin-bottom:8px;">Redefinição de senha</h2>
        <p style="color:#57534e;font-size:14px;line-height:1.6;">Olá, <strong>${name}</strong>.</p>
        <p style="color:#57534e;font-size:14px;line-height:1.6;">
          Recebemos uma solicitação para redefinir a senha da sua conta de administrador.
          Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${resetUrl}"
            style="background:#7f1d1d;color:#fff;text-decoration:none;padding:12px 28px;font-size:14px;font-weight:600;display:inline-block;">
            Criar nova senha
          </a>
        </div>
        <p style="color:#a8a29e;font-size:12px;line-height:1.6;">
          Se você não solicitou a redefinição, ignore este e-mail. Sua senha permanece inalterada.<br/>
          Este link expira em 1 hora.
        </p>
        <hr style="border:none;border-top:1px solid #e7e5e4;margin:24px 0;"/>
        <p style="color:#a8a29e;font-size:11px;text-align:center;">CB Odonto · Área Administrativa</p>
      </div>
    `,
  })
}

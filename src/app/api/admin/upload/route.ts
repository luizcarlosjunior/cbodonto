import { authOptions } from '@/lib/auth'
import { s3, s3PublicUrl } from '@/lib/s3'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_TYPES: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_FOLDERS = ['testimonials', 'dentists', 'patients', 'services']

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const folder = req.nextUrl.searchParams.get('folder') ?? 'testimonials'
  if (!ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: 'Pasta inválida' }, { status: 400 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })

  const ext = ALLOWED_TYPES[file.type]
  if (!ext) return NextResponse.json({ error: 'Tipo não permitido. Use WebP, JPG ou PNG.' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5 MB.' }, { status: 400 })

  const key = `${process.env.AWS_S3_FOLDER}/${folder}/${randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )

  return NextResponse.json({ publicUrl: s3PublicUrl(key) })
}

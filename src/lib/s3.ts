import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'

const REGION = process.env.AWS_S3_REGION!
const BUCKET = process.env.AWS_S3_BUCKET!
const FOLDER = process.env.AWS_S3_FOLDER!

export const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export function s3PublicUrl(key: string) {
  return `https://s3.${REGION}.amazonaws.com/${BUCKET}/${key}`
}

export function s3KeyFromUrl(url: string): string | null {
  try {
    const u = new URL(url)
    return u.pathname.slice(1) // remove leading /
  } catch {
    return null
  }
}

export async function deleteS3Object(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

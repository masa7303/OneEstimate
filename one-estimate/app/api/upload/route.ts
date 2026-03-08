import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireDbUser } from '@/lib/auth/db'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  try {
    await requireDbUser()

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'JPEG, PNG, WebP のみアップロード可能です' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'ファイルサイズは5MB以下にしてください' }, { status: 400 })
    }

    const blob = await put(file.name, file, {
      access: 'public',
    })

    return NextResponse.json({ url: blob.url })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'アップロードに失敗しました' }, { status: 500 })
  }
}

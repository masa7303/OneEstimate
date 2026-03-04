import { NextResponse } from 'next/server'
import { getDbUser } from '@/lib/auth/db'

/**
 * GET /api/auth/me
 * 現在ログイン中のユーザーのDB情報を返す。
 * - DB未登録の場合は 404（オンボーディングが必要）
 * - 未認証の場合は 401
 */
export async function GET() {
  try {
    const user = await getDbUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}

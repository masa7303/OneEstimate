import { NextRequest, NextResponse } from 'next/server'
import { getServerUser } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/auth/setup
 * サインアップ後に Company + User を作成する。
 * - 既にUserレコードがある場合は何もしない（冪等）
 * - companyName が必須
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getServerUser()
    if (!authUser) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // 既にDB登録済みならスキップ
    const existing = await prisma.user.findUnique({
      where: { authUserId: authUser.id },
    })
    if (existing) {
      return NextResponse.json({ success: true, userId: existing.id, companyId: existing.companyId })
    }

    const body = await req.json()
    const companyName = body.companyName?.trim()
    if (!companyName) {
      return NextResponse.json({ error: '工務店名を入力してください' }, { status: 400 })
    }

    // Company + User をトランザクションで作成
    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name: companyName },
      })

      // CompanyInfo も空レコードで作成
      await tx.companyInfo.create({
        data: { companyId: company.id },
      })

      const user = await tx.user.create({
        data: {
          authUserId: authUser.id,
          email: authUser.email || '',
          name: authUser.displayName || null,
          role: 'ADMIN', // 最初のユーザーは管理者
          companyId: company.id,
        },
      })

      return { userId: user.id, companyId: company.id }
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('Auth setup error:', error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}

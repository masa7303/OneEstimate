import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// GET /api/admin/options — カテゴリ一覧（アイテム数付き）
export async function GET() {
  try {
    const user = await requireDbUser()
    const categories = await prisma.optionCategory.findMany({
      where: { companyId: user.companyId },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { items: true } } },
    })
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json([], { status: 401 })
  }
}

// POST /api/admin/options — カテゴリ新規作成
export async function POST(req: NextRequest) {
  try {
    const user = await requireDbUser()
    const { name } = await req.json()
    if (!name) {
      return NextResponse.json({ error: 'カテゴリ名は必須です' }, { status: 400 })
    }

    const maxSort = await prisma.optionCategory.aggregate({
      where: { companyId: user.companyId },
      _max: { sortOrder: true },
    })

    const category = await prisma.optionCategory.create({
      data: {
        companyId: user.companyId,
        name,
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

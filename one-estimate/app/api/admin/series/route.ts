import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// GET /api/admin/series — 一覧取得
export async function GET() {
  try {
    const user = await requireDbUser()
    const series = await prisma.series.findMany({
      where: { companyId: user.companyId },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json(series)
  } catch {
    return NextResponse.json([], { status: 401 })
  }
}

// POST /api/admin/series — 新規作成
export async function POST(req: NextRequest) {
  try {
    const user = await requireDbUser()
    const body = await req.json()

    const { name, description, baseCost, marginRate } = body
    if (!name || baseCost == null || marginRate == null) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    const rate = parseFloat(marginRate)
    const cost = parseInt(baseCost, 10)
    if (rate < 0 || rate >= 1) {
      return NextResponse.json({ error: '粗利益率は0〜1未満で入力してください' }, { status: 400 })
    }

    const basePrice = Math.round(cost / (1 - rate))

    const maxSort = await prisma.series.aggregate({
      where: { companyId: user.companyId },
      _max: { sortOrder: true },
    })

    const series = await prisma.series.create({
      data: {
        companyId: user.companyId,
        name,
        description: description || null,
        baseCost: cost,
        marginRate: rate,
        basePrice,
        imageUrl: body.imageUrl ?? null,
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      },
    })

    return NextResponse.json(series, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

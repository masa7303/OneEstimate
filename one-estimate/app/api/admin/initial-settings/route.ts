import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// GET — 初期設定一覧（セクション別）
export async function GET() {
  try {
    const user = await requireDbUser()
    const settings = await prisma.initialSetting.findMany({
      where: { companyId: user.companyId },
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
    })
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json([], { status: 401 })
  }
}

// POST — 設定項目追加
export async function POST(req: NextRequest) {
  try {
    const user = await requireDbUser()
    const { section, itemName, defaultAmount, isVisible } = await req.json()
    if (!section || !itemName) {
      return NextResponse.json({ error: 'セクションと項目名は必須です' }, { status: 400 })
    }

    const maxSort = await prisma.initialSetting.aggregate({
      where: { companyId: user.companyId, section },
      _max: { sortOrder: true },
    })

    const setting = await prisma.initialSetting.create({
      data: {
        companyId: user.companyId,
        section,
        itemName,
        defaultAmount: parseInt(defaultAmount, 10) || 0,
        isVisible: isVisible !== false,
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      },
    })

    return NextResponse.json(setting, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: '同じセクションに同名の項目が既にあります' }, { status: 400 })
    }
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

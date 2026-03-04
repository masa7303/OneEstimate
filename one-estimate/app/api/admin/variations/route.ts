import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// GET /api/admin/variations — タイプ一覧
export async function GET() {
  try {
    const user = await requireDbUser()
    const types = await prisma.variationType.findMany({
      where: { companyId: user.companyId },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { items: true } } },
    })
    return NextResponse.json(types)
  } catch {
    return NextResponse.json([], { status: 401 })
  }
}

// POST /api/admin/variations — タイプ新規作成
export async function POST(req: NextRequest) {
  try {
    const user = await requireDbUser()
    const { name, slug } = await req.json()
    if (!name || !slug) {
      return NextResponse.json({ error: '名前とスラッグは必須です' }, { status: 400 })
    }

    const maxSort = await prisma.variationType.aggregate({
      where: { companyId: user.companyId },
      _max: { sortOrder: true },
    })

    const type = await prisma.variationType.create({
      data: {
        companyId: user.companyId,
        name,
        slug,
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      },
    })

    return NextResponse.json(type, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'このスラッグは既に使われています' }, { status: 400 })
    }
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

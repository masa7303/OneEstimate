import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// GET /api/admin/variations/[id]/items — アイテム一覧
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireDbUser()
    const { id } = await params

    const type = await prisma.variationType.findFirst({
      where: { id, companyId: user.companyId },
    })
    if (!type) return NextResponse.json({ type: null, items: [] }, { status: 404 })

    const items = await prisma.variationItem.findMany({
      where: { variationTypeId: id },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ type, items })
  } catch {
    return NextResponse.json({ type: null, items: [] }, { status: 401 })
  }
}

// POST /api/admin/variations/[id]/items — アイテム追加
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireDbUser()
    const { id } = await params
    const body = await req.json()

    const type = await prisma.variationType.findFirst({
      where: { id, companyId: user.companyId },
    })
    if (!type) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    const { name, description, cost, price } = body
    if (!name) return NextResponse.json({ error: 'アイテム名は必須です' }, { status: 400 })

    const maxSort = await prisma.variationItem.aggregate({
      where: { variationTypeId: id },
      _max: { sortOrder: true },
    })

    const item = await prisma.variationItem.create({
      data: {
        variationTypeId: id,
        name,
        description: description || null,
        cost: parseInt(cost, 10) || 0,
        price: parseInt(price, 10) || 0,
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      },
    })

    return NextResponse.json(item, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// PUT /api/admin/variations/items/[itemId] — アイテム更新
export async function PUT(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const user = await requireDbUser()
    const { itemId } = await params
    const body = await req.json()

    const item = await prisma.variationItem.findUnique({
      where: { id: itemId },
      include: { variationType: true },
    })
    if (!item || item.variationType.companyId !== user.companyId) {
      return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    }

    const { name, description, cost, price } = body
    const updated = await prisma.variationItem.update({
      where: { id: itemId },
      data: {
        name: name ?? item.name,
        description: description ?? item.description,
        cost: cost != null ? parseInt(cost, 10) : item.cost,
        price: price != null ? parseInt(price, 10) : item.price,
      },
    })

    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

// DELETE /api/admin/variations/items/[itemId] — アイテム削除
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const user = await requireDbUser()
    const { itemId } = await params

    const item = await prisma.variationItem.findUnique({
      where: { id: itemId },
      include: { variationType: true },
    })
    if (!item || item.variationType.companyId !== user.companyId) {
      return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    }

    await prisma.variationItem.delete({ where: { id: itemId } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

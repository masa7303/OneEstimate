import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// PUT /api/admin/options/items/[itemId] — アイテム更新
export async function PUT(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const user = await requireDbUser()
    const { itemId } = await params
    const body = await req.json()

    const item = await prisma.optionItem.findUnique({
      where: { id: itemId },
      include: { category: true },
    })
    if (!item || item.category.companyId !== user.companyId) {
      return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    }

    const { name, description, cost, price } = body
    const updated = await prisma.optionItem.update({
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

// DELETE /api/admin/options/items/[itemId] — アイテム削除
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  try {
    const user = await requireDbUser()
    const { itemId } = await params

    const item = await prisma.optionItem.findUnique({
      where: { id: itemId },
      include: { category: true },
    })
    if (!item || item.category.companyId !== user.companyId) {
      return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    }

    await prisma.optionItem.delete({ where: { id: itemId } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

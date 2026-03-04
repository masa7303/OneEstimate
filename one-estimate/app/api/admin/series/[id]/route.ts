import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// PUT /api/admin/series/[id] — 更新
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireDbUser()
    const { id } = await params
    const body = await req.json()

    const existing = await prisma.series.findFirst({
      where: { id, companyId: user.companyId },
    })
    if (!existing) {
      return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    }

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

    const updated = await prisma.series.update({
      where: { id },
      data: {
        name,
        description: description || null,
        baseCost: cost,
        marginRate: rate,
        basePrice,
      },
    })

    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

// DELETE /api/admin/series/[id] — 削除
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireDbUser()
    const { id } = await params

    const existing = await prisma.series.findFirst({
      where: { id, companyId: user.companyId },
    })
    if (!existing) {
      return NextResponse.json({ error: '見つかりません' }, { status: 404 })
    }

    await prisma.series.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

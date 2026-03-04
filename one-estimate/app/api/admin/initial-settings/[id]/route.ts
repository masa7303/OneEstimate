import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// PUT — 設定項目更新
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireDbUser()
    const { id } = await params
    const body = await req.json()

    const existing = await prisma.initialSetting.findFirst({
      where: { id, companyId: user.companyId },
    })
    if (!existing) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    const updated = await prisma.initialSetting.update({
      where: { id },
      data: {
        itemName: body.itemName ?? existing.itemName,
        defaultAmount: body.defaultAmount != null ? parseInt(body.defaultAmount, 10) : existing.defaultAmount,
        isVisible: body.isVisible !== undefined ? body.isVisible : existing.isVisible,
      },
    })

    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

// DELETE — 設定項目削除
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireDbUser()
    const { id } = await params

    const existing = await prisma.initialSetting.findFirst({
      where: { id, companyId: user.companyId },
    })
    if (!existing) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    await prisma.initialSetting.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

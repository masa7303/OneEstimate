import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// PUT /api/admin/options/[id] — カテゴリ名更新
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireDbUser()
    const { id } = await params
    const { name } = await req.json()

    const existing = await prisma.optionCategory.findFirst({
      where: { id, companyId: user.companyId },
    })
    if (!existing) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    const updated = await prisma.optionCategory.update({
      where: { id },
      data: { name },
    })
    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

// DELETE /api/admin/options/[id] — カテゴリ削除（アイテムも連鎖削除）
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireDbUser()
    const { id } = await params

    const existing = await prisma.optionCategory.findFirst({
      where: { id, companyId: user.companyId },
    })
    if (!existing) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    await prisma.optionCategory.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

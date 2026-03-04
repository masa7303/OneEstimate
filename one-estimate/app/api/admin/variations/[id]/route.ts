import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// PUT /api/admin/variations/[id] — タイプ更新
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireDbUser()
    const { id } = await params
    const { name, slug } = await req.json()

    const existing = await prisma.variationType.findFirst({
      where: { id, companyId: user.companyId },
    })
    if (!existing) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    const updated = await prisma.variationType.update({
      where: { id },
      data: { name: name ?? existing.name, slug: slug ?? existing.slug },
    })
    return NextResponse.json(updated)
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'このスラッグは既に使われています' }, { status: 400 })
    }
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

// DELETE /api/admin/variations/[id] — タイプ削除
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireDbUser()
    const { id } = await params

    const existing = await prisma.variationType.findFirst({
      where: { id, companyId: user.companyId },
    })
    if (!existing) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    await prisma.variationType.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

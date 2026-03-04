import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// PUT — 質問更新（選択肢も全置換）
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireDbUser()
    const { id } = await params
    const body = await req.json()

    const existing = await prisma.question.findFirst({
      where: { id, companyId: user.companyId },
    })
    if (!existing) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    const { title, advice, inputType, choices } = body

    // トランザクションで選択肢を全置換
    const updated = await prisma.$transaction(async (tx) => {
      await tx.questionChoice.deleteMany({ where: { questionId: id } })
      return tx.question.update({
        where: { id },
        data: {
          title: title ?? existing.title,
          advice: advice ?? existing.advice,
          inputType: inputType ?? existing.inputType,
          choices: {
            create: (choices || []).map((c: any, i: number) => ({
              label: c.label,
              value: c.value || c.label,
              sortOrder: i,
            })),
          },
        },
        include: { choices: { orderBy: { sortOrder: 'asc' } } },
      })
    })

    return NextResponse.json(updated)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

// DELETE — 質問削除
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireDbUser()
    const { id } = await params

    const existing = await prisma.question.findFirst({
      where: { id, companyId: user.companyId },
    })
    if (!existing) return NextResponse.json({ error: '見つかりません' }, { status: 404 })

    await prisma.question.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

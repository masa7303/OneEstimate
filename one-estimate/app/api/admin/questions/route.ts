import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// GET — 質問一覧（選択肢数付き）
export async function GET() {
  try {
    const user = await requireDbUser()
    const questions = await prisma.question.findMany({
      where: { companyId: user.companyId },
      orderBy: { sortOrder: 'asc' },
      include: { choices: { orderBy: { sortOrder: 'asc' } } },
    })
    return NextResponse.json(questions)
  } catch {
    return NextResponse.json([], { status: 401 })
  }
}

// POST — 質問作成
export async function POST(req: NextRequest) {
  try {
    const user = await requireDbUser()
    const { title, advice, inputType, choices } = await req.json()
    if (!title) return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 })

    const maxSort = await prisma.question.aggregate({
      where: { companyId: user.companyId },
      _max: { sortOrder: true },
    })

    const question = await prisma.question.create({
      data: {
        companyId: user.companyId,
        title,
        advice: advice || null,
        inputType: inputType || 'CHOICE',
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
        choices: {
          create: (choices || []).map((c: any, i: number) => ({
            label: c.label,
            value: c.value || c.label,
            sortOrder: i,
          })),
        },
      },
      include: { choices: true },
    })

    return NextResponse.json(question, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

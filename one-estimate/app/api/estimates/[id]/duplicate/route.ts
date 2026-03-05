import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// POST /api/estimates/[id]/duplicate — 見積複製
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireDbUser()

    const original = await prisma.estimate.findFirst({
      where: { id: params.id, companyId: user.companyId },
      include: {
        variations: true,
        options: true,
        sectionBItems: { orderBy: { sortOrder: 'asc' } },
        sectionCItems: { orderBy: { sortOrder: 'asc' } },
        sectionDItems: { orderBy: { sortOrder: 'asc' } },
        answers: true,
      },
    })

    if (!original) {
      return NextResponse.json({ error: '見積が見つかりません' }, { status: 404 })
    }

    // 新しい見積番号を採番
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
    const prefix = `EST-${dateStr}-`

    const lastEstimate = await prisma.estimate.findFirst({
      where: { companyId: user.companyId, estimateNumber: { startsWith: prefix } },
      orderBy: { estimateNumber: 'desc' },
    })

    let seq = 1
    if (lastEstimate) {
      const lastSeq = parseInt(lastEstimate.estimateNumber.slice(prefix.length), 10)
      if (!isNaN(lastSeq)) seq = lastSeq + 1
    }
    const estimateNumber = `${prefix}${String(seq).padStart(3, '0')}`

    const newEstimate = await prisma.estimate.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        estimateNumber,
        seriesId: original.seriesId,
        customerId: original.customerId,
        tsubo: original.tsubo,
        sectionA: original.sectionA,
        sectionATax: original.sectionATax,
        sectionB: original.sectionB,
        sectionBTax: original.sectionBTax,
        sectionCVariation: original.sectionCVariation,
        sectionCOption: original.sectionCOption,
        sectionCOther: original.sectionCOther,
        sectionC: original.sectionC,
        sectionCTax: original.sectionCTax,
        sectionD: original.sectionD,
        sectionDTax: original.sectionDTax,
        totalAmount: original.totalAmount,
        status: 'DRAFT',
        isEstimateIssued: false,
        isFundingIssued: false,
        variations: {
          create: original.variations.map(v => ({
            itemType: v.itemType,
            itemName: v.itemName,
            cost: v.cost,
            price: v.price,
          })),
        },
        options: {
          create: original.options.map(o => ({
            categoryId: o.categoryId,
            itemId: o.itemId,
            cost: o.cost,
            price: o.price,
          })),
        },
        sectionBItems: {
          create: original.sectionBItems.map((item, i) => ({
            itemName: item.itemName,
            amount: item.amount,
            sortOrder: i,
          })),
        },
        sectionCItems: {
          create: original.sectionCItems.map((item, i) => ({
            itemName: item.itemName,
            amount: item.amount,
            sortOrder: i,
          })),
        },
        sectionDItems: {
          create: original.sectionDItems.map((item, i) => ({
            itemName: item.itemName,
            amount: item.amount,
            sortOrder: i,
          })),
        },
        answers: {
          create: original.answers.map(a => ({
            questionId: a.questionId,
            choiceValue: a.choiceValue,
          })),
        },
      },
    })

    return NextResponse.json(newEstimate, { status: 201 })
  } catch {
    return NextResponse.json({ error: '複製に失敗しました' }, { status: 500 })
  }
}

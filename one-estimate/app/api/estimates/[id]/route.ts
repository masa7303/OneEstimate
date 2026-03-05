import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// GET /api/estimates/[id] — 見積詳細取得
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireDbUser()

    const estimate = await prisma.estimate.findFirst({
      where: { id: params.id, companyId: user.companyId },
      include: {
        series: { select: { name: true, basePrice: true } },
        customer: { select: { id: true, name: true } },
        user: { select: { name: true, email: true } },
        variations: { orderBy: { id: 'asc' } },
        options: {
          include: {
            category: { select: { name: true } },
            item: { select: { name: true } },
          },
        },
        sectionBItems: { orderBy: { sortOrder: 'asc' } },
        sectionCItems: { orderBy: { sortOrder: 'asc' } },
        sectionDItems: { orderBy: { sortOrder: 'asc' } },
        answers: true,
        aiResult: true,
        fundingPlan: true,
      },
    })

    if (!estimate) {
      return NextResponse.json({ error: '見積が見つかりません' }, { status: 404 })
    }

    // CompanyInfo を別途取得
    const companyInfo = await prisma.companyInfo.findUnique({
      where: { companyId: user.companyId },
      select: { name: true, address: true, tel: true, fax: true, notes: true },
    })

    return NextResponse.json({ ...estimate, companyInfo })
  } catch {
    return NextResponse.json({ error: '認証エラー' }, { status: 401 })
  }
}

// PATCH /api/estimates/[id] — 見積更新（発行 / ステータス変更 / 全セクション再編集）
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireDbUser()
    const body = await req.json()

    const existing = await prisma.estimate.findFirst({
      where: { id: params.id, companyId: user.companyId },
    })
    if (!existing) {
      return NextResponse.json({ error: '見積が見つかりません' }, { status: 404 })
    }

    // ステータス変更のみ
    if (body.status && !body.seriesId) {
      const updated = await prisma.estimate.update({
        where: { id: params.id },
        data: { status: body.status },
      })
      return NextResponse.json(updated)
    }

    // 発行のみ（従来互換）
    if (body.isEstimateIssued && !body.seriesId) {
      const updated = await prisma.estimate.update({
        where: { id: params.id },
        data: {
          customerId: body.customerId ?? existing.customerId,
          isEstimateIssued: true,
        },
      })
      return NextResponse.json(updated)
    }

    // 全セクション再編集
    if (body.seriesId) {
      const TAX_RATE = 0.1
      const sectionA = body.sectionA || 0
      const sectionATax = Math.round(sectionA * TAX_RATE)
      const sectionB = body.sectionB || 0
      const sectionBTax = Math.round(sectionB * TAX_RATE)
      const sectionCVariation = body.sectionCVariation || 0
      const sectionCOption = body.sectionCOption || 0
      const sectionCOther = body.sectionCOther || 0
      const sectionC = sectionCVariation + sectionCOption + sectionCOther
      const sectionCTax = Math.round(sectionC * TAX_RATE)
      const sectionD = body.sectionD || 0
      const sectionDTax = Math.round(sectionD * TAX_RATE)
      const totalAmount = (sectionA + sectionATax) + (sectionB + sectionBTax) + (sectionC + sectionCTax) + (sectionD + sectionDTax)

      // 既存スナップショット削除 → 再作成（トランザクション）
      await prisma.$transaction([
        prisma.estimateVariation.deleteMany({ where: { estimateId: params.id } }),
        prisma.estimateOption.deleteMany({ where: { estimateId: params.id } }),
        prisma.estimateSectionB.deleteMany({ where: { estimateId: params.id } }),
        prisma.estimateSectionC.deleteMany({ where: { estimateId: params.id } }),
        prisma.estimateSectionD.deleteMany({ where: { estimateId: params.id } }),
        prisma.estimateAnswer.deleteMany({ where: { estimateId: params.id } }),
        prisma.estimate.update({
          where: { id: params.id },
          data: {
            seriesId: body.seriesId,
            tsubo: body.tsubo,
            sectionA, sectionATax,
            sectionB, sectionBTax,
            sectionCVariation, sectionCOption, sectionCOther,
            sectionC, sectionCTax,
            sectionD, sectionDTax,
            totalAmount,
            ...(body.customerId ? { customerId: body.customerId } : {}),
          },
        }),
      ])

      // スナップショット再作成
      const estimateId = params.id
      if (body.variations?.length) {
        await prisma.estimateVariation.createMany({
          data: body.variations.map((v: any) => ({
            estimateId, itemType: v.itemType, itemName: v.itemName, cost: v.cost || 0, price: v.price || 0,
          })),
        })
      }
      if (body.options?.length) {
        await prisma.estimateOption.createMany({
          data: body.options.map((o: any) => ({
            estimateId, categoryId: o.categoryId, itemId: o.itemId, cost: o.cost || 0, price: o.price || 0,
          })),
        })
      }
      if (body.sectionBItems?.length) {
        await prisma.estimateSectionB.createMany({
          data: body.sectionBItems.map((item: any, i: number) => ({
            estimateId, itemName: item.itemName, amount: item.amount || 0, sortOrder: i,
          })),
        })
      }
      if (body.sectionCItems?.length) {
        await prisma.estimateSectionC.createMany({
          data: body.sectionCItems.map((item: any, i: number) => ({
            estimateId, itemName: item.itemName, amount: item.amount || 0, sortOrder: i,
          })),
        })
      }
      if (body.sectionDItems?.length) {
        await prisma.estimateSectionD.createMany({
          data: body.sectionDItems.map((item: any, i: number) => ({
            estimateId, itemName: item.itemName, amount: item.amount || 0, sortOrder: i,
          })),
        })
      }
      if (body.answers?.length) {
        await prisma.estimateAnswer.createMany({
          data: body.answers.map((a: any) => ({
            estimateId, questionId: a.questionId, choiceValue: a.choiceValue,
          })),
        })
      }

      const updated = await prisma.estimate.findUnique({ where: { id: params.id } })
      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: '更新内容がありません' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
  }
}

// DELETE /api/estimates/[id] — 見積削除
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireDbUser()

    const existing = await prisma.estimate.findFirst({
      where: { id: params.id, companyId: user.companyId },
    })
    if (!existing) {
      return NextResponse.json({ error: '見積が見つかりません' }, { status: 404 })
    }

    await prisma.$transaction([
      prisma.estimateVariation.deleteMany({ where: { estimateId: params.id } }),
      prisma.estimateOption.deleteMany({ where: { estimateId: params.id } }),
      prisma.estimateSectionB.deleteMany({ where: { estimateId: params.id } }),
      prisma.estimateSectionC.deleteMany({ where: { estimateId: params.id } }),
      prisma.estimateSectionD.deleteMany({ where: { estimateId: params.id } }),
      prisma.estimateAnswer.deleteMany({ where: { estimateId: params.id } }),
      prisma.estimateAiResult.deleteMany({ where: { estimateId: params.id } }),
      prisma.fundingPlan.deleteMany({ where: { estimateId: params.id } }),
      prisma.estimate.delete({ where: { id: params.id } }),
    ])

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 })
  }
}

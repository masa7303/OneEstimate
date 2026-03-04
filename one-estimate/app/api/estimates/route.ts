import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// GET /api/estimates — 見積一覧
export async function GET() {
  try {
    const user = await requireDbUser()
    const estimates = await prisma.estimate.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        series: { select: { name: true } },
        customer: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    })
    return NextResponse.json(estimates)
  } catch {
    return NextResponse.json([], { status: 401 })
  }
}

// POST /api/estimates — 見積保存
export async function POST(req: NextRequest) {
  try {
    const user = await requireDbUser()
    const body = await req.json()

    // 見積番号の採番: EST-YYYYMMDD-XXX
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

    const estimate = await prisma.estimate.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        estimateNumber,
        seriesId: body.seriesId,
        tsubo: body.tsubo,
        sectionA,
        sectionATax,
        sectionB,
        sectionBTax,
        sectionCVariation,
        sectionCOption,
        sectionCOther,
        sectionC,
        sectionCTax,
        sectionD,
        sectionDTax,
        totalAmount,
        // スナップショット: 変動費
        variations: {
          create: (body.variations || []).map((v: any) => ({
            itemType: v.itemType,
            itemName: v.itemName,
            cost: v.cost || 0,
            price: v.price || 0,
          })),
        },
        // スナップショット: オプション
        options: {
          create: (body.options || []).map((o: any) => ({
            categoryId: o.categoryId,
            itemId: o.itemId,
            cost: o.cost || 0,
            price: o.price || 0,
          })),
        },
        // スナップショット: セクションB明細
        sectionBItems: {
          create: (body.sectionBItems || []).map((item: any, i: number) => ({
            itemName: item.itemName,
            amount: item.amount || 0,
            sortOrder: i,
          })),
        },
        // スナップショット: セクションC明細
        sectionCItems: {
          create: (body.sectionCItems || []).map((item: any, i: number) => ({
            itemName: item.itemName,
            amount: item.amount || 0,
            sortOrder: i,
          })),
        },
        // スナップショット: セクションD明細
        sectionDItems: {
          create: (body.sectionDItems || []).map((item: any, i: number) => ({
            itemName: item.itemName,
            amount: item.amount || 0,
            sortOrder: i,
          })),
        },
      },
    })

    return NextResponse.json(estimate, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || '保存に失敗しました' }, { status: 500 })
  }
}

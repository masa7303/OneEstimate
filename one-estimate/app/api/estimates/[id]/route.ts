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

// PATCH /api/estimates/[id] — 見積発行（顧客紐付け + isEstimateIssued=true）
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireDbUser()
    const body = await req.json()

    // 対象見積の存在確認
    const existing = await prisma.estimate.findFirst({
      where: { id: params.id, companyId: user.companyId },
    })
    if (!existing) {
      return NextResponse.json({ error: '見積が見つかりません' }, { status: 404 })
    }

    const updated = await prisma.estimate.update({
      where: { id: params.id },
      data: {
        customerId: body.customerId ?? existing.customerId,
        isEstimateIssued: true,
      },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
  }
}

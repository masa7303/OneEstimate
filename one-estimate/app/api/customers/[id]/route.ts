import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// GET /api/customers/[id] — 顧客詳細
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireDbUser()

    const customer = await prisma.customer.findFirst({
      where: { id: params.id, companyId: user.companyId },
      include: {
        estimates: {
          include: {
            series: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: '顧客が見つかりません' }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch {
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}

// PUT /api/customers/[id] — 顧客更新
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireDbUser()
    const body = await req.json()

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: '顧客名は必須です' }, { status: 400 })
    }

    const existing = await prisma.customer.findFirst({
      where: { id: params.id, companyId: user.companyId },
    })
    if (!existing) {
      return NextResponse.json({ error: '顧客が見つかりません' }, { status: 404 })
    }

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: body.name.trim(),
        nameKana: body.nameKana?.trim() || null,
        tel: body.tel?.trim() || null,
        email: body.email?.trim() || null,
        address: body.address?.trim() || null,
        memo: body.memo?.trim() || null,
      },
    })

    return NextResponse.json(customer)
  } catch {
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
  }
}

// DELETE /api/customers/[id] — 顧客削除（紐付き見積も全削除）
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireDbUser()

    const existing = await prisma.customer.findFirst({
      where: { id: params.id, companyId: user.companyId },
    })
    if (!existing) {
      return NextResponse.json({ error: '顧客が見つかりません' }, { status: 404 })
    }

    // 紐付き見積の関連データを削除してから顧客を削除
    const estimates = await prisma.estimate.findMany({
      where: { customerId: params.id },
      select: { id: true },
    })
    const estimateIds = estimates.map((e) => e.id)

    if (estimateIds.length > 0) {
      await prisma.$transaction([
        prisma.estimateVariation.deleteMany({ where: { estimateId: { in: estimateIds } } }),
        prisma.estimateOption.deleteMany({ where: { estimateId: { in: estimateIds } } }),
        prisma.estimateSectionB.deleteMany({ where: { estimateId: { in: estimateIds } } }),
        prisma.estimateSectionC.deleteMany({ where: { estimateId: { in: estimateIds } } }),
        prisma.estimateSectionD.deleteMany({ where: { estimateId: { in: estimateIds } } }),
        prisma.estimateAnswer.deleteMany({ where: { estimateId: { in: estimateIds } } }),
        prisma.estimateAiResult.deleteMany({ where: { estimateId: { in: estimateIds } } }),
        prisma.fundingPlan.deleteMany({ where: { estimateId: { in: estimateIds } } }),
        prisma.estimate.deleteMany({ where: { id: { in: estimateIds } } }),
        prisma.customer.delete({ where: { id: params.id } }),
      ])
    } else {
      await prisma.customer.delete({ where: { id: params.id } })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// GET /api/estimates/[id]/funding — 資金計画書取得
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireDbUser()
    const estimate = await prisma.estimate.findFirst({
      where: { id: params.id, companyId: user.companyId },
      include: {
        fundingPlan: true,
        answers: true,
      },
    })
    if (!estimate) {
      return NextResponse.json({ error: '見積が見つかりません' }, { status: 404 })
    }

    // InitialSetting (E/F) + FundingPlanTemplate (G) を取得
    const [settingsEF, templates] = await Promise.all([
      prisma.initialSetting.findMany({
        where: { companyId: user.companyId, section: { in: ['E', 'F'] }, isVisible: true },
        orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
      }),
      prisma.fundingPlanTemplate.findMany({
        where: { companyId: user.companyId },
        orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
      }),
    ])

    return NextResponse.json({
      estimate,
      fundingPlan: estimate.fundingPlan,
      settingsEF,
      templates,
    })
  } catch {
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}

// POST /api/estimates/[id]/funding — 資金計画書保存/更新
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireDbUser()
    const body = await req.json()

    const estimate = await prisma.estimate.findFirst({
      where: { id: params.id, companyId: user.companyId },
    })
    if (!estimate) {
      return NextResponse.json({ error: '見積が見つかりません' }, { status: 404 })
    }

    const fundingPlan = await prisma.fundingPlan.upsert({
      where: { estimateId: params.id },
      update: { data: body.data },
      create: {
        estimateId: params.id,
        data: body.data,
      },
    })

    // isFundingIssued を更新
    if (body.issue) {
      await prisma.estimate.update({
        where: { id: params.id },
        data: { isFundingIssued: true },
      })
    }

    return NextResponse.json(fundingPlan)
  } catch {
    return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 })
  }
}

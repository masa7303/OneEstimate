import { NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// GET /api/estimates/master — 見積に必要なマスターデータ一括取得
export async function GET() {
  try {
    const user = await requireDbUser()
    const cid = user.companyId

    const [series, tsuboCoefficients, variationTypes, optionCategories, initialSettings, atriumPrices, roomSetting] = await Promise.all([
      prisma.series.findMany({ where: { companyId: cid }, orderBy: { sortOrder: 'asc' } }),
      prisma.tsuboCoefficient.findMany({ where: { companyId: cid }, orderBy: { tsubo: 'asc' } }),
      prisma.variationType.findMany({
        where: { companyId: cid },
        orderBy: { sortOrder: 'asc' },
        include: { items: { orderBy: { sortOrder: 'asc' } } },
      }),
      prisma.optionCategory.findMany({
        where: { companyId: cid },
        orderBy: { sortOrder: 'asc' },
        include: { items: { orderBy: { sortOrder: 'asc' } } },
      }),
      prisma.initialSetting.findMany({
        where: { companyId: cid, isVisible: true },
        orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
      }),
      prisma.atriumPrice.findMany({ where: { companyId: cid }, orderBy: { sortOrder: 'asc' } }),
      prisma.roomPriceSetting.findUnique({ where: { companyId: cid } }),
    ])

    return NextResponse.json({
      series,
      tsuboCoefficients,
      variationTypes,
      optionCategories,
      initialSettings,
      atriumPrices,
      roomSetting,
    })
  } catch {
    return NextResponse.json({ error: 'マスターデータの取得に失敗しました' }, { status: 401 })
  }
}

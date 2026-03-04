import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// GET — 坪数係数一覧
export async function GET() {
  try {
    const user = await requireDbUser()
    const list = await prisma.tsuboCoefficient.findMany({
      where: { companyId: user.companyId },
      orderBy: { tsubo: 'asc' },
    })

    // 吹き抜け・部屋数設定も一緒に返す
    const [atrium, room] = await Promise.all([
      prisma.atriumPrice.findMany({
        where: { companyId: user.companyId },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.roomPriceSetting.findUnique({
        where: { companyId: user.companyId },
      }),
    ])

    return NextResponse.json({ coefficients: list, atrium, room })
  } catch {
    return NextResponse.json({ coefficients: [], atrium: [], room: null }, { status: 401 })
  }
}

// POST — 坪数係数の一括保存
export async function POST(req: NextRequest) {
  try {
    const user = await requireDbUser()
    const { coefficients, atrium, room } = await req.json()

    await prisma.$transaction(async (tx) => {
      // 坪数係数: 全削除→再作成
      if (coefficients) {
        await tx.tsuboCoefficient.deleteMany({ where: { companyId: user.companyId } })
        await tx.tsuboCoefficient.createMany({
          data: coefficients.map((c: any) => ({
            companyId: user.companyId,
            tsubo: parseInt(c.tsubo, 10),
            coefficient: parseFloat(c.coefficient),
          })),
        })
      }

      // 吹き抜け: 全削除→再作成
      if (atrium) {
        await tx.atriumPrice.deleteMany({ where: { companyId: user.companyId } })
        await tx.atriumPrice.createMany({
          data: atrium.map((a: any, i: number) => ({
            companyId: user.companyId,
            label: a.label,
            cost: parseInt(a.cost, 10) || 0,
            price: parseInt(a.price, 10) || 0,
            sortOrder: i,
          })),
        })
      }

      // 部屋数設定: upsert
      if (room) {
        await tx.roomPriceSetting.upsert({
          where: { companyId: user.companyId },
          update: {
            floor1BaseRooms: parseInt(room.floor1BaseRooms, 10) || 3,
            floor1UnitCost: parseInt(room.floor1UnitCost, 10) || 0,
            floor1UnitPrice: parseInt(room.floor1UnitPrice, 10) || 0,
            floor2UnitCost: parseInt(room.floor2UnitCost, 10) || 0,
            floor2UnitPrice: parseInt(room.floor2UnitPrice, 10) || 0,
          },
          create: {
            companyId: user.companyId,
            floor1BaseRooms: parseInt(room.floor1BaseRooms, 10) || 3,
            floor1UnitCost: parseInt(room.floor1UnitCost, 10) || 0,
            floor1UnitPrice: parseInt(room.floor1UnitPrice, 10) || 0,
            floor2UnitCost: parseInt(room.floor2UnitCost, 10) || 0,
            floor2UnitPrice: parseInt(room.floor2UnitPrice, 10) || 0,
          },
        })
      }
    })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

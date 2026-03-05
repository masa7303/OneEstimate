import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// GET /api/customers — 顧客一覧（検索・フィルタ対応）
export async function GET(req: NextRequest) {
  try {
    const user = await requireDbUser()
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = { companyId: user.companyId }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameKana: { contains: search, mode: 'insensitive' } },
        { tel: { contains: search } },
      ]
    }

    if (status) {
      where.estimates = { some: { status } }
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: { select: { estimates: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(customers)
  } catch {
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}

// POST /api/customers — 顧客作成
export async function POST(req: NextRequest) {
  try {
    const user = await requireDbUser()
    const body = await req.json()

    if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
      return NextResponse.json({ error: '顧客名は必須です' }, { status: 400 })
    }

    const customer = await prisma.customer.create({
      data: {
        companyId: user.companyId,
        name: body.name.trim(),
        nameKana: body.nameKana?.trim() || null,
        tel: body.tel?.trim() || null,
        email: body.email?.trim() || null,
        address: body.address?.trim() || null,
        memo: body.memo?.trim() || null,
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch {
    return NextResponse.json({ error: '作成に失敗しました' }, { status: 500 })
  }
}

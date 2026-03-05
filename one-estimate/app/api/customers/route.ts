import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

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
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch {
    return NextResponse.json({ error: '作成に失敗しました' }, { status: 500 })
  }
}

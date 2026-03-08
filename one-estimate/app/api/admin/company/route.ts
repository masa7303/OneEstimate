import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

// GET — 会社情報取得
export async function GET() {
  try {
    const user = await requireDbUser()
    const info = await prisma.companyInfo.findUnique({
      where: { companyId: user.companyId },
    })
    return NextResponse.json(info || {})
  } catch {
    return NextResponse.json({}, { status: 401 })
  }
}

// PUT — 会社情報更新
export async function PUT(req: NextRequest) {
  try {
    const user = await requireDbUser()
    const body = await req.json()

    const info = await prisma.companyInfo.upsert({
      where: { companyId: user.companyId },
      update: {
        name: body.name ?? null,
        address: body.address ?? null,
        tel: body.tel ?? null,
        fax: body.fax ?? null,
        email: body.email ?? null,
        notes: body.notes ?? null,
        logoUrl: body.logoUrl !== undefined ? body.logoUrl : undefined,
      },
      create: {
        companyId: user.companyId,
        name: body.name ?? null,
        address: body.address ?? null,
        tel: body.tel ?? null,
        fax: body.fax ?? null,
        email: body.email ?? null,
        notes: body.notes ?? null,
        logoUrl: body.logoUrl ?? null,
      },
    })

    return NextResponse.json(info)
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'エラーが発生しました' }, { status: 500 })
  }
}

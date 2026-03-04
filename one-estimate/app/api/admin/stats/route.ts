import { NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const user = await requireDbUser()
    const companyId = user.companyId

    const [series, optionCategories, questions, customers] = await Promise.all([
      prisma.series.count({ where: { companyId } }),
      prisma.optionCategory.count({ where: { companyId } }),
      prisma.question.count({ where: { companyId } }),
      prisma.customer.count({ where: { companyId } }),
    ])

    return NextResponse.json({ series, optionCategories, questions, customers })
  } catch (error) {
    return NextResponse.json({ series: 0, optionCategories: 0, questions: 0, customers: 0 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

const FONT_NAME = 'Yu Gothic'
const YEN_FORMAT = '¥#,##0'

function setRowFont(row: ExcelJS.Row, opts?: Partial<ExcelJS.Font>) {
  row.eachCell(cell => {
    cell.font = { name: FONT_NAME, size: 10, ...opts }
  })
}

// GET /api/estimates/[id]/funding/excel — 資金計画書Excel出力（A3横向き）
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireDbUser()

    const estimate = await prisma.estimate.findFirst({
      where: { id: params.id, companyId: user.companyId },
      include: {
        series: { select: { name: true } },
        customer: { select: { name: true } },
        fundingPlan: true,
        sectionBItems: { orderBy: { sortOrder: 'asc' } },
        sectionCItems: { orderBy: { sortOrder: 'asc' } },
        sectionDItems: { orderBy: { sortOrder: 'asc' } },
      },
    })

    if (!estimate) {
      return NextResponse.json({ error: '見積が見つかりません' }, { status: 404 })
    }

    const companyInfo = await prisma.companyInfo.findUnique({
      where: { companyId: user.companyId },
    })

    const fundingData = (estimate.fundingPlan?.data as any) || {}

    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('資金計画書', {
      pageSetup: {
        paperSize: 8 as any, // A3
        orientation: 'landscape',
        fitToPage: true,
        margins: { left: 0.5, right: 0.5, top: 0.5, bottom: 0.5, header: 0.3, footer: 0.3 },
      },
    })

    // タイトル
    const titleRow = ws.addRow(['資金計画書'])
    titleRow.getCell(1).font = { name: FONT_NAME, size: 16, bold: true }
    ws.mergeCells('A1:F1')

    // 基本情報
    ws.addRow([])
    const infoRow1 = ws.addRow(['お客様名:', estimate.customer?.name || '—', '', '日付:', new Date().toLocaleDateString('ja-JP')])
    setRowFont(infoRow1)
    const infoRow2 = ws.addRow(['シリーズ:', estimate.series.name, '', '坪数:', `${estimate.tsubo}坪`])
    setRowFont(infoRow2)
    ws.addRow([])

    // セクションヘッダー
    const headerRow = ws.addRow(['区分', '項目', '金額（税抜）', '消費税', '金額（税込）', '備考'])
    headerRow.eachCell(cell => {
      cell.font = { name: FONT_NAME, size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } }
      cell.alignment = { horizontal: 'center', vertical: 'middle' }
    })

    const TAX_RATE = 0.1
    const addSection = (label: string, amount: number) => {
      const tax = Math.round(amount * TAX_RATE)
      const row = ws.addRow([label, '', amount, tax, amount + tax, ''])
      row.getCell(3).numFmt = YEN_FORMAT
      row.getCell(4).numFmt = YEN_FORMAT
      row.getCell(5).numFmt = YEN_FORMAT
      setRowFont(row)
      return amount + tax
    }

    const addSectionWithItems = (label: string, items: { name: string; amount: number }[]) => {
      let subtotal = 0
      items.forEach((item, i) => {
        const tax = Math.round(item.amount * TAX_RATE)
        const row = ws.addRow([i === 0 ? label : '', item.name, item.amount, tax, item.amount + tax, ''])
        row.getCell(3).numFmt = YEN_FORMAT
        row.getCell(4).numFmt = YEN_FORMAT
        row.getCell(5).numFmt = YEN_FORMAT
        setRowFont(row)
        subtotal += item.amount + tax
      })
      return subtotal
    }

    let grandTotal = 0

    // A: 建物工事費
    grandTotal += addSection('A. 建物工事費', estimate.sectionA)

    // B: 付帯工事費
    if (estimate.sectionBItems.length > 0) {
      grandTotal += addSectionWithItems('B. 付帯工事費', estimate.sectionBItems.map(i => ({ name: i.itemName, amount: i.amount })))
    } else {
      grandTotal += addSection('B. 付帯工事費', estimate.sectionB)
    }

    // C: オプション工事費
    grandTotal += addSection('C. オプション工事費', estimate.sectionC)

    // D: その他諸費用
    if (estimate.sectionDItems.length > 0) {
      grandTotal += addSectionWithItems('D. その他諸費用', estimate.sectionDItems.map(i => ({ name: i.itemName, amount: i.amount })))
    } else {
      grandTotal += addSection('D. その他諸費用', estimate.sectionD)
    }

    // E: 事務手数料
    const sectionEItems = (fundingData.sectionE || []) as { name: string; amount: number }[]
    if (sectionEItems.length > 0) {
      grandTotal += addSectionWithItems('E. 事務手数料', sectionEItems)
    }

    // F: 土地費用
    const sectionFItems = (fundingData.sectionF || []) as { name: string; amount: number }[]
    if (sectionFItems.length > 0) {
      grandTotal += addSectionWithItems('F. 土地費用', sectionFItems)
    }

    // G: 補助金等（マイナス計上）
    const sectionGItems = (fundingData.sectionG || []) as { name: string; amount: number }[]
    if (sectionGItems.length > 0) {
      sectionGItems.forEach((item, i) => {
        const row = ws.addRow([i === 0 ? 'G. 補助金等' : '', item.name, -Math.abs(item.amount), '', -Math.abs(item.amount), '控除'])
        row.getCell(3).numFmt = YEN_FORMAT
        row.getCell(5).numFmt = YEN_FORMAT
        setRowFont(row)
        grandTotal -= Math.abs(item.amount)
      })
    }

    // 総合計
    ws.addRow([])
    const totalRow = ws.addRow(['', '費用総額', '', '', grandTotal, ''])
    totalRow.getCell(5).numFmt = YEN_FORMAT
    setRowFont(totalRow, { bold: true, size: 12 })

    // ローン計算
    const loanData = fundingData.loan || {}
    if (loanData.selfFunding !== undefined) {
      ws.addRow([])
      const loanHeader = ws.addRow(['ローン計算'])
      setRowFont(loanHeader, { bold: true, size: 11 })

      const selfFunding = loanData.selfFunding || 0
      const borrowAmount = loanData.borrowAmount || (grandTotal - selfFunding)
      const interestRate = loanData.interestRate || 0
      const years = loanData.years || 35

      ws.addRow(['', '自己資金', selfFunding]).getCell(3).numFmt = YEN_FORMAT
      ws.addRow(['', '借入金額', borrowAmount]).getCell(3).numFmt = YEN_FORMAT
      ws.addRow(['', '金利（年）', `${interestRate}%`])
      ws.addRow(['', '返済期間', `${years}年`])

      // PMT計算
      if (borrowAmount > 0 && interestRate > 0 && years > 0) {
        const monthlyRate = interestRate / 100 / 12
        const numPayments = years * 12
        const monthlyPayment = Math.round(
          borrowAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1)
        )
        const pmtRow = ws.addRow(['', '月々返済額', monthlyPayment])
        pmtRow.getCell(3).numFmt = YEN_FORMAT
        setRowFont(pmtRow, { bold: true })
      }
    }

    // 列幅設定
    ws.getColumn(1).width = 18
    ws.getColumn(2).width = 30
    ws.getColumn(3).width = 16
    ws.getColumn(4).width = 14
    ws.getColumn(5).width = 18
    ws.getColumn(6).width = 15

    // 会社情報
    if (companyInfo) {
      ws.addRow([])
      ws.addRow([])
      const ciRow = ws.addRow([companyInfo.name || ''])
      setRowFont(ciRow, { size: 9 })
      if (companyInfo.address) {
        const adRow = ws.addRow([companyInfo.address])
        setRowFont(adRow, { size: 9 })
      }
      if (companyInfo.tel) {
        const telRow = ws.addRow([`TEL: ${companyInfo.tel}`])
        setRowFont(telRow, { size: 9 })
      }
    }

    const buffer = await wb.xlsx.writeBuffer()
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="funding_${dateStr}.xlsx"`,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Excel生成に失敗しました' }, { status: 500 })
  }
}

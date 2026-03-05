import { NextRequest, NextResponse } from 'next/server'
import { requireDbUser } from '@/lib/auth/db'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

const DEFAULT_NOTES = [
  '1. 本見積書の有効期限は発行日より30日間となります。',
  '2. 上記金額には消費税（10%）が含まれております。',
  '3. 地盤調査費用、確認申請費用、外構工事費用は別途となります。',
  '4. 詳細なプラン・仕様により金額が変動する場合がございます。',
  '5. 本見積書は概算見積であり、正式なご契約時に詳細見積書を作成いたします。',
]

const FONT_NAME = 'Yu Gothic'
const YEN_FORMAT = '¥#,##0'

function setRowFont(row: ExcelJS.Row, opts?: Partial<ExcelJS.Font>) {
  row.eachCell(cell => {
    cell.font = { name: FONT_NAME, size: 10, ...opts }
  })
}

// GET /api/estimates/[id]/excel — Excel生成・ダウンロード
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
        customer: { select: { name: true } },
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

    const companyInfo = await prisma.companyInfo.findUnique({
      where: { companyId: user.companyId },
      select: { name: true, address: true, tel: true, fax: true, notes: true },
    })

    // ===== Excel生成 =====
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('見積書', {
      pageSetup: {
        paperSize: 9, // A4
        orientation: 'portrait',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        margins: { left: 0.6, right: 0.6, top: 0.6, bottom: 0.6, header: 0.3, footer: 0.3 },
      },
    })

    // 列幅
    ws.columns = [
      { width: 18 }, // A
      { width: 22 }, // B
      { width: 40 }, // C
      { width: 20 }, // D
    ]

    let rowNum = 1

    // --- タイトル ---
    const titleRow = ws.addRow(['', '御 見 積 書', '', ''])
    ws.mergeCells(rowNum, 1, rowNum, 4)
    titleRow.getCell(1).font = { name: FONT_NAME, size: 18, bold: true }
    titleRow.getCell(1).alignment = { horizontal: 'center' }
    rowNum++

    // 空行
    ws.addRow([]); rowNum++

    // --- 顧客名・見積番号・日付 ---
    const createdDate = new Date(estimate.createdAt)
    const dateStr = `${createdDate.getFullYear()}年${createdDate.getMonth() + 1}月${createdDate.getDate()}日`
    const validDate = new Date(createdDate)
    validDate.setDate(validDate.getDate() + 30)
    const validStr = `${validDate.getFullYear()}年${validDate.getMonth() + 1}月${validDate.getDate()}日`
    const customerName = estimate.customer?.name || ''

    const infoRow1 = ws.addRow([`${customerName}　様`, '', '', `見積番号: ${estimate.estimateNumber}`])
    infoRow1.getCell(1).font = { name: FONT_NAME, size: 12, bold: true, underline: true }
    infoRow1.getCell(4).font = { name: FONT_NAME, size: 9 }
    infoRow1.getCell(4).alignment = { horizontal: 'right' }
    rowNum++

    const infoRow2 = ws.addRow(['', '', '', `発行日: ${dateStr}`])
    infoRow2.getCell(4).font = { name: FONT_NAME, size: 9 }
    infoRow2.getCell(4).alignment = { horizontal: 'right' }
    rowNum++

    const infoRow3 = ws.addRow(['', '', '', `有効期限: ${validStr}`])
    infoRow3.getCell(4).font = { name: FONT_NAME, size: 9 }
    infoRow3.getCell(4).alignment = { horizontal: 'right' }
    rowNum++

    // 空行
    ws.addRow([]); rowNum++

    // --- 御見積金額 ---
    const amountRow = ws.addRow(['', '御見積金額（税込）', '', estimate.totalAmount])
    ws.mergeCells(rowNum, 2, rowNum, 3)
    amountRow.getCell(2).font = { name: FONT_NAME, size: 11, bold: true }
    amountRow.getCell(4).font = { name: FONT_NAME, size: 16, bold: true, color: { argb: 'FFCC0000' } }
    amountRow.getCell(4).numFmt = YEN_FORMAT
    amountRow.getCell(4).alignment = { horizontal: 'right' }
    rowNum++

    // 空行
    ws.addRow([]); rowNum++

    // --- セクション出力ヘルパー ---
    const addSectionHeader = (label: string, bgColor: string) => {
      const row = ws.addRow([label, '', '', ''])
      ws.mergeCells(rowNum, 1, rowNum, 4)
      row.getCell(1).font = { name: FONT_NAME, size: 10, bold: true, color: { argb: 'FFFFFFFF' } }
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } }
      rowNum++
    }

    const addItemRow = (name: string, amount: number) => {
      const row = ws.addRow(['', '', name, amount])
      ws.mergeCells(rowNum, 1, rowNum, 3)
      row.getCell(1).value = name
      row.getCell(1).font = { name: FONT_NAME, size: 9 }
      row.getCell(4).font = { name: FONT_NAME, size: 9 }
      row.getCell(4).numFmt = YEN_FORMAT
      row.getCell(4).alignment = { horizontal: 'right' }
      rowNum++
    }

    const addSubtotalRows = (subtotal: number, tax: number, total: number) => {
      // 税抜小計
      let row = ws.addRow(['', '', '税抜小計', subtotal])
      row.getCell(3).font = { name: FONT_NAME, size: 9 }
      row.getCell(3).alignment = { horizontal: 'right' }
      row.getCell(4).font = { name: FONT_NAME, size: 9, bold: true }
      row.getCell(4).numFmt = YEN_FORMAT
      row.getCell(4).alignment = { horizontal: 'right' }
      rowNum++

      // 消費税
      row = ws.addRow(['', '', '消費税（10%）', tax])
      row.getCell(3).font = { name: FONT_NAME, size: 9 }
      row.getCell(3).alignment = { horizontal: 'right' }
      row.getCell(4).font = { name: FONT_NAME, size: 9 }
      row.getCell(4).numFmt = YEN_FORMAT
      row.getCell(4).alignment = { horizontal: 'right' }
      rowNum++

      // 税込計
      row = ws.addRow(['', '', '税込計', total])
      row.getCell(3).font = { name: FONT_NAME, size: 9, bold: true }
      row.getCell(3).alignment = { horizontal: 'right' }
      row.getCell(4).font = { name: FONT_NAME, size: 10, bold: true }
      row.getCell(4).numFmt = YEN_FORMAT
      row.getCell(4).alignment = { horizontal: 'right' }
      row.getCell(4).border = { top: { style: 'thin' } }
      rowNum++
    }

    // --- セクションA ---
    const tsuboPrice = estimate.tsubo > 0 ? Math.round(estimate.sectionA / estimate.tsubo) : 0
    addSectionHeader('A. 基本本体価格', 'FF1D4ED8')
    addItemRow(`${estimate.series.name}　${estimate.tsubo}坪（坪単価 ¥${tsuboPrice.toLocaleString()}）`, estimate.sectionA)
    addSubtotalRows(estimate.sectionA, estimate.sectionATax, estimate.sectionA + estimate.sectionATax)

    // 空行
    ws.addRow([]); rowNum++

    // --- セクションB ---
    if (estimate.sectionBItems.length > 0) {
      addSectionHeader('B. 付帯工事費', 'FF047857')
      estimate.sectionBItems.forEach(item => addItemRow(item.itemName, item.amount))
      addSubtotalRows(estimate.sectionB, estimate.sectionBTax, estimate.sectionB + estimate.sectionBTax)
      ws.addRow([]); rowNum++
    }

    // --- セクションC ---
    const hasCItems = estimate.variations.length > 0 || estimate.options.length > 0 || estimate.sectionCItems.length > 0
    if (hasCItems) {
      addSectionHeader('C. オプション工事費', 'FF7E22CE')
      estimate.variations.forEach(v => addItemRow(`[変更] ${v.itemName}`, v.price))
      estimate.options.forEach(o => addItemRow(`[オプション] ${o.item.name}`, o.price))
      estimate.sectionCItems.forEach(item => addItemRow(item.itemName, item.amount))
      addSubtotalRows(estimate.sectionC, estimate.sectionCTax, estimate.sectionC + estimate.sectionCTax)
      ws.addRow([]); rowNum++
    }

    // --- セクションD ---
    if (estimate.sectionDItems.length > 0) {
      addSectionHeader('D. その他諸費用', 'FFC2410C')
      estimate.sectionDItems.forEach(item => addItemRow(item.itemName, item.amount))
      addSubtotalRows(estimate.sectionD, estimate.sectionDTax, estimate.sectionD + estimate.sectionDTax)
      ws.addRow([]); rowNum++
    }

    // --- 合計行 ---
    const totalRow = ws.addRow(['御見積合計（税込）', '', '', estimate.totalAmount])
    ws.mergeCells(rowNum, 1, rowNum, 3)
    totalRow.getCell(1).font = { name: FONT_NAME, size: 12, bold: true, color: { argb: 'FFFFFFFF' } }
    totalRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }
    totalRow.getCell(4).font = { name: FONT_NAME, size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
    totalRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2937' } }
    totalRow.getCell(4).numFmt = YEN_FORMAT
    totalRow.getCell(4).alignment = { horizontal: 'right' }
    rowNum++

    // 空行×2
    ws.addRow([]); rowNum++
    ws.addRow([]); rowNum++

    // --- 備考 ---
    const notesRow = ws.addRow(['備考'])
    notesRow.getCell(1).font = { name: FONT_NAME, size: 9, bold: true }
    notesRow.getCell(1).border = { bottom: { style: 'thin' } }
    rowNum++

    const notes = companyInfo?.notes
      ? companyInfo.notes.split('\n').filter(Boolean)
      : DEFAULT_NOTES

    notes.forEach(note => {
      const row = ws.addRow([note])
      ws.mergeCells(rowNum, 1, rowNum, 4)
      row.getCell(1).font = { name: FONT_NAME, size: 8, color: { argb: 'FF666666' } }
      rowNum++
    })

    // 空行×2
    ws.addRow([]); rowNum++
    ws.addRow([]); rowNum++

    // --- 会社情報 ---
    if (companyInfo?.name) {
      const compRow = ws.addRow([companyInfo.name])
      ws.mergeCells(rowNum, 1, rowNum, 4)
      compRow.getCell(1).font = { name: FONT_NAME, size: 11, bold: true }
      rowNum++
    }
    if (companyInfo?.address) {
      const addrRow = ws.addRow([companyInfo.address])
      ws.mergeCells(rowNum, 1, rowNum, 4)
      addrRow.getCell(1).font = { name: FONT_NAME, size: 9 }
      rowNum++
    }
    const contactParts: string[] = []
    if (companyInfo?.tel) contactParts.push(`TEL: ${companyInfo.tel}`)
    if (companyInfo?.fax) contactParts.push(`FAX: ${companyInfo.fax}`)
    if (contactParts.length > 0) {
      const contactRow = ws.addRow([contactParts.join('　　')])
      ws.mergeCells(rowNum, 1, rowNum, 4)
      contactRow.getCell(1).font = { name: FONT_NAME, size: 9 }
      rowNum++
    }

    // --- バッファ生成 ---
    const buffer = await wb.xlsx.writeBuffer()

    const now = new Date()
    const fileName = `見積書_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.xlsx`

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    })
  } catch (e: any) {
    console.error('Excel generation error:', e)
    return NextResponse.json({ error: 'Excel生成に失敗しました' }, { status: 500 })
  }
}

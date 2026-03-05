'use client'

import { EstimateDetail } from '@/types/estimate'

const fmt = (n: number) => `¥${n.toLocaleString()}`

const DEFAULT_NOTES = [
  '1. 本見積書の有効期限は発行日より30日間となります。',
  '2. 上記金額には消費税（10%）が含まれております。',
  '3. 地盤調査費用、確認申請費用、外構工事費用は別途となります。',
  '4. 詳細なプラン・仕様により金額が変動する場合がございます。',
  '5. 本見積書は概算見積であり、正式なご契約時に詳細見積書を作成いたします。',
]

function SectionTable({
  title,
  items,
  subtotal,
  tax,
  total,
  color,
}: {
  title: string
  items: { name: string; amount: number }[]
  subtotal: number
  tax: number
  total: number
  color: string
}) {
  return (
    <div className="mb-3">
      <div className={`${color} text-white text-[11px] font-bold px-2 py-1`}>{title}</div>
      <table className="w-full text-[10px] border-collapse">
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-0.5 px-2 text-gray-700">{item.name}</td>
              <td className="py-0.5 px-2 text-right text-gray-900 w-28">{fmt(item.amount)}</td>
            </tr>
          ))}
          <tr className="border-t border-gray-300">
            <td className="py-0.5 px-2 text-right text-gray-600">税抜小計</td>
            <td className="py-0.5 px-2 text-right font-medium w-28">{fmt(subtotal)}</td>
          </tr>
          <tr>
            <td className="py-0.5 px-2 text-right text-gray-600">消費税（10%）</td>
            <td className="py-0.5 px-2 text-right font-medium w-28">{fmt(tax)}</td>
          </tr>
          <tr className="border-t border-gray-400">
            <td className="py-0.5 px-2 text-right font-bold">税込計</td>
            <td className="py-0.5 px-2 text-right font-bold w-28">{fmt(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function EstimateDocument({ data }: { data: EstimateDetail }) {
  const createdDate = new Date(data.createdAt)
  const dateStr = `${createdDate.getFullYear()}年${createdDate.getMonth() + 1}月${createdDate.getDate()}日`

  const validDate = new Date(createdDate)
  validDate.setDate(validDate.getDate() + 30)
  const validStr = `${validDate.getFullYear()}年${validDate.getMonth() + 1}月${validDate.getDate()}日`

  const customerName = data.customer?.name || '　　　　　　　　'

  // セクションC の明細を構築
  const sectionCAllItems: { name: string; amount: number }[] = []

  // C-1 変動費
  if (data.variations.length > 0) {
    data.variations.forEach(v => {
      sectionCAllItems.push({ name: `[変更] ${v.itemName}`, amount: v.price })
    })
  }

  // C-2 オプション
  if (data.options.length > 0) {
    data.options.forEach(o => {
      sectionCAllItems.push({ name: `[オプション] ${o.item.name}`, amount: o.price })
    })
  }

  // C-3 その他工事
  if (data.sectionCItems.length > 0) {
    data.sectionCItems.forEach(item => {
      sectionCAllItems.push({ name: item.itemName, amount: item.amount })
    })
  }

  // 備考
  const notes = data.companyInfo?.notes
    ? data.companyInfo.notes.split('\n').filter(Boolean)
    : DEFAULT_NOTES

  const companyName = data.companyInfo?.name || ''
  const companyAddress = data.companyInfo?.address || ''
  const companyTel = data.companyInfo?.tel || ''
  const companyFax = data.companyInfo?.fax || ''

  // 坪単価（税抜）
  const tsuboPrice = data.tsubo > 0 ? Math.round(data.sectionA / data.tsubo) : 0

  return (
    <div
      id="estimate-document"
      className="w-[210mm] min-h-[297mm] bg-white mx-auto p-[15mm] text-[11px] text-gray-900 leading-relaxed relative"
      style={{ fontFamily: '"Yu Gothic", "游ゴシック", "Hiragino Sans", sans-serif' }}
    >
      {/* ヘッダー */}
      <div className="text-center mb-6">
        <h1 className="text-[24px] font-bold tracking-[0.3em] mb-4">御 見 積 書</h1>
        <div className="flex justify-between items-start">
          <div className="text-left">
            <div className="text-[14px] font-bold border-b-2 border-gray-900 pb-1 inline-block">
              {customerName}　様
            </div>
          </div>
          <div className="text-right text-[10px] space-y-0.5">
            <div>見積番号: {data.estimateNumber}</div>
            <div>発行日: {dateStr}</div>
            <div>有効期限: {validStr}</div>
          </div>
        </div>
      </div>

      {/* 金額ボックス */}
      <div className="border-2 border-red-600 rounded-lg p-3 mb-5 text-center">
        <div className="text-[10px] text-gray-600 mb-1">御見積金額（税込）</div>
        <div className="text-[22px] font-bold text-red-600">{fmt(data.totalAmount)}</div>
      </div>

      {/* セクションA */}
      <SectionTable
        title="A. 基本本体価格"
        items={[
          { name: `${data.series.name}　${data.tsubo}坪（坪単価 ${fmt(tsuboPrice)}）`, amount: data.sectionA },
        ]}
        subtotal={data.sectionA}
        tax={data.sectionATax}
        total={data.sectionA + data.sectionATax}
        color="bg-blue-700"
      />

      {/* セクションB */}
      {data.sectionBItems.length > 0 && (
        <SectionTable
          title="B. 付帯工事費"
          items={data.sectionBItems.map(item => ({ name: item.itemName, amount: item.amount }))}
          subtotal={data.sectionB}
          tax={data.sectionBTax}
          total={data.sectionB + data.sectionBTax}
          color="bg-emerald-700"
        />
      )}

      {/* セクションC */}
      {sectionCAllItems.length > 0 && (
        <SectionTable
          title="C. オプション工事費"
          items={sectionCAllItems}
          subtotal={data.sectionC}
          tax={data.sectionCTax}
          total={data.sectionC + data.sectionCTax}
          color="bg-purple-700"
        />
      )}

      {/* セクションD */}
      {data.sectionDItems.length > 0 && (
        <SectionTable
          title="D. その他諸費用"
          items={data.sectionDItems.map(item => ({ name: item.itemName, amount: item.amount }))}
          subtotal={data.sectionD}
          tax={data.sectionDTax}
          total={data.sectionD + data.sectionDTax}
          color="bg-orange-700"
        />
      )}

      {/* 合計行 */}
      <div className="bg-gray-800 text-white rounded-lg px-4 py-2 flex justify-between items-center mb-5">
        <span className="font-bold text-[12px]">御見積合計（税込）</span>
        <span className="text-[18px] font-bold">{fmt(data.totalAmount)}</span>
      </div>

      {/* 備考 */}
      <div className="mb-5">
        <div className="text-[10px] font-bold text-gray-700 mb-1 border-b border-gray-300 pb-0.5">備考</div>
        <div className="text-[9px] text-gray-600 space-y-0.5">
          {notes.map((note, i) => (
            <div key={i}>{note}</div>
          ))}
        </div>
      </div>

      {/* フッター: 会社情報 */}
      <div className="absolute bottom-[15mm] left-[15mm] right-[15mm]">
        <div className="flex justify-between items-end border-t border-gray-300 pt-3">
          <div className="text-[10px] text-gray-700 space-y-0.5">
            {companyName && <div className="font-bold text-[12px] text-gray-900">{companyName}</div>}
            {companyAddress && <div>{companyAddress}</div>}
            <div className="flex gap-4">
              {companyTel && <span>TEL: {companyTel}</span>}
              {companyFax && <span>FAX: {companyFax}</span>}
            </div>
          </div>
          <div className="w-16 h-16 border-2 border-red-400 rounded-full flex items-center justify-center text-red-400 text-[14px] font-bold">
            印
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

const fmt = (n: number) => n.toLocaleString()
const TAX_RATE = 0.1

type Props = {
  seriesName: string
  tsubo: number
  sectionA: number
  sectionB: number
  sectionC: number
  sectionD: number
}

export function SidebarSummary({ seriesName, tsubo, sectionA, sectionB, sectionC, sectionD }: Props) {
  const sectionATax = Math.round(sectionA * TAX_RATE)
  const sectionBTax = Math.round(sectionB * TAX_RATE)
  const sectionCTax = Math.round(sectionC * TAX_RATE)
  const sectionDTax = Math.round(sectionD * TAX_RATE)
  const totalAmount = (sectionA + sectionATax) + (sectionB + sectionBTax) + (sectionC + sectionCTax) + (sectionD + sectionDTax)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">見積サマリー</h3>
      <div className="text-xs text-gray-500 mb-3">
        {seriesName && <span className="font-medium text-gray-700">{seriesName}</span>}
        {tsubo > 0 && <span className="ml-2">{tsubo}坪</span>}
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-500">A. 基本本体</span>
          <span className="text-gray-700">¥{fmt(sectionA + sectionATax)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">B. 付帯工事</span>
          <span className="text-gray-700">¥{fmt(sectionB + sectionBTax)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">C. オプション</span>
          <span className="text-gray-700">¥{fmt(sectionC + sectionCTax)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">D. その他</span>
          <span className="text-gray-700">¥{fmt(sectionD + sectionDTax)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-900 text-sm">税込総額</span>
            <span className="text-lg font-bold text-blue-700">¥{fmt(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

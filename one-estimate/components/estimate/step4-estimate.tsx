'use client'

const fmt = (n: number) => n.toLocaleString()
const TAX_RATE = 0.1

type Props = {
  sectionA: number
  sectionB: number
  sectionCVariation: number
  sectionCOption: number
  sectionCOther: number
  sectionD: number
  seriesName: string
  tsubo: number
}

export function Step4Estimate(props: Props) {
  const { sectionA, sectionB, sectionCVariation, sectionCOption, sectionCOther, sectionD, seriesName, tsubo } = props
  const sectionC = sectionCVariation + sectionCOption + sectionCOther

  const sectionATax = Math.round(sectionA * TAX_RATE)
  const sectionBTax = Math.round(sectionB * TAX_RATE)
  const sectionCTax = Math.round(sectionC * TAX_RATE)
  const sectionDTax = Math.round(sectionD * TAX_RATE)
  const totalAmount = (sectionA + sectionATax) + (sectionB + sectionBTax) + (sectionC + sectionCTax) + (sectionD + sectionDTax)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">見積確認</h2>
        <p className="text-sm text-gray-500 mb-5">{seriesName} / {tsubo}坪</p>

        <div className="space-y-4">
          {/* A */}
          <div className="border border-blue-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold text-blue-700">A. 基本本体価格</h3>
              <span className="text-sm font-bold text-blue-700">¥{fmt(sectionA + sectionATax)}</span>
            </div>
            <div className="text-xs text-gray-500">
              税抜 ¥{fmt(sectionA)} + 消費税 ¥{fmt(sectionATax)}
            </div>
          </div>

          {/* B */}
          <div className="border border-emerald-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold text-emerald-700">B. 付帯工事費</h3>
              <span className="text-sm font-bold text-emerald-700">¥{fmt(sectionB + sectionBTax)}</span>
            </div>
            <div className="text-xs text-gray-500">
              税抜 ¥{fmt(sectionB)} + 消費税 ¥{fmt(sectionBTax)}
            </div>
          </div>

          {/* C */}
          <div className="border border-purple-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold text-purple-700">C. オプション工事費</h3>
              <span className="text-sm font-bold text-purple-700">¥{fmt(sectionC + sectionCTax)}</span>
            </div>
            <div className="text-xs text-gray-500 space-y-0.5">
              <div>C-1 変更工事費: ¥{fmt(sectionCVariation)}</div>
              <div>C-2 住設オプション: ¥{fmt(sectionCOption)}</div>
              <div>C-3 その他工事費: ¥{fmt(sectionCOther)}</div>
              <div>消費税: ¥{fmt(sectionCTax)}</div>
            </div>
          </div>

          {/* D */}
          <div className="border border-orange-100 rounded-lg p-4">
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-semibold text-orange-700">D. その他諸費用</h3>
              <span className="text-sm font-bold text-orange-700">¥{fmt(sectionD + sectionDTax)}</span>
            </div>
            <div className="text-xs text-gray-500">
              税抜 ¥{fmt(sectionD)} + 消費税 ¥{fmt(sectionDTax)}
            </div>
          </div>
        </div>

        {/* 合計 */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">税込総額</span>
            <span className="text-3xl font-bold text-blue-700">¥{fmt(totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

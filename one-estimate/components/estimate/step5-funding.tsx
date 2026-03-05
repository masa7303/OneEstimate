'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

const fmt = (n: number) => n.toLocaleString()
const TAX_RATE = 0.1

type FundingItem = { name: string; amount: number }

type Props = {
  estimateId: string | null
  sectionA: number
  sectionB: number
  sectionC: number
  sectionD: number
}

export function Step5Funding({ estimateId, sectionA, sectionB, sectionC, sectionD }: Props) {
  const [sectionEItems, setSectionEItems] = useState<FundingItem[]>([])
  const [sectionFItems, setSectionFItems] = useState<FundingItem[]>([])
  const [sectionGItems, setSectionGItems] = useState<FundingItem[]>([])
  const [selfFunding, setSelfFunding] = useState(0)
  const [interestRate, setInterestRate] = useState(0.5)
  const [loanYears, setLoanYears] = useState(35)
  const [saving, setSaving] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // 既存データロード
  useEffect(() => {
    if (!estimateId) return
    fetch(`/api/estimates/${estimateId}/funding`)
      .then(res => res.json())
      .then(data => {
        // テンプレートからE/F/Gの初期値をセット
        const eItems: FundingItem[] = (data.settingsEF || [])
          .filter((s: any) => s.section === 'E')
          .map((s: any) => ({ name: s.itemName, amount: s.defaultAmount }))
        const fItems: FundingItem[] = (data.settingsEF || [])
          .filter((s: any) => s.section === 'F')
          .map((s: any) => ({ name: s.itemName, amount: s.defaultAmount }))
        const gItems: FundingItem[] = (data.templates || [])
          .filter((t: any) => t.section === 'G')
          .map((t: any) => ({ name: t.itemName, amount: t.defaultAmount }))

        // 保存済みデータがあればそれを使う
        if (data.fundingPlan?.data) {
          const fd = data.fundingPlan.data as any
          if (fd.sectionE?.length) setSectionEItems(fd.sectionE)
          else setSectionEItems(eItems)
          if (fd.sectionF?.length) setSectionFItems(fd.sectionF)
          else setSectionFItems(fItems)
          if (fd.sectionG?.length) setSectionGItems(fd.sectionG)
          else setSectionGItems(gItems)
          if (fd.loan) {
            setSelfFunding(fd.loan.selfFunding || 0)
            setInterestRate(fd.loan.interestRate || 0.5)
            setLoanYears(fd.loan.years || 35)
          }
        } else {
          setSectionEItems(eItems)
          setSectionFItems(fItems)
          setSectionGItems(gItems)
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [estimateId])

  // 合計計算
  const taxed = (amount: number) => amount + Math.round(amount * TAX_RATE)
  const totalABCD = taxed(sectionA) + taxed(sectionB) + taxed(sectionC) + taxed(sectionD)
  const totalE = sectionEItems.reduce((sum, i) => sum + taxed(i.amount), 0)
  const totalF = sectionFItems.reduce((sum, i) => sum + taxed(i.amount), 0)
  const totalG = sectionGItems.reduce((sum, i) => sum + Math.abs(i.amount), 0)
  const grandTotal = totalABCD + totalE + totalF - totalG

  // ローン計算
  const borrowAmount = Math.max(0, grandTotal - selfFunding)
  let monthlyPayment = 0
  if (borrowAmount > 0 && interestRate > 0 && loanYears > 0) {
    const r = interestRate / 100 / 12
    const n = loanYears * 12
    monthlyPayment = Math.round(borrowAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1))
  }

  const handleSave = async () => {
    if (!estimateId) return
    setSaving(true)
    await fetch(`/api/estimates/${estimateId}/funding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          sectionE: sectionEItems,
          sectionF: sectionFItems,
          sectionG: sectionGItems,
          loan: { selfFunding, borrowAmount, interestRate, years: loanYears },
        },
      }),
    })
    setSaving(false)
  }

  const handleExcel = () => {
    if (!estimateId) return
    window.open(`/api/estimates/${estimateId}/funding/excel`, '_blank')
  }

  const updateItem = (setter: (v: FundingItem[]) => void, items: FundingItem[], idx: number, field: 'name' | 'amount', value: string | number) => {
    const updated = [...items]
    if (field === 'amount') updated[idx] = { ...updated[idx], amount: Number(value) || 0 }
    else updated[idx] = { ...updated[idx], name: String(value) }
    setter(updated)
  }

  const addItem = (setter: (v: FundingItem[]) => void, items: FundingItem[]) => {
    setter([...items, { name: '', amount: 0 }])
  }

  const removeItem = (setter: (v: FundingItem[]) => void, items: FundingItem[], idx: number) => {
    setter(items.filter((_, i) => i !== idx))
  }

  if (!estimateId) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">見積を先に保存してから資金計画書を作成できます。</p>
      </div>
    )
  }

  if (!loaded) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
  }

  const renderSection = (title: string, color: string, items: FundingItem[], setter: (v: FundingItem[]) => void) => (
    <section className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-semibold ${color}`}>{title}</h3>
        <button onClick={() => addItem(setter, items)} className="text-xs text-blue-600 hover:underline">+ 項目追加</button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">項目がありません</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={item.name} onChange={e => updateItem(setter, items, i, 'name', e.target.value)}
                className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm" placeholder="項目名" />
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-400">¥</span>
                <input type="number" value={item.amount} onChange={e => updateItem(setter, items, i, 'amount', e.target.value)}
                  className="w-32 border border-gray-200 rounded px-2 py-1 text-sm text-right" />
              </div>
              <button onClick={() => removeItem(setter, items, i)} className="text-gray-400 hover:text-red-500">
                <Icons.x className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )

  return (
    <div className="space-y-5">
      {/* A-D サマリー（読み取り専用） */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">A〜D 見積連動（自動）</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">A. 建物工事費</span><span>¥{fmt(taxed(sectionA))}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">B. 付帯工事費</span><span>¥{fmt(taxed(sectionB))}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">C. オプション工事費</span><span>¥{fmt(taxed(sectionC))}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">D. その他諸費用</span><span>¥{fmt(taxed(sectionD))}</span></div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between text-sm font-medium">
          <span>A〜D 小計</span><span>¥{fmt(totalABCD)}</span>
        </div>
      </section>

      {/* E: 事務手数料 */}
      {renderSection('E. 事務手数料', 'text-teal-700', sectionEItems, setSectionEItems)}

      {/* F: 土地費用 */}
      {renderSection('F. 土地費用', 'text-amber-700', sectionFItems, setSectionFItems)}

      {/* G: 補助金等（マイナス計上） */}
      {renderSection('G. 補助金等（控除）', 'text-green-700', sectionGItems, setSectionGItems)}

      {/* 費用総額 */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">費用総額</span>
          <span className="text-3xl font-bold text-blue-700">¥{fmt(grandTotal)}</span>
        </div>
      </section>

      {/* ローン計算 */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">ローン計算</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">自己資金</label>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-400">¥</span>
              <input type="number" value={selfFunding} onChange={e => setSelfFunding(parseInt(e.target.value) || 0)}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-right" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">借入金額</label>
            <p className="text-sm font-medium text-gray-900 py-1.5">¥{fmt(borrowAmount)}</p>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">金利（年 %）</label>
            <input type="number" step={0.01} value={interestRate} onChange={e => setInterestRate(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-right" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">返済期間（年）</label>
            <input type="number" value={loanYears} onChange={e => setLoanYears(parseInt(e.target.value) || 0)}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-right" />
          </div>
        </div>
        {monthlyPayment > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
            <span className="text-sm text-blue-700">月々返済額</span>
            <span className="text-xl font-bold text-blue-700">¥{fmt(monthlyPayment)}/月</span>
          </div>
        )}
      </section>

      {/* アクション */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleExcel}>
          <Icons.download className="w-4 h-4 mr-1" />Excel出力
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '資金計画書を保存'}
        </Button>
      </div>
    </div>
  )
}

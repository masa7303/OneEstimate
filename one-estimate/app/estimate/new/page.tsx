'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

type Series = { id: string; name: string; baseCost: number; marginRate: number; basePrice: number }
type TsuboCoef = { tsubo: number; coefficient: number }
type VType = { id: string; slug: string; name: string; items: VItem[] }
type VItem = { id: string; name: string; cost: number; price: number }
type OptCat = { id: string; name: string; items: OptItem[] }
type OptItem = { id: string; name: string; cost: number; price: number }
type ISetting = { id: string; section: string; itemName: string; defaultAmount: number }
type AtriumPrice = { label: string; cost: number; price: number }
type RoomSetting = { floor1BaseRooms: number; floor1UnitCost: number; floor1UnitPrice: number; floor2UnitCost: number; floor2UnitPrice: number }

const TAX_RATE = 0.1
const fmt = (n: number) => n.toLocaleString()

export default function EstimateNewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // マスターデータ
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [tsuboCoefs, setTsuboCoefs] = useState<TsuboCoef[]>([])
  const [variationTypes, setVariationTypes] = useState<VType[]>([])
  const [optionCategories, setOptionCategories] = useState<OptCat[]>([])
  const [initialSettings, setInitialSettings] = useState<ISetting[]>([])
  const [atriumPrices, setAtriumPrices] = useState<AtriumPrice[]>([])
  const [roomSetting, setRoomSetting] = useState<RoomSetting | null>(null)

  // 入力状態
  const [seriesId, setSeriesId] = useState('')
  const [tsubo, setTsubo] = useState(30)

  // 変動費の選択（variationType.id → 選択したitemのid）
  const [variationSelections, setVariationSelections] = useState<Record<string, string>>({})
  // 吹き抜け
  const [atriumIndex, setAtriumIndex] = useState(0)
  // 部屋数
  const [floor1Rooms, setFloor1Rooms] = useState(0)
  const [floor2Rooms, setFloor2Rooms] = useState(0)

  // オプション（itemId → boolean）
  const [optionSelections, setOptionSelections] = useState<Record<string, boolean>>({})

  // セクションB, C(other), D の金額（編集可能）
  const [sectionBAmounts, setSectionBAmounts] = useState<Record<string, number>>({})
  const [sectionCOtherAmounts, setSectionCOtherAmounts] = useState<Record<string, number>>({})
  const [sectionDAmounts, setSectionDAmounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/estimates/master')
      .then(res => res.json())
      .then(data => {
        setSeriesList(data.series || [])
        setTsuboCoefs(data.tsuboCoefficients || [])
        setVariationTypes(data.variationTypes || [])
        setOptionCategories(data.optionCategories || [])
        setInitialSettings(data.initialSettings || [])
        setAtriumPrices(data.atriumPrices || [])
        setRoomSetting(data.roomSetting || null)

        // 初期設定の金額をセット
        const bAmounts: Record<string, number> = {}
        const cAmounts: Record<string, number> = {}
        const dAmounts: Record<string, number> = {}
        ;(data.initialSettings || []).forEach((s: ISetting) => {
          if (s.section === 'B') bAmounts[s.id] = s.defaultAmount
          if (s.section === 'C') cAmounts[s.id] = s.defaultAmount
          if (s.section === 'D') dAmounts[s.id] = s.defaultAmount
        })
        setSectionBAmounts(bAmounts)
        setSectionCOtherAmounts(cAmounts)
        setSectionDAmounts(dAmounts)

        if (data.series?.length) setSeriesId(data.series[0].id)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // ===== 計算 =====
  const selectedSeries = seriesList.find(s => s.id === seriesId)
  const tsuboCoef = tsuboCoefs.find(c => c.tsubo === tsubo)?.coefficient || 1.0

  // A: 基本本体価格
  const sectionA = selectedSeries ? Math.round(selectedSeries.basePrice * tsuboCoef) : 0

  // B: 付帯工事費
  const settingsB = initialSettings.filter(s => s.section === 'B')
  const sectionB = settingsB.reduce((sum, s) => sum + (sectionBAmounts[s.id] ?? s.defaultAmount), 0)

  // C-1: 変動費
  const calcVariations = () => {
    let total = 0
    const items: { itemType: string; itemName: string; cost: number; price: number }[] = []

    variationTypes.forEach(vt => {
      const selectedId = variationSelections[vt.id]
      if (selectedId) {
        const item = vt.items.find(i => i.id === selectedId)
        if (item) {
          total += item.price
          items.push({ itemType: vt.slug, itemName: item.name, cost: item.cost, price: item.price })
        }
      }
    })

    // 吹き抜け
    if (atriumPrices[atriumIndex] && atriumIndex > 0) {
      const a = atriumPrices[atriumIndex]
      total += a.price
      items.push({ itemType: 'atrium', itemName: `吹き抜け（${a.label}）`, cost: a.cost, price: a.price })
    }

    // 部屋数追加
    if (roomSetting) {
      if (floor1Rooms > 0) {
        const p = floor1Rooms * roomSetting.floor1UnitPrice
        const c = floor1Rooms * roomSetting.floor1UnitCost
        total += p
        items.push({ itemType: 'room_floor1', itemName: `1階 +${floor1Rooms}部屋`, cost: c, price: p })
      }
      if (floor2Rooms > 0) {
        const p = floor2Rooms * roomSetting.floor2UnitPrice
        const c = floor2Rooms * roomSetting.floor2UnitCost
        total += p
        items.push({ itemType: 'room_floor2', itemName: `2階 +${floor2Rooms}部屋`, cost: c, price: p })
      }
    }

    return { total, items }
  }

  // C-2: オプション
  const calcOptions = () => {
    let total = 0
    const items: { categoryId: string; itemId: string; cost: number; price: number }[] = []

    optionCategories.forEach(cat => {
      cat.items.forEach(item => {
        if (optionSelections[item.id]) {
          total += item.price
          items.push({ categoryId: cat.id, itemId: item.id, cost: item.cost, price: item.price })
        }
      })
    })

    return { total, items }
  }

  // C-3: その他工事費
  const settingsCOther = initialSettings.filter(s => s.section === 'C')
  const sectionCOther = settingsCOther.reduce((sum, s) => sum + (sectionCOtherAmounts[s.id] ?? s.defaultAmount), 0)

  // D: その他諸費用
  const settingsD = initialSettings.filter(s => s.section === 'D')
  const sectionD = settingsD.reduce((sum, s) => sum + (sectionDAmounts[s.id] ?? s.defaultAmount), 0)

  const variationCalc = calcVariations()
  const optionCalc = calcOptions()

  const sectionCVariation = variationCalc.total
  const sectionCOption = optionCalc.total
  const sectionC = sectionCVariation + sectionCOption + sectionCOther

  const sectionATax = Math.round(sectionA * TAX_RATE)
  const sectionBTax = Math.round(sectionB * TAX_RATE)
  const sectionCTax = Math.round(sectionC * TAX_RATE)
  const sectionDTax = Math.round(sectionD * TAX_RATE)

  const totalAmount = (sectionA + sectionATax) + (sectionB + sectionBTax) + (sectionC + sectionCTax) + (sectionD + sectionDTax)

  // ===== 保存 =====
  const handleSave = async () => {
    if (!seriesId) return
    setSaving(true)

    const body = {
      seriesId,
      tsubo,
      sectionA,
      sectionB,
      sectionCVariation,
      sectionCOption,
      sectionCOther,
      sectionD,
      variations: variationCalc.items,
      options: optionCalc.items,
      sectionBItems: settingsB.map(s => ({ itemName: s.itemName, amount: sectionBAmounts[s.id] ?? s.defaultAmount })),
      sectionCItems: settingsCOther.map(s => ({ itemName: s.itemName, amount: sectionCOtherAmounts[s.id] ?? s.defaultAmount })),
      sectionDItems: settingsD.map(s => ({ itemName: s.itemName, amount: sectionDAmounts[s.id] ?? s.defaultAmount })),
    }

    const res = await fetch('/api/estimates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      setSaving(false)
      alert('保存に失敗しました')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
  }

  if (seriesList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-gray-500 mb-4">シリーズが登録されていません。管理画面で先にマスターデータを設定してください。</p>
          <Button onClick={() => router.push('/admin/series')}>シリーズ管理へ</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">見積シミュレーション</h1>

        <div className="space-y-6">
          {/* ===== セクションA: 基本本体価格 ===== */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-blue-700 mb-4">A. 基本本体価格</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">シリーズ</label>
                <select value={seriesId} onChange={e => setSeriesId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  {seriesList.map(s => <option key={s.id} value={s.id}>{s.name}（¥{fmt(s.basePrice)}）</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">坪数</label>
                <div className="flex items-center gap-2">
                  <input type="range" min={15} max={45} value={tsubo} onChange={e => setTsubo(Number(e.target.value))}
                    className="flex-1" />
                  <span className="text-lg font-bold text-gray-900 w-16 text-right">{tsubo}坪</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">係数: {tsuboCoef.toFixed(3)}</p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm text-blue-700">基本本体価格（税抜）</span>
              <span className="text-xl font-bold text-blue-700">¥{fmt(sectionA)}</span>
            </div>
          </section>

          {/* ===== セクションB: 付帯工事費 ===== */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-emerald-700 mb-4">B. 付帯工事費</h2>
            {settingsB.length === 0 ? (
              <p className="text-sm text-gray-400">初期設定で項目を追加してください</p>
            ) : (
              <div className="space-y-2">
                {settingsB.map(s => (
                  <div key={s.id} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-700 flex-1">{s.itemName}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-400">¥</span>
                      <input type="number" value={sectionBAmounts[s.id] ?? s.defaultAmount}
                        onChange={e => setSectionBAmounts({ ...sectionBAmounts, [s.id]: parseInt(e.target.value) || 0 })}
                        className="w-32 border border-gray-300 rounded px-2 py-1 text-sm text-right" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-emerald-50 rounded-lg p-3 flex justify-between items-center mt-3">
              <span className="text-sm text-emerald-700">付帯工事費 小計（税抜）</span>
              <span className="text-xl font-bold text-emerald-700">¥{fmt(sectionB)}</span>
            </div>
          </section>

          {/* ===== セクションC: オプション工事費 ===== */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-purple-700 mb-4">C. オプション工事費</h2>

            {/* C-1: 変動費 */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">C-1. 変更工事費</h3>
              {variationTypes.length === 0 && atriumPrices.length === 0 ? (
                <p className="text-sm text-gray-400">変動費タイプを登録してください</p>
              ) : (
                <div className="space-y-3">
                  {variationTypes.map(vt => (
                    <div key={vt.id} className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-32">{vt.name}</span>
                      <select
                        value={variationSelections[vt.id] || ''}
                        onChange={e => setVariationSelections({ ...variationSelections, [vt.id]: e.target.value })}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                        <option value="">変更なし</option>
                        {vt.items.map(item => (
                          <option key={item.id} value={item.id}>{item.name}（+¥{fmt(item.price)}）</option>
                        ))}
                      </select>
                    </div>
                  ))}

                  {atriumPrices.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-700 w-32">吹き抜け</span>
                      <select value={atriumIndex} onChange={e => setAtriumIndex(Number(e.target.value))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
                        {atriumPrices.map((a, i) => (
                          <option key={i} value={i}>{a.label}{a.price > 0 ? `（+¥${fmt(a.price)}）` : ''}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {roomSetting && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">1階追加部屋数</span>
                        <input type="number" min={0} max={5} value={floor1Rooms}
                          onChange={e => setFloor1Rooms(parseInt(e.target.value) || 0)}
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">2階追加部屋数</span>
                        <input type="number" min={0} max={5} value={floor2Rooms}
                          onChange={e => setFloor2Rooms(parseInt(e.target.value) || 0)}
                          className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="text-right text-sm text-gray-600 mt-2">C-1 小計: ¥{fmt(sectionCVariation)}</div>
            </div>

            {/* C-2: オプション */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">C-2. 住設オプション</h3>
              {optionCategories.length === 0 ? (
                <p className="text-sm text-gray-400">オプションカテゴリを登録してください</p>
              ) : (
                <div className="space-y-3">
                  {optionCategories.map(cat => (
                    <div key={cat.id}>
                      <p className="text-xs font-medium text-gray-500 mb-1">{cat.name}</p>
                      <div className="flex flex-wrap gap-2">
                        {cat.items.map(item => (
                          <label key={item.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${optionSelections[item.id] ? 'bg-purple-50 border-purple-300 text-purple-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                            <input type="checkbox" checked={!!optionSelections[item.id]}
                              onChange={e => setOptionSelections({ ...optionSelections, [item.id]: e.target.checked })}
                              className="sr-only" />
                            {item.name}
                            <span className="text-xs text-gray-400">+¥{fmt(item.price)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-right text-sm text-gray-600 mt-2">C-2 小計: ¥{fmt(sectionCOption)}</div>
            </div>

            {/* C-3: その他工事費 */}
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">C-3. その他工事費</h3>
              {settingsCOther.length === 0 ? (
                <p className="text-sm text-gray-400">初期設定（セクションC）で項目を追加してください</p>
              ) : (
                <div className="space-y-2">
                  {settingsCOther.map(s => (
                    <div key={s.id} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-gray-700 flex-1">{s.itemName}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-400">¥</span>
                        <input type="number" value={sectionCOtherAmounts[s.id] ?? s.defaultAmount}
                          onChange={e => setSectionCOtherAmounts({ ...sectionCOtherAmounts, [s.id]: parseInt(e.target.value) || 0 })}
                          className="w-32 border border-gray-300 rounded px-2 py-1 text-sm text-right" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-right text-sm text-gray-600 mt-2">C-3 小計: ¥{fmt(sectionCOther)}</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-3 flex justify-between items-center">
              <span className="text-sm text-purple-700">オプション工事費 小計（税抜）</span>
              <span className="text-xl font-bold text-purple-700">¥{fmt(sectionC)}</span>
            </div>
          </section>

          {/* ===== セクションD: その他諸費用 ===== */}
          <section className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-orange-700 mb-4">D. その他諸費用</h2>
            {settingsD.length === 0 ? (
              <p className="text-sm text-gray-400">初期設定（セクションD）で項目を追加してください</p>
            ) : (
              <div className="space-y-2">
                {settingsD.map(s => (
                  <div key={s.id} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-700 flex-1">{s.itemName}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-400">¥</span>
                      <input type="number" value={sectionDAmounts[s.id] ?? s.defaultAmount}
                        onChange={e => setSectionDAmounts({ ...sectionDAmounts, [s.id]: parseInt(e.target.value) || 0 })}
                        className="w-32 border border-gray-300 rounded px-2 py-1 text-sm text-right" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-orange-50 rounded-lg p-3 flex justify-between items-center mt-3">
              <span className="text-sm text-orange-700">その他諸費用 小計（税抜）</span>
              <span className="text-xl font-bold text-orange-700">¥{fmt(sectionD)}</span>
            </div>
          </section>

          {/* ===== 合計 ===== */}
          <section className="bg-white rounded-xl border-2 border-blue-200 p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">見積合計</h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">A. 基本本体価格</span><span>¥{fmt(sectionA)} <span className="text-gray-400">+ 税 ¥{fmt(sectionATax)}</span></span></div>
              <div className="flex justify-between"><span className="text-gray-600">B. 付帯工事費</span><span>¥{fmt(sectionB)} <span className="text-gray-400">+ 税 ¥{fmt(sectionBTax)}</span></span></div>
              <div className="flex justify-between"><span className="text-gray-600">C. オプション工事費</span><span>¥{fmt(sectionC)} <span className="text-gray-400">+ 税 ¥{fmt(sectionCTax)}</span></span></div>
              <div className="flex justify-between"><span className="text-gray-600">D. その他諸費用</span><span>¥{fmt(sectionD)} <span className="text-gray-400">+ 税 ¥{fmt(sectionDTax)}</span></span></div>
              <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                <span className="font-semibold text-gray-900">税込総額</span>
                <span className="text-2xl font-bold text-blue-700">¥{fmt(totalAmount)}</span>
              </div>
            </div>
          </section>

          {/* ===== 保存 ===== */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>キャンセル</Button>
            <Button onClick={handleSave} disabled={saving || !seriesId}>
              {saving ? '保存中...' : '見積を保存'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'
import { StepIndicator } from '@/components/estimate/step-indicator'
import { SidebarSummary } from '@/components/estimate/sidebar-summary'
import { Step1Series } from '@/components/estimate/step1-series'
import { Step2Questionnaire } from '@/components/estimate/step2-questionnaire'
import { Step3Options } from '@/components/estimate/step3-options'
import { Step4Estimate } from '@/components/estimate/step4-estimate'
import { Step5Funding } from '@/components/estimate/step5-funding'
import { AiRecommendation } from '@/components/estimate/ai-recommendation'

type Series = { id: string; name: string; description?: string; baseCost: number; marginRate: number; basePrice: number; imageUrl?: string | null }
type TsuboCoef = { tsubo: number; coefficient: number }
type VType = { id: string; slug: string; name: string; items: VItem[] }
type VItem = { id: string; name: string; cost: number; price: number; imageUrl?: string | null }
type OptCat = { id: string; name: string; items: OptItem[] }
type OptItem = { id: string; name: string; cost: number; price: number; imageUrl?: string | null }
type ISetting = { id: string; section: string; itemName: string; defaultAmount: number }
type AtriumPrice = { label: string; cost: number; price: number }
type RoomSetting = { floor1BaseRooms: number; floor1UnitCost: number; floor1UnitPrice: number; floor2UnitCost: number; floor2UnitPrice: number }
type Question = { id: string; title: string; advice: string | null; inputType: string; choices: { id: string; label: string; value: string }[] }

const TAX_RATE = 0.1
const fmt = (n: number) => n.toLocaleString()

export default function EstimateNewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const customerId = searchParams.get('customerId')
  const editId = searchParams.get('editId')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [savedEstimateId, setSavedEstimateId] = useState<string | null>(editId)

  // マスターデータ
  const [seriesList, setSeriesList] = useState<Series[]>([])
  const [tsuboCoefs, setTsuboCoefs] = useState<TsuboCoef[]>([])
  const [variationTypes, setVariationTypes] = useState<VType[]>([])
  const [optionCategories, setOptionCategories] = useState<OptCat[]>([])
  const [initialSettings, setInitialSettings] = useState<ISetting[]>([])
  const [atriumPrices, setAtriumPrices] = useState<AtriumPrice[]>([])
  const [roomSetting, setRoomSetting] = useState<RoomSetting | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])

  // Step 1 State
  const [seriesId, setSeriesId] = useState('')
  const [tsubo, setTsubo] = useState(30)
  const [variationSelections, setVariationSelections] = useState<Record<string, string>>({})
  const [atriumIndex, setAtriumIndex] = useState(0)
  const [floor1Rooms, setFloor1Rooms] = useState(0)
  const [floor2Rooms, setFloor2Rooms] = useState(0)
  const [sectionBAmounts, setSectionBAmounts] = useState<Record<string, number>>({})
  const [sectionCOtherAmounts, setSectionCOtherAmounts] = useState<Record<string, number>>({})
  const [sectionDAmounts, setSectionDAmounts] = useState<Record<string, number>>({})

  // Step 2 State
  const [answers, setAnswers] = useState<Record<string, string>>({})

  // Step 3 State (カテゴリID → 選択アイテムID)
  const [optionSelections, setOptionSelections] = useState<Record<string, string>>({})

  // マスターデータ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/estimates/master')
        const data = await res.json()
        setSeriesList(data.series || [])
        setTsuboCoefs(data.tsuboCoefficients || [])
        setVariationTypes(data.variationTypes || [])
        setOptionCategories(data.optionCategories || [])
        setInitialSettings(data.initialSettings || [])
        setAtriumPrices(data.atriumPrices || [])
        setRoomSetting(data.roomSetting || null)
        setQuestions(data.questions || [])

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

        // オプションのデフォルト選択（各カテゴリの最初のアイテム＝標準仕様）
        const defaultOpts: Record<string, string> = {}
        ;(data.optionCategories || []).forEach((cat: OptCat) => {
          if (cat.items.length > 0) {
            // price=0の最初のアイテムを標準として選択、なければ最初のアイテム
            const stdItem = cat.items.find(i => i.price === 0) || cat.items[0]
            defaultOpts[cat.id] = stdItem.id
          }
        })
        setOptionSelections(defaultOpts)

        // 変動費のデフォルト選択（各タイプの最初のアイテム）
        const defaultVars: Record<string, string> = {}
        ;(data.variationTypes || []).forEach((vt: VType) => {
          if (vt.items.length > 0) {
            const stdItem = vt.items.find(i => i.price === 0) || vt.items[0]
            defaultVars[vt.id] = stdItem.id
          }
        })
        setVariationSelections(defaultVars)

        // 編集モードの場合、既存データをロード
        if (editId) {
          const editRes = await fetch(`/api/estimates/${editId}`)
          if (editRes.ok) {
            const est = await editRes.json()
            setSeriesId(est.seriesId)
            setTsubo(est.tsubo)
            // 変動費の復元
            const vSel: Record<string, string> = {}
            est.variations?.forEach((v: { itemType: string; itemName: string }) => {
              const vType = (data.variationTypes || []).find((vt: VType) => vt.slug === v.itemType)
              if (vType) {
                const item = vType.items.find((i: VItem) => i.name === v.itemName)
                if (item) vSel[vType.id] = item.id
              }
            })
            setVariationSelections(vSel)
            // オプションの復元（排他選択: カテゴリID → アイテムID）
            const oSel: Record<string, string> = {}
            est.options?.forEach((o: { categoryId: string; itemId: string }) => {
              oSel[o.categoryId] = o.itemId
            })
            setOptionSelections(oSel)
            // セクション金額の復元
            const bAmt: Record<string, number> = {}
            est.sectionBItems?.forEach((item: { itemName: string; amount: number }) => {
              const setting = (data.initialSettings || []).find((s: ISetting) => s.section === 'B' && s.itemName === item.itemName)
              if (setting) bAmt[setting.id] = item.amount
            })
            if (Object.keys(bAmt).length) setSectionBAmounts({ ...bAmounts, ...bAmt })
            // アンケートの復元
            const ans: Record<string, string> = {}
            est.answers?.forEach((a: { questionId: string; choiceValue: string }) => {
              ans[a.questionId] = a.choiceValue
            })
            setAnswers(ans)
          }
        }

        setLoading(false)
      } catch {
        setLoading(false)
      }
    }
    fetchData()
  }, [editId])

  // ===== 計算 =====
  const selectedSeries = seriesList.find(s => s.id === seriesId)
  const tsuboCoef = tsuboCoefs.find(c => c.tsubo === tsubo)?.coefficient || 1.0

  const sectionA = selectedSeries ? Math.round(selectedSeries.basePrice * tsuboCoef) : 0

  const settingsB = initialSettings.filter(s => s.section === 'B')
  const sectionB = settingsB.reduce((sum, s) => sum + (sectionBAmounts[s.id] ?? s.defaultAmount), 0)

  const calcVariations = () => {
    let total = 0
    const items: { itemType: string; itemName: string; cost: number; price: number }[] = []
    variationTypes.forEach(vt => {
      const selectedVId = variationSelections[vt.id]
      if (selectedVId) {
        const item = vt.items.find(i => i.id === selectedVId)
        if (item) {
          total += item.price
          items.push({ itemType: vt.slug, itemName: item.name, cost: item.cost, price: item.price })
        }
      }
    })
    if (atriumPrices[atriumIndex] && atriumIndex > 0) {
      const a = atriumPrices[atriumIndex]
      total += a.price
      items.push({ itemType: 'atrium', itemName: `吹き抜け（${a.label}）`, cost: a.cost, price: a.price })
    }
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

  const calcOptions = () => {
    let total = 0
    const items: { categoryId: string; itemId: string; cost: number; price: number }[] = []
    optionCategories.forEach(cat => {
      const selectedItemId = optionSelections[cat.id]
      if (selectedItemId) {
        const item = cat.items.find(i => i.id === selectedItemId)
        if (item && item.price !== 0) {
          total += item.price
          items.push({ categoryId: cat.id, itemId: item.id, cost: item.cost, price: item.price })
        }
      }
    })
    return { total, items }
  }

  const settingsCOther = initialSettings.filter(s => s.section === 'C')
  const sectionCOther = settingsCOther.reduce((sum, s) => sum + (sectionCOtherAmounts[s.id] ?? s.defaultAmount), 0)
  const settingsD = initialSettings.filter(s => s.section === 'D')
  const sectionD = settingsD.reduce((sum, s) => sum + (sectionDAmounts[s.id] ?? s.defaultAmount), 0)

  const variationCalc = calcVariations()
  const optionCalc = calcOptions()
  const sectionCVariation = variationCalc.total
  const sectionCOption = optionCalc.total
  const sectionC = sectionCVariation + sectionCOption + sectionCOther

  // ===== ステップ遷移 =====
  const handleNext = () => {
    if (currentStep === 2) {
      // アンケート後→AI推薦パネル表示
      setShowAiPanel(true)
      return
    }
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleAiClose = () => {
    setShowAiPanel(false)
    setCurrentStep(3) // オプション選択へ
  }

  const handleAiApply = (selections: Record<string, boolean>) => {
    // AI推薦はRecord<string, boolean>（itemId→true）で返す。排他選択に変換する
    const newSel = { ...optionSelections }
    optionCategories.forEach(cat => {
      cat.items.forEach(item => {
        if (selections[item.id]) {
          newSel[cat.id] = item.id
        }
      })
    })
    setOptionSelections(newSel)
    setShowAiPanel(false)
    setCurrentStep(3)
  }

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
      customerId: customerId || undefined,
      answers: Object.entries(answers).map(([questionId, choiceValue]) => ({ questionId, choiceValue })),
    }

    try {
      if (editId || savedEstimateId) {
        // 編集モード: PATCH
        const targetId = editId || savedEstimateId
        const res = await fetch(`/api/estimates/${targetId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          setSaving(false)
          setSavedEstimateId(targetId)
          setCurrentStep(5) // 資金計画書へ
        } else {
          setSaving(false)
          alert('更新に失敗しました')
        }
      } else {
        // 新規作成: POST
        const res = await fetch('/api/estimates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          const created = await res.json()
          setSaving(false)
          setSavedEstimateId(created.id)
          setCurrentStep(5) // 資金計画書へ
        } else {
          setSaving(false)
          alert('保存に失敗しました')
        }
      }
    } catch {
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

  const seriesName = selectedSeries?.name || ''

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {editId ? '見積編集' : '見積シミュレーション'}
          </h1>
        </div>

        <StepIndicator currentStep={currentStep} />

        <div className="flex gap-6">
          {/* メインコンテンツ */}
          <div className="flex-1 min-w-0">
            {currentStep === 1 && (
              <Step1Series
                seriesList={seriesList} tsuboCoefs={tsuboCoefs} variationTypes={variationTypes}
                atriumPrices={atriumPrices} roomSetting={roomSetting} initialSettings={initialSettings}
                seriesId={seriesId} setSeriesId={setSeriesId}
                tsubo={tsubo} setTsubo={setTsubo}
                variationSelections={variationSelections} setVariationSelections={setVariationSelections}
                atriumIndex={atriumIndex} setAtriumIndex={setAtriumIndex}
                floor1Rooms={floor1Rooms} setFloor1Rooms={setFloor1Rooms}
                floor2Rooms={floor2Rooms} setFloor2Rooms={setFloor2Rooms}
                sectionBAmounts={sectionBAmounts} setSectionBAmounts={setSectionBAmounts}
                sectionCOtherAmounts={sectionCOtherAmounts} setSectionCOtherAmounts={setSectionCOtherAmounts}
                sectionDAmounts={sectionDAmounts} setSectionDAmounts={setSectionDAmounts}
                sectionA={sectionA} tsuboCoef={tsuboCoef}
              />
            )}
            {currentStep === 2 && (
              <Step2Questionnaire
                questions={questions}
                answers={answers}
                setAnswers={setAnswers}
              />
            )}
            {currentStep === 3 && (
              <Step3Options
                optionCategories={optionCategories}
                optionSelections={optionSelections}
                setOptionSelections={setOptionSelections}
                sectionCOption={sectionCOption}
              />
            )}
            {currentStep === 4 && (
              <Step4Estimate
                sectionA={sectionA} sectionB={sectionB}
                sectionCVariation={sectionCVariation} sectionCOption={sectionCOption} sectionCOther={sectionCOther}
                sectionD={sectionD} seriesName={seriesName} tsubo={tsubo}
              />
            )}
            {currentStep === 5 && (
              <Step5Funding
                estimateId={savedEstimateId}
                sectionA={sectionA}
                sectionB={sectionB}
                sectionC={sectionC}
                sectionD={sectionD}
              />
            )}

            {/* ナビゲーションボタン */}
            <div className="flex justify-between items-center mt-6">
              <div>
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handlePrev}>
                    <Icons.arrowLeft className="w-4 h-4 mr-1" />前へ
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => router.push('/dashboard')}>キャンセル</Button>
                {currentStep === 4 ? (
                  <Button onClick={handleSave} disabled={saving || !seriesId}>
                    {saving ? '保存中...' : editId ? '見積を更新' : '見積を保存'}
                  </Button>
                ) : currentStep === 5 ? (
                  savedEstimateId && (
                    <Button onClick={() => router.push(`/estimate/${savedEstimateId}`)}>
                      見積詳細へ<Icons.arrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )
                ) : (
                  <Button onClick={handleNext}>
                    次へ<Icons.arrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <SidebarSummary
              seriesName={seriesName}
              tsubo={tsubo}
              sectionA={sectionA}
              sectionB={sectionB}
              sectionC={sectionC}
              sectionD={sectionD}
            />
          </div>
        </div>
      </div>

      {/* AI推薦パネル */}
      <AiRecommendation
        show={showAiPanel}
        onClose={handleAiClose}
        onApply={handleAiApply}
        seriesName={seriesName}
        tsubo={tsubo}
        answers={answers}
        questions={questions}
        optionCategories={optionCategories}
      />
    </div>
  )
}

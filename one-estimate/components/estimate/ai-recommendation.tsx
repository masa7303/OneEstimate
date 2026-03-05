'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

type AiResult = {
  summary: string
  tags: string[]
  recommendations: { categoryId: string; itemIndex: number; reason: string }[]
}

type OptCat = { id: string; name: string; items: { id: string; name: string; price: number }[] }

type Props = {
  show: boolean
  onClose: () => void
  onApply: (selections: Record<string, boolean>) => void
  seriesName: string
  tsubo: number
  answers: Record<string, string>
  questions: { id: string; title: string; choices: { value: string; label: string }[] }[]
  optionCategories: OptCat[]
}

export function AiRecommendation({ show, onClose, onApply, seriesName, tsubo, answers, questions, optionCategories }: Props) {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AiResult | null>(null)

  useEffect(() => {
    if (!show) return
    setLoading(true)
    setProgress(0)
    setResult(null)

    // プログレスバー演出
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 3, 90))
    }, 100)

    const answersList = questions
      .filter(q => answers[q.id])
      .map(q => {
        const choice = q.choices.find(c => c.value === answers[q.id])
        return { questionTitle: q.title, choiceValue: choice?.label || answers[q.id] }
      })

    fetch('/api/ai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seriesName,
        tsubo,
        answers: answersList,
        optionCategories: optionCategories.map(c => ({
          id: c.id,
          name: c.name,
          items: c.items.map(i => ({ id: i.id, name: i.name, price: i.price })),
        })),
      }),
    })
      .then(res => res.json())
      .then(data => {
        clearInterval(interval)
        setProgress(100)
        setTimeout(() => {
          setResult(data)
          setLoading(false)
        }, 300)
      })
      .catch(() => {
        clearInterval(interval)
        setProgress(100)
        setLoading(false)
      })

    return () => clearInterval(interval)
  }, [show, seriesName, tsubo, answers, questions, optionCategories])

  if (!show) return null

  const handleApply = () => {
    if (!result) return
    const selections: Record<string, boolean> = {}
    result.recommendations.forEach(rec => {
      const cat = optionCategories.find(c => c.id === rec.categoryId)
      if (cat && cat.items[rec.itemIndex]) {
        selections[cat.items[rec.itemIndex].id] = true
      }
    })
    onApply(selections)
  }

  const fmt = (n: number) => n.toLocaleString()

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl">
        {loading ? (
          <div className="p-12 text-center">
            <Icons.sparkles className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI分析中...</h3>
            <p className="text-sm text-gray-500 mb-6">アンケート回答を分析し、最適なオプションを選定しています</p>
            <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : result ? (
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icons.sparkles className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-bold text-gray-900">AIおすすめプラン</h3>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <Icons.x className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-3">{result.summary}</p>

            {result.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {result.tags.map((tag, i) => (
                  <span key={i} className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-3 mb-6">
              {result.recommendations.map((rec, i) => {
                const cat = optionCategories.find(c => c.id === rec.categoryId)
                const item = cat?.items[rec.itemIndex]
                if (!cat || !item) return null
                return (
                  <div key={i} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">{cat.name}</span>
                      <span className="text-xs font-medium text-blue-600">+¥{fmt(item.price)}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{rec.reason}</p>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>スキップ</Button>
              <Button onClick={handleApply}>
                <Icons.check className="w-4 h-4 mr-1" />おすすめを一括選択
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">推薦の取得に失敗しました</p>
            <Button variant="outline" onClick={onClose} className="mt-4">閉じる</Button>
          </div>
        )}
      </div>
    </div>
  )
}

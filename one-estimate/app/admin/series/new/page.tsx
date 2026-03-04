'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function SeriesNewPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [baseCost, setBaseCost] = useState('')
  const [marginRate, setMarginRate] = useState('22')

  const calcPrice = () => {
    const cost = parseInt(baseCost, 10)
    const rate = parseFloat(marginRate) / 100
    if (isNaN(cost) || isNaN(rate) || rate >= 1) return null
    return Math.round(cost / (1 - rate))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    const res = await fetch('/api/admin/series', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        baseCost: parseInt(baseCost, 10),
        marginRate: parseFloat(marginRate) / 100,
      }),
    })

    if (res.ok) {
      router.push('/admin/series')
    } else {
      const data = await res.json()
      setError(data.error || '保存に失敗しました')
      setSaving(false)
    }
  }

  const price = calcPrice()

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/series" className="text-gray-400 hover:text-gray-600">← 戻る</Link>
        <h1 className="text-2xl font-bold text-gray-900">シリーズ新規作成</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">シリーズ名 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例: ナチュラルスタイル"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例: 自然素材を活かしたナチュラルデザイン"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">原価（30坪基準・円） <span className="text-red-500">*</span></label>
          <input
            type="number"
            value={baseCost}
            onChange={e => setBaseCost(e.target.value)}
            required
            min={0}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例: 15000000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">粗利益率（%） <span className="text-red-500">*</span></label>
          <input
            type="number"
            value={marginRate}
            onChange={e => setMarginRate(e.target.value)}
            required
            min={0}
            max={99}
            step={0.1}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="例: 22"
          />
        </div>

        {price !== null && baseCost && (
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              販売価格（自動計算）: <span className="font-bold text-lg">¥{price.toLocaleString()}</span>
            </p>
            <p className="text-xs text-blue-500 mt-1">原価 ÷ (1 − 粗利益率) = {parseInt(baseCost).toLocaleString()} ÷ {(1 - parseFloat(marginRate) / 100).toFixed(4)}</p>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? '保存中...' : '作成'}
          </Button>
          <Link href="/admin/series">
            <Button type="button" variant="outline">キャンセル</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}

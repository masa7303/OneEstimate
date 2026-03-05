'use client'

import { useEffect, useState } from 'react'

type Stats = {
  series: number
  optionCategories: number
  questions: number
  customers: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [demoLoading, setDemoLoading] = useState<'insert' | 'delete' | null>(null)
  const [demoMessage, setDemoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadStats = () => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {})
  }

  useEffect(() => { loadStats() }, [])

  const handleDemoInsert = async () => {
    if (!confirm('デモデータを投入します。既存のマスターデータがある場合は重複する可能性があります。続行しますか？')) return
    setDemoLoading('insert')
    setDemoMessage(null)
    try {
      const res = await fetch('/api/admin/demo-seed', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setDemoMessage({ type: 'success', text: data.message || 'デモデータを投入しました' })
        loadStats()
      } else {
        setDemoMessage({ type: 'error', text: data.error || '投入に失敗しました' })
      }
    } catch {
      setDemoMessage({ type: 'error', text: '通信エラーが発生しました' })
    } finally {
      setDemoLoading(null)
    }
  }

  const handleDemoDelete = async () => {
    if (!confirm('デモデータを含む全てのマスターデータ・見積・顧客データを削除します。この操作は取り消せません。本当に削除しますか？')) return
    setDemoLoading('delete')
    setDemoMessage(null)
    try {
      const res = await fetch('/api/admin/demo-seed', { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setDemoMessage({ type: 'success', text: data.message || 'データを削除しました' })
        loadStats()
      } else {
        setDemoMessage({ type: 'error', text: data.error || '削除に失敗しました' })
      }
    } catch {
      setDemoMessage({ type: 'error', text: '通信エラーが発生しました' })
    } finally {
      setDemoLoading(null)
    }
  }

  const cards = [
    { label: 'シリーズ', value: stats?.series ?? '-', color: 'from-blue-500 to-blue-600' },
    { label: 'オプションカテゴリ', value: stats?.optionCategories ?? '-', color: 'from-emerald-500 to-emerald-600' },
    { label: 'アンケート', value: stats?.questions ?? '-', color: 'from-purple-500 to-purple-600' },
    { label: '顧客', value: stats?.customers ?? '-', color: 'from-orange-500 to-orange-600' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">管理ダッシュボード</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className="text-3xl font-bold">
              <span className={`bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                {card.value}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* デモデータ管理 */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">デモデータ管理</h2>
        <p className="text-sm text-gray-500 mb-4">
          デモ用のマスターデータ（シリーズ4種・オプション52項目・アンケート12問・坪数係数・変動費・初期設定・会社情報）を一括投入・削除できます。
        </p>

        {demoMessage && (
          <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            demoMessage.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {demoMessage.text}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleDemoInsert}
            disabled={demoLoading !== null}
            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {demoLoading === 'insert' ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                投入中...
              </span>
            ) : 'デモデータ投入'}
          </button>
          <button
            onClick={handleDemoDelete}
            disabled={demoLoading !== null}
            className="px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {demoLoading === 'delete' ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                削除中...
              </span>
            ) : '全データ削除'}
          </button>
        </div>
      </div>
    </div>
  )
}

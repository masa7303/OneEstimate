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

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {})
  }, [])

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
    </div>
  )
}

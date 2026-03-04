'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Series = {
  id: string
  name: string
  description: string | null
  baseCost: number
  marginRate: number
  basePrice: number
  sortOrder: number
}

export default function SeriesListPage() {
  const [list, setList] = useState<Series[]>([])
  const [loading, setLoading] = useState(true)

  const fetchList = () => {
    fetch('/api/admin/series')
      .then(res => res.json())
      .then(data => { setList(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchList() }, [])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await fetch(`/api/admin/series/${id}`, { method: 'DELETE' })
    fetchList()
  }

  const fmt = (n: number) => n.toLocaleString()

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">シリーズ管理</h1>
        <Link href="/admin/series/new">
          <Button>新規作成</Button>
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          シリーズがまだ登録されていません
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">シリーズ名</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">原価（30坪）</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">粗利益率</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">販売価格（30坪）</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{s.name}</div>
                    {s.description && <div className="text-xs text-gray-500 mt-0.5">{s.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">¥{fmt(s.baseCost)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{(s.marginRate * 100).toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">¥{fmt(s.basePrice)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/series/${s.id}/edit`}>
                        <Button variant="outline" size="sm">編集</Button>
                      </Link>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id, s.name)}>
                        削除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type VType = {
  id: string
  name: string
  slug: string
  sortOrder: number
  _count: { items: number }
}

export default function VariationsListPage() {
  const [list, setList] = useState<VType[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [error, setError] = useState('')

  const fetchList = () => {
    fetch('/api/admin/variations')
      .then(res => res.json())
      .then(data => { setList(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchList() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!formName.trim() || !formSlug.trim()) return
    const res = await fetch('/api/admin/variations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formName.trim(), slug: formSlug.trim() }),
    })
    if (res.ok) {
      setFormName(''); setFormSlug(''); setShowForm(false)
      fetchList()
    } else {
      const data = await res.json()
      setError(data.error || '作成に失敗しました')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」とその中のアイテムをすべて削除しますか？`)) return
    await fetch(`/api/admin/variations/${id}`, { method: 'DELETE' })
    fetchList()
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">変動費管理</h1>
        {!showForm && <Button onClick={() => setShowForm(true)}>タイプ追加</Button>}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">表示名 *</label>
              <input type="text" value={formName} onChange={e => setFormName(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 間取り変更" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">スラッグ（英字） *</label>
              <input type="text" value={formSlug} onChange={e => setFormSlug(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: layout" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm">作成</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); setError('') }}>キャンセル</Button>
          </div>
        </form>
      )}

      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          変動費タイプがまだ登録されていません
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-900">{t.name}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{t.slug}</span>
                <span className="text-xs text-gray-400">{t._count.items}件</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/variations/${t.id}`}>
                  <Button variant="outline" size="sm">アイテム管理</Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(t.id, t.name)}>削除</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

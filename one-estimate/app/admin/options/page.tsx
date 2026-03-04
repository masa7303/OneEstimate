'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Category = {
  id: string
  name: string
  sortOrder: number
  _count: { items: number }
}

export default function OptionsListPage() {
  const [list, setList] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const fetchList = () => {
    fetch('/api/admin/options')
      .then(res => res.json())
      .then(data => { setList(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchList() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    await fetch('/api/admin/options', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    setNewName('')
    fetchList()
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    await fetch(`/api/admin/options/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    setEditId(null)
    fetchList()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」とその中のアイテムをすべて削除しますか？`)) return
    await fetch(`/api/admin/options/${id}`, { method: 'DELETE' })
    fetchList()
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">オプション管理</h1>

      {/* カテゴリ追加フォーム */}
      <form onSubmit={handleCreate} className="flex gap-3 mb-6">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="新しいカテゴリ名（例: キッチン）"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Button type="submit" disabled={!newName.trim()}>追加</Button>
      </form>

      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          カテゴリがまだ登録されていません
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((cat) => (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {editId === cat.id ? (
                  <div className="flex gap-2 flex-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleUpdate(cat.id)}
                      autoFocus
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button size="sm" onClick={() => handleUpdate(cat.id)}>保存</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditId(null)}>取消</Button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium text-gray-900">{cat.name}</span>
                    <span className="text-xs text-gray-400">{cat._count.items}件</span>
                  </>
                )}
              </div>
              {editId !== cat.id && (
                <div className="flex gap-2 ml-4">
                  <Link href={`/admin/options/${cat.id}`}>
                    <Button variant="outline" size="sm">アイテム管理</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => { setEditId(cat.id); setEditName(cat.name) }}>
                    名前変更
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(cat.id, cat.name)}>
                    削除
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

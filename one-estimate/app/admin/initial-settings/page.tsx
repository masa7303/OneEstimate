'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type Setting = {
  id: string
  section: string
  itemName: string
  defaultAmount: number
  isVisible: boolean
}

const SECTIONS = [
  { value: 'B', label: 'B: 付帯工事費' },
  { value: 'C', label: 'C: その他工事費' },
  { value: 'D', label: 'D: その他諸費用' },
]

export default function InitialSettingsPage() {
  const [list, setList] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const [formSection, setFormSection] = useState('B')
  const [formName, setFormName] = useState('')
  const [formAmount, setFormAmount] = useState('')

  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')

  const fetchList = () => {
    fetch('/api/admin/initial-settings')
      .then(res => res.json())
      .then(data => { setList(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchList() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/admin/initial-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: formSection, itemName: formName, defaultAmount: formAmount }),
    })
    if (res.ok) {
      setFormName(''); setFormAmount(''); setShowForm(false)
      fetchList()
    } else {
      const data = await res.json()
      setError(data.error || '作成に失敗しました')
    }
  }

  const handleUpdate = async (id: string) => {
    await fetch(`/api/admin/initial-settings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemName: editName, defaultAmount: editAmount }),
    })
    setEditId(null)
    fetchList()
  }

  const handleToggle = async (s: Setting) => {
    await fetch(`/api/admin/initial-settings/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isVisible: !s.isVisible }),
    })
    fetchList()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await fetch(`/api/admin/initial-settings/${id}`, { method: 'DELETE' })
    fetchList()
  }

  const fmt = (n: number) => n.toLocaleString()

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
  }

  const grouped = SECTIONS.map(s => ({
    ...s,
    items: list.filter(i => i.section === s.value),
  }))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">初期設定</h1>
        {!showForm && <Button onClick={() => setShowForm(true)}>項目追加</Button>}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">セクション *</label>
              <select value={formSection} onChange={e => setFormSection(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">項目名 *</label>
              <input type="text" value={formName} onChange={e => setFormName(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 地盤改良費" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">初期金額（税抜・円）</label>
              <input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} min={0}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0" />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm">追加</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); setError('') }}>キャンセル</Button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {grouped.map(g => (
          <div key={g.value}>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{g.label}</h2>
            {g.items.length === 0 ? (
              <p className="text-sm text-gray-400 ml-2">まだ項目がありません</p>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium text-gray-600">項目名</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">初期金額</th>
                      <th className="text-center px-4 py-2 font-medium text-gray-600">表示</th>
                      <th className="text-right px-4 py-2 font-medium text-gray-600">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map(item => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        {editId === item.id ? (
                          <>
                            <td className="px-4 py-2">
                              <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                            </td>
                            <td className="px-4 py-2">
                              <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)}
                                className="w-32 border border-gray-300 rounded px-2 py-1 text-sm text-right" />
                            </td>
                            <td />
                            <td className="px-4 py-2 text-right">
                              <div className="flex justify-end gap-1">
                                <Button size="sm" onClick={() => handleUpdate(item.id)}>保存</Button>
                                <Button size="sm" variant="outline" onClick={() => setEditId(null)}>取消</Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2 text-gray-900">{item.itemName}</td>
                            <td className="px-4 py-2 text-right text-gray-700">¥{fmt(item.defaultAmount)}</td>
                            <td className="px-4 py-2 text-center">
                              <button onClick={() => handleToggle(item)}
                                className={`w-8 h-5 rounded-full transition-colors ${item.isVisible ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                <span className={`block w-3.5 h-3.5 bg-white rounded-full transition-transform ${item.isVisible ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                              </button>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => { setEditId(item.id); setEditName(item.itemName); setEditAmount(String(item.defaultAmount)) }}>編集</Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id, item.itemName)}>削除</Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ui/image-upload'

type VItem = {
  id: string
  name: string
  description: string | null
  cost: number
  price: number
  imageUrl: string | null
  sortOrder: number
}

type VType = { id: string; name: string; slug: string }

export default function VariationItemsPage() {
  const { id } = useParams<{ id: string }>()
  const [type, setType] = useState<VType | null>(null)
  const [items, setItems] = useState<VItem[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formCost, setFormCost] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formImageUrl, setFormImageUrl] = useState<string | null>(null)

  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editCost, setEditCost] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null)

  const fetchItems = () => {
    fetch(`/api/admin/variations/${id}/items`)
      .then(res => res.json())
      .then(data => { setType(data.type); setItems(data.items || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchItems() }, [id])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return
    await fetch(`/api/admin/variations/${id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formName, description: formDesc, cost: formCost, price: formPrice, imageUrl: formImageUrl }),
    })
    setFormName(''); setFormDesc(''); setFormCost(''); setFormPrice(''); setFormImageUrl(null)
    setShowForm(false)
    fetchItems()
  }

  const handleUpdate = async (itemId: string) => {
    await fetch(`/api/admin/variations/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, description: editDesc, cost: editCost, price: editPrice, imageUrl: editImageUrl }),
    })
    setEditId(null)
    fetchItems()
  }

  const handleDelete = async (itemId: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await fetch(`/api/admin/variations/items/${itemId}`, { method: 'DELETE' })
    fetchItems()
  }

  const startEdit = (item: VItem) => {
    setEditId(item.id)
    setEditName(item.name)
    setEditDesc(item.description || '')
    setEditCost(String(item.cost))
    setEditPrice(String(item.price))
    setEditImageUrl(item.imageUrl || null)
  }

  const fmt = (n: number) => n.toLocaleString()

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/variations" className="text-gray-400 hover:text-gray-600">← 戻る</Link>
        <h1 className="text-2xl font-bold text-gray-900">{type?.name} のアイテム</h1>
      </div>

      {!showForm ? (
        <div className="mb-4"><Button onClick={() => setShowForm(true)}>アイテム追加</Button></div>
      ) : (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">アイテム名 *</label>
              <input type="text" value={formName} onChange={e => setFormName(e.target.value)} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: 対面キッチン変更" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">説明</label>
              <input type="text" value={formDesc} onChange={e => setFormDesc(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">原価（円）</label>
              <input type="number" value={formCost} onChange={e => setFormCost(e.target.value)} min={0}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">販売価格差額（円）</label>
              <input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} min={0}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
            </div>
          </div>
          <div className="col-span-2">
            <ImageUpload value={formImageUrl} onChange={setFormImageUrl} label="画像" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">追加</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>キャンセル</Button>
          </div>
        </form>
      )}

      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          アイテムがまだ登録されていません
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">アイテム名</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">原価</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">販売価格差額</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  {editId === item.id ? (
                    <>
                      <td className="px-4 py-2">
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                        <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="説明"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm mt-1" />
                        <div className="mt-2">
                          <ImageUpload value={editImageUrl} onChange={setEditImageUrl} label="画像" />
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" value={editCost} onChange={e => setEditCost(e.target.value)}
                          className="w-24 border border-gray-300 rounded px-2 py-1 text-sm text-right" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                          className="w-24 border border-gray-300 rounded px-2 py-1 text-sm text-right" />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" onClick={() => handleUpdate(item.id)}>保存</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditId(null)}>取消</Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.imageUrl && (
                            <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded border border-gray-200" />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">¥{fmt(item.cost)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">¥{fmt(item.price)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => startEdit(item)}>編集</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id, item.name)}>削除</Button>
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
  )
}

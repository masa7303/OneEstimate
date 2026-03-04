'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type Coef = { tsubo: number; coefficient: number }
type Atrium = { label: string; cost: number; price: number }
type Room = {
  floor1BaseRooms: number
  floor1UnitCost: number
  floor1UnitPrice: number
  floor2UnitCost: number
  floor2UnitPrice: number
}

const DEFAULT_COEFS: Coef[] = Array.from({ length: 31 }, (_, i) => {
  const t = 15 + i
  return { tsubo: t, coefficient: t === 30 ? 1.0 : 0 }
})

const DEFAULT_ATRIUM: Atrium[] = [
  { label: 'なし', cost: 0, price: 0 },
  { label: '小', cost: 0, price: 0 },
  { label: '中', cost: 0, price: 0 },
  { label: '大', cost: 0, price: 0 },
]

const DEFAULT_ROOM: Room = {
  floor1BaseRooms: 3,
  floor1UnitCost: 91000,
  floor1UnitPrice: 91000,
  floor2UnitCost: 66000,
  floor2UnitPrice: 66000,
}

export default function TsuboPage() {
  const [coefs, setCoefs] = useState<Coef[]>(DEFAULT_COEFS)
  const [atrium, setAtrium] = useState<Atrium[]>(DEFAULT_ATRIUM)
  const [room, setRoom] = useState<Room>(DEFAULT_ROOM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/tsubo')
      .then(res => res.json())
      .then(data => {
        if (data.coefficients?.length) {
          const map = new Map(data.coefficients.map((c: any) => [c.tsubo, c.coefficient]))
          setCoefs(DEFAULT_COEFS.map(d => ({ tsubo: d.tsubo, coefficient: (map.get(d.tsubo) as number) ?? d.coefficient })))
        }
        if (data.atrium?.length) setAtrium(data.atrium.map((a: any) => ({ label: a.label, cost: a.cost, price: a.price })))
        if (data.room) setRoom(data.room)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const updateCoef = (i: number, val: string) => {
    const next = [...coefs]
    next[i] = { ...next[i], coefficient: parseFloat(val) || 0 }
    setCoefs(next)
  }

  const updateAtrium = (i: number, field: keyof Atrium, val: string) => {
    const next = [...atrium]
    if (field === 'label') next[i] = { ...next[i], label: val }
    else next[i] = { ...next[i], [field]: parseInt(val, 10) || 0 }
    setAtrium(next)
  }

  const updateRoom = (field: keyof Room, val: string) => {
    setRoom({ ...room, [field]: parseInt(val, 10) || 0 })
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    await fetch('/api/admin/tsubo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coefficients: coefs, atrium, room }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const fmt = (n: number) => n.toLocaleString()

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">坪数係数・追加費用設定</h1>
        <div className="flex items-center gap-3">
          {saved && <span className="text-sm text-green-600">保存しました</span>}
          <Button onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '一括保存'}</Button>
        </div>
      </div>

      {/* 坪数係数 */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">坪数係数（30坪 = 1.000 基準）</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-px bg-gray-200">
            {coefs.map((c, i) => (
              <div key={c.tsubo} className="bg-white p-2 text-center">
                <div className={`text-xs font-medium mb-1 ${c.tsubo === 30 ? 'text-blue-600' : 'text-gray-500'}`}>
                  {c.tsubo}坪
                </div>
                <input
                  type="number"
                  value={c.coefficient || ''}
                  onChange={e => updateCoef(i, e.target.value)}
                  step={0.001}
                  min={0}
                  className={`w-full text-center border rounded px-1 py-1 text-sm ${c.tsubo === 30 ? 'border-blue-300 bg-blue-50' : 'border-gray-300'}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 吹き抜け */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">吹き抜け価格</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2 font-medium text-gray-600">ラベル</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">原価（円）</th>
                <th className="text-right px-4 py-2 font-medium text-gray-600">販売価格差額（円）</th>
              </tr>
            </thead>
            <tbody>
              {atrium.map((a, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-4 py-2">
                    <input type="text" value={a.label} onChange={e => updateAtrium(i, 'label', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-24" />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <input type="number" value={a.cost || ''} onChange={e => updateAtrium(i, 'cost', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm text-right w-28" placeholder="0" />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <input type="number" value={a.price || ''} onChange={e => updateAtrium(i, 'price', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm text-right w-28" placeholder="0" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 部屋数追加費用 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">部屋数追加費用</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">1階基準部屋数</label>
            <input type="number" value={room.floor1BaseRooms} onChange={e => updateRoom('floor1BaseRooms', e.target.value)}
              min={0} className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">1階 追加原価（円/部屋）</label>
              <input type="number" value={room.floor1UnitCost} onChange={e => updateRoom('floor1UnitCost', e.target.value)}
                min={0} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">1階 追加販売価格（円/部屋）</label>
              <input type="number" value={room.floor1UnitPrice} onChange={e => updateRoom('floor1UnitPrice', e.target.value)}
                min={0} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2階 追加原価（円/部屋）</label>
              <input type="number" value={room.floor2UnitCost} onChange={e => updateRoom('floor2UnitCost', e.target.value)}
                min={0} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2階 追加販売価格（円/部屋）</label>
              <input type="number" value={room.floor2UnitPrice} onChange={e => updateRoom('floor2UnitPrice', e.target.value)}
                min={0} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

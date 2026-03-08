'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ImageUpload } from '@/components/ui/image-upload'

export default function CompanyInfoPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [tel, setTel] = useState('')
  const [fax, setFax] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/company')
      .then(res => res.json())
      .then(data => {
        setName(data.name || '')
        setAddress(data.address || '')
        setTel(data.tel || '')
        setFax(data.fax || '')
        setEmail(data.email || '')
        setNotes(data.notes || '')
        setLogoUrl(data.logoUrl || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    await fetch('/api/admin/company', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, address, tel, fax, email, notes, logoUrl }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">会社情報</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ImageUpload value={logoUrl} onChange={setLogoUrl} label="会社ロゴ" />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">会社名</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: 株式会社サンプル工務店" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
          <input type="text" value={address} onChange={e => setAddress(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: 東京都渋谷区..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
            <input type="text" value={tel} onChange={e => setTel(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="03-1234-5678" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">FAX</label>
            <input type="text" value={fax} onChange={e => setFax(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="03-1234-5679" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="info@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">見積書備考テンプレート</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="見積書に表示する備考のテンプレート" />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
          {saved && <span className="text-sm text-green-600">保存しました</span>}
        </div>
      </form>
    </div>
  )
}

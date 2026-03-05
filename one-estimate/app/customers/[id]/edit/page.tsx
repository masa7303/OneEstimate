'use client'

import { useAuth } from '@/lib/auth/client'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

export default function CustomerEditPage() {
  const auth = useAuth()
  const user = auth.user
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    nameKana: '',
    tel: '',
    email: '',
    address: '',
    memo: '',
  })

  useEffect(() => {
    if (!user && !(auth as any).isLoading) {
      router.replace('/auth/signin')
    }
  }, [user, (auth as any).isLoading, router])

  useEffect(() => {
    if (!user) return
    fetch(`/api/customers/${customerId}`)
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then(data => {
        setForm({
          name: data.name || '',
          nameKana: data.nameKana || '',
          tel: data.tel || '',
          email: data.email || '',
          address: data.address || '',
          memo: data.memo || '',
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user, customerId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('顧客名は必須です')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || '更新に失敗しました')
        setSaving(false)
        return
      }
      router.push(`/customers/${customerId}`)
    } catch {
      setError('更新に失敗しました')
      setSaving(false)
    }
  }

  if (!user || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <Link href={`/customers/${customerId}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <Icons.arrowLeft className="w-4 h-4" />顧客詳細に戻る
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">顧客情報を編集</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">フリガナ</label>
            <input
              type="text"
              value={form.nameKana}
              onChange={e => setForm({ ...form, nameKana: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TEL</label>
              <input
                type="tel"
                value={form.tel}
                onChange={e => setForm({ ...form, tel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">メール</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea
              value={form.memo}
              onChange={e => setForm({ ...form, memo: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link href={`/customers/${customerId}`}>
              <Button type="button" variant="outline">キャンセル</Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? '保存中...' : '更新する'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}

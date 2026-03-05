'use client'

import { useAuth } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

type Customer = {
  id: string
  name: string
  nameKana: string | null
  tel: string | null
  email: string | null
  updatedAt: string
  _count: { estimates: number }
}

export default function CustomersPage() {
  const auth = useAuth()
  const user = auth.user
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    if (!user && !(auth as any).isLoading) {
      router.replace('/auth/signin')
    }
  }, [user, (auth as any).isLoading, router])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    if (!user) return
    setLoading(true)
    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    fetch(`/api/customers?${params}`)
      .then(res => res.json())
      .then(data => { setCustomers(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user, debouncedSearch])

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">顧客一覧</h1>
            <p className="text-sm text-gray-500 mt-1">{customers.length} 件の顧客</p>
          </div>
          <Link href="/customers/new">
            <Button>
              <Icons.plus className="w-4 h-4 mr-2" />新規顧客
            </Button>
          </Link>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="名前・フリガナ・電話番号で検索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : customers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Icons.users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{debouncedSearch ? '該当する顧客が見つかりません' : '顧客がまだ登録されていません'}</p>
            {!debouncedSearch && (
              <Link href="/customers/new">
                <Button>最初の顧客を登録</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">名前</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">フリガナ</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">TEL</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">見積件数</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">最終更新日</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr
                    key={c.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/customers/${c.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.nameKana || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{c.tel || '—'}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{c._count.estimates}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(c.updatedAt).toLocaleDateString('ja-JP')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}

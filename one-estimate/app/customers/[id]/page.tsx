'use client'

import { useAuth } from '@/lib/auth/client'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

type CustomerDetail = {
  id: string
  name: string
  nameKana: string | null
  tel: string | null
  email: string | null
  address: string | null
  memo: string | null
  createdAt: string
  updatedAt: string
  estimates: {
    id: string
    estimateNumber: string
    tsubo: number
    totalAmount: number
    status: string
    createdAt: string
    series: { name: string }
  }[]
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '下書き', color: 'bg-gray-100 text-gray-600' },
  SUBMITTED: { label: '提出済', color: 'bg-blue-100 text-blue-700' },
  WON: { label: '受注', color: 'bg-green-100 text-green-700' },
  LOST: { label: '失注', color: 'bg-red-100 text-red-600' },
}

export default function CustomerDetailPage() {
  const auth = useAuth()
  const user = auth.user
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
      .then(data => { setCustomer(data); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [user, customerId])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/customers/${customerId}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/customers')
      }
    } catch {
      setDeleting(false)
    }
  }

  const fmt = (n: number) => n.toLocaleString()

  if (!user || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </main>
    )
  }

  if (!customer) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 pb-8">
        <div className="max-w-5xl mx-auto px-4 text-center py-12">
          <p className="text-gray-500">顧客が見つかりません</p>
          <Link href="/customers" className="text-blue-600 hover:underline text-sm mt-2 inline-block">顧客一覧に戻る</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/customers" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <Icons.arrowLeft className="w-4 h-4" />顧客一覧に戻る
          </Link>
        </div>

        {/* 基本情報カード */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              {customer.nameKana && <p className="text-sm text-gray-500 mt-0.5">{customer.nameKana}</p>}
            </div>
            <div className="flex gap-2">
              <Link href={`/customers/${customerId}/edit`}>
                <Button variant="outline" size="sm">
                  <Icons.edit className="w-4 h-4 mr-1" />編集
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setShowDeleteDialog(true)}>
                <Icons.trash className="w-4 h-4 mr-1" />削除
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">TEL</span>
              <p className="font-medium text-gray-900 mt-0.5">{customer.tel || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">メール</span>
              <p className="font-medium text-gray-900 mt-0.5">{customer.email || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">住所</span>
              <p className="font-medium text-gray-900 mt-0.5">{customer.address || '—'}</p>
            </div>
            <div>
              <span className="text-gray-500">登録日</span>
              <p className="font-medium text-gray-900 mt-0.5">{new Date(customer.createdAt).toLocaleDateString('ja-JP')}</p>
            </div>
          </div>
          {customer.memo && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500">メモ</span>
              <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">{customer.memo}</p>
            </div>
          )}
        </div>

        {/* 見積一覧 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">見積一覧</h2>
            <Link href={`/estimate/new?customerId=${customerId}`}>
              <Button size="sm">
                <Icons.plus className="w-4 h-4 mr-1" />新規見積作成
              </Button>
            </Link>
          </div>
          {customer.estimates.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">見積がありません</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">見積番号</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">シリーズ</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">坪数</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">総額（税込）</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">ステータス</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">作成日</th>
                </tr>
              </thead>
              <tbody>
                {customer.estimates.map(est => {
                  const st = STATUS_LABELS[est.status] || STATUS_LABELS.DRAFT
                  return (
                    <tr key={est.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/estimate/${est.id}`)}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{est.estimateNumber}</td>
                      <td className="px-4 py-3 text-gray-900">{est.series.name}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{est.tsubo}坪</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">¥{fmt(est.totalAmount)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(est.createdAt).toLocaleDateString('ja-JP')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 削除確認ダイアログ */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">顧客を削除しますか？</h3>
            <p className="text-sm text-gray-600 mb-1">
              <strong>{customer.name}</strong> を削除します。
            </p>
            {customer.estimates.length > 0 && (
              <p className="text-sm text-red-600 mb-4">
                紐付いている見積 {customer.estimates.length} 件も全て削除されます。この操作は取り消せません。
              </p>
            )}
            {customer.estimates.length === 0 && (
              <p className="text-sm text-gray-500 mb-4">この操作は取り消せません。</p>
            )}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>キャンセル</Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={deleting}>
                {deleting ? '削除中...' : '削除する'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

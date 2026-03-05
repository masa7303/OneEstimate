'use client'

import { useAuth } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type Estimate = {
  id: string
  estimateNumber: string
  tsubo: number
  totalAmount: number
  status: string
  createdAt: string
  series: { name: string }
  customer: { name: string } | null
  user: { name: string | null; email: string }
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '下書き', color: 'bg-gray-100 text-gray-600' },
  SUBMITTED: { label: '提出済', color: 'bg-blue-100 text-blue-700' },
  WON: { label: '受注', color: 'bg-green-100 text-green-700' },
  LOST: { label: '失注', color: 'bg-red-100 text-red-600' },
}

export default function DashboardPage() {
  const auth = useAuth()
  const user = auth.user
  const router = useRouter()
  const [setupChecked, setSetupChecked] = useState(false)
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loadingEstimates, setLoadingEstimates] = useState(true)

  // 未ログイン時はサインインへ
  useEffect(() => {
    if (!user && !(auth as any).isLoading) {
      router.replace('/auth/signin')
    }
  }, [user, (auth as any).isLoading, router])

  // ログイン後、DB上のUserレコードがあるか確認
  useEffect(() => {
    if (!user || setupChecked) return
    let mounted = true

    const checkSetup = async () => {
      try {
        const pendingName = localStorage.getItem('pending_company_name')
        if (pendingName) {
          const res = await fetch('/api/auth/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyName: pendingName }),
          })
          if (mounted && res.ok) {
            localStorage.removeItem('pending_company_name')
            setSetupChecked(true)
            return
          }
        }
        const res = await fetch('/api/auth/me')
        if (!mounted) return
        if (res.status === 404) {
          router.replace('/onboarding')
          return
        }
        setSetupChecked(true)
      } catch {
        if (mounted) setSetupChecked(true)
      }
    }

    checkSetup()
    return () => { mounted = false }
  }, [user, setupChecked, router])

  // 見積一覧取得
  useEffect(() => {
    if (!setupChecked) return
    fetch('/api/estimates')
      .then(res => res.json())
      .then(data => { setEstimates(data); setLoadingEstimates(false) })
      .catch(() => setLoadingEstimates(false))
  }, [setupChecked])

  if (!user || !setupChecked) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </main>
    )
  }

  const fmt = (n: number) => n.toLocaleString()

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
            <p className="text-sm text-gray-500 mt-1">
              ようこそ、{user?.displayName || user?.email?.split('@')[0] || 'ユーザー'} さん
            </p>
          </div>
          <Link href="/estimate/new">
            <Button>新規見積作成</Button>
          </Link>
        </div>

        {loadingEstimates ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : estimates.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">見積がまだありません</p>
            <Link href="/estimate/new">
              <Button>最初の見積を作成</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">見積番号</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">シリーズ</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">坪数</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">総額（税込）</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">ステータス</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">顧客</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">作成日</th>
                </tr>
              </thead>
              <tbody>
                {estimates.map(est => {
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
                      <td className="px-4 py-3 text-gray-600">{est.customer?.name || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{new Date(est.createdAt).toLocaleDateString('ja-JP')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}

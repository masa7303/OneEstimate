'use client'

import { useAuth } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/ui/icons'

type Stats = {
  totalEstimates: number
  draftCount: number
  submittedCount: number
  wonCount: number
  lostCount: number
  customerCount: number
  monthlyAmount: number
}

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
  const [stats, setStats] = useState<Stats | null>(null)

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

  // 見積一覧 + 統計取得
  useEffect(() => {
    if (!setupChecked) return
    fetch('/api/estimates')
      .then(res => res.json())
      .then(data => {
        setEstimates(data)
        setLoadingEstimates(false)
        // 統計を計算
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const draftCount = data.filter((e: Estimate) => e.status === 'DRAFT').length
        const submittedCount = data.filter((e: Estimate) => e.status === 'SUBMITTED').length
        const wonCount = data.filter((e: Estimate) => e.status === 'WON').length
        const lostCount = data.filter((e: Estimate) => e.status === 'LOST').length
        const monthlyAmount = data
          .filter((e: Estimate) => new Date(e.createdAt) >= monthStart)
          .reduce((sum: number, e: Estimate) => sum + e.totalAmount, 0)
        setStats(prev => ({
          ...(prev || { customerCount: 0 }),
          totalEstimates: data.length,
          draftCount, submittedCount, wonCount, lostCount, monthlyAmount,
        }))
      })
      .catch(() => setLoadingEstimates(false))
    // 顧客数取得
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({
          ...(prev || { totalEstimates: 0, draftCount: 0, submittedCount: 0, wonCount: 0, lostCount: 0, monthlyAmount: 0 }),
          customerCount: Array.isArray(data) ? data.length : 0,
        }))
      })
      .catch(() => {})
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
          <div className="flex gap-2">
            <Link href="/customers">
              <Button variant="outline">
                <Icons.users className="w-4 h-4 mr-2" />顧客一覧
              </Button>
            </Link>
            <Link href="/estimate/new">
              <Button>新規見積作成</Button>
            </Link>
          </div>
        </div>

        {/* 統計カード */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">見積総数</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalEstimates}</div>
              <div className="flex gap-2 mt-1 text-xs">
                <span className="text-gray-500">下書き {stats.draftCount}</span>
                <span className="text-blue-600">提出済 {stats.submittedCount}</span>
                <span className="text-green-600">受注 {stats.wonCount}</span>
              </div>
            </div>
            <Link href="/customers" className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors">
              <div className="text-xs text-gray-500 mb-1">顧客数</div>
              <div className="text-2xl font-bold text-gray-900">{stats.customerCount}</div>
              <div className="text-xs text-blue-600 mt-1">一覧を表示 →</div>
            </Link>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">今月の見積金額</div>
              <div className="text-2xl font-bold text-gray-900">¥{fmt(stats.monthlyAmount)}</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">受注率</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalEstimates > 0
                  ? `${Math.round((stats.wonCount / stats.totalEstimates) * 100)}%`
                  : '—'}
              </div>
            </div>
          </div>
        )}

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

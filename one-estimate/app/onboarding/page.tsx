'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/client'

/**
 * オンボーディングページ
 * - Supabase認証済みだがDB上のUserレコードがない場合に表示
 * - 工務店名を入力してCompany + Userを作成
 * - Google OAuth経由の新規登録で使用
 */
export default function OnboardingPage() {
  const auth = useAuth()
  const user = auth.user
  const router = useRouter()
  const [companyName, setCompanyName] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // localStorageに保存された工務店名があれば自動入力
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pending_company_name')
      if (saved) setCompanyName(saved)
    } catch {}
  }, [])

  // 未ログインならサインインページへ
  useEffect(() => {
    if (!user && !(auth as any).isLoading) {
      router.replace('/auth/signin')
    }
  }, [user, (auth as any).isLoading, router])

  // localStorageに工務店名がある場合は自動でセットアップを試行
  useEffect(() => {
    if (!user) return
    let mounted = true

    const tryAutoSetup = async () => {
      try {
        const saved = localStorage.getItem('pending_company_name')
        if (!saved) return

        const res = await fetch('/api/auth/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyName: saved }),
        })
        if (!mounted) return

        if (res.ok) {
          localStorage.removeItem('pending_company_name')
          router.replace('/dashboard')
        }
      } catch {}
    }

    tryAutoSetup()
    return () => { mounted = false }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!companyName.trim()) {
      setError('工務店名を入力してください')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: companyName.trim() }),
      })

      if (res.ok) {
        try { localStorage.removeItem('pending_company_name') } catch {}
        router.replace('/dashboard')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || '登録に失敗しました')
      }
    } catch {
      setError('エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">読み込み中...</h2>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-start justify-center pt-24 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-sm">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl px-5 py-4">
          <div className="text-center mb-4">
            <h1 className="text-lg font-medium text-slate-800">
              工務店情報の登録
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              最初にご利用の工務店名を登録してください
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="companyName" className="block text-xs font-medium text-slate-600 mb-1.5">
                工務店名
              </label>
              <input
                id="companyName"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/50"
                placeholder="例: 株式会社山田工務店"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              {isLoading ? '登録中...' : '登録して始める'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

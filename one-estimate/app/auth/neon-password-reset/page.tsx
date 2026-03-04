"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useStackApp } from '@stackframe/stack'

export const dynamic = 'force-dynamic'

export default function NeonPasswordResetPage(props: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const searchParams = props.searchParams || {}
  const code = typeof searchParams.code === 'string' ? searchParams.code : ''

  const app = useStackApp()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!code) {
      setError('リセットリンクからアクセスしてください（codeが見つかりません）')
      return
    }
    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください')
      return
    }
    if (password !== confirm) {
      setError('確認用パスワードが一致しません')
      return
    }
    setIsLoading(true)
    try {
      const anyApp: any = app as any
      if (!anyApp?.resetPassword) throw new Error('resetPassword API が利用できません')
      const result = await anyApp.resetPassword({ password, code })
      if (result?.status === 'error') {
        setError(result?.error?.message || 'パスワードリセットに失敗しました')
        return
      }
      setSuccess(true)
    } catch (err: any) {
      setError(`エラーが発生しました: ${err?.message || String(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-start justify-center pt-24 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-sm">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl px-5 py-4">
          <div className="text-center mb-4">
            <h1 className="text-lg font-medium text-slate-800">パスワードをリセット</h1>
          </div>

          {!code && !success && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 mb-3">
              リセットリンクからアクセスしてください。リンクの有効期限が切れている可能性があります。
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </div>
              <p className="text-sm text-slate-700 mb-4">パスワードを更新しました。</p>
              <Link href="/auth/signin" className="px-3 py-2 rounded bg-blue-600 text-white text-sm inline-block">ログイン画面へ</Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3 stack-reset" autoComplete="on">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">新しいパスワード</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                  placeholder="8文字以上"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">新しいパスワード（確認）</label>
                <input
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/50"
                  placeholder="もう一度入力"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs" data-error>{error}</div>
              )}

              <button
                type="submit"
                disabled={isLoading || !code}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '更新中...' : 'パスワードを更新'}
              </button>

              <div className="mt-2 text-center">
                <Link href="/auth/signin" className="text-xs text-blue-600 hover:text-blue-700">← ログイン画面に戻る</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

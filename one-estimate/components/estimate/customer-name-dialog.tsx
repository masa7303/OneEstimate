'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
}

export default function CustomerNameDialog({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError('顧客名を入力してください')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onSubmit(trimmed)
    } catch {
      setError('保存に失敗しました')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">顧客名の入力</h2>
        <p className="text-sm text-gray-500 mb-4">見積書を発行するには顧客名が必要です。</p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">顧客名</label>
          <input
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError('') }}
            placeholder="例: 山田太郎"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter' && !submitting) handleSubmit() }}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            キャンセル
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '処理中...' : '発行する'}
          </Button>
        </div>
      </div>
    </div>
  )
}

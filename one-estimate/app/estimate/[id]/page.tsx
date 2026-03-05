'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import EstimateDocument from '@/components/estimate/estimate-document'
import CustomerNameDialog from '@/components/estimate/customer-name-dialog'
import type { EstimateDetail } from '@/types/estimate'

export default function EstimateDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [data, setData] = useState<EstimateDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [downloadingExcel, setDownloadingExcel] = useState(false)

  useEffect(() => {
    fetch(`/api/estimates/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('見積が見つかりません'); setLoading(false) })
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  const handleExcelDownload = async () => {
    setDownloadingExcel(true)
    try {
      const res = await fetch(`/api/estimates/${id}/excel`)
      if (!res.ok) throw new Error('Excel生成エラー')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const now = new Date()
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
      a.href = url
      a.download = `見積書_${dateStr}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      alert('Excel出力に失敗しました')
    } finally {
      setDownloadingExcel(false)
    }
  }

  const handleIssue = () => {
    if (!data) return
    if (!data.customerId) {
      setShowCustomerDialog(true)
    } else {
      issueEstimate(data.customerId)
    }
  }

  const issueEstimate = async (customerId: string) => {
    try {
      const res = await fetch(`/api/estimates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      })
      if (!res.ok) throw new Error()
      // 再取得
      const refreshRes = await fetch(`/api/estimates/${id}`)
      if (refreshRes.ok) {
        const refreshed = await refreshRes.json()
        setData(refreshed)
      }
      setShowCustomerDialog(false)
    } catch {
      alert('発行に失敗しました')
    }
  }

  const handleCustomerSubmit = async (name: string) => {
    // 顧客作成
    const cusRes = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!cusRes.ok) throw new Error('顧客作成失敗')
    const customer = await cusRes.json()
    await issueEstimate(customer.id)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{error || 'データの読み込みに失敗しました'}</p>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>ダッシュボードへ</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-100 print:bg-white">
      {/* ツールバー */}
      <div className="no-print sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
              ← 戻る
            </Button>
            <div>
              <span className="text-sm font-medium text-gray-900">{data.estimateNumber}</span>
              {data.isEstimateIssued && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  発行済
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              印刷
            </Button>
            <Button variant="outline" size="sm" onClick={handleExcelDownload} disabled={downloadingExcel}>
              {downloadingExcel ? '生成中...' : 'Excel出力'}
            </Button>
            {!data.isEstimateIssued && (
              <Button size="sm" onClick={handleIssue}>
                発行
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* プレビューエリア */}
      <div className="py-8 print:py-0">
        <div className="print:shadow-none shadow-xl mx-auto" style={{ width: '210mm' }}>
          <EstimateDocument data={data} />
        </div>
      </div>

      {/* 顧客名ダイアログ */}
      <CustomerNameDialog
        open={showCustomerDialog}
        onClose={() => setShowCustomerDialog(false)}
        onSubmit={handleCustomerSubmit}
      />
    </main>
  )
}

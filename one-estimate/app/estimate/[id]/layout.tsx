import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '見積書詳細 | OneEstimate',
  description: '見積書のプレビュー・印刷・Excel出力',
}

export default function EstimateDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/client'
import { useEffect, useState } from 'react'
import { Icons } from '@/components/ui/icons'

const navItems = [
  { href: '/admin', label: 'ダッシュボード', icon: '📊' },
  { href: '/admin/series', label: 'シリーズ管理', icon: '🏠' },
  { href: '/admin/options', label: 'オプション管理', icon: '⚙️' },
  { href: '/admin/variations', label: '変動費管理', icon: '📐' },
  { href: '/admin/questions', label: 'アンケート管理', icon: '📋' },
  { href: '/admin/initial-settings', label: '初期設定', icon: '💰' },
  { href: '/admin/company', label: '会社情報', icon: '🏢' },
  { href: '/admin/tsubo', label: '坪数係数', icon: '📏' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth()
  const user = auth.user
  const pathname = usePathname()
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!user && !(auth as any).isLoading) {
      router.replace('/auth/signin')
      return
    }
    if (!user) return

    let mounted = true
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!mounted) return
        if (data.user?.role === 'ADMIN') {
          setRole('ADMIN')
        } else {
          router.replace('/dashboard')
        }
        setChecking(false)
      })
      .catch(() => {
        if (mounted) {
          router.replace('/dashboard')
          setChecking(false)
        }
      })
    return () => { mounted = false }
  }, [user, (auth as any).isLoading, router])

  if (!user || checking || role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="flex">
        {/* サイドバー */}
        <aside className="w-56 fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 overflow-y-auto">
          <nav className="p-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* メインコンテンツ */}
        <main className="ml-56 flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

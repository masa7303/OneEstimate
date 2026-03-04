#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, 'utf8')
}

function replaceFacades(provider) {
  const base = path.join(root, 'lib', 'auth')
  const map = {
    neon: {
      client: "export { useAuth } from './impl-neon/client'\n",
      server: "export { getServerUser, requireUser, deleteUser } from './impl-neon/server'\n",
      provider: "export { AuthProvider } from './impl-neon/Provider'\n",
    },
    supabase: {
      client: "export { useAuth } from './impl-supabase/client'\n",
      server: "export { getServerUser, requireUser, deleteUser } from './impl-supabase/server'\n",
      provider: "export { AuthProvider } from './impl-supabase/Provider'\n",
    }
  }
  const target = map[provider]
  writeFile(path.join(base, 'client.ts'), target.client)
  writeFile(path.join(base, 'server.ts'), target.server)
  writeFile(path.join(base, 'Provider.tsx'), target.provider)
}

function setMiddleware(provider) {
  const file = path.join(root, 'middleware.ts')
  if (provider === 'supabase') {
    const code = `import { NextRequest, NextResponse } from 'next/server'\nimport { createServerClient } from '@supabase/ssr'\n\nexport async function middleware(req: NextRequest) {\n  const res = NextResponse.next()\n  const { pathname } = req.nextUrl\n  if (pathname.startsWith('/dashboard') || pathname.startsWith('/billing')) {\n    const url = process.env.NEXT_PUBLIC_SUPABASE_URL\n    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY\n    if (!url || !anon) return res\n    const supabase = createServerClient(url, anon, {\n      cookies: {\n        get(name: string) { return req.cookies.get(name)?.value },\n        set(name: string, value: string, options: any) { res.cookies.set({ name, value, ...options }) },\n        remove(name: string, options: any) { res.cookies.set({ name, value: '', ...options }) },\n      },\n      headers: {\n        get(name: string) { return req.headers.get(name) ?? undefined },\n        set(name: string, value: string) { res.headers.set(name, value) },\n      }\n    })\n    const { data, error } = await supabase.auth.getUser()\n    if (error || !data?.user) {\n      const redirectUrl = req.nextUrl.clone()\n      redirectUrl.pathname = '/auth/signup'\n      return NextResponse.redirect(redirectUrl)\n    }\n  }\n  return res\n}\n\nexport const config = { matcher: ['/dashboard/:path*','/billing/:path*'] }\n`
    writeFile(file, code)
  } else if (provider === 'neon') {
    const neonContent = `import { NextRequest, NextResponse } from 'next/server'\nimport { getStackServerApp } from '@/lib/stack'\n\nexport async function middleware(request: NextRequest) {\n  const { pathname, searchParams } = request.nextUrl\n  // Redirect internal password reset handler to custom page unless resuming built-in flow\n  if (pathname === '/handler/password-reset' && !searchParams.get('resume')) {\n    const u = request.nextUrl.clone()\n    u.pathname = '/auth/neon-password-reset'\n    return NextResponse.redirect(u)\n  }\n  if (pathname.startsWith('/dashboard') || pathname.startsWith('/billing')) {\n    try {\n      const app = getStackServerApp()\n      const user = await app.getUser()\n      if (!user) {\n        return NextResponse.redirect(new URL('/auth/signup', request.url))\n      }\n    } catch (error) {\n      console.warn('Stack Auth not configured, skipping auth check')\n    }\n  }\n  return NextResponse.next()\n}\n\nexport const config = { matcher: ['/dashboard/:path*','/billing/:path*','/handler/password-reset'] }\n`
    writeFile(file, neonContent)
  }
}

function writeSupabasePasswordResetPage() {
  const file = path.join(root, 'app', 'auth', 'password-reset', 'page.tsx')
  const code = `"use client"\n\nimport { useState, useEffect } from 'react'\nimport { createBrowserClient } from '@supabase/ssr'\nimport Link from 'next/link'\n\nexport default function SupabasePasswordResetPage() {\n  const [password, setPassword] = useState('')\n  const [confirm, setConfirm] = useState('')\n  const [isLoading, setIsLoading] = useState(false)\n  const [error, setError] = useState('')\n  const [success, setSuccess] = useState(false)\n  const [sessionReady, setSessionReady] = useState(false)\n\n  function getClient() {\n    const url = process.env.NEXT_PUBLIC_SUPABASE_URL\n    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY\n    if (!url || !anon) return null\n    return createBrowserClient(url, anon)\n  }\n\n  useEffect(() => {\n    let mounted = true\n    ;(async () => {\n      const client = getClient()\n      if (!client) return\n      const { data } = await client.auth.getSession()\n      if (!mounted) return\n      setSessionReady(Boolean(data.session))\n    })()\n    return () => { mounted = false }\n  }, [])\n\n  const onSubmit = async (e: React.FormEvent) => {\n    e.preventDefault()\n    setError('')\n    if (password.length < 8) {\n      setError('パスワードは8文字以上で設定してください')\n      return\n    }\n    if (password !== confirm) {\n      setError('確認用パスワードが一致しません')\n      return\n    }\n    setIsLoading(true)\n    try {\n      const client = getClient()\n      if (!client) throw new Error('SUPABASE_NOT_CONFIGURED')\n      const { error } = await client.auth.updateUser({ password })\n      if (error) {\n        setError(error.message)\n      } else {\n        setSuccess(true)\n      }\n    } catch (e: any) {\n      setError(e?.message || 'エラーが発生しました')\n    } finally {\n      setIsLoading(false)\n    }\n  }\n\n  return (\n    <main className=\"min-h-screen flex items-start justify-center pt-24 px-4 bg-gradient-to-br from-slate-50 to-blue-50\">\n      <div className=\"w-full max-w-sm\">\n        <div className=\"bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl px-5 py-4\">\n          <div className=\"text-center mb-4\">\n            <h1 className=\"text-lg font-medium text-slate-800\">パスワードをリセット</h1>\n          </div>\n\n          {!sessionReady && !success && (\n            <div className=\"p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 mb-3\">\n              リセットリンクからアクセスしてください。リンクの有効期限が切れている可能性があります。\n            </div>\n          )}\n\n          {success ? (\n            <div className=\"text-center\">\n              <div className=\"w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4\">\n                <svg className=\"w-6 h-6 text-emerald-600\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M5 13l4 4L19 7\" /></svg>\n              </div>\n              <p className=\"text-sm text-slate-700 mb-4\">パスワードを更新しました。</p>\n              <Link href=\"/dashboard\" className=\"px-3 py-2 rounded bg-blue-600 text-white text-sm inline-block\">ダッシュボードへ</Link>\n            </div>\n          ) : (\n            <form onSubmit={onSubmit} className=\"space-y-3\">\n              <div>\n                <label className=\"block text-xs font-medium text-slate-600 mb-1.5\">新しいパスワード</label>\n                <input\n                  type=\"password\"\n                  required\n                  value={password}\n                  onChange={(e) => setPassword(e.target.value)}\n                  className=\"w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/50\"\n                  placeholder=\"8文字以上\"\n                  disabled={isLoading}\n                />\n              </div>\n              <div>\n                <label className=\"block text-xs font-medium text-slate-600 mb-1.5\">新しいパスワード（確認）</label>\n                <input\n                  type=\"password\"\n                  required\n                  value={confirm}\n                  onChange={(e) => setConfirm(e.target.value)}\n                  className=\"w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white/50\"\n                  placeholder=\"もう一度入力\"\n                  disabled={isLoading}\n                />\n              </div>\n\n              {error && (\n                <div className=\"p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs\">{error}</div>\n              )}\n\n              <button\n                type=\"submit\"\n                disabled={isLoading || !sessionReady}\n                className=\"w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed\"\n              >\n                {isLoading ? '更新中...' : 'パスワードを更新'}\n              </button>\n\n              <div className=\"mt-2 text-center\">\n                <Link href=\"/auth/signin\" className=\"text-xs text-blue-600 hover:text-blue-700\">← ログイン画面に戻る</Link>\n              </div>\n            </form>\n          )}\n        </div>\n      </div>\n    </main>\n  )\n}\n`
  writeFile(file, code)
}

function writeSupabasePasswordResetPlaceholder() {
  const file = path.join(root, 'app', 'auth', 'password-reset', 'page.tsx')
  const code = `"use client"

import Link from 'next/link'

export default function SupabasePasswordResetPage() {
  return (
    <main className=\"min-h-screen flex items-start justify-center pt-24 px-4 bg-gradient-to-br from-slate-50 to-blue-50\">
      <div className=\"w-full max-w-sm\">
        <div className=\"bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl px-5 py-4\">
          <div className=\"text-center mb-4\">
            <h1 className=\"text-lg font-medium text-slate-800\">パスワードをリセット（Supabase）</h1>
          </div>
          <div className=\"p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 mb-3\">
            このページは Supabase Auth 選択時のみ有効です。Neon（StackAuth）では <code>/auth/neon-password-reset</code> を使用します。
          </div>
          <div className=\"text-center\">
            <Link href=\"/\" className=\"px-3 py-2 rounded bg-blue-600 text-white text-sm inline-block\">トップへ戻る</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
`
  writeFile(file, code)
}

function deletePathIfExists(p) {
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p)
    if (stat.isDirectory()) fs.rmSync(p, { recursive: true, force: true })
    else fs.rmSync(p)
  }
}

function cleanupFiles(provider) {
  if (provider === 'supabase') {
    // Remove Neon/Stack specific handler & stack lib
    deletePathIfExists(path.join(root, 'app', 'handler'))
    deletePathIfExists(path.join(root, 'lib', 'stack.ts'))
  } else if (provider === 'neon') {
    // Do not delete supabase impl to preserve ability to switch back quickly
  }
}

function mutateDependencies(provider) {
  const pkgFile = path.join(root, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'))
  pkg.scripts = pkg.scripts || {}
  pkg.scripts['startpack:init'] = 'node scripts/startpack-init.mjs'

  pkg.dependencies = pkg.dependencies || {}
  if (provider === 'supabase') {
    // add supabase, remove stack
    if (!pkg.dependencies['@supabase/supabase-js']) {
      pkg.dependencies['@supabase/supabase-js'] = '^2.45.0'
    }
    if (!pkg.dependencies['@supabase/ssr']) {
      pkg.dependencies['@supabase/ssr'] = '^0.5.0'
    }
    if (pkg.dependencies['@stackframe/stack']) delete pkg.dependencies['@stackframe/stack']
  } else if (provider === 'neon') {
    // remove supabase
    if (pkg.dependencies['@supabase/supabase-js']) delete pkg.dependencies['@supabase/supabase-js']
    if (pkg.dependencies['@supabase/ssr']) delete pkg.dependencies['@supabase/ssr']
    // ensure stack dependency exists
    if (!pkg.dependencies['@stackframe/stack']) {
      pkg.dependencies['@stackframe/stack'] = '^2.8.28'
    }
  }
  fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2))
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const ask = (q) => new Promise(res => rl.question(q, res))
  console.log('StartPack init: 認証プロバイダを選択してください')
  console.log('1) Neon（StackAuth）\n2) Supabase Auth')
  const ans = (await ask('番号を入力 [1/2]: ')).trim()
  const provider = ans === '2' ? 'supabase' : 'neon'
  rl.close()

  replaceFacades(provider)
  setMiddleware(provider)
  cleanupFiles(provider)
  mutateDependencies(provider)

  // Prune files of the non-selected provider for a cleaner structure
  if (provider === 'neon') {
    deletePathIfExists(path.join(root, 'lib', 'auth', 'impl-supabase'))
    deletePathIfExists(path.join(root, 'app', 'auth', 'password-reset'))
    deletePathIfExists(path.join(root, 'types', 'shims-supabase.d.ts'))
  } else if (provider === 'supabase') {
    deletePathIfExists(path.join(root, 'lib', 'auth', 'impl-neon'))
    deletePathIfExists(path.join(root, 'app', 'auth', 'neon-password-reset'))
    // Supabase では Neon 専用のルートは不要のため削除
    deletePathIfExists(path.join(root, 'app', 'api', 'auth', 'neon'))
    // Stack の型スタブも削除（参照が残っていないため）
    deletePathIfExists(path.join(root, 'types', 'shims-stack.d.ts'))
    deletePathIfExists(path.join(root, 'app', 'handler'))
  }

  // Ensure essential files for neon
  if (provider === 'neon') {
    // Restore lib/stack.ts if missing
    const stackFile = path.join(root, 'lib', 'stack.ts')
    if (!fs.existsSync(stackFile)) {
      writeFile(stackFile, `import { StackClientApp, StackServerApp } from "@stackframe/stack";\n\nfunction ensureEnv() {\n  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;\n  const publishableClientKey =\n    process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;\n  const secretServerKey = process.env.STACK_SECRET_SERVER_KEY;\n  \n  if (!projectId || !publishableClientKey || !secretServerKey) {\n    throw new Error(\n      \"Stack Auth 環境変数が未設定です。NEXT_PUBLIC_STACK_PROJECT_ID / NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY / STACK_SECRET_SERVER_KEY を設定してください。\"\n    );\n  }\n  return { projectId, publishableClientKey, secretServerKey };\n}\n\nexport function getStackClientApp() {\n  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;\n  const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;\n  \n  if (!projectId || !publishableClientKey) {\n    throw new Error(\n      \"Stack Auth クライアント環境変数が未設定です。NEXT_PUBLIC_STACK_PROJECT_ID / NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY を設定してください。\"\n    );\n  }\n  \n  return new StackClientApp({\n    projectId,\n    publishableClientKey,\n    tokenStore: \"nextjs-cookie\",\n    urls: {\n      afterSignIn: \"/dashboard\",\n      afterSignUp: \"/dashboard\",\n      afterSignOut: \"/\",\n      emailVerification: \"/auth/email-verified\",\n    },\n  });\n}\n\nexport function getStackServerApp() {\n  const { projectId, publishableClientKey, secretServerKey } = ensureEnv();\n  return new StackServerApp({\n    projectId,\n    publishableClientKey,\n    secretServerKey,\n    tokenStore: \"nextjs-cookie\",\n    urls: {\n      afterSignIn: \"/dashboard\",\n      afterSignUp: \"/dashboard\",\n      afterSignOut: \"/\",\n      emailVerification: \"/auth/email-verified\",\n    },\n  });\n}\n`)
    }
    // Restore handler route if missing
    const handlerPage = path.join(root, 'app', 'handler', '[...stack]', 'page.tsx')
    if (!fs.existsSync(handlerPage)) {
      writeFile(handlerPage, `import * as Stack from '@stackframe/stack'\nimport { getStackServerApp } from '@/lib/stack'\n\nexport default function HandlerPage(props: {\n  params: { stack?: string[] }\n  searchParams?: { [key: string]: string | string[] | undefined }\n}) {\n  const app = getStackServerApp()\n  const StackHandler: any = (Stack as any).StackHandler\n  if (typeof StackHandler === 'function') {\n    return <StackHandler app={app} fullPage routeProps={props} />\n  }\n  return null\n}\n`)
    }
  }
  
  // Ensure Supabase-specific pages when selected
  if (provider === 'supabase') {
    writeSupabasePasswordResetPage()
  }

  console.log(`\n✔ 設定完了: provider=${provider}`)
  console.log('- .env をプロバイダ別テンプレに沿って作成してください:')
  console.log('  - Neon:     cp .env.neon.example .env')
  console.log('  - Supabase: cp .env.supabase.example .env')
  console.log('- 依存をインストール: npm install')
  console.log('- Prisma マイグレーション: npx prisma migrate dev')
}

main().catch((e) => { console.error(e); process.exit(1) })

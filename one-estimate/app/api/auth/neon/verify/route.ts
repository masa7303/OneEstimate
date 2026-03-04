import { NextRequest, NextResponse } from 'next/server'
import { StackServerApp } from '@stackframe/stack'

function buildApp() {
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID
  const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
  const secretServerKey = process.env.STACK_SECRET_SERVER_KEY
  if (!projectId || !publishableClientKey || !secretServerKey) {
    throw new Error('STACK_ENV_MISSING')
  }
  return new StackServerApp({
    projectId,
    publishableClientKey,
    secretServerKey,
    tokenStore: 'nextjs-cookie',
    urls: {
      afterSignIn: '/dashboard',
      afterSignUp: '/dashboard',
      afterSignOut: '/',
      emailVerification: '/auth/email-verified',
    },
  })
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get('code') || ''
    if (!code) return NextResponse.json({ ok: false, error: 'CODE_MISSING' }, { status: 400 })
    const app = buildApp()
    const res: any = await (app as any).verifyEmail?.(code)
    if (res && res.status === 'ok') return NextResponse.json({ ok: true })
    // Gracefully treat already-used codes as success to improve UX
    const statusCode = (res as any)?.error?.statusCode || (res as any)?.statusCode
    const rawMsg = (res as any)?.error?.message || (res as any)?.error || ''
    const isAlreadyUsed = statusCode === 409 || String(rawMsg).includes('VERIFICATION_CODE_ALREADY_USED')
    if (isAlreadyUsed) {
      return NextResponse.json({ ok: true, info: 'ALREADY_VERIFIED' })
    }
    const msg = rawMsg || 'VERIFY_FAILED'
    try { console.error('[Neon verify-email] failed:', res) } catch {}
    return NextResponse.json({ ok: false, error: msg, detail: res }, { status: 400 })
  } catch (e: any) {
    const msg = e?.message || 'SERVER_ERROR'
    const status = msg === 'STACK_ENV_MISSING' ? 503 : 500
    try { console.error('[Neon verify-email] exception:', e) } catch {}
    return NextResponse.json({ ok: false, error: msg }, { status })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

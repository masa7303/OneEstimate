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

export async function POST(req: NextRequest) {
  try {
    const app = buildApp()
    const user: any = await app.getUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'NO_SESSION' }, { status: 401 })
    }

    // Build absolute callback URL for non-browser environment
    const hdrOrigin = req.headers.get('origin') || ''
    const derivedOrigin = (req.nextUrl && (req.nextUrl as any).origin) || `${req.nextUrl.protocol}//${req.nextUrl.host}`
    const origin = hdrOrigin || derivedOrigin || ''
    const callbackUrl = origin ? `${origin}/auth/email-verified` : '/auth/email-verified'

    // Try a variety of SDK shapes to send the verification email
    // 1) Direct primary email object with a send method
    try {
      const primaryEmail =
        (typeof user.getPrimaryEmail === 'function' ? await user.getPrimaryEmail() : undefined) ||
        user.primaryEmail ||
        (typeof user.getPrimaryContactChannel === 'function' ? await user.getPrimaryContactChannel('email') : undefined)
      if (primaryEmail && typeof primaryEmail.sendVerificationEmail === 'function') {
        // Try structured arg first; then fallback to positional string
        try {
          await primaryEmail.sendVerificationEmail({ callbackUrl })
        } catch (_e) {
          await primaryEmail.sendVerificationEmail(callbackUrl as any)
        }
        return NextResponse.json({ ok: true })
      }
    } catch (_) {
      // fallthrough to channel-based attempts
    }

    // 2) Enumerate contact channels and find an email channel
    const channels: any[] =
      (typeof user.getContactChannels === 'function' ? await user.getContactChannels() : undefined) ||
      (typeof user.listContactChannels === 'function' ? await user.listContactChannels() : undefined) ||
      (Array.isArray(user.contactChannels) ? user.contactChannels : [])

    if (channels && channels.length) {
      const primary = channels.find((c: any) => (c.type === 'email' || c.kind === 'email') && (c.isPrimary || c.primary))
      const anyEmail = primary || channels.find((c: any) => c.type === 'email' || c.kind === 'email')
      if (anyEmail && typeof anyEmail.sendVerificationEmail === 'function') {
        try {
          await anyEmail.sendVerificationEmail({ callbackUrl })
        } catch (_e) {
          await anyEmail.sendVerificationEmail(callbackUrl as any)
        }
        return NextResponse.json({ ok: true })
      }
    }

    // 3) Fallback to app-level helpers if available
    if (typeof (app as any).sendVerificationEmail === 'function') {
      try {
        await (app as any).sendVerificationEmail({ callbackUrl })
      } catch (_e) {
        await (app as any).sendVerificationEmail(callbackUrl)
      }
      return NextResponse.json({ ok: true })
    }
    if (typeof (app as any).resendEmailVerification === 'function') {
      try {
        await (app as any).resendEmailVerification({ callbackUrl })
      } catch (_e) {
        await (app as any).resendEmailVerification(callbackUrl)
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: false, error: 'NO_API' }, { status: 500 })
  } catch (e: any) {
    const msg = e?.message || 'UNKNOWN_ERROR'
    const status = msg === 'STACK_ENV_MISSING' ? 503 : 500
    try { console.error('[Neon resend-email] exception:', e) } catch {}
    return NextResponse.json({ ok: false, error: msg }, { status })
  }
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

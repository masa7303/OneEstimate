import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getStackServerApp } from '@/lib/stack'

function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

function hasStackEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
    process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY &&
    process.env.STACK_SECRET_SERVER_KEY
  )
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname, searchParams } = req.nextUrl

  // Neon(Stack) specific redirect: Route built-in handler to our custom page
  if (hasStackEnv() && pathname === '/handler/password-reset' && !searchParams.get('resume')) {
    const u = req.nextUrl.clone()
    u.pathname = '/auth/neon-password-reset'
    return NextResponse.redirect(u)
  }

  // Protect gated routes (Stack/Neon only). For Supabase, let pages handle auth to avoid SSR cookie mismatch.
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/estimate') || pathname.startsWith('/onboarding')) {
    if (hasStackEnv()) {
      try {
        const app = getStackServerApp() as any
        const user = await app.getUser()
        if (!user) {
          return NextResponse.redirect(new URL('/', req.url))
        }
        return res
      } catch (_e) {
        // If Stack isn't configured properly, allow and let pages handle auth
      }
    }
  }

  return res
}

export const config = { matcher: ['/dashboard/:path*','/admin/:path*','/estimate/:path*','/customers/:path*','/onboarding','/handler/password-reset'] }

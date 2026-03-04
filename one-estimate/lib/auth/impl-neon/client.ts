"use client"
/* eslint-disable react-hooks/rules-of-hooks */

import { useUser, useStackApp, StackClientApp } from "@stackframe/stack"
import { useMemo } from "react"
import type { AuthClient, AuthUser } from "../types"

function mapUser(u: any | null): AuthUser | null {
  if (!u) return null
  return {
    id: u.id,
    email: u.primaryEmail ?? null,
    displayName: u.displayName ?? null,
    primaryEmailVerified: Boolean(u.primaryEmailVerified),
  }
}

export function useAuth(): AuthClient {
  const envReady = Boolean(
    process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
    process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
  )

  if (!envReady) {
    return {
      user: null,
      isLoading: false,
      error: null,
      async signIn() { return { ok: false, error: 'STACK_ENV_MISSING' } },
      async signUp() { return { ok: false, error: 'STACK_ENV_MISSING' } },
      async signOut() { /* no-op */ },
      async signInWithGoogle() { throw new Error('STACK_ENV_MISSING') },
      async sendPasswordReset() { return { ok: false, error: 'STACK_ENV_MISSING' } },
      async verifyEmail() { return { ok: false, error: 'STACK_ENV_MISSING' } },
      async resendEmailVerification() { return { ok: false, error: 'STACK_ENV_MISSING' } },
    }
  }

  const userRaw = useUser()
  const app = useStackApp() as StackClientApp

  const user = useMemo(() => mapUser(userRaw), [userRaw])

  return {
    user,
    isLoading: false,
    error: null,
    async signIn({ email, password }) {
      const result = await app.signInWithCredential({ email, password, noRedirect: true })
      if (result.status === "ok") return { ok: true }
      const err = (result as any)?.error?.code || (result as any)?.error?.message
      return { ok: false, error: err || "SIGN_IN_FAILED" }
    },
    async signUp({ email, password, verificationCallbackUrl }) {
      const result = await app.signUpWithCredential({
        email,
        password,
        noRedirect: true,
        verificationCallbackUrl,
      })
      if (result.status === "ok") return { ok: true, info: "verification_sent" }
      const err = (result as any)?.error?.code || (result as any)?.error?.message
      return { ok: false, error: err || "SIGN_UP_FAILED" }
    },
    async signOut() {
      try { await userRaw?.signOut?.() } catch {}
    },
    async signInWithGoogle() {
      await app.signInWithOAuth("google")
    },
    async sendPasswordReset(email: string) {
      try {
        await app.sendForgotPasswordEmail(email)
        return { ok: true }
      } catch (e: any) {
        return { ok: false, error: e?.message || 'RESET_FAILED' }
      }
    },
    async verifyEmail(code: string) {
      try {
        const res = await app.verifyEmail(code)
        return { ok: res.status === 'ok', error: res.status === 'ok' ? undefined : 'VERIFY_FAILED' }
      } catch (e: any) {
        return { ok: false, error: e?.message || 'VERIFY_FAILED' }
      }
    },
    async resendEmailVerification() {
      try {
        const r = await fetch('/api/auth/neon/resend', { method: 'POST', cache: 'no-store' })
        const res = await r.json().catch(() => ({}))
        if (r.ok && res && res.ok) return { ok: true }
        return { ok: false, error: res?.error || 'RESEND_FAILED' }
      } catch (e: any) {
        return { ok: false, error: e?.message || 'RESEND_FAILED' }
      }
    },
  }
}

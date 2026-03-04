import { getStackServerApp } from "@/lib/stack"
import type { AuthUser } from "../types"

function mapUser(u: any | null): AuthUser | null {
  if (!u) return null
  return {
    id: u.id,
    email: u.primaryEmail ?? null,
    displayName: u.displayName ?? null,
    primaryEmailVerified: Boolean(u.primaryEmailVerified),
  }
}

export async function getServerUser(): Promise<AuthUser | null> {
  const app = getStackServerApp()
  const u = await app.getUser()
  return mapUser(u)
}

export async function requireUser(opts?: { redirect?: (url: string) => never }) {
  const u = await getServerUser()
  if (!u) {
    if (opts?.redirect) return opts.redirect("/auth/signup")
    throw new Error("Unauthorized")
  }
  return u
}

export async function deleteUser(userId: string): Promise<{ ok: boolean; error?: string; status?: number }> {
  const neonProjectId = process.env.NEON_PROJECT_ID
  const neonApiToken = process.env.NEON_API_TOKEN
  if (!neonProjectId || !neonApiToken) {
    return { ok: false, error: 'Neonの設定が未完了です (NEON_PROJECT_ID / NEON_API_TOKEN)', status: 503 }
  }
  try {
    const endpointA = `https://console.neon.tech/api/v2/projects/${encodeURIComponent(neonProjectId)}/auth/users/${encodeURIComponent(userId)}`
    const respA = await fetch(endpointA, { method: 'DELETE', headers: { Authorization: `Bearer ${neonApiToken}`, Accept: 'application/json' } })
    if (respA.status === 204 || respA.status === 404) return { ok: true }
    const endpointB = `https://console.neon.tech/api/v2/projects/${encodeURIComponent(neonProjectId)}/users/${encodeURIComponent(userId)}`
    const respB = await fetch(endpointB, { method: 'DELETE', headers: { Authorization: `Bearer ${neonApiToken}`, Accept: 'application/json' } })
    if (respB.status === 204 || respB.status === 404) return { ok: true }
    const text = await respB.text().catch(() => '')
    console.error('Neon user delete failed (fallback):', respB.status, text)
    return { ok: false, error: 'Neonユーザー削除に失敗しました', status: 502 }
  } catch (e) {
    console.error('Neon user delete error:', e)
    return { ok: false, error: 'Neonユーザー削除に失敗しました', status: 502 }
  }
}


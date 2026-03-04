import { prisma } from '@/lib/prisma'
import { getServerUser } from './server'

export type DbUser = {
  id: string
  authUserId: string
  email: string
  name: string | null
  role: string
  companyId: string
}

/**
 * Supabase認証ユーザーに対応するDBのUserレコードを取得する。
 * 未登録（Company未作成）の場合は null を返す。
 */
export async function getDbUser(): Promise<DbUser | null> {
  const authUser = await getServerUser()
  if (!authUser) return null

  const user = await prisma.user.findUnique({
    where: { authUserId: authUser.id },
  })
  if (!user) return null

  return {
    id: user.id,
    authUserId: user.authUserId,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId,
  }
}

/**
 * 認証済み＋DB登録済みのユーザーを取得。未登録なら例外。
 */
export async function requireDbUser(): Promise<DbUser> {
  const user = await getDbUser()
  if (!user) throw new Error('User not registered')
  return user
}

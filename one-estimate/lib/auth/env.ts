export function hasAuthEnv() {
  if (typeof window !== 'undefined') {
    // client: check NEXT_PUBLIC_ keys
    const hasStack = Boolean(process.env.NEXT_PUBLIC_STACK_PROJECT_ID && process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY)
    const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return hasStack || hasSupabase
  }
  // server fallback (not used in header)
  return Boolean(
    (process.env.NEXT_PUBLIC_STACK_PROJECT_ID && process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY && process.env.STACK_SECRET_SERVER_KEY) ||
      (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  )
}


"use client"

import { StackProvider, StackClientApp } from "@stackframe/stack"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID
  const publishableClientKey = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY

  if (projectId && publishableClientKey) {
    const app = new StackClientApp({
      projectId,
      publishableClientKey,
      tokenStore: "nextjs-cookie",
      urls: {
        afterSignIn: "/dashboard",
        afterSignUp: "/dashboard",
        afterSignOut: "/",
        emailVerification: "/auth/email-verified",
      },
    })
    return <StackProvider app={app} lang="ja-JP">{children}</StackProvider>
  }

  return <>{children}</>
}

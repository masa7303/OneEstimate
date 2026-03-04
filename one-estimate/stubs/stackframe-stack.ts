// Minimal stub for '@stackframe/stack' to allow building when Neon provider is not used.
// This is used only when the real package is not installed.
import React from 'react'

export function useStackApp(): any {
  return {
    async signInWithCredential() { throw new Error('STACK_NOT_AVAILABLE') },
    async signUpWithCredential() { throw new Error('STACK_NOT_AVAILABLE') },
    async verifyEmail() { return { status: 'error', error: { message: 'STACK_NOT_AVAILABLE' } } },
    async sendForgotPasswordEmail() { throw new Error('STACK_NOT_AVAILABLE') },
  }
}

export function useUser(): any {
  return null
}

export class StackClientApp {
  constructor(_opts?: any) {}
}
export class StackServerApp {
  constructor(_opts?: any) {}
  async getUser() { return null }
}

export function StackProvider({ children }: { children: React.ReactNode }) {
  return children as any
}

// Stubs to satisfy TypeScript when Stack is not installed or when building in Supabase mode
declare module '@/lib/stack' {
  export function getStackClientApp(): any
  export function getStackServerApp(): any
  export function hasStackEnv(): boolean
}

declare module '@stackframe/stack' {
  export function useStackApp(): any
  export function useUser(): any
  export type StackClientApp = any
  export type StackServerApp = any
  export const StackClientApp: any
  export const StackServerApp: any
  export function StackProvider(props: any): any
}

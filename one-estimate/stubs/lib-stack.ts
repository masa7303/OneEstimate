// Minimal stub for '@/lib/stack' to avoid build errors when Stack is not used.
export function getStackClientApp() {
  throw new Error('STACK_NOT_AVAILABLE')
}
export function getStackServerApp() {
  return {
    async getUser() { return null },
  }
}
export function hasStackEnv() {
  return false
}

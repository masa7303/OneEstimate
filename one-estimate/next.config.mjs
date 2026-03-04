import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Provide a stub for '@stackframe/stack' when the package is not installed
    let hasStack = true
    try {
      // Resolve actual package; if not installed, fall back to local stubs
      require.resolve('@stackframe/stack')
    } catch (_e) {
      hasStack = false
    }
    if (!hasStack) {
      config.resolve = config.resolve || {}
      config.resolve.alias = config.resolve.alias || {}
      config.resolve.alias['@stackframe/stack'] = path.resolve(__dirname, 'stubs/stackframe-stack.ts')
      config.resolve.alias['@/lib/stack'] = path.resolve(__dirname, 'stubs/lib-stack.ts')
    }
    return config
  },
}

export default nextConfig

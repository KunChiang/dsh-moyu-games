import { createRequire } from 'node:module'
import { homedir } from 'node:os'
import { join } from 'node:path'

/** 在 DSH profile、全局 npx 缓存或本地 node_modules 中找 React 运行时。 */
export function resolveDshRequire(root) {
  const anchors = [
    process.env.DSH_PROFILE_DIR ? join(process.env.DSH_PROFILE_DIR, 'x.js') : null,
    join(homedir(), '.dsh', 'profiles', 'node_modules', 'x.js'),
    join(root, 'node_modules', 'x.js'),
    join(root, 'x.js'),
  ].filter(Boolean)
  for (const anchor of anchors) {
    try {
      const req = createRequire(anchor)
      req.resolve('react')
      req.resolve('react-dom/server')
      return req
    } catch {
      // 尝试下一个位置
    }
  }
  throw new Error('找不到 React 运行时：请先在插件目录执行 pnpm install，或在 DSH profile 内运行')
}

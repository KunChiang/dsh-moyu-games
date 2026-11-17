/**
 * 本地视觉预览：把客户端 Bundle 渲染成静态 HTML，配一份接近 DSH 的主题变量，
 * 方便用无头浏览器截图检查布局（不依赖正在运行的 GUI）。
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveDshRequire } from './runtime.mjs'
import { SIZE, BLACK, WHITE, createBoard, findWin, isBoardFull, pickMove } from '../src/shared/gomoku.js'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const profileRequire = resolveDshRequire(root)
const React = profileRequire('react')
const { renderToStaticMarkup } = profileRequire('react-dom/server')

function demoMoves() {
  const board = createBoard()
  const moves = []
  let turn = BLACK
  for (let i = 0; i < 15; i += 1) {
    const move = pickMove(board, SIZE, turn, { level: turn === BLACK ? 'easy' : 'medium' })
    if (move === null) break
    board[move.y * SIZE + move.x] = turn
    moves.push({ x: move.x, y: move.y, p: turn })
    if (findWin(board, SIZE, move.x, move.y) || isBoardFull(board)) return null
    turn = turn === BLACK ? WHITE : BLACK
  }
  return moves
}

let moves = null
for (let attempt = 0; attempt < 80 && moves === null; attempt += 1) moves = demoMoves()
if (moves === null) throw new Error('could not build a non-terminal demo position')
const store = new Map()
store.set('dsh-moyu-games.game.v1', JSON.stringify({ moves, humanColor: BLACK, level: 'medium', startedAt: Date.now() - 96_000 }))

const styles = []
const cjsTable = new Map()

globalThis.window = globalThis
globalThis.localStorage = {
  getItem: (key) => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => { store.set(key, String(value)) },
  removeItem: (key) => { store.delete(key) },
}
globalThis.__ModuleLoader__ = { load({ id, factory }) { cjsTable.set(id, factory) } }
globalThis.document = {
  baseURI: 'http://127.0.0.1:43129/',
  hidden: false,
  head: { appendChild: (tag) => styles.push(tag) },
  querySelector: () => null,
  createElement: () => ({ dataset: {}, textContent: '' }),
}

new Function('window', readFileSync(join(root, 'lib', 'client.js'), 'utf8'))(globalThis)
const exports = cjsTable.get('dsh-moyu-games')((specifier) => {
  if (specifier === 'react') return React
  if (specifier === 'react/jsx-runtime') return profileRequire('react/jsx-runtime')
  throw new Error(`unexpected external ${specifier}`)
})

const dicts = {}
const registrations = []
const ctx = {
  effect(callback) { callback() },
  locale: {
    register(ns, value) { dicts[ns] = value; return () => {} },
    bind(ns) {
      return (key, params) => {
        let text = dicts[ns]?.zh?.[key] ?? key
        if (params) for (const [name, value] of Object.entries(params)) text = text.replaceAll(`{${name}}`, String(value))
        return text
      }
    },
    subscribe() { return () => {} },
  },
  slots: {
    inject(key, callback) { callback() },
    register(options, component) { registrations.push({ options, component }); return () => {} },
  },
  get() { return undefined },
}

exports.apply(ctx)
const main = registrations.find((entry) => entry.options.name === 'main')
const markup = renderToStaticMarkup(React.createElement(main.component, {}))
const css = styles.map((tag) => tag.textContent).join('\n')

const baseCss = `
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    background: var(--dsw-alias-bg-base);
    color: var(--dsw-alias-label-primary);
    -webkit-font-smoothing: antialiased;
  }
  :root {
    --dsw-alias-bg-base: #ffffff;
    --dsw-alias-bg-layer-1: #ffffff;
    --dsw-alias-bg-layer-2: #f9fafb;
    --dsw-alias-bg-layer-3: #f1f3f5;
    --dsw-alias-bg-overlay: #ffffff;
    --dsw-alias-border-l1: rgba(0, 0, 0, .05);
    --dsw-alias-border-l2: rgba(0, 0, 0, .1);
    --dsw-alias-border-l3: rgba(0, 0, 0, .13);
    --dsw-alias-border-l4: rgba(0, 0, 0, .17);
    --dsw-alias-label-primary: #0f1115;
    --dsw-alias-label-primary-foreground: #ffffff;
    --dsw-alias-label-secondary: #61666b;
    --dsw-alias-label-tertiary: #81858c;
    --dsw-alias-brand-primary: #0f1115;
    --dsw-alias-button-primary-fill: #0f1115;
    --dsw-alias-interactive-bg-hover: rgba(0, 0, 0, .05);
    --dsw-alias-state-success-primary: #22c55e;
    --dsw-alias-state-error-primary: #ef4444;
    --dsw-alias-state-warn-primary: #f59e0b;
  }
  body[data-ds-dark-theme] {
    --dsw-alias-bg-base: #151517;
    --dsw-alias-bg-layer-1: #1b1b1c;
    --dsw-alias-bg-layer-2: #232324;
    --dsw-alias-bg-layer-3: #2c2c2e;
    --dsw-alias-bg-overlay: #232324;
    --dsw-alias-border-l1: rgba(255, 255, 255, .05);
    --dsw-alias-border-l2: rgba(255, 255, 255, .1);
    --dsw-alias-border-l3: rgba(255, 255, 255, .13);
    --dsw-alias-border-l4: rgba(255, 255, 255, .17);
    --dsw-alias-label-primary: #f9fafb;
    --dsw-alias-label-primary-foreground: #0f1115;
    --dsw-alias-label-secondary: #adb2b8;
    --dsw-alias-label-tertiary: #81858c;
    --dsw-alias-brand-primary: #f9fafb;
    --dsw-alias-button-primary-fill: #f9fafb;
    --dsw-alias-interactive-bg-hover: rgba(255, 255, 255, .06);
    --dsw-alias-state-success-primary: #4ed17e;
    --dsw-alias-state-error-primary: #f25a5a;
    --dsw-alias-state-warn-primary: #f7ad31;
  }
  #stage { height: 100vh; display: flex; }
  #stage > div { flex: 1 1 auto; min-width: 0; }
`

const html = (dark) => `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Moyu Games preview</title>
<style>${baseCss}\n${css}</style>
</head>
<body${dark ? ' data-ds-dark-theme' : ''}>
<div id="stage">${markup}</div>
</body>
</html>`

const outDir = join(root, 'preview')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'panel-light.html'), html(false))
writeFileSync(join(outDir, 'panel-dark.html'), html(true))
console.log(`preview written (${moves.length} demo moves)`)

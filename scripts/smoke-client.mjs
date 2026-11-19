/**
 * 无浏览器冒烟测试：在 Node 里用最小 window / document / ModuleLoader 跑一遍
 * 客户端 bundle 的 apply()，并用 react-dom/server 渲染面板，确认注册与渲染不炸。
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveDshRequire } from './runtime.mjs'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const profileRequire = resolveDshRequire(root)
const React = profileRequire('react')
const { renderToStaticMarkup } = profileRequire('react-dom/server')

const registered = []
const effects = []
const cjsTable = new Map()
const contexts = []

globalThis.window = globalThis
globalThis.__ModuleLoader__ = {
  load({ id, factory }) {
    cjsTable.set(id, factory)
  },
}
const createdStyles = []
globalThis.document = {
  baseURI: 'http://127.0.0.1:43129/',
  head: { appendChild: (tag) => createdStyles.push(tag) },
  querySelector: () => null,
  createElement: () => ({ dataset: {}, textContent: '' }),
  hidden: false,
}

const bundle = readFileSync(join(root, 'lib', 'client.js'), 'utf8')
new Function('window', bundle)(globalThis)
const factory = cjsTable.get('dsh-moyu-games')
if (typeof factory !== 'function') throw new Error('bundle did not register its factory')
const exports = factory((specifier) => {
  if (specifier === 'react') return React
  if (specifier === 'react/jsx-runtime') return profileRequire('react/jsx-runtime')
  throw new Error(`unexpected external ${specifier}`)
})

if (typeof exports.apply !== 'function') throw new Error('apply is missing')
if (!Array.isArray(exports.inject)) throw new Error('inject is missing')

const dictionaries = {}
const ctx = {
  effect(callback) { effects.push(callback()) },
  locale: {
    register(ns, dicts) { dictionaries[ns] = dicts; return () => {} },
    bind(ns) {
      return (key, params) => {
        const dict = dictionaries[ns]?.zh ?? {}
        let text = dict[key] ?? key
        if (params) for (const [name, value] of Object.entries(params)) text = text.replaceAll(`{${name}}`, String(value))
        return text
      }
    },
    subscribe() { return () => {} },
  },
  slots: {
    inject(key, callback) { callback(); return () => {} },
    register(options, component) {
      registered.push({ options, component })
      return () => {}
    },
  },
  get(name) { return name === 'layout' ? { selectPanel() {} } : undefined },
}

exports.apply(ctx)
const ids = registered.map((entry) => `${entry.options.name}#${entry.options.id ?? entry.options.key}`)
console.log('registered slots:', ids.join(', '))
if (ids.length !== 3) throw new Error(`expected 3 slot registrations, got ${ids.length}`)
if (!ids.includes('main#moyu-games')) throw new Error('main panel is not registered')
if (!ids.includes('sidebar.panellist#moyu-games')) throw new Error('sidebar entry is not registered')

if (!dictionaries['moyu-games']?.zh?.nav) throw new Error('dictionary missing')
if (createdStyles.length !== 1) throw new Error('stylesheet not injected')

const gomoku = registered.find((entry) => entry.options.name === 'main' && entry.options.key === 'moyu-games')
const gomokuHtml = renderToStaticMarkup(React.createElement(gomoku.component, { initialGame: 'gomoku' }))
for (const marker of ['myg-root', 'myg-board', 'myg-header', 'role="grid"', '摸鱼棋室']) {
  if (!gomokuHtml.includes(marker)) throw new Error(`rendered gomoku panel is missing ${marker}`)
}
const darkHtml = renderToStaticMarkup(React.createElement(gomoku.component, { initialGame: 'dark-animals' }))
for (const marker of ['myg-root', 'myg-daGrid', '暗兽棋', '玩法', '首翻']) {
  if (!darkHtml.includes(marker)) throw new Error(`rendered dark panel is missing ${marker}`)
}
const minesweeperHtml = renderToStaticMarkup(React.createElement(gomoku.component, { initialGame: 'minesweeper' }))
for (const marker of ['myg-msBoard', '扫雷', '点第一格开始', 'AI 提示']) {
  if (!minesweeperHtml.includes(marker)) throw new Error(`rendered minesweeper panel is missing ${marker}`)
}
const stackHtml = renderToStaticMarkup(React.createElement(gomoku.component, { initialGame: 'stack' }))
for (const marker of ['myg-stackSvg', '叠楼', '放下', '最高']) {
  if (!stackHtml.includes(marker)) throw new Error(`rendered stack panel is missing ${marker}`)
}
console.log(`rendered panels: gomoku ${gomokuHtml.length} B, dark ${darkHtml.length} B, minesweeper ${minesweeperHtml.length} B, stack ${stackHtml.length} B, markers ok`)
console.log('smoke ok')

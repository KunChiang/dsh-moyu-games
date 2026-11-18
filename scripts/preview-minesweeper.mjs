/** 扫雷预览：渲染一局进行中的静态画面。 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveDshRequire } from './runtime.mjs'
import { matchToSave, newGame, reveal, toggleFlag } from '../src/shared/minesweeper.js'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const profileRequire = resolveDshRequire(root)
const React = profileRequire('react')
const { renderToStaticMarkup } = profileRequire('react-dom/server')

function mulberry(seedValue) {
  let a = seedValue
  return () => {
    a |= 0
    a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const random = mulberry(23)
let state = newGame('medium', random)
state = reveal(state, 8 * state.cols + 8, random)
for (const index of [5 * 16 + 4, 5 * 16 + 10, 11 * 16 + 4, 11 * 16 + 10, 3 * 16 + 8]) {
  if (!state.cells[index].mine && !state.cells[index].revealed) state = reveal(state, index, random)
}
const mineIndices = state.cells.map((cell, index) => (cell.mine ? index : -1)).filter((index) => index >= 0).slice(0, 3)
for (const index of mineIndices) state = toggleFlag(state, index)

const store = new Map()
store.set('dsh-moyu-games.last-game.v2', 'minesweeper')
store.set('dsh-moyu-games.minesweeper.game.v1', JSON.stringify(matchToSave(state)))

globalThis.window = globalThis
globalThis.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
}
globalThis.__ModuleLoader__ = { load({ id, factory }) { this.factory = factory } }
const styles = []
globalThis.document = {
  baseURI: 'http://127.0.0.1:43129/',
  hidden: false,
  head: { appendChild: (tag) => styles.push(tag) },
  querySelector: () => null,
  createElement: () => ({ dataset: {}, textContent: '' }),
}

const cjsTable = new Map()
globalThis.__ModuleLoader__ = { load({ id, factory }) { cjsTable.set(id, factory) } }
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
  slots: { inject(key, callback) { callback() }, register(options, component) { registrations.push({ options, component }); return () => {} } },
  get() { return undefined },
}
exports.apply(ctx)
const main = registrations.find((entry) => entry.options.name === 'main' && entry.options.key === 'moyu-games')
const markup = renderToStaticMarkup(React.createElement(main.component, { initialGame: 'minesweeper' }))
const css = styles.map((tag) => tag.textContent).join('\n')
const baseCss = readFileSync(join(root, 'scripts', 'preview-theme.css'), 'utf8')
const html = (dark) => `<!doctype html><html><head><meta charset="utf-8"><title>Minesweeper preview</title>
<style>${baseCss}\n${css}</style></head><body${dark ? ' data-ds-dark-theme' : ''}><div id="stage">${markup}</div></body></html>`
mkdirSync(join(root, 'preview'), { recursive: true })
writeFileSync(join(root, 'preview', 'minesweeper-light.html'), html(false))
writeFileSync(join(root, 'preview', 'minesweeper-dark.html'), html(true))
console.log('minesweeper preview written')

/** 暗兽棋预览：渲染一局进行中的静态画面（不依赖 GUI）。 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveDshRequire } from './runtime.mjs'
import { applyAction, newDarkMatch } from '../src/shared/dark-animals.js'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const profileRequire = resolveDshRequire(root)
const React = profileRequire('react')
const { renderToStaticMarkup } = profileRequire('react-dom/server')

const seed = newDarkMatch({ random: () => 0.37 }).seed
const store = new Map()
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

// 预置一局：首翻 + 几步走棋。
const state = (() => {
  let current = newDarkMatch({ level: 'hard', random: mulberry(7) })
  const scripted = [
    { type: 'flip', cell: 5 },
    { type: 'flip', cell: 10 },
    { type: 'flip', cell: 0 },
  ]
  for (const action of scripted) current = applyAction(current, action)
  return current
})()
store.set('dsh-moyu-games.last-game.v2', 'dark-animals')
store.set('dsh-moyu-games.dark-animals.game.v1', JSON.stringify({
  seed: state.seed,
  actions: state.actions.map(({ actor, ...action }) => action),
  level: 'hard',
  startedAt: state.startedAt,
}))

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

const darkMain = registrations.find((entry) => entry.options.name === 'main' && entry.options.key === 'moyu-games')
const markup = renderToStaticMarkup(React.createElement(darkMain.component, { initialGame: 'dark-animals' }))
const css = styles.map((tag) => tag.textContent).join('\n')
const baseCss = readFileSync(join(root, 'scripts', 'preview-theme.css'), 'utf8')
const html = (dark) => `<!doctype html><html><head><meta charset="utf-8"><title>Dark beasts preview</title>
<style>${baseCss}\n${css}</style></head><body${dark ? ' data-ds-dark-theme' : ''}><div id="stage">${markup}</div></body></html>`
mkdirSync(join(root, 'preview'), { recursive: true })
writeFileSync(join(root, 'preview', 'dark-animals-light.html'), html(false))
writeFileSync(join(root, 'preview', 'dark-animals-dark.html'), html(true))
console.log('dark preview written')

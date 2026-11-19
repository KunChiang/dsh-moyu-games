/** 叠楼预览：构造一座略微倾斜的楼。 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveDshRequire } from './runtime.mjs'
import { createTower, resolveDrop, topBlock, towerToSave } from '../src/shared/stack.js'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const profileRequire = resolveDshRequire(root)
const React = profileRequire('react')
const { renderToStaticMarkup } = profileRequire('react-dom/server')

let tower = createTower()
const offsets = [0, 0.11, 0.13, 0.15, 0.17, 0.19, 0.2, 0.18]
for (const ratio of offsets) {
  const top = topBlock(tower)
  const result = resolveDrop(tower, top.x + top.width / 2 + top.width * ratio)
  if (result.tower.status !== 'playing') break
  tower = result.tower
}

const store = new Map()
store.set('dsh-moyu-games.last-game.v2', 'stack')
store.set('dsh-moyu-games.stack.game.v1', JSON.stringify(towerToSave(tower)))
store.set('dsh-moyu-games.stack.best.v1', '17')

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
const markup = renderToStaticMarkup(React.createElement(main.component, { initialGame: 'stack' }))
const css = styles.map((tag) => tag.textContent).join('\n')
const baseCss = readFileSync(join(root, 'scripts', 'preview-theme.css'), 'utf8')
const html = (dark) => `<!doctype html><html><head><meta charset="utf-8"><title>Stack preview</title>
<style>${baseCss}\n${css}</style></head><body${dark ? ' data-ds-dark-theme' : ''}><div id="stage">${markup}</div></body></html>`
mkdirSync(join(root, 'preview'), { recursive: true })
writeFileSync(join(root, 'preview', 'stack-light.html'), html(false))
writeFileSync(join(root, 'preview', 'stack-dark.html'), html(true))
console.log('stack preview written', tower.blocks.length, 'blocks, lean', tower.lean.toFixed(2))

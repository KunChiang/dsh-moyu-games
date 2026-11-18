/**
 * 摸鱼棋室 —— Host 半。
 *
 * 浏览器半负责棋盘与本地 AI；这里只做两件小而稳的事：
 * 1. 把不同棋种的胜负战绩持久化到 DSH_HOME（跨 GUI 重启、跨浏览器 origin 都不丢）；
 * 2. 给浏览器半一个同源 JSON 接口（/moyu-games/api/stats?game=...）。
 *
 * 没有模型调用、没有额外权限：纯本地文件 + 同源路由。
 */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

export const name = 'dsh-moyu-games'
export const inject = ['webServer']

const ROUTE_PREFIX = '/moyu-games/api'
const MAX_BODY_BYTES = 8 * 1024
const GAME_KEYS = new Set(['gomoku', 'dark-animals', 'minesweeper'])
const EMPTY_STATS = Object.freeze({ wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0 })

function dshHome() {
  const configured = process.env.DSH_HOME
  if (typeof configured === 'string' && configured.trim() !== '') return configured
  return join(homedir(), '.dsh')
}

function statsFile() {
  return join(dshHome(), 'storages', 'moyu-games', 'stats.json')
}

function sanitizeStats(raw) {
  const stats = { ...EMPTY_STATS }
  if (typeof raw !== 'object' || raw === null) return stats
  for (const key of Object.keys(EMPTY_STATS)) {
    const value = raw[key]
    if (Number.isFinite(value) && value >= 0) stats[key] = Math.floor(value)
  }
  return stats
}

/** 旧版文件是扁平战绩；新版是 { games: { [game]: stats } }。 */
function sanitizeStore(raw) {
  const games = {}
  if (typeof raw !== 'object' || raw === null) return { games }
  if (typeof raw.games === 'object' && raw.games !== null) {
    for (const game of GAME_KEYS) games[game] = sanitizeStats(raw.games[game])
    return { games }
  }
  if (Number.isFinite(raw.wins) || Number.isFinite(raw.losses)) {
    games.gomoku = sanitizeStats(raw)
  }
  return { games }
}

async function readStore() {
  try {
    const text = await readFile(statsFile(), 'utf8')
    return sanitizeStore(JSON.parse(text))
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      console.warn('[moyu-games] read stats failed:', error?.message ?? error)
    }
    return sanitizeStore(null)
  }
}

async function writeStore(store) {
  const file = statsFile()
  await mkdir(join(dshHome(), 'storages', 'moyu-games'), { recursive: true })
  const temp = `${file}.${process.pid}.${Date.now()}.tmp`
  await writeFile(temp, `${JSON.stringify({ games: store.games }, null, 2)}\n`, 'utf8')
  await rename(temp, file)
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(body)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks = []
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('body too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function applyResult(stats, result) {
  const next = { ...stats }
  if (result === 'win') {
    next.wins += 1
    next.streak += 1
    if (next.streak > next.bestStreak) next.bestStreak = next.streak
  } else if (result === 'lose') {
    next.losses += 1
    next.streak = 0
  } else if (result === 'draw') {
    next.draws += 1
    next.streak = 0
  } else {
    return null
  }
  return next
}

async function handle(req, res) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const path = url.pathname
  if (path !== `${ROUTE_PREFIX}/stats` && path !== `${ROUTE_PREFIX}/stats/`) {
    sendJson(res, 404, { error: 'not found' })
    return
  }
  const queryGame = url.searchParams.get('game') ?? 'gomoku'
  if (!GAME_KEYS.has(queryGame)) {
    sendJson(res, 400, { error: 'unknown game' })
    return
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    const store = await readStore()
    const stats = store.games[queryGame] ?? { ...EMPTY_STATS }
    if (!store.games[queryGame]) {
      store.games[queryGame] = { ...EMPTY_STATS }
      await writeStore(store)
    }
    sendJson(res, 200, { game: queryGame, stats })
    return
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { allow: 'GET, POST' })
    res.end()
    return
  }

  let payload
  try {
    const text = await readBody(req)
    payload = text === '' ? {} : JSON.parse(text)
  } catch {
    sendJson(res, 400, { error: 'invalid json' })
    return
  }

  const game = payload?.game ?? 'gomoku'
  if (!GAME_KEYS.has(game)) {
    sendJson(res, 400, { error: 'unknown game' })
    return
  }

  const store = await readStore()
  const current = store.games[game] ?? { ...EMPTY_STATS }

  if (payload?.reset === true) {
    store.games[game] = { ...EMPTY_STATS }
    await writeStore(store)
    sendJson(res, 200, { game, stats: store.games[game] })
    return
  }

  const next = applyResult(current, payload?.result)
  if (next === null) {
    sendJson(res, 400, { error: 'result must be win, lose or draw' })
    return
  }
  store.games[game] = next
  await writeStore(store)
  sendJson(res, 200, { game, stats: next })
}

export function apply(ctx) {
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: ROUTE_PREFIX,
    handler: (req, res) => {
      handle(req, res).catch((error) => {
        ctx.logger?.warn?.(error)
        if (!res.headersSent) sendJson(res, 500, { error: 'internal error' })
        else res.end()
      })
    },
  }), 'moyu-games: stats route')
}

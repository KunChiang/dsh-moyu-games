import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply } from '../src/host/index.js'

function fakeContext() {
  let route = null
  const effects = []
  const ctx = {
    effect(callback) {
      effects.push(callback())
    },
    webServer: {
      register(candidate) {
        route = candidate
        return () => {}
      },
    },
    logger: { warn() {} },
  }
  return { ctx, route: () => route, effects }
}

function request(method, url, body) {
  const req = new EventEmitter()
  req.method = method
  req.url = url
  const chunks = []
  const res = {
    status: 0,
    headers: {},
    body: '',
    headersSent: false,
    writeHead(status, headers) {
      this.status = status
      this.headers = headers ?? {}
      this.headersSent = true
    },
    end(text) {
      this.body = text ?? ''
    },
  }
  const promise = new Promise((resolve) => {
    res.onDone = resolve
  })
  queueMicrotask(() => {
    if (body !== undefined) req.emit('data', Buffer.from(body))
    req.emit('end')
  })
  return { req, res, promise }
}

async function call(route, method, url, body) {
  const { req, res } = request(method, url, body)
  await route.handler(req, res)
  // 路由处理器不返回 Promise；等文件 I/O 与响应写完。
  for (let i = 0; i < 40 && res.status === 0; i += 1) await new Promise((resolve) => setTimeout(resolve, 10))
  return res
}

test('host：战绩 GET/POST/重置 与文件持久化', async () => {
  const home = await mkdtemp(join(tmpdir(), 'moyu-games-'))
  const previous = process.env.DSH_HOME
  process.env.DSH_HOME = home
  try {
    const { ctx, route } = fakeContext()
    apply(ctx)
    assert.ok(route())

    let res = await call(route(), 'GET', '/moyu-games/api/stats?game=gomoku')
    assert.equal(res.status, 200)
    assert.deepEqual(JSON.parse(res.body).stats, { wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0 })

    res = await call(route(), 'POST', '/moyu-games/api/stats', JSON.stringify({ game: 'gomoku', result: 'win' }))
    assert.deepEqual(JSON.parse(res.body).stats, { wins: 1, losses: 0, draws: 0, streak: 1, bestStreak: 1 })

    res = await call(route(), 'POST', '/moyu-games/api/stats', JSON.stringify({ game: 'gomoku', result: 'win' }))
    assert.deepEqual(JSON.parse(res.body).stats, { wins: 2, losses: 0, draws: 0, streak: 2, bestStreak: 2 })

    res = await call(route(), 'POST', '/moyu-games/api/stats', JSON.stringify({ game: 'gomoku', result: 'lose' }))
    assert.equal(JSON.parse(res.body).stats.streak, 0)
    assert.equal(JSON.parse(res.body).stats.bestStreak, 2)

    const saved = JSON.parse(await readFile(join(home, 'storages', 'moyu-games', 'stats.json'), 'utf8'))
    assert.equal(saved.games.gomoku.wins, 2)
    assert.equal(saved.games.gomoku.losses, 1)

    res = await call(route(), 'POST', '/moyu-games/api/stats', JSON.stringify({ game: 'gomoku', reset: true }))
    assert.deepEqual(JSON.parse(res.body).stats, { wins: 0, losses: 0, draws: 0, streak: 0, bestStreak: 0 })

    res = await call(route(), 'POST', '/moyu-games/api/stats', JSON.stringify({ game: 'gomoku', result: 'nope' }))
    assert.equal(res.status, 400)
  } finally {
    if (previous === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previous
    await rm(home, { recursive: true, force: true })
  }
})

test('host：只接受 registrable 路径与合法方法', async () => {
  const home = await mkdtemp(join(tmpdir(), 'moyu-games-'))
  const previous = process.env.DSH_HOME
  process.env.DSH_HOME = home
  try {
    const { ctx, route } = fakeContext()
    apply(ctx)
    let res = await call(route(), 'GET', '/moyu-games/other')
    assert.equal(res.status, 404)
    res = await call(route(), 'PUT', '/moyu-games/api/stats')
    assert.equal(res.status, 405)
    res = await call(route(), 'POST', '/moyu-games/api/stats', 'not json')
    assert.equal(res.status, 400)
  } finally {
    if (previous === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previous
    await rm(home, { recursive: true, force: true })
  }
})

test('host：不同棋种分别记账', async () => {
  const home = await mkdtemp(join(tmpdir(), 'moyu-games-'))
  const previous = process.env.DSH_HOME
  process.env.DSH_HOME = home
  try {
    const { ctx, route } = fakeContext()
    apply(ctx)
    let res = await call(route(), 'POST', '/moyu-games/api/stats', JSON.stringify({ game: 'gomoku', result: 'win' }))
    assert.equal(JSON.parse(res.body).stats.wins, 1)
    res = await call(route(), 'POST', '/moyu-games/api/stats', JSON.stringify({ game: 'dark-animals', result: 'lose' }))
    assert.equal(JSON.parse(res.body).stats.losses, 1)
    res = await call(route(), 'GET', '/moyu-games/api/stats?game=gomoku')
    assert.equal(JSON.parse(res.body).stats.wins, 1)
    assert.equal(JSON.parse(res.body).stats.losses, 0)
    res = await call(route(), 'GET', '/moyu-games/api/stats?game=dark-animals')
    assert.equal(JSON.parse(res.body).stats.wins, 0)
    assert.equal(JSON.parse(res.body).stats.losses, 1)
    res = await call(route(), 'POST', '/moyu-games/api/stats', JSON.stringify({ game: 'minesweeper', result: 'win' }))
    assert.equal(JSON.parse(res.body).stats.wins, 1)
    res = await call(route(), 'GET', '/moyu-games/api/stats?game=minesweeper')
    assert.equal(JSON.parse(res.body).stats.wins, 1)
    res = await call(route(), 'GET', '/moyu-games/api/stats?game=nope')
    assert.equal(res.status, 400)
  } finally {
    if (previous === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = previous
    await rm(home, { recursive: true, force: true })
  }
})

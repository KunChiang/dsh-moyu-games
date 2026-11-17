/** 战绩与本地棋局的轻量持久化：Host 路由优先，localStorage 兜底。 */

const STATS_KEY = 'dsh-moyu-games.stats.v1'
const STATS_KEY_PREFIX = 'dsh-moyu-games.stats.v2.'
const GAME_KEY = 'dsh-moyu-games.game.v1'
const DARK_GAME_KEY = 'dsh-moyu-games.dark-animals.game.v1'
const API = 'moyu-games/api/stats'

export const GAME_GOMOKU = 'gomoku'
export const GAME_DARK_ANIMALS = 'dark-animals'

export const EMPTY_STATS = Object.freeze({
  wins: 0,
  losses: 0,
  draws: 0,
  streak: 0,
  bestStreak: 0,
})

function statsKey(game) {
  return game === GAME_GOMOKU ? STATS_KEY : `${STATS_KEY_PREFIX}${game}`
}

function readLocal(key) {
  try {
    const text = window.localStorage.getItem(key)
    return text === null ? null : JSON.parse(text)
  } catch {
    return null
  }
}

function writeLocal(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 隐私模式 / 配额满时静默降级：游戏本身照常可玩。
  }
}

function removeLocal(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

function sanitize(raw) {
  const stats = { ...EMPTY_STATS }
  if (typeof raw !== 'object' || raw === null) return stats
  for (const key of Object.keys(EMPTY_STATS)) {
    if (Number.isFinite(raw[key]) && raw[key] >= 0) stats[key] = Math.floor(raw[key])
  }
  return stats
}

export function cachedStats(game = GAME_GOMOKU) {
  return sanitize(readLocal(statsKey(game)))
}

async function callHost(url, method, body, timeoutMs = 1800) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    if (typeof data?.stats !== 'object') throw new Error('bad payload')
    return sanitize(data.stats)
  } finally {
    clearTimeout(timer)
  }
}

export async function loadStats(game = GAME_GOMOKU) {
  try {
    const stats = await callHost(`${API}?game=${encodeURIComponent(game)}`, 'GET')
    writeLocal(statsKey(game), stats)
    return stats
  } catch {
    return cachedStats(game)
  }
}

export async function recordResult(game, result) {
  const local = cachedStats(game)
  const optimistic = { ...local }
  if (result === 'win') {
    optimistic.wins += 1
    optimistic.streak += 1
    optimistic.bestStreak = Math.max(optimistic.bestStreak, optimistic.streak)
  } else if (result === 'lose') {
    optimistic.losses += 1
    optimistic.streak = 0
  } else {
    optimistic.draws += 1
    optimistic.streak = 0
  }
  writeLocal(statsKey(game), optimistic)
  try {
    const stats = await callHost(API, 'POST', { game, result })
    writeLocal(statsKey(game), stats)
    return stats
  } catch {
    return optimistic
  }
}

export async function resetStats(game = GAME_GOMOKU) {
  writeLocal(statsKey(game), EMPTY_STATS)
  try {
    const stats = await callHost(API, 'POST', { game, reset: true })
    writeLocal(statsKey(game), stats)
    return stats
  } catch {
    return { ...EMPTY_STATS }
  }
}

/** 保存未结束的五子棋局，刷新页面后还能接着下。 */
export function saveLocalGame(match) {
  if (!match || !Array.isArray(match.moves)) return
  writeLocal(GAME_KEY, {
    moves: match.moves,
    humanColor: match.humanColor,
    level: match.level,
    startedAt: match.startedAt,
  })
}

export function loadLocalGame() {
  const saved = readLocal(GAME_KEY)
  if (saved === null || typeof saved !== 'object' || !Array.isArray(saved.moves)) return null
  if (saved.moves.length === 0) return null
  return saved
}

export function clearLocalGame() {
  removeLocal(GAME_KEY)
}

/** 暗兽棋存档：seed + 动作序列。 */
export function saveDarkGame(state) {
  if (!state || !Array.isArray(state.seed)) return
  writeLocal(DARK_GAME_KEY, {
    seed: state.seed,
    actions: state.actions.map(({ actor, ...action }) => action),
    level: state.level,
    startedAt: state.startedAt,
  })
}

export function loadDarkGame() {
  const saved = readLocal(DARK_GAME_KEY)
  if (saved === null || typeof saved !== 'object') return null
  return saved
}

export function clearDarkGame() {
  removeLocal(DARK_GAME_KEY)
}

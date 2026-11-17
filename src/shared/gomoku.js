/**
 * 五子棋规则与本地 AI —— 纯函数、零依赖，浏览器半与 Node 测试共用。
 *
 * 设计取舍：
 * - 15×15 无禁手（free-style），五连及以上即胜，休闲对局足够公平。
 * - AI 不调用任何模型：候选点局部棋形评分 + alpha-beta 极小化极大搜索，
 *   断线也能玩，且不消耗 token —— 摸鱼不该有成本。
 */

export const SIZE = 15
export const EMPTY = 0
export const BLACK = 1
export const WHITE = 2

/** 四个扫描方向：横、竖、右下、右上。 */
export const DIRECTIONS = Object.freeze([
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
])

const WIN_SCORE = 1e9

export function otherPlayer(player) {
  return player === BLACK ? WHITE : BLACK
}

export function createBoard(size = SIZE) {
  return new Uint8Array(size * size)
}

export function cloneBoard(board) {
  return board.slice()
}

export function inside(size, x, y) {
  return x >= 0 && y >= 0 && x < size && y < size
}

export function cellAt(board, size, x, y) {
  return inside(size, x, y) ? board[y * size + x] : -1
}

export function stoneCount(board) {
  let count = 0
  for (let i = 0; i < board.length; i += 1) if (board[i] !== EMPTY) count += 1
  return count
}

export function isBoardFull(board) {
  for (let i = 0; i < board.length; i += 1) if (board[i] === EMPTY) return false
  return true
}

/**
 * 落在 (x, y) 的棋子是否已经连成五子。返回整条连线的坐标（按方向排序），
 * 没有胜负时为 null。
 */
export function findWin(board, size, x, y) {
  if (!inside(size, x, y)) return null
  const player = board[y * size + x]
  if (player === EMPTY) return null

  for (const [dx, dy] of DIRECTIONS) {
    const cells = []
    for (const sign of [-1, 1]) {
      let nx = x + sign * dx
      let ny = y + sign * dy
      while (inside(size, nx, ny) && board[ny * size + nx] === player) {
        cells.push([nx, ny])
        nx += sign * dx
        ny += sign * dy
      }
    }
    if (cells.length + 1 >= 5) {
      cells.push([x, y])
      cells.sort((a, b) => (a[0] - b[0]) * dx + (a[1] - b[1]) * dy)
      return cells
    }
  }
  return null
}

/** 假设 player 落在空格 (x, y)，是否立即五连（不修改棋盘）。 */
export function wouldWin(board, size, x, y, player) {
  if (!inside(size, x, y) || board[y * size + x] !== EMPTY) return false
  for (const [dx, dy] of DIRECTIONS) {
    let count = 1
    for (const sign of [-1, 1]) {
      let nx = x + sign * dx
      let ny = y + sign * dy
      while (inside(size, nx, ny) && board[ny * size + nx] === player) {
        count += 1
        nx += sign * dx
        ny += sign * dy
      }
    }
    if (count >= 5) return true
  }
  return false
}

/**
 * 候选着法：已有棋子周围 radius 格内的空点。空盘返回天元。
 * 只搜索棋子附近的点让 AI 在 15×15 上依然够快。
 */
export function candidateMoves(board, size, radius = 2) {
  const seen = new Set()
  let any = false
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (board[y * size + x] === EMPTY) continue
      any = true
      const x0 = Math.max(0, x - radius)
      const x1 = Math.min(size - 1, x + radius)
      const y0 = Math.max(0, y - radius)
      const y1 = Math.min(size - 1, y + radius)
      for (let ny = y0; ny <= y1; ny += 1) {
        for (let nx = x0; nx <= x1; nx += 1) {
          if (board[ny * size + nx] !== EMPTY) continue
          seen.add(ny * size + nx)
        }
      }
    }
  }
  if (!any) {
    const center = (size - 1) >> 1
    return [{ x: center, y: center }]
  }
  const moves = []
  for (const index of seen) moves.push({ x: index % size, y: (index / size) | 0 })
  return moves
}

/* ── 局部棋形分析 ─────────────────────────────────────────────────────── */

/** 以落点为中心取 9 格窗口：o 己方、. 空、# 对方或棋盘外。 */
function rayWindow(board, size, x, y, player, dx, dy) {
  let text = ''
  for (let offset = -4; offset <= 4; offset += 1) {
    if (offset === 0) {
      text += 'o'
      continue
    }
    const nx = x + dx * offset
    const ny = y + dy * offset
    if (!inside(size, nx, ny)) {
      text += '#'
      continue
    }
    const value = board[ny * size + nx]
    text += value === player ? 'o' : value === EMPTY ? '.' : '#'
  }
  return text
}

function hasFive(text) {
  for (let i = 0; i <= 4; i += 1) if (text.slice(i, i + 5) === 'ooooo') return true
  return false
}

/** 窗口内哪些空点补上后会形成五连 —— 数量决定“活四 / 冲四”。 */
function winningCells(text) {
  let total = 0
  for (let i = 0; i < 9; i += 1) {
    if (text[i] !== '.') continue
    const next = text.slice(0, i) + 'o' + text.slice(i + 1)
    if (hasFive(next)) total += 1
  }
  return total
}

/** 窗口内补一子能形成“四”（下一步即胜）的点数，以及其中能形成活四的点数。 */
function fourMakers(text) {
  let makers = 0
  let openMakers = 0
  for (let i = 0; i < 9; i += 1) {
    if (text[i] !== '.') continue
    const next = text.slice(0, i) + 'o' + text.slice(i + 1)
    const ways = winningCells(next)
    if (ways >= 1) makers += 1
    if (ways >= 2) openMakers += 1
  }
  return { makers, openMakers }
}

/**
 * 单方向棋形等级：
 * 5 五连 / 4 四（下一手成五）/ 3 三（再一手成四）/ 2 二 / 1 单子。
 * open 表示两端可延展（活四、活三……）。
 */
function classifyRay(text) {
  if (hasFive(text)) return { level: 5, open: false }

  const wins = winningCells(text)
  if (wins >= 2) return { level: 4, open: true }
  if (wins === 1) return { level: 4, open: false }

  const fours = fourMakers(text)
  if (fours.openMakers >= 1) return { level: 3, open: true }
  if (fours.makers >= 1) return { level: 3, open: false }

  let left = 0
  while (left < 4 && text[4 - left - 1] === 'o') left += 1
  let right = 0
  while (right < 4 && text[4 + right + 1] === 'o') right += 1
  const run = left + right + 1
  const openEnds =
    (text[4 - left - 1] === '.' ? 1 : 0) + (text[4 + right + 1] === '.' ? 1 : 0)

  if (run >= 3) return { level: 3, open: openEnds === 2 }
  if (run === 2) return { level: 2, openEnds }
  return { level: 1, openEnds }
}

/**
 * 落点价值：对 player 而言，(x, y) 这一手四个方向的棋形总和。
 * 双四 / 双活三额外加权，是 AI 找到杀棋的关键。
 */
export function pointScore(board, size, x, y, player) {
  if (!inside(size, x, y) || board[y * size + x] !== EMPTY) return -1
  let score = 0
  let fours = 0
  let openThrees = 0

  for (const [dx, dy] of DIRECTIONS) {
    const info = classifyRay(rayWindow(board, size, x, y, player, dx, dy))
    if (info.level === 5) return 1e8
    if (info.level === 4) {
      fours += 1
      score += info.open ? 3_000_000 : 400_000
    } else if (info.level === 3) {
      if (info.open) {
        openThrees += 1
        score += 60_000
      } else {
        score += 6_000
      }
    } else if (info.level === 2) {
      score += info.openEnds === 2 ? 900 : 220
    } else {
      score += info.openEnds === 2 ? 40 : 10
    }
  }

  if (fours >= 2) score += 4_000_000
  if (openThrees >= 2) score += 300_000
  return score
}

/** 内部节点用的廉价排序分：只数连续与开放端，不做递归棋形。 */
function quickScore(board, size, x, y, player) {
  if (board[y * size + x] !== EMPTY) return -1
  if (wouldWin(board, size, x, y, player)) return 5e7

  let score = 0
  for (const [dx, dy] of DIRECTIONS) {
    let left = 0
    let right = 0
    for (let sign of [-1, 1]) {
      let run = 0
      let nx = x + sign * dx
      let ny = y + sign * dy
      while (inside(size, nx, ny) && board[ny * size + nx] === player) {
        run += 1
        nx += sign * dx
        ny += sign * dy
      }
      if (sign === -1) left = run
      else right = run
    }
    const run = left + right + 1
    const open =
      (inside(size, x - (left + 1) * dx, y - (left + 1) * dy) &&
        board[(y - (left + 1) * dy) * size + (x - (left + 1) * dx)] === EMPTY
        ? 1
        : 0) +
      (inside(size, x + (right + 1) * dx, y + (right + 1) * dy) &&
        board[(y + (right + 1) * dy) * size + (x + (right + 1) * dx)] === EMPTY
        ? 1
        : 0)
    if (run >= 5) score += 1e7
    else if (run === 4) score += open >= 2 ? 100_000 : open === 1 ? 20_000 : 0
    else if (run === 3) score += open === 2 ? 4_000 : 600
    else if (run === 2) score += open === 2 ? 300 : 80
    else score += open === 2 ? 12 : 3
  }
  return score
}

/* ── 全盘评估与搜索 ───────────────────────────────────────────────────── */

/** 全盘单方棋力：扫描所有行、列、斜线的连续段与开放端。 */
export function boardScore(board, size, player) {
  let score = 0
  for (const [dx, dy] of DIRECTIONS) {
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (board[y * size + x] !== player) continue
        const px = x - dx
        const py = y - dy
        if (inside(size, px, py) && board[py * size + px] === player) continue

        let length = 0
        let nx = x
        let ny = y
        while (inside(size, nx, ny) && board[ny * size + nx] === player) {
          length += 1
          nx += dx
          ny += dy
        }

        const before = inside(size, x - dx, y - dy) &&
          board[(y - dy) * size + (x - dx)] === EMPTY
        const after = inside(size, nx, ny) && board[ny * size + nx] === EMPTY
        const open = (before ? 1 : 0) + (after ? 1 : 0)

        if (length >= 5) score += 10_000_000
        else if (length === 4) score += open === 2 ? 1_000_000 : open === 1 ? 120_000 : 0
        else if (length === 3) score += open === 2 ? 24_000 : open === 1 ? 2_400 : 0
        else if (length === 2) score += open === 2 ? 1_200 : open === 1 ? 160 : 0
        else score += open === 2 ? 30 : 6
      }
    }
  }
  return score
}

export function evaluateBoard(board, size, player) {
  const opponent = otherPlayer(player)
  return boardScore(board, size, player) * 1.02 - boardScore(board, size, opponent) * 1.12
}

function orderedMoves(board, size, player, limit, accurate) {
  const moves = candidateMoves(board, size, 2)
  const opponent = otherPlayer(player)
  const weight = accurate ? 1 : 1
  const scored = []
  for (const move of moves) {
    const own = accurate
      ? pointScore(board, size, move.x, move.y, player)
      : quickScore(board, size, move.x, move.y, player)
    const deny = accurate
      ? pointScore(board, size, move.x, move.y, opponent)
      : quickScore(board, size, move.x, move.y, opponent)
    scored.push({ ...move, weight: own + deny * weight })
  }
  scored.sort((a, b) => b.weight - a.weight)
  return scored.slice(0, limit)
}

function minimax(board, size, aiPlayer, opponent, turn, depth, alpha, beta, context) {
  context.nodes += 1
  if (depth <= 0) return evaluateBoard(board, size, aiPlayer)
  if (context.nodes > context.budget) return evaluateBoard(board, size, aiPlayer)
  if ((context.nodes & 255) === 0 && Date.now() > context.deadline) {
    context.timedOut = true
    return evaluateBoard(board, size, aiPlayer)
  }

  const moves = orderedMoves(board, size, turn, depth >= 3 ? 8 : 10, false)
  if (moves.length === 0) return 0

  if (turn === aiPlayer) {
    let best = -Infinity
    for (const move of moves) {
      const index = move.y * size + move.x
      board[index] = turn
      const win = findWin(board, size, move.x, move.y)
      let value
      if (win) value = WIN_SCORE + depth
      else value = minimax(board, size, aiPlayer, opponent, opponent, depth - 1, alpha, beta, context)
      board[index] = EMPTY
      if (value > best) best = value
      if (best > alpha) alpha = best
      if (alpha >= beta) break
      if (context.timedOut) break
    }
    return best
  }

  let best = Infinity
  for (const move of moves) {
    const index = move.y * size + move.x
    board[index] = turn
    const win = findWin(board, size, move.x, move.y)
    let value
    if (win) value = -WIN_SCORE - depth
    else value = minimax(board, size, aiPlayer, opponent, aiPlayer, depth - 1, alpha, beta, context)
    board[index] = EMPTY
    if (value < best) best = value
    if (best < beta) beta = best
    if (alpha >= beta) break
    if (context.timedOut) break
  }
  return best
}

const LEVEL_CONFIG = {
  easy: { maxDepth: 0, top: 8 },
  medium: { maxDepth: 2, top: 12, budget: 40_000, timeLimitMs: 240 },
  hard: { maxDepth: 6, top: 10, budget: 55_000, timeLimitMs: 320 },
}

/**
 * 选一手棋。返回 { x, y } 或 null（棋盘已满）。
 *
 * @param board 当前棋盘（不会被修改）
 * @param size 边长
 * @param player 轮到谁
 * @param options.level easy | medium | hard
 * @param options.random 可注入随机源（测试用）
 * @param options.timeLimitMs 覆盖搜索时限
 */
export function pickMove(board, size, player, options = {}) {
  const level = LEVEL_CONFIG[options.level] !== undefined ? options.level : 'medium'
  const config = LEVEL_CONFIG[level]
  const random = options.random ?? Math.random
  const opponent = otherPlayer(player)

  if (isBoardFull(board)) return null

  const candidates = candidateMoves(board, size, 2)
  if (candidates.length === 0) return null

  // 1. 能赢就赢。
  for (const move of candidates) {
    if (wouldWin(board, size, move.x, move.y, player)) return move
  }

  // 2. 对手下一手能赢就必须堵；多个杀点说明已经输了，尽量挑最好的位置。
  const blocks = candidates.filter((move) => wouldWin(board, size, move.x, move.y, opponent))
  if (blocks.length > 0) {
    let best = blocks[0]
    let bestScore = -Infinity
    for (const move of blocks) {
      const score =
        pointScore(board, size, move.x, move.y, player) +
        pointScore(board, size, move.x, move.y, opponent) * 1.1 +
        random() * 1e-3
      if (score > bestScore) {
        bestScore = score
        best = move
      }
    }
    return best
  }

  // 3. 全盘候选评分（进攻 + 防守），作为排序与简单难度的依据。
  const ranked = candidates
    .map((move) => {
      const attack = pointScore(board, size, move.x, move.y, player)
      const defense = pointScore(board, size, move.x, move.y, opponent)
      return { ...move, attack, defense, score: attack + defense * 1.08 }
    })
    .sort((a, b) => b.score - a.score)

  if (level === 'easy') {
    const pool = ranked.slice(0, Math.min(config.top, ranked.length))
    const noise = 0.22
    if (pool.length > 1 && random() < noise) {
      return pool[1 + Math.floor(random() * (pool.length - 1))]
    }
    if (pool.length > 1 && random() < 0.12) {
      return pool[Math.floor(random() * pool.length)]
    }
    return pool[0]
  }

  // 4. 极小化极大搜索。根节点用精确棋形排序，内部节点用廉价排序。
  const ctx = {
    nodes: 0,
    budget: config.budget,
    deadline: Date.now() + (options.timeLimitMs ?? config.timeLimitMs),
    timedOut: false,
  }
  const work = cloneBoard(board)
  let best = ranked[0]
  let bestValue = -Infinity

  const widths = { 2: Math.min(config.top, 10), 4: Math.min(config.top, 8) }

  for (let depth = 2; depth <= config.maxDepth; depth += 2) {
    const width = widths[depth] ?? Math.min(config.top, 8)
    let depthBest = null
    let depthBestValue = -Infinity
    let alpha = -Infinity

    for (const move of ranked.slice(0, width)) {
      const index = move.y * size + move.x
      work[index] = player
      const win = findWin(work, size, move.x, move.y)
      let value
      if (win) value = WIN_SCORE
      else value = minimax(work, size, player, opponent, opponent, depth - 1, alpha, Infinity, ctx)
      work[index] = EMPTY

      if (value > depthBestValue) {
        depthBestValue = value
        depthBest = move
      }
      if (value > alpha) alpha = value
      if (ctx.nodes > ctx.budget || ctx.timedOut) break
    }

    if (depthBest !== null) {
      best = depthBest
      bestValue = depthBestValue
    }
    if (ctx.nodes > ctx.budget || ctx.timedOut) break
    if (bestValue >= WIN_SCORE / 2) break
  }

  if (best === null || best === undefined) return ranked[0]
  return { x: best.x, y: best.y }
}
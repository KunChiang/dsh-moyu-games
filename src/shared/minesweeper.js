/**
 * 扫雷 —— 纯函数规则与约束分析。
 *
 * - 支持 9×9/10、16×16/40、16×30/99 三档；
 * - 首点及其 3×3 邻域保证无雷；
 * - 左键翻开、右键插旗；翻开所有非雷格获胜；
 * - analyze() 只做逻辑推理：先找 100% 安全/必雷格，找不到才给一个概率最低的猜测。
 */

export const LEVELS = ['easy', 'medium', 'hard']

export const DIFFICULTIES = Object.freeze({
  easy: { cols: 9, rows: 9, mines: 10, label: '9×9' },
  medium: { cols: 16, rows: 16, mines: 40, label: '16×16' },
  hard: { cols: 30, rows: 16, mines: 99, label: '16×30' },
})

const NEIGHBOR_OFFSETS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
]

export function neighbors(cols, rows, index) {
  const x = index % cols
  const y = Math.floor(index / cols)
  const out = []
  for (const [dx, dy] of NEIGHBOR_OFFSETS) {
    const nx = x + dx
    const ny = y + dy
    if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) out.push(ny * cols + nx)
  }
  return out
}

export function newGame(level = 'easy', random = Math.random) {
  const config = DIFFICULTIES[level] ?? DIFFICULTIES.easy
  const total = config.cols * config.rows
  return {
    id: `ms${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    level: DIFFICULTIES[level] ? level : 'easy',
    cols: config.cols,
    rows: config.rows,
    mines: config.mines,
    cells: Array.from({ length: total }, () => ({
      mine: false,
      adjacent: 0,
      revealed: false,
      flagged: false,
    })),
    placed: false,
    status: 'ready',
    revealed: 0,
    flagCount: 0,
    startedAt: null,
    endedAt: null,

  }
}

function placeMines(game, safeIndex, random) {
  const total = game.cols * game.rows
  const safe = new Set([safeIndex, ...neighbors(game.cols, game.rows, safeIndex)])
  let candidates = []
  for (let i = 0; i < total; i += 1) if (!safe.has(i)) candidates.push(i)
  if (candidates.length < game.mines) {
    candidates = []
    for (let i = 0; i < total; i += 1) if (i !== safeIndex) candidates.push(i)
  }
  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const tmp = candidates[i]
    candidates[i] = candidates[j]
    candidates[j] = tmp
  }
  const mineSet = new Set(candidates.slice(0, game.mines))
  const cells = game.cells.map((cell, index) => ({ ...cell, mine: mineSet.has(index) }))
  for (let i = 0; i < total; i += 1) {
    if (cells[i].mine) continue
    cells[i].adjacent = neighbors(game.cols, game.rows, i).filter((n) => cells[n].mine).length
  }
  return { ...game, cells, placed: true, status: 'playing', startedAt: Date.now() }
}

function floodReveal(game, cells, start) {
  const queue = [start]
  const seen = new Set()
  let revealed = game.revealed
  while (queue.length > 0) {
    const index = queue.pop()
    if (seen.has(index)) continue
    seen.add(index)
    const cell = cells[index]
    if (!cell || cell.revealed || cell.flagged || cell.mine) continue
    cell.revealed = true
    revealed += 1
    if (cell.adjacent === 0) {
      for (const n of neighbors(game.cols, game.rows, index)) {
        if (!cells[n].revealed && !cells[n].flagged) queue.push(n)
      }
    }
  }
  return revealed
}

function finishIfWon(game, cells, revealed) {
  const totalSafe = game.cols * game.rows - game.mines
  if (revealed < totalSafe) return { cells, revealed, status: game.status, endedAt: game.endedAt }
  const nextCells = cells.map((cell) => (
    cell.mine && !cell.flagged ? { ...cell, flagged: true } : cell
  ))
  const flagCount = nextCells.filter((cell) => cell.flagged).length
  return { cells: nextCells, revealed, status: 'won', endedAt: Date.now(), flagCount }
}

/** 翻开一格；首翻时布雷。返回新的 game 对象。 */
export function reveal(game, index, random = Math.random) {
  if (game.status !== 'ready' && game.status !== 'playing') return game
  if (!Number.isInteger(index) || index < 0 || index >= game.cells.length) return game
  const start = game.placed ? game : placeMines(game, index, random)
  const target = start.cells[index]
  if (target.revealed || target.flagged) return start

  const cells = start.cells.map((cell) => ({ ...cell }))
  if (cells[index].mine) {
    const lost = cells.map((cell) => {
      if (cell.mine) return { ...cell, revealed: true }
      if (cell.flagged) return { ...cell, flagged: false }
      return cell
    })
    return { ...start, cells: lost, status: 'lost', endedAt: Date.now() }
  }

  const revealed = floodReveal(start, cells, index)
  const finished = finishIfWon(start, cells, revealed)
  return { ...start, ...finished }
}

/** 插旗 / 取消插旗。 */
export function toggleFlag(game, index) {
  if (game.status !== 'ready' && game.status !== 'playing') return game
  if (!Number.isInteger(index) || index < 0 || index >= game.cells.length) return game
  const cell = game.cells[index]
  if (cell.revealed) return game
  if (!cell.flagged && game.flagCount >= game.mines) return game
  const cells = game.cells.map((c, i) => (i === index ? { ...c, flagged: !c.flagged } : c))
  return {
    ...game,
    cells,
    flagCount: game.flagCount + (cell.flagged ? -1 : 1),
  }
}

/** 在已翻开的数字上双击：周围旗数等于数字时，翻开其余邻格。 */
export function chord(game, index, random = Math.random) {
  if (game.status !== 'playing') return game
  const cell = game.cells[index]
  if (!cell.revealed || cell.adjacent === 0) return game
  const around = neighbors(game.cols, game.rows, index)
  const flags = around.filter((n) => game.cells[n].flagged).length
  if (flags !== cell.adjacent) return game
  let next = game
  for (const n of around) {
    if (next.cells[n].revealed || next.cells[n].flagged) continue
    next = reveal(next, n, random)
    if (next.status !== 'playing') break
  }
  return next
}

/* ── 约束分析 ───────────────────────────────────────────────────────── */

function buildConstraints(game, knownMines) {
  const constraints = []
  for (let i = 0; i < game.cells.length; i += 1) {
    const cell = game.cells[i]
    if (!cell.revealed || cell.mine || cell.adjacent === 0) continue
    const unknown = []
    let flagged = 0
    for (const n of neighbors(game.cols, game.rows, i)) {
      const other = game.cells[n]
      if (other.revealed) continue
      if (other.flagged || knownMines.has(n)) flagged += 1
      else unknown.push(n)
    }
    if (unknown.length === 0) continue
    constraints.push({ unknown, remaining: cell.adjacent - flagged })
  }
  return constraints
}

/**
 * 逻辑分析。返回 { safe, mines, guess }：
 * - safe: 100% 安全格；mines: 100% 雷格；guess: 无确定解时的最佳猜测 { index, chance }
 */
export function analyze(game) {
  const knownMines = new Set()
  const safe = new Set()
  if (game.status !== 'playing') return { safe: [], mines: [], guess: null }

  let changed = true
  let rounds = 0
  while (changed && rounds < 40) {
    changed = false
    rounds += 1
    const constraints = buildConstraints(game, knownMines)
    for (const { unknown, remaining } of constraints) {
      if (remaining <= 0) {
        for (const n of unknown) if (!safe.has(n)) { safe.add(n); changed = true }
      } else if (remaining >= unknown.length) {
        for (const n of unknown) if (!knownMines.has(n)) { knownMines.add(n); changed = true }
      }
    }
    if (changed) continue

    // 子集推理：A 的未知邻居是 B 的子集时，B\A 的雷数可确定。
    const subsetConstraints = buildConstraints(game, knownMines)
    for (const a of subsetConstraints) {
      for (const b of subsetConstraints) {
        if (a === b) continue
        const setB = new Set(b.unknown)
        if (!a.unknown.every((n) => setB.has(n))) continue
        const diff = b.unknown.filter((n) => !a.unknown.includes(n))
        if (diff.length === 0) continue
        const diffMines = b.remaining - a.remaining
        if (diffMines === 0) {
          for (const n of diff) if (!safe.has(n)) { safe.add(n); changed = true }
        } else if (diffMines === diff.length) {
          for (const n of diff) if (!knownMines.has(n)) { knownMines.add(n); changed = true }
        }
      }
      if (changed) break
    }
  }

  const safeList = [...safe].filter((n) => !game.cells[n].revealed && !game.cells[n].flagged)
  const mineList = [...knownMines].filter((n) => !game.cells[n].revealed && !game.cells[n].flagged)
  if (safeList.length > 0 || mineList.length > 0) {
    return { safe: safeList, mines: mineList, guess: null }
  }

  // 没有确定解：给一个概率最低的猜测。
  const constraints = buildConstraints(game, knownMines)
  const probability = new Map()
  for (let i = 0; i < game.cells.length; i += 1) {
    if (game.cells[i].revealed || game.cells[i].flagged) continue
    const touch = constraints.filter((c) => c.unknown.includes(i))
    if (touch.length === 0) {
      const hidden = game.cells.filter((cell) => !cell.revealed && !cell.flagged).length
      const remaining = game.mines - game.flagCount
      probability.set(i, hidden > 0 ? remaining / hidden : 1)
    } else {
      let worst = 0
      for (const c of touch) worst = Math.max(worst, c.remaining / c.unknown.length)
      probability.set(i, Math.min(0.98, worst))
    }
  }
  let guess = null
  for (const [index, chance] of probability) {
    if (guess === null || chance < guess.chance) guess = { index, chance }
  }
  return { safe: [], mines: [], guess }
}

/** 未翻开的格子数（供 UI 统计）。 */
export function hiddenCount(game) {
  return game.cells.filter((cell) => !cell.revealed).length
}

export function isFinished(game) {
  return game.status === 'won' || game.status === 'lost'
}

export function matchToSave(game) {
  return {
    id: game.id,
    level: game.level,
    cols: game.cols,
    rows: game.rows,
    mines: game.mines,
    cells: game.cells,
    placed: game.placed,
    status: game.status,
    revealed: game.revealed,
    flagCount: game.flagCount,
    startedAt: game.startedAt,
    endedAt: game.endedAt,
  }
}

export function matchFromSave(saved) {
  if (!saved || !Array.isArray(saved.cells) || !Number.isInteger(saved.cols) || !Number.isInteger(saved.rows)) return null
  if (saved.cells.length !== saved.cols * saved.rows) return null
  if (saved.status !== 'ready' && saved.status !== 'playing') return null
  const cells = saved.cells.map((cell) => ({
    mine: cell?.mine === true,
    adjacent: Number.isInteger(cell?.adjacent) ? cell.adjacent : 0,
    revealed: cell?.revealed === true,
    flagged: cell?.flagged === true,
  }))
  return {
    id: typeof saved.id === 'string' ? saved.id : `ms${Date.now().toString(36)}`,
    level: LEVELS.includes(saved.level) ? saved.level : 'easy',
    cols: saved.cols,
    rows: saved.rows,
    mines: Number.isInteger(saved.mines) ? saved.mines : DIFFICULTIES.easy.mines,
    cells,
    placed: saved.placed === true,
    status: saved.status,
    revealed: Number.isInteger(saved.revealed) ? saved.revealed : cells.filter((cell) => cell.revealed && !cell.mine).length,
    flagCount: cells.filter((cell) => cell.flagged).length,
    startedAt: Number.isFinite(saved.startedAt) ? saved.startedAt : Date.now(),
    endedAt: null,
  }
}

/**
 * 暗兽棋 —— 4×4 翻翻棋，16 枚棋子全部背面朝上开始。
 *
 * 规则（基础 4×4 版）：
 * - 每方 8 枚：象 狮 虎 豹 狼 狗 猫 鼠，各一枚；开局随机洗入 16 格并全部盖住。
 * - 先手翻开的第一枚棋决定先手颜色，对方取得另一颜色。
 * - 每回合二选一：翻开一枚暗棋，或让一枚己方明棋正交走一格（空格或吃合法敌棋）。
 * - 等级：象 > 狮 > 虎 > 豹 > 狼 > 狗 > 猫 > 鼠；高级吃低级，同级可互吃且进攻方留下；
 *   鼠能吃象，象不能吃鼠。
 * - 吃光对方，或对方无任何合法动作，即获胜；同一局面第三次出现、或连续 100 手无翻棋/吃子判和。
 * - 不能盲目吃暗棋；必须先翻开。
 *
 * 棋盘状态是纯数据；AI 只读取「已公开」的棋子与暗格位置，不偷看暗棋身份。
 */

export const DARK_SIZE = 4
export const DARK_CELLS = DARK_SIZE * DARK_SIZE

/** 按用户给的 1 象 … 8 鼠 编号；power 越大越强。 */
export const ANIMALS = Object.freeze([
  { id: 'elephant', name: '象', rank: 1, power: 8 },
  { id: 'lion', name: '狮', rank: 2, power: 7 },
  { id: 'tiger', name: '虎', rank: 3, power: 6 },
  { id: 'leopard', name: '豹', rank: 4, power: 5 },
  { id: 'wolf', name: '狼', rank: 5, power: 4 },
  { id: 'dog', name: '狗', rank: 6, power: 3 },
  { id: 'cat', name: '猫', rank: 7, power: 2 },
  { id: 'rat', name: '鼠', rank: 8, power: 1 },
])

export const ANIMAL_BY_ID = Object.freeze(Object.fromEntries(ANIMALS.map((animal) => [animal.id, animal])))
const POWER = Object.freeze(Object.fromEntries(ANIMALS.map((animal) => [animal.id, animal.power])))

/** 静态子力价值；鼠另算「能吃象」的战术溢价。 */
const VALUE = Object.freeze({
  elephant: 100,
  lion: 78,
  tiger: 62,
  leopard: 46,
  wolf: 33,
  dog: 24,
  cat: 17,
  rat: 13,
})

const FILES = 'ABCD'
const ACTOR_HUMAN = 1
const ACTOR_AI = 2
const WIN = 1e9
const NO_PROGRESS_DRAW_PLIES = 100

export function cellName(index) {
  return `${FILES[index % DARK_SIZE]}${Math.floor(index / DARK_SIZE) + 1}`
}

export function otherActor(actor) {
  return actor === ACTOR_HUMAN ? ACTOR_AI : ACTOR_HUMAN
}

/** 八兽两枚（各归一方），洗牌成 16 格初始布局。 */
export function createSeed(random = Math.random) {
  const pieces = []
  for (const animal of ANIMALS) {
    pieces.push({ animal: animal.id, owner: 1 })
    pieces.push({ animal: animal.id, owner: 2 })
  }
  for (let i = pieces.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const tmp = pieces[i]
    pieces[i] = pieces[j]
    pieces[j] = tmp
  }
  return pieces
}

function newId() {
  return `d${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function newDarkMatch({ level = 'medium', random = Math.random } = {}) {
  const seed = createSeed(random)
  return {
    id: newId(),
    seed,
    cells: seed.map((piece) => ({ ...piece, revealed: false })),
    turn: ACTOR_HUMAN,
    status: 'playing',
    winner: null,
    humanColor: null,
    aiColor: null,
    firstFlipDone: false,
    actions: [],
    log: [],
    captured: { 1: [], 2: [] },
    noProgress: 0,
    repetitions: { [serializePublic({ seed, cells: seed.map((piece) => ({ ...piece, revealed: false })), turn: ACTOR_HUMAN, humanColor: null })]: 1 },
    startedAt: Date.now(),
    endedAt: null,
    lastAction: null,
    level,
  }
}

export function cloneCells(cells) {
  return cells.map((cell) => (cell === null ? null : { ...cell }))
}

/** 公开局面（暗棋一律记为 ?），用于重复局面判定。 */
export function serializePublic(state) {
  const cells = state.cells
    .map((cell) => (cell === null ? '-' : cell.revealed ? `${cell.animal}${cell.owner}` : '?'))
    .join(',')
  return `${cells}|${state.turn}|${state.humanColor ?? '-'}`
}

export function colorOfActor(state, actor) {
  if (state.humanColor === null) return null
  return actor === ACTOR_HUMAN ? state.humanColor : state.aiColor
}

export function actorOfColor(state, color) {
  if (state.humanColor === null) return null
  return state.humanColor === color ? ACTOR_HUMAN : ACTOR_AI
}

export function canCapture(attacker, defender) {
  if (attacker === 'rat' && defender === 'elephant') return true
  if (attacker === 'elephant' && defender === 'rat') return false
  return POWER[attacker] >= POWER[defender]
}

export function isAdjacent(from, to) {
  const fx = from % DARK_SIZE
  const fy = Math.floor(from / DARK_SIZE)
  const tx = to % DARK_SIZE
  const ty = Math.floor(to / DARK_SIZE)
  return Math.abs(fx - tx) + Math.abs(fy - ty) === 1
}

export function legalActions(state, actor = state.turn) {
  if (state.status !== 'playing') return []
  const actions = []
  for (let index = 0; index < state.cells.length; index += 1) {
    if (state.cells[index] !== null && !state.cells[index].revealed) actions.push({ type: 'flip', cell: index })
  }

  const color = colorOfActor(state, actor)
  if (color === null) return actions

  for (let index = 0; index < state.cells.length; index += 1) {
    const cell = state.cells[index]
    if (cell === null || !cell.revealed || cell.owner !== color) continue
    const x = index % DARK_SIZE
    const y = Math.floor(index / DARK_SIZE)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= DARK_SIZE || ny >= DARK_SIZE) continue
      const target = ny * DARK_SIZE + nx
      const occupant = state.cells[target]
      if (occupant === null) {
        actions.push({ type: 'move', from: index, to: target })
        continue
      }
      if (!occupant.revealed) continue
      if (occupant.owner === color) continue
      if (!canCapture(cell.animal, occupant.animal)) continue
      actions.push({ type: 'move', from: index, to: target })
    }
  }
  return actions
}

export function hasAnyAction(state, actor = state.turn) {
  return legalActions(state, actor).length > 0
}

function settle(state, actor) {
  const next = { ...state }
  const opponent = otherActor(actor)
  const opponentColor = next.humanColor === null ? null : (opponent === ACTOR_HUMAN ? next.humanColor : next.aiColor)

  if (opponentColor !== null) {
    const remaining = next.cells.some((cell) => cell !== null && cell.owner === opponentColor)
    if (!remaining) return finish(next, actor, 'win')
  }

  if (!hasAnyAction(next, opponent)) return finish(next, actor, 'win')

  if (next.noProgress >= NO_PROGRESS_DRAW_PLIES) return finishDraw(next)
  const key = serializePublic(next)
  const count = (next.repetitions[key] ?? 0) + 1
  next.repetitions = { ...next.repetitions, [key]: count }
  if (count >= 3) return finishDraw(next)
  return next
}

function finish(state, winner, kind) {
  const status = kind === 'draw' ? 'draw' : winner === ACTOR_HUMAN ? 'win' : 'lose'
  return {
    ...state,
    status,
    winner: kind === 'draw' ? null : winner,
    endedAt: Date.now(),
  }
}

function finishDraw(state) {
  return { ...state, status: 'draw', winner: null, endedAt: Date.now() }
}

/** 执行一个合法动作（纯函数）。非法动作返回原对象。 */
export function applyAction(state, action) {
  if (state.status !== 'playing' || !action) return state
  const actor = state.turn
  const cells = cloneCells(state.cells)
  let captured = state.captured
  let noProgress = state.noProgress + 1
  let humanColor = state.humanColor
  let aiColor = state.aiColor
  let firstFlipDone = state.firstFlipDone
  let lastAction = null

  if (action.type === 'flip') {
    const cell = cells[action.cell]
    if (!cell || cell.revealed) return state
    cell.revealed = true
    if (!firstFlipDone) {
      firstFlipDone = true
      if (actor === ACTOR_HUMAN) {
        humanColor = cell.owner
        aiColor = 3 - cell.owner
      } else {
        aiColor = cell.owner
        humanColor = 3 - cell.owner
      }
    }
    noProgress = 0
    lastAction = { type: 'flip', cell: action.cell, actor, animal: cell.animal, owner: cell.owner }
  } else if (action.type === 'move') {
    if (!firstFlipDone) return state
    const from = cells[action.from]
    const to = cells[action.to]
    if (!from || !from.revealed) return state
    const myColor = actor === ACTOR_HUMAN ? humanColor : aiColor
    if (from.owner !== myColor) return state
    if (!isAdjacent(action.from, action.to)) return state
    // 暗棋不能盲吃，也不能直接踩上去；必须先翻开。
    if (to !== null && !to.revealed) return state
    if (to !== null) {
      if (to.owner === myColor) return state
      if (!canCapture(from.animal, to.animal)) return state
      captured = {
        ...state.captured,
        [to.owner]: [...state.captured[to.owner], to.animal],
      }
      noProgress = 0
    }
    cells[action.to] = from
    cells[action.from] = null
    lastAction = {
      type: 'move',
      from: action.from,
      to: action.to,
      actor,
      animal: from.animal,
      captured: to !== null && to.revealed ? to.animal : null,
      capturedOwner: to !== null && to.revealed ? to.owner : null,
    }
  } else {
    return state
  }

  const next = {
    ...state,
    cells,
    captured,
    noProgress,
    humanColor,
    aiColor,
    firstFlipDone,
    turn: otherActor(actor),
    actions: [...state.actions, { ...action, actor }],
    log: [...(state.log ?? []), lastAction],
    lastAction,
  }
  return settle(next, actor)
}

/** 悔棋：退回到人类上一次动作之前（同时带走 AI 的应手）。 */
export function undoToHumanTurn(state) {
  let lastHuman = -1
  for (let i = state.actions.length - 1; i >= 0; i -= 1) {
    if (state.actions[i].actor === ACTOR_HUMAN) {
      lastHuman = i
      break
    }
  }
  if (lastHuman < 0) return state
  const actions = state.actions.slice(0, lastHuman)
  return replay(state.seed, actions, {
    id: state.id,
    level: state.level,
    startedAt: state.startedAt,
  })
}

/** 从初始布局 + 动作序列重建局面（存档 / 悔棋共用）。 */
export function replay(seed, actions, meta = {}) {
  let state = {
    id: meta.id ?? newId(),
    seed,
    cells: seed.map((piece) => ({ ...piece, revealed: false })),
    turn: ACTOR_HUMAN,
    status: 'playing',
    winner: null,
    humanColor: null,
    aiColor: null,
    firstFlipDone: false,
    actions: [],
    log: [],
    captured: { 1: [], 2: [] },
    noProgress: 0,
    repetitions: { [serializePublic({ seed, cells: seed.map((piece) => ({ ...piece, revealed: false })), turn: ACTOR_HUMAN, humanColor: null })]: 1 },
    startedAt: meta.startedAt ?? Date.now(),
    endedAt: null,
    lastAction: null,
    level: meta.level ?? 'medium',
  }
  for (const action of Array.isArray(actions) ? actions : []) {
    const next = applyAction(state, action)
    if (next === state) break
    state = next
  }
  return state
}

export function matchToSave(state) {
  return {
    seed: state.seed,
    actions: state.actions.map(({ actor, ...action }) => action),
    level: state.level,
    startedAt: state.startedAt,
  }
}

export function matchFromSave(saved) {
  if (!saved || !Array.isArray(saved.seed) || saved.seed.length !== DARK_CELLS) return null
  const seed = saved.seed.filter((piece) => piece && ANIMAL_BY_ID[piece.animal] && (piece.owner === 1 || piece.owner === 2))
  if (seed.length !== DARK_CELLS) return null
  const state = replay(seed, Array.isArray(saved.actions) ? saved.actions : [], {
    level: saved.level,
    startedAt: saved.startedAt,
  })
  return state.status === 'playing' ? state : null
}

/* ── AI ──────────────────────────────────────────────────────────────── */

function pieceValue(cell, opponentCells) {
  let value = VALUE[cell.animal] ?? 10
  if (cell.animal === 'rat' && opponentCells.some((other) => other.revealed && other.animal === 'elephant')) value += 12
  if (cell.animal === 'elephant') value += 4
  return value
}

function evaluate(state, actor) {
  const color = colorOfActor(state, actor)
  if (color === null) return 0
  const opponentColor = 3 - color
  let score = 0
  const ownCells = state.cells.filter((cell) => cell !== null && cell.revealed && cell.owner === color)
  const enemyCells = state.cells.filter((cell) => cell !== null && cell.revealed && cell.owner === opponentColor)
  for (const cell of ownCells) score += pieceValue(cell, enemyCells)
  for (const cell of enemyCells) score -= pieceValue(cell, ownCells)
  score += legalActions(state, actor).filter((action) => action.type === 'move').length * 0.6
  score -= legalActions(state, otherActor(actor)).filter((action) => action.type === 'move').length * 0.4
  return score
}

function terminalValue(state, rootActor) {
  if (state.status === 'draw') return 0
  if (state.status === 'playing') return null
  return state.winner === rootActor ? WIN : -WIN
}

function negamax(state, actor, depth, rootActor, alpha, beta) {
  const terminal = terminalValue(state, rootActor)
  if (terminal !== null) return terminal
  if (depth <= 0) return evaluate(state, actor)
  const moves = legalActions(state, actor).filter((action) => action.type === 'move')
  if (moves.length === 0) return evaluate(state, actor)

  let best = -Infinity
  for (const move of moves) {
    const next = applyAction(state, move)
    const value = -negamax(next, otherActor(actor), depth - 1, rootActor, -beta, -alpha)
    if (value > best) best = value
    if (best > alpha) alpha = best
    if (alpha >= beta) break
  }
  return best
}

function bestMove(state, moves, depth, random) {
  let best = null
  let bestValue = -Infinity
  for (const move of moves) {
    const next = applyAction(state, move)
    const terminal = terminalValue(next, ACTOR_AI)
    const value = terminal !== null
      ? (terminal === WIN ? WIN : terminal)
      : -negamax(next, ACTOR_HUMAN, Math.max(0, depth - 1), ACTOR_AI, -Infinity, Infinity)
    const jitter = random() * 0.001
    if (value + jitter > bestValue) {
      bestValue = value + jitter
      best = move
    }
  }
  return { action: best, value: bestValue }
}

/**
 * 选一个动作。AI 只读取公开信息：暗格一律按未知处理，翻棋只随机选格子。
 * @param state 当前局面
 * @param level easy | medium | hard
 * @param random 可注入随机源
 */
export function chooseDarkAction(state, level = 'medium', random = Math.random) {
  const actions = legalActions(state, state.turn)
  if (actions.length === 0) return null
  const flips = actions.filter((action) => action.type === 'flip')
  const moves = actions.filter((action) => action.type === 'move')

  if (moves.length === 0) return flips[Math.floor(random() * flips.length)]

  if (level === 'easy') {
    if (random() < 0.4) return actions[Math.floor(random() * actions.length)]
    const { action } = bestMove(state, moves, 1, random)
    return action
  }

  const depth = level === 'hard' ? 3 : 2
  const { action, value } = bestMove(state, moves, depth, random)
  // 所有走法都吃亏、且还有暗棋可翻时，翻棋换换手气。
  if (level !== 'easy' && value < -150 && flips.length > 0 && random() < 0.65) {
    return flips[Math.floor(random() * flips.length)]
  }
  return action
}

export function actionLabel(state, action) {
  if (!action) return ''
  if (action.type === 'flip') {
    const cell = state.cells[action.cell]
    return `${cellName(action.cell)} ${ANIMAL_BY_ID[cell.animal].name}`
  }
  const piece = state.cells[action.from]
  const from = cellName(action.from)
  const to = cellName(action.to)
  const captured = state.cells[action.to]
  return captured !== null && captured.revealed
    ? `${from}→${to} 吃${ANIMAL_BY_ID[captured.animal].name}`
    : `${from}→${to}`
}

export { ACTOR_AI, ACTOR_HUMAN, NO_PROGRESS_DRAW_PLIES, POWER, VALUE }

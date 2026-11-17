/**
 * 一局五子棋的不可变状态机。React 半只负责把动作接到这里，
 * 规则判定与 AI 都用 @shared/gomoku 的纯函数，方便 Node 侧单测。
 */
import {
  BLACK,
  EMPTY,
  SIZE,
  cloneBoard,
  createBoard,
  findWin,
  isBoardFull,
  otherPlayer,
} from '../shared/gomoku.js'

export const LEVELS = ['easy', 'medium', 'hard']

export function normalizeLevel(level) {
  return LEVELS.includes(level) ? level : 'medium'
}

export function newMatch({ humanColor = BLACK, level = 'medium' } = {}) {
  return {
    id: `m${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    board: createBoard(SIZE),
    moves: [],
    turn: BLACK,
    status: 'playing',
    winLine: null,
    lastMove: null,
    humanColor,
    level: normalizeLevel(level),
    startedAt: Date.now(),
    endedAt: null,
  }
}

export function aiColorOf(match) {
  return otherPlayer(match.humanColor)
}

export function isAiTurn(match) {
  return match.status === 'playing' && match.turn === aiColorOf(match)
}

export function canUndo(match) {
  return match.moves.some((move) => move.p === match.humanColor)
}

/** 落子并结算胜负。非法落子返回原对象。 */
export function placeStone(match, x, y) {
  if (match.status !== 'playing') return match
  if (!Number.isInteger(x) || !Number.isInteger(y)) return match
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return match
  const index = y * SIZE + x
  if (match.board[index] !== EMPTY) return match

  const player = match.turn
  const board = cloneBoard(match.board)
  board[index] = player
  const winLine = findWin(board, SIZE, x, y)
  const move = { x, y, p: player }
  const moves = [...match.moves, move]

  let status = 'playing'
  let endedAt = null
  if (winLine !== null) {
    status = player === match.humanColor ? 'win' : 'lose'
    endedAt = Date.now()
  } else if (isBoardFull(board)) {
    status = 'draw'
    endedAt = Date.now()
  }

  return {
    ...match,
    board,
    moves,
    turn: otherPlayer(player),
    status,
    winLine,
    lastMove: move,
    endedAt,
  }
}

/**
 * 悔棋：退回到「人类上一次落子之前」，因此会一次带走 AI 的应手。
 * 没有人类棋子可退时返回原对象。
 */
export function undoToHumanTurn(match) {
  let lastHuman = -1
  for (let i = match.moves.length - 1; i >= 0; i -= 1) {
    if (match.moves[i].p === match.humanColor) {
      lastHuman = i
      break
    }
  }
  if (lastHuman < 0) return match

  const moves = match.moves.slice(0, lastHuman)
  const board = createBoard(SIZE)
  for (const move of moves) board[move.y * SIZE + move.x] = move.p

  return {
    ...match,
    board,
    moves,
    turn: moves.length > 0 ? otherPlayer(moves[moves.length - 1].p) : BLACK,
    status: 'playing',
    winLine: null,
    lastMove: moves.length > 0 ? moves[moves.length - 1] : null,
    endedAt: null,
  }
}

/** 从棋谱重建棋盘（用于从本地存档恢复）。 */
export function matchFromMoves({ moves, humanColor, level, startedAt }) {
  let match = {
    ...newMatch({ humanColor, level }),
    startedAt: Number.isFinite(startedAt) ? startedAt : Date.now(),
  }
  for (const move of Array.isArray(moves) ? moves : []) {
    if (
      !move ||
      !Number.isInteger(move.x) ||
      !Number.isInteger(move.y) ||
      (move.p !== BLACK && move.p !== otherPlayer(BLACK))
    ) {
      continue
    }
    match = placeStone(match, move.x, move.y)
  }
  return match
}

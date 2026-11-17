import test from 'node:test'
import assert from 'node:assert/strict'
import { BLACK, WHITE, SIZE, createBoard, findWin } from '../src/shared/gomoku.js'
import {
  newMatch,
  placeStone,
  undoToHumanTurn,
  isAiTurn,
  canUndo,
  aiColorOf,
  matchFromMoves,
} from '../src/shared/match.js'

test('newMatch：玩家执黑时轮到人类，执白时轮到 AI', () => {
  const black = newMatch({ humanColor: BLACK, level: 'medium' })
  assert.equal(black.turn, BLACK)
  assert.equal(isAiTurn(black), false)
  assert.equal(aiColorOf(black), WHITE)
  assert.equal(black.status, 'playing')

  const white = newMatch({ humanColor: WHITE, level: 'medium' })
  assert.equal(white.turn, BLACK)
  assert.equal(isAiTurn(white), true)
})

test('落子交替，重复落子无效', () => {
  let match = newMatch({ humanColor: BLACK })
  match = placeStone(match, 7, 7)
  assert.equal(match.board[7 * SIZE + 7], BLACK)
  assert.equal(match.turn, WHITE)
  const again = placeStone(match, 7, 7)
  assert.equal(again, match)
  assert.equal(again.moves.length, 1)
})

test('人类五连 => win，AI 五连 => lose', () => {
  let match = newMatch({ humanColor: BLACK })
  for (const x of [3, 4, 5, 6]) {
    match = placeStone(match, x, 8)
    match = placeStone(match, x, 9) // 白棋陪跑，不构成五连
  }
  match = placeStone(match, 7, 8)
  assert.equal(match.status, 'win')
  assert.ok(match.winLine)

  let lose = newMatch({ humanColor: BLACK })
  const humanMoves = [[0, 0], [2, 0], [4, 0], [6, 0], [8, 0]]
  for (let i = 0; i < 5; i += 1) {
    lose = placeStone(lose, humanMoves[i][0], humanMoves[i][1]) // 人类陪跑
    lose = placeStone(lose, 11, 4 + i) // AI 白棋竖线五连
  }
  assert.equal(lose.status, 'lose')
})

test('悔棋退回人类上一次落子之前，并同时撤销 AI 应手', () => {
  let match = newMatch({ humanColor: BLACK })
  match = placeStone(match, 7, 7) // 人
  match = placeStone(match, 7, 8) // AI
  assert.equal(match.moves.length, 2)
  assert.equal(canUndo(match), true)

  const undone = undoToHumanTurn(match)
  assert.equal(undone.moves.length, 0)
  assert.equal(undone.turn, BLACK)
  assert.equal(undone.status, 'playing')
  assert.equal(undone.board[7 * SIZE + 7], 0)
  assert.equal(canUndo(undone), false)
  assert.equal(undoToHumanTurn(undone), undone)
})

test('执白时悔棋只在有己方棋子后可用', () => {
  let match = newMatch({ humanColor: WHITE })
  assert.equal(canUndo(match), false)
  match = placeStone(match, 7, 7) // AI 黑
  assert.equal(canUndo(match), false)
  match = placeStone(match, 7, 8) // 人 白
  match = placeStone(match, 8, 8) // AI 黑
  assert.equal(canUndo(match), true)
  const undone = undoToHumanTurn(match)
  assert.equal(undone.moves.length, 1)
  assert.equal(undone.turn, WHITE)
})

test('从棋谱恢复局面与直接落子一致', () => {
  let match = newMatch({ humanColor: BLACK, level: 'hard' })
  match = placeStone(match, 7, 7)
  match = placeStone(match, 8, 8)
  match = placeStone(match, 6, 7)
  const rebuilt = matchFromMoves({
    moves: match.moves,
    humanColor: match.humanColor,
    level: match.level,
    startedAt: match.startedAt,
  })
  assert.deepEqual([...rebuilt.board], [...match.board])
  assert.equal(rebuilt.turn, match.turn)
  assert.equal(rebuilt.moves.length, 3)
  assert.equal(rebuilt.level, 'hard')
})

test('胜利后不可继续落子', () => {
  let match = newMatch({ humanColor: BLACK })
  for (const x of [3, 4, 5, 6]) {
    match = placeStone(match, x, 8)
    match = placeStone(match, x, 9)
  }
  match = placeStone(match, 7, 8)
  assert.equal(match.status, 'win')
  const after = placeStone(match, 1, 1)
  assert.equal(after, match)
})

test('每局都有独立 id（用于避免重复记账）', () => {
  const first = newMatch({ humanColor: BLACK })
  const second = newMatch({ humanColor: BLACK })
  assert.notEqual(first.id, second.id)
})

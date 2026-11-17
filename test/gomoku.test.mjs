import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BLACK,
  WHITE,
  SIZE,
  createBoard,
  findWin,
  wouldWin,
  candidateMoves,
  isBoardFull,
  pointScore,
  pickMove,
} from '../src/shared/gomoku.js'

function place(board, cells, player) {
  for (const [x, y] of cells) board[y * SIZE + x] = player
}

test('横向五连获胜并返回完整连线', () => {
  const board = createBoard()
  place(board, [[3, 7], [4, 7], [5, 7], [6, 7]], BLACK)
  board[7 * SIZE + 7] = BLACK
  const line = findWin(board, SIZE, 7, 7)
  assert.deepEqual(line, [[3, 7], [4, 7], [5, 7], [6, 7], [7, 7]])
})

test('斜向五连获胜', () => {
  const board = createBoard()
  place(board, [[2, 2], [3, 3], [4, 4], [6, 6]], WHITE)
  board[5 * SIZE + 5] = WHITE
  const line = findWin(board, SIZE, 5, 5)
  assert.equal(line.length, 5)
})

test('四连不算胜，补一手会赢', () => {
  const board = createBoard()
  place(board, [[3, 7], [4, 7], [5, 7], [6, 7]], BLACK)
  assert.equal(findWin(board, SIZE, 6, 7), null)
  assert.equal(wouldWin(board, SIZE, 2, 7, BLACK), true)
  assert.equal(wouldWin(board, SIZE, 7, 7, BLACK), true)
  assert.equal(wouldWin(board, SIZE, 7, 7, WHITE), false)
})

test('候选点只落在已有棋子附近；空盘下天元', () => {
  const board = createBoard()
  assert.deepEqual(candidateMoves(board, SIZE, 2), [{ x: 7, y: 7 }])
  board[7 * SIZE + 7] = BLACK
  const moves = candidateMoves(board, SIZE, 2)
  assert.ok(moves.length > 0)
  assert.ok(moves.every((m) => Math.abs(m.x - 7) <= 2 && Math.abs(m.y - 7) <= 2))
  assert.ok(!moves.some((m) => m.x === 7 && m.y === 7))
})

test('AI 会立即取胜而不是去防守', () => {
  const board = createBoard()
  // AI 白棋四连，同时黑棋也有四连；白棋必须直接成五。
  place(board, [[3, 7], [4, 7], [5, 7], [6, 7]], WHITE)
  place(board, [[3, 8], [4, 8], [5, 8], [6, 8]], BLACK)
  const move = pickMove(board, SIZE, WHITE, { level: 'medium' })
  assert.ok(
    (move.x === 2 && move.y === 7) || (move.x === 7 && move.y === 7),
    `expected winning move, got ${JSON.stringify(move)}`,
  )
  assert.equal(wouldWin(board, SIZE, move.x, move.y, WHITE), true)
})

test('AI 会堵住对手的冲四', () => {
  const board = createBoard()
  place(board, [[3, 7], [4, 7], [5, 7], [6, 7]], BLACK)
  place(board, [[4, 8], [5, 8], [6, 8]], WHITE)
  const move = pickMove(board, SIZE, WHITE, { level: 'medium' })
  assert.ok(
    (move.x === 2 && move.y === 7) || (move.x === 7 && move.y === 7),
    `expected block, got ${JSON.stringify(move)}`,
  )
})

test('不会落在已有棋子上，也不会越界', () => {
  const board = createBoard()
  board[7 * SIZE + 7] = BLACK
  for (const level of ['easy', 'medium', 'hard']) {
    const move = pickMove(board, SIZE, WHITE, { level })
    assert.ok(move)
    assert.ok(move.x >= 0 && move.x < SIZE && move.y >= 0 && move.y < SIZE)
    assert.equal(board[move.y * SIZE + move.x], 0)
  }
})

test('点评估：活三高于冲三，双活三有额外加成', () => {
  const board = createBoard()
  place(board, [[5, 7], [6, 7]], BLACK)
  const openThree = pointScore(board, SIZE, 7, 7, BLACK)

  const closed = createBoard()
  place(closed, [[0, 7], [1, 7]], BLACK)
  const closedThree = pointScore(closed, SIZE, 2, 7, BLACK)
  assert.ok(openThree > closedThree)

  const double = createBoard()
  place(double, [[5, 7], [6, 7], [7, 5], [7, 6]], BLACK)
  assert.ok(pointScore(double, SIZE, 7, 7, BLACK) > openThree * 1.5)
})

test('满盘返回 null', () => {
  const board = createBoard()
  board.fill(BLACK)
  assert.equal(isBoardFull(board), true)
  assert.equal(pickMove(board, SIZE, WHITE, { level: 'easy' }), null)
})

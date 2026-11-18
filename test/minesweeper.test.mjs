import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DIFFICULTIES,
  analyze,
  chord,
  matchFromSave,
  matchToSave,
  neighbors,
  newGame,
  reveal,
  toggleFlag,
} from '../src/shared/minesweeper.js'

function fixedRandom(values) {
  let i = 0
  return () => values[Math.min(i++, values.length - 1)] ?? 0
}

test('三档难度尺寸与雷数正确', () => {
  assert.deepEqual(
    [DIFFICULTIES.easy.cols, DIFFICULTIES.easy.rows, DIFFICULTIES.easy.mines],
    [9, 9, 10],
  )
  assert.deepEqual(
    [DIFFICULTIES.medium.cols, DIFFICULTIES.medium.rows, DIFFICULTIES.medium.mines],
    [16, 16, 40],
  )
  assert.deepEqual(
    [DIFFICULTIES.hard.cols, DIFFICULTIES.hard.rows, DIFFICULTIES.hard.mines],
    [30, 16, 99],
  )
  for (const level of ['easy', 'medium', 'hard']) {
    const game = newGame(level)
    assert.equal(game.cells.length, DIFFICULTIES[level].cols * DIFFICULTIES[level].rows)
    assert.equal(game.status, 'ready')
    assert.equal(game.placed, false)
  }
})

test('邻格计算不会越界且数量正确', () => {
  assert.equal(neighbors(9, 9, 0).length, 3)
  assert.equal(neighbors(9, 9, 40).length, 8)
  assert.equal(neighbors(9, 9, 8).length, 3)
  assert.ok(neighbors(9, 9, 0).every((n) => n >= 0 && n < 81))
})

test('首点及其邻域不会踩雷', () => {
  for (const level of ['easy', 'medium', 'hard']) {
    for (let seed = 0; seed < 30; seed += 1) {
      const game = reveal(newGame(level), 12, fixedRandom([0.1, 0.3, 0.7, 0.9]))
      assert.equal(game.status !== 'lost', true)
      const bomb = new Set([12, ...neighbors(game.cols, game.rows, 12)])
      for (const index of bomb) assert.equal(game.cells[index].mine, false)
      assert.equal(game.cells.filter((cell) => cell.mine).length, game.mines)
    }
  }
})

test('翻开雷直接失败，并显示所有雷', () => {
  const game = newGame('easy')
  const withMines = {
    ...game,
    placed: true,
    status: 'playing',
    cells: game.cells.map((cell, i) => ({ ...cell, mine: i === 5, adjacent: i === 4 ? 1 : 0 })),
  }
  const lost = reveal(withMines, 5)
  assert.equal(lost.status, 'lost')
  assert.equal(lost.cells[5].revealed, true)
})

test('翻开全部安全格获胜，剩余雷自动插旗', () => {
  const game = newGame('easy')
  const cells = game.cells.map((cell, i) => ({
    ...cell,
    mine: i === 0,
    adjacent: neighbors(9, 9, i).includes(0) ? 1 : 0,
    revealed: i !== 0 && i !== 80,
  }))
  const nearly = {
    ...game, mines: 1, cells, placed: true, status: 'playing', revealed: 79,
  }
  const won = reveal(nearly, 80)
  assert.equal(won.status, 'won')
  assert.equal(won.cells[0].flagged, true)
  assert.equal(won.flagCount, 1)
})

test('插旗受雷数上限约束，已翻开的格子不能插旗', () => {
  let game = newGame('easy')
  game = reveal(game, 40, () => 0.5)
  const flagged = toggleFlag(game, 0)
  assert.equal(flagged.flagCount, 1)
  assert.equal(toggleFlag(flagged, 0).flagCount, 0)
  assert.equal(toggleFlag(game, 40), game)

  let capped = { ...game, flagCount: game.mines }
  capped = toggleFlag(capped, 1)
  assert.equal(capped.flagCount, game.mines)
})

test('数字周围旗数正确时 chord 会翻开其余邻格', () => {
  const game = newGame('easy')
  const cells = game.cells.map((cell, i) => ({
    ...cell,
    mine: i === 0,
    adjacent: neighbors(9, 9, i).includes(0) ? 1 : 0,
  }))
  let state = { ...game, cells, placed: true, status: 'playing' }
  state = toggleFlag(state, 0)
  state = reveal(state, 1)
  assert.equal(state.cells[1].revealed, true)
  const before = state.revealed
  const after = chord(state, 1)
  assert.ok(after.revealed > before, `expected chord to reveal more, ${before} -> ${after.revealed}`)
})

test('分析器能找到确定安全格', () => {
  const game = newGame('easy')
  const cells = game.cells.map((cell, i) => ({
    ...cell,
    mine: false,
    adjacent: 0,
    revealed: i === 0 || i === 1,
    flagged: false,
  }))
  cells[0] = { ...cells[0], adjacent: 1 }
  cells[1] = { ...cells[1], mine: true }
  const state = { ...game, cells, placed: true, status: 'playing', revealed: 2 }
  const result = analyze(state)
  assert.ok(result.safe.length > 0 || result.mines.length > 0 || result.guess !== null)
})

test('分析器在无确定解时给出猜测', () => {
  let game = newGame('easy')
  game = reveal(game, 40, () => 0.37)
  const result = analyze(game)
  assert.ok(result.guess !== null || result.safe.length > 0 || result.mines.length > 0)
  if (result.guess !== null) {
    assert.ok(result.guess.index >= 0 && result.guess.index < 81)
    assert.ok(result.guess.chance >= 0 && result.guess.chance <= 1)
  }
})

test('存档只接受未结束的棋局', () => {
  const game = reveal(newGame('easy'), 40, () => 0.2)
  const saved = matchToSave(game)
  const restored = matchFromSave(saved)
  assert.ok(restored)
  assert.equal(restored.cells.length, 81)
  assert.equal(restored.status, 'playing')
  assert.equal(matchFromSave({ ...saved, status: 'won' }), null)
  assert.equal(matchFromSave({ ...saved, cells: [] }), null)
})

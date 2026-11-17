import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ACTOR_AI,
  ACTOR_HUMAN,
  ANIMALS,
  DARK_CELLS,
  applyAction,
  canCapture,
  chooseDarkAction,
  createSeed,
  legalActions,
  matchFromSave,
  matchToSave,
  newDarkMatch,
  replay,
  undoToHumanTurn,
} from '../src/shared/dark-animals.js'

function piece(animal, owner, revealed = true) {
  return { animal, owner, revealed }
}

function customState({ cells, humanColor = 1, turn = ACTOR_HUMAN, firstFlipDone = true, level = 'medium' }) {
  const normalized = Array.from({ length: DARK_CELLS }, (_, index) => {
    const value = cells[index]
    return value === undefined || value === null ? null : value
  })
  return {
    id: 'test',
    seed: normalized.map((cell) => (cell === null ? { animal: 'rat', owner: 1 } : { animal: cell.animal, owner: cell.owner })),
    cells: normalized,
    turn,
    status: 'playing',
    winner: null,
    humanColor,
    aiColor: 3 - humanColor,
    firstFlipDone,
    actions: [],
    captured: { 1: [], 2: [] },
    noProgress: 0,
    repetitions: {},
    startedAt: Date.now(),
    endedAt: null,
    lastAction: null,
    level,
  }
}

test('开局 16 枚暗棋：八兽各两枚、双方各一套、全部盖住', () => {
  const state = newDarkMatch({ random: () => 0.42 })
  assert.equal(state.cells.length, 16)
  assert.ok(state.cells.every((cell) => cell.revealed === false))
  assert.equal(state.humanColor, null)
  assert.equal(state.turn, ACTOR_HUMAN)
  for (const animal of ANIMALS) {
    const copies = state.seed.filter((cell) => cell.animal === animal.id)
    assert.equal(copies.length, 2)
    assert.deepEqual(copies.map((cell) => cell.owner).sort(), [1, 2])
  }
})

test('第一枚翻棋决定双方颜色', () => {
  const seed = createSeed(() => 0.2)
  seed[0] = { animal: 'tiger', owner: 2 }
  const state = replay(seed, [])
  const next = applyAction(state, { type: 'flip', cell: 0 })
  assert.equal(next.humanColor, 2)
  assert.equal(next.aiColor, 1)
  assert.equal(next.firstFlipDone, true)
  assert.equal(next.cells[0].revealed, true)
  assert.equal(next.turn, ACTOR_AI)
})

test('等级与鼠象克制：同级可吃、鼠吃象、象不能吃鼠', () => {
  assert.equal(canCapture('lion', 'tiger'), true)
  assert.equal(canCapture('tiger', 'lion'), false)
  assert.equal(canCapture('wolf', 'wolf'), true)
  assert.equal(canCapture('rat', 'elephant'), true)
  assert.equal(canCapture('elephant', 'rat'), false)
})

test('暗棋不能盲吃；明棋正交一格吃子', () => {
  const state = customState({
    cells: {
      0: piece('rat', 1),
      1: piece('elephant', 2),
      2: piece('cat', 2, false),
    },
  })
  const moves = legalActions(state, ACTOR_HUMAN).filter((action) => action.type === 'move')
  assert.ok(moves.some((action) => action.from === 0 && action.to === 1))
  assert.ok(!moves.some((action) => action.from === 0 && action.to === 2))
  const blocked = applyAction(state, { type: 'move', from: 0, to: 2 })
  assert.equal(blocked, state)
})

test('吃光对方最后一只兽即获胜', () => {
  const state = customState({
    cells: {
      0: piece('lion', 1),
      1: piece('cat', 2),
    },
  })
  const next = applyAction(state, { type: 'move', from: 0, to: 1 })
  assert.equal(next.status, 'win')
  assert.equal(next.winner, ACTOR_HUMAN)
  assert.deepEqual(next.captured[2], ['cat'])
})

test('对方无翻棋也无走法时判负', () => {
  // 鼠在角落，被狮、虎堵死；鼠不能吃它们，也没有空格可走。
  const state = customState({
    cells: {
      0: piece('rat', 2),
      1: piece('lion', 1),
      4: piece('tiger', 1),
      10: piece('dog', 1),
      15: piece('wolf', 1),
    },
    turn: ACTOR_HUMAN,
  })
  const next = applyAction(state, { type: 'move', from: 10, to: 11 })
  assert.equal(next.status, 'win')
  assert.equal(next.winner, ACTOR_HUMAN)
})

test('100 手无翻棋/吃子判和', () => {
  let state = customState({
    cells: {
      0: piece('lion', 1),
      15: piece('cat', 2),
    },
  })
  const cycle = [
    [0, 1], [15, 14], [1, 0], [14, 15],
  ]
  for (let turn = 0; turn < 100; turn += 1) {
    const [from, to] = cycle[turn % 4]
    // 本测试只验证 100 手无进展规则，重置重复局面计数避免先触发三次重复和棋。
    state = { ...state, repetitions: {} }
    state = applyAction(state, { type: 'move', from, to })
    if (turn < 99) assert.equal(state.status, 'playing')
  }
  assert.equal(state.status, 'draw')
})

test('存档与悔棋：恢复颜色、暗棋与棋谱', () => {
  const seed = createSeed(() => 0.31)
  const state = replay(seed, [])
  const flipped = applyAction(state, { type: 'flip', cell: 5 })
  const aiFlip = applyAction(flipped, { type: 'flip', cell: 9 })
  const saved = matchToSave(aiFlip)
  const restored = matchFromSave(saved)
  assert.ok(restored)
  assert.deepEqual(restored.cells.map((cell) => cell?.revealed ?? null), aiFlip.cells.map((cell) => cell?.revealed ?? null))
  assert.equal(restored.humanColor, aiFlip.humanColor)
  assert.equal(restored.cells[5].animal, aiFlip.cells[5].animal)

  const undone = undoToHumanTurn(aiFlip)
  assert.equal(undone.actions.length, 0)
  assert.equal(undone.turn, ACTOR_HUMAN)
  assert.equal(undone.humanColor, null)
})

test('AI 只按公开信息决策：暗棋身份不同但公开局面相同时走法一致', () => {
  const baseCells = {
    0: piece('lion', 1),
    1: piece('tiger', 1),
    5: piece('cat', 2),
    6: piece('dog', 2),
    8: piece('wolf', 2),
  }
  const first = customState({ cells: { ...baseCells, 10: piece('elephant', 1, false) } })
  const second = customState({ cells: { ...baseCells, 10: piece('rat', 2, false) } })
  const random = () => 0.5
  const a = chooseDarkAction(first, 'hard', random)
  const b = chooseDarkAction(second, 'hard', random)
  assert.ok(a && b)
  assert.deepEqual({ type: a.type, from: a.from, to: a.to }, { type: b.type, from: b.from, to: b.to })
})

test('AI 每次只返回合法动作', () => {
  let state = newDarkMatch({ random: () => 0.13 })
  for (let i = 0; i < 80 && state.status === 'playing'; i += 1) {
    const actor = state.turn
    const action = actor === ACTOR_AI ? chooseDarkAction(state, 'hard') : legalActions(state, actor)[0]
    assert.ok(action)
    assert.ok(legalActions(state, actor).some((candidate) => JSON.stringify(candidate) === JSON.stringify(action)))
    state = applyAction(state, action)
  }
})

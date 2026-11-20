import test from 'node:test'
import assert from 'node:assert/strict'
import {
  STACK,
  cameraOffset,
  createTower,
  resolveDrop,
  tiltOf,
  topBlock,
  towerFromSave,
  towerToSave,
} from '../src/shared/stack.js'

test('初始楼只有一块基座', () => {
  const tower = createTower()
  assert.equal(tower.blocks.length, 1)
  assert.equal(tower.score, 0)
  assert.equal(tower.status, 'playing')
  assert.equal(topBlock(tower).width, STACK.baseWidth)
})

test('完美对齐保留宽度并降低晃动', () => {
  const tower = createTower()
  const top = topBlock(tower)
  const result = resolveDrop(tower, top.x + top.width / 2)
  assert.equal(result.outcome, 'perfect')
  assert.equal(result.tower.blocks.length, 2)
  assert.equal(topBlock(result.tower).width, top.width)
  assert.equal(result.tower.score, 1)
})

test('偏移时保留整块楼板（含悬空部分）', () => {
  const tower = createTower()
  const top = topBlock(tower)
  const result = resolveDrop(tower, top.x + top.width / 2 + 20)
  assert.equal(result.outcome, 'landed')
  const next = topBlock(result.tower)
  assert.equal(next.width, top.width)
  assert.ok(next.x > top.x)
})

test('支撑太少会掉下去', () => {
  const tower = createTower()
  const top = topBlock(tower)
  const result = resolveDrop(tower, top.x - top.width * 0.4)
  assert.equal(result.outcome, 'miss')
  assert.equal(result.tower.status, 'over')
  assert.equal(result.tower.reason, 'miss')
  assert.equal(result.tower.blocks.length, 1)
})

test('连续向同一侧歪会积累 lean 并最终倒塌', () => {
  let tower = createTower()
  let outcome = null
  for (let i = 0; i < 20 && tower.status === 'playing'; i += 1) {
    const top = topBlock(tower)
    const result = resolveDrop(tower, top.x + top.width / 2 + top.width * 0.3)
    tower = result.tower
    outcome = result.outcome
  }
  assert.equal(tower.status, 'over')
  assert.equal(outcome, 'topple')
  assert.ok(tower.blocks.length > 1)
})

test('相机在楼层超过可见数后向上滚动', () => {
  assert.equal(cameraOffset(1), 0)
  assert.equal(cameraOffset(STACK.visibleFloors), 0)
  assert.equal(cameraOffset(STACK.visibleFloors + 2), STACK.blockHeight * 2)
})

test('倾斜角随 lean 增大并被限制', () => {
  const low = { ...createTower(), lean: 0.2 }
  const high = { ...createTower(), lean: 1 }
  assert.ok(tiltOf(high) > tiltOf(low))
  assert.ok(Math.abs(tiltOf({ ...createTower(), lean: 99 })) <= STACK.maxLean * 7)
})

test('存档恢复楼层与分数', () => {
  let tower = createTower()
  const top = topBlock(tower)
  tower = resolveDrop(tower, top.x + top.width / 2 + 12).tower
  const restored = towerFromSave(towerToSave(tower))
  assert.ok(restored)
  assert.equal(restored.blocks.length, tower.blocks.length)
  assert.equal(restored.score, tower.score)
  assert.equal(restored.blocks[1].width, tower.blocks[1].width)
})

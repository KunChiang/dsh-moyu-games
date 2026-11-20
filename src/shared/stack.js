/**
 * 叠楼 —— 吊车左右摆动，点击放下楼层。
 *
 * 规则：
 * - 吊车带着与当前楼顶同宽的楼板左右移动，点击放下；
 * - 楼板整块保留（悬空部分也留在楼上），但支撑太少会直接掉下去；
 * - 连续歪向一侧会让 lean 增大，楼越晃越厉害，lean 超过上限就整体倒塌。
 * - 相机只跟随顶部，底部楼层逐渐移出画面，画布高度不随楼层增长。
 * - 完全对齐算 perfect，不损失宽度并让晃动回落。
 */

export const STACK = Object.freeze({
  width: 360,
  height: 560,
  blockHeight: 32,
  baseY: 520,
  baseWidth: 150,
  visibleFloors: 9,
  maxLean: 1.1,
  perfectTolerance: 4,
})

export function createTower() {
  const x = (STACK.width - STACK.baseWidth) / 2
  return {
    blocks: [{ x, width: STACK.baseWidth, level: 0 }],
    score: 0,
    lean: 0,
    status: 'playing',
    reason: null,
  }
}

export function topBlock(tower) {
  return tower.blocks[tower.blocks.length - 1]
}

export function cameraOffset(count) {
  return Math.max(0, (count - STACK.visibleFloors) * STACK.blockHeight)
}

export function tiltOf(tower) {
  const lean = Math.max(-STACK.maxLean, Math.min(STACK.maxLean, tower.lean))
  return lean * 7
}

/**
 * 计算一次落板。center 是吊车中心（世界坐标）。
 * @returns {{ tower, outcome: 'perfect'|'landed'|'miss'|'topple', block }}
 */
export function resolveDrop(tower, center) {
  if (tower.status !== 'playing') return { tower, outcome: 'none', block: null }
  const top = topBlock(tower)
  const width = top.width
  const left = center - width / 2
  const right = center + width / 2
  const overlapLeft = Math.max(top.x, left)
  const overlapRight = Math.min(top.x + top.width, right)
  const overlap = overlapRight - overlapLeft
  // 整块保留，但至少要有一小部分压在楼顶上，否则支撑不住会掉下去。
  const minimumSupport = width * 0.25

  if (overlap < minimumSupport) {
    return {
      tower: { ...tower, status: 'over', reason: 'miss' },
      outcome: 'miss',
      block: null,
    }
  }

  const topCenter = top.x + top.width / 2
  const offset = center - topCenter
  const normalized = offset / width
  const perfect = Math.abs(offset) <= Math.min(STACK.perfectTolerance, width * 0.06)

  // 不裁掉悬空部分：整块楼板都留在楼上。
  const block = perfect
    ? { x: top.x, width: top.width, level: tower.blocks.length }
    : { x: left, width, level: tower.blocks.length }

  let lean = tower.lean * 0.68 + normalized * 1.4
  if (perfect) lean = tower.lean * 0.45

  const blocks = [...tower.blocks, block]
  const next = {
    ...tower,
    blocks,
    score: tower.score + 1,
    lean,
  }

  if (Math.abs(lean) >= STACK.maxLean) {
    return {
      tower: { ...next, status: 'over', reason: 'topple' },
      outcome: 'topple',
      block,
    }
  }

  return { tower: next, outcome: perfect ? 'perfect' : 'landed', block }
}

export function towerToSave(tower) {
  return {
    blocks: tower.blocks,
    score: tower.score,
    lean: tower.lean,
  }
}

export function towerFromSave(saved) {
  if (!saved || !Array.isArray(saved.blocks) || saved.blocks.length === 0) return null
  const blocks = []
  for (const block of saved.blocks) {
    if (!Number.isFinite(block?.x) || !Number.isFinite(block?.width)) return null
    if (block.width <= 0) return null
    blocks.push({ x: block.x, width: block.width, level: blocks.length })
  }
  return {
    blocks,
    score: Number.isFinite(saved.score) ? saved.score : blocks.length - 1,
    lean: Number.isFinite(saved.lean) ? saved.lean : 0,
    status: 'playing',
    reason: null,
  }
}

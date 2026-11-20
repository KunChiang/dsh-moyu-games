import React from 'react'
import {
  STACK,
  cameraOffset,
  createTower,
  resolveDrop,
  tiltOf,
  topBlock,
  towerFromSave,
  towerToSave,
} from '../shared/stack.js'
import {
  clearStack,
  loadStack,
  saveStack,
  setStackBest,
  stackBest,
} from './storage.js'

const CRANE_RAIL_Y = 58
const CRANE_BLOCK_Y = 96
const BLOCK_HEIGHT = STACK.blockHeight
const BLOCK_GAP = 2
const PALETTE = ['#5eead4', '#93c5fd', '#c4b5fd', '#fcd34d', '#fca5a5', '#86efac', '#67e8f9', '#f9a8d4']

function blockColor(level) {
  return PALETTE[level % PALETTE.length]
}

export function StackMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="15" width="16" height="4" rx="1.2" fill="currentColor" opacity=".9" />
      <rect x="6" y="10" width="12" height="4" rx="1.2" fill="currentColor" opacity=".7" />
      <rect x="8" y="5" width="8" height="4" rx="1.2" fill="currentColor" opacity=".5" />
      <path d="M12 2v2M9.6 3.2 12 4l2.4-.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function Card({ title, children }) {
  return (
    <section className="myg-card">
      {title !== undefined && <h2 className="myg-cardTitle">{title}</h2>}
      {children}
    </section>
  )
}

export function StackGame({ t, active }) {
  const initial = (() => {
    const saved = loadStack()
    const restored = saved !== null ? towerFromSave(saved) : null
    return restored ?? createTower()
  })()
  const [game, setGame] = React.useState(initial)
  const [phase, setPhase] = React.useState('aiming')
  const [crane, setCrane] = React.useState({ x: STACK.width / 2, clock: 0 })
  const [fallY, setFallY] = React.useState(null)
  const [pending, setPending] = React.useState(null)
  const [quip, setQuip] = React.useState('stack.quip.greet')
  const [best, setBest] = React.useState(stackBest)
  const [newBest, setNewBest] = React.useState(false)

  const gameRef = React.useRef(game)
  gameRef.current = game
  const phaseRef = React.useRef('aiming')
  const craneRef = React.useRef(STACK.width / 2)
  const directionRef = React.useRef(1)
  const pendingRef = React.useRef(null)
  const bestRef = React.useRef(best)
  bestRef.current = best

  React.useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  React.useEffect(() => {
    if (phase !== 'aiming') return undefined
    let raf = 0
    let last = performance.now()
    const loop = (now) => {
      const dt = Math.min(40, now - last)
      last = now
      const current = gameRef.current
      if (current.status === 'playing') {
        const top = topBlock(current)
        const min = top.width / 2 + 12
        const max = STACK.width - top.width / 2 - 12
        const speed = 0.16 + Math.min(0.14, current.score * 0.006)
        let x = craneRef.current + directionRef.current * speed * dt
        if (x <= min) { x = min; directionRef.current = 1 }
        else if (x >= max) { x = max; directionRef.current = -1 }
        craneRef.current = x
        setCrane({ x, clock: now })
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  React.useEffect(() => {
    if (phase !== 'dropping' || pending === null) return undefined
    let raf = 0
    let start = null
    const duration = 240
    const step = (now) => {
      if (start === null) start = now
      const progress = Math.min(1, (now - start) / duration)
      setFallY(pending.from + (pending.to - pending.from) * progress * progress)
      if (progress < 1) {
        raf = requestAnimationFrame(step)
        return
      }
      settle()
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [phase, pending])

  const settle = React.useCallback(() => {
    const current = pendingRef.current
    if (current === null) return
    const next = current.result.tower
    gameRef.current = next
    setGame(next)
    setPending(null)
    setFallY(null)
    phaseRef.current = next.status === 'over' ? 'over' : 'aiming'
    setPhase(phaseRef.current)
    const outcome = current.result.outcome
    if (outcome === 'perfect') setQuip('stack.quip.perfect')
    else if (outcome === 'miss') setQuip('stack.quip.miss')
    else if (outcome === 'topple') setQuip('stack.quip.topple')
    else if (Math.abs(next.lean) > 0.65) setQuip('stack.quip.risky')
    else setQuip('stack.quip.landed')
    if (next.status === 'over' && next.score > bestRef.current) {
      bestRef.current = next.score
      setBest(next.score)
      setNewBest(true)
      setStackBest(next.score)
    }
  }, [])

  React.useEffect(() => {
    if (game.status === 'playing') saveStack(towerToSave(game))
    else clearStack()
  }, [game])

  const drop = React.useCallback(() => {
    if (phaseRef.current !== 'aiming') return
    const current = gameRef.current
    if (current.status !== 'playing') return
    const top = topBlock(current)
    const camera = cameraOffset(current.blocks.length)
    const cameraX = top.x + top.width / 2 - STACK.width / 2
    const worldCenter = craneRef.current + cameraX
    const result = resolveDrop(current, worldCenter)
    const target = STACK.baseY - (current.blocks.length + 1) * BLOCK_HEIGHT + camera
    const pendingDrop = {
      result,
      from: CRANE_BLOCK_Y,
      to: target,
      width: top.width,
      x: worldCenter - top.width / 2,
      level: current.blocks.length,
    }
    pendingRef.current = pendingDrop
    phaseRef.current = 'dropping'
    setPending(pendingDrop)
    setFallY(CRANE_BLOCK_Y)
    setPhase('dropping')
  }, [])

  const restart = React.useCallback(() => {
    const fresh = createTower()
    gameRef.current = fresh
    phaseRef.current = 'aiming'
    setGame(fresh)
    setPhase('aiming')
    setFallY(null)
    setPending(null)
    pendingRef.current = null
    setNewBest(false)
    setQuip('stack.quip.greet')
    craneRef.current = STACK.width / 2
    directionRef.current = 1
    clearStack()
  }, [])

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (!active) return
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target
      const typing = target !== null && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable === true
      )
      if (typing) return
      if (event.key === ' ' || event.key === 'Enter') {
        if (target !== null && target.closest?.('button') !== null) return
        event.preventDefault()
        drop()
      } else if (event.key === 'n' || event.key === 'N') {
        event.preventDefault()
        restart()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, drop, restart])

  const top = topBlock(game)
  const angle = tiltOf(game) + (
    game.status === 'playing'
      ? Math.sin(crane.clock / 330) * Math.min(2.4, Math.abs(game.lean) * 2.2)
      : 0
  )
  const camera = cameraOffset(game.blocks.length)
  const topCenter = top.x + top.width / 2
  const cameraX = topCenter - STACK.width / 2
  const baseCenter = topBlock(game).x + topBlock(game).width / 2
  const vertical = phase === 'dropping' ? fallY : CRANE_BLOCK_Y
  const visibleBlock = phase === 'dropping' && pending !== null
    ? { x: pending.x - cameraX, width: pending.width, level: pending.level }
    : { x: crane.x - top.width / 2, width: top.width, level: game.blocks.length }
  const resultTitle = t('stack.result.title')
  const resultDesc = t('stack.result.desc', { n: game.score, best })

  return (
    <div className="myg-main">
      <section className="myg-boardCard">
        {game.status === 'over' && (
          <div className="myg-result lose">
            <div>
              <div className="myg-resultTitle">{resultTitle}</div>
              <div className="myg-resultDesc">
                {resultDesc}{newBest ? ` · ${t('stack.newBest')}` : ''}
              </div>
            </div>
            <span className="myg-spacer" />
            <button type="button" className="myg-btn primary" onClick={restart}>{t('stack.result.again')}</button>
          </div>
        )}

        <div className="myg-boardTop">
          <span className="myg-turn">
            <i className={`myg-turnDot ${game.status === 'over' ? 'lost' : ''}`} />
            {t('stack.floors', { n: game.score })}
          </span>
          <span className="myg-turnHint">{t('stack.tip')}</span>
          <span className="myg-spacer" />
          <span className="myg-levelChip">{t('stack.bestLabel', { n: best })}</span>
        </div>

        <div className="myg-stackWrap">
          <svg
            className="myg-stackSvg"
            viewBox={`0 0 ${STACK.width} ${STACK.height}`}
            role="button"
            tabIndex={0}
            aria-label={t('stack.tip')}
            onClick={drop}
          >
            <defs>
              <linearGradient id="myg-stackSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" className="myg-stackSkyTop" />
                <stop offset="1" className="myg-stackSkyBottom" />
              </linearGradient>
              <linearGradient id="myg-stackFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" className="myg-stackFadeStart" />
                <stop offset="1" className="myg-stackFadeEnd" />
              </linearGradient>
            </defs>
            <rect width={STACK.width} height={STACK.height} fill="url(#myg-stackSky)" />
            <circle cx="72" cy="130" r="26" className="myg-stackCloud" />
            <circle cx="300" cy="210" r="20" className="myg-stackCloud" />
            <circle cx="210" cy="88" r="14" className="myg-stackCloud" />

            <g transform={`translate(${-cameraX} ${camera})`}>
              <rect x="-2000" y={STACK.baseY} width="4360" height={STACK.height - STACK.baseY} className="myg-stackGround" />
              <line x1="-2000" y1={STACK.baseY} x2="2360" y2={STACK.baseY} className="myg-stackGroundLine" />
              <g transform={`rotate(${angle} ${baseCenter} ${STACK.baseY})`}>
                {game.blocks.map((block) => (
                  <rect
                    key={block.level}
                    x={block.x}
                    y={STACK.baseY - (block.level + 1) * BLOCK_HEIGHT + BLOCK_GAP}
                    width={block.width}
                    height={BLOCK_HEIGHT - BLOCK_GAP}
                    rx={3}
                    fill={blockColor(block.level)}
                    stroke="rgba(15, 23, 42, .22)"
                    strokeWidth="1"
                  />
                ))}
              </g>
            </g>

            {camera > 0 && (
              <rect x="0" y={STACK.height - 110} width={STACK.width} height="110" fill="url(#myg-stackFade)" pointerEvents="none" />
            )}

            <g className="myg-stackCrane">
              <line x1="20" y1={CRANE_RAIL_Y} x2={STACK.width - 20} y2={CRANE_RAIL_Y} className="myg-stackRail" />
              <rect x={crane.x - 19} y={CRANE_RAIL_Y - 14} width="38" height="15" rx="4" className="myg-stackTrolley" />
              {phase !== 'dropping' && (
                <line x1={crane.x} y1={CRANE_RAIL_Y + 1} x2={crane.x} y2={CRANE_BLOCK_Y} className="myg-stackCable" />
              )}
              <rect
                x={visibleBlock.x}
                y={vertical}
                width={visibleBlock.width}
                height={16}
                rx={3}
                fill={blockColor(visibleBlock.level)}
                stroke="rgba(15, 23, 42, .22)"
                strokeWidth="1"
              />
            </g>
          </svg>
        </div>

        <div className="myg-boardFoot">
          <span className="myg-footMeta">{t('stack.bestLabel', { n: best })}</span>
          <span className="myg-spacer" />
          <button type="button" className="myg-btn primary" onClick={drop} disabled={phase !== 'aiming'}>
            {t('stack.drop')}
          </button>
          <button type="button" className="myg-btn" onClick={restart}>
            {t('restart')}
          </button>
        </div>
      </section>

      <aside className="myg-side">
        <Card title={t('opponent')}>
          <div className="myg-ai">
            <div className="myg-avatar"><StackMark size={22} /></div>
            <div className="myg-aiBody">
              <div className="myg-aiName">{t('opponent.name')} <span>{t('opponent.tag')}</span></div>
              <div className="myg-bubble">{t(quip)}</div>
            </div>
          </div>
        </Card>

        <Card title={t('stack.stats')}>
          <div className="myg-stackScores">
            <div><b>{game.score}</b><span>{t('stack.current')}</span></div>
            <div><b>{best}</b><span>{t('stack.best')}</span></div>
          </div>
        </Card>

        <Card title={t('stack.rulesTitle')}>
          <p className="myg-empty" style={{ margin: 0 }}>{t('stack.rules')}</p>
        </Card>

        <div className="myg-hint">
          <span aria-hidden="true">🏗️</span>
          <span>{t('stack.tip')}</span>
        </div>
      </aside>
    </div>
  )
}

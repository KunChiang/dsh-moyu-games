import React from 'react'
import { BLACK, SIZE } from '../shared/gomoku.js'

const PAD = 0.5
const SPAN = SIZE - 1
const VIEW = SIZE

function centerOf(index) {
  return PAD + index
}

function stoneColor(player) {
  return player === BLACK ? 'url(#myg-stone-black)' : 'url(#myg-stone-white)'
}

/**
 * 棋盘：15×15 交叉点、天元星位、悬停预览、最后一手标记、胜利连线。
 * 支持鼠标 / 触屏与方向键 + 回车。
 */
export function GomokuBoard({ match, thinking, onPlace, onUndo, onRestart, t }) {
  const [hover, setHover] = React.useState(null)
  const [cursor, setCursor] = React.useState({ x: 7, y: 7 })
  const [focused, setFocused] = React.useState(false)
  const svgRef = React.useRef(null)

  const humanTurn = match.status === 'playing' && match.turn === match.humanColor && !thinking
  const player = match.turn

  const cellFromEvent = React.useCallback((event) => {
    const svg = svgRef.current
    if (svg === null) return null
    const rect = svg.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null
    const vx = ((event.clientX - rect.left) / rect.width) * VIEW
    const vy = ((event.clientY - rect.top) / rect.height) * VIEW
    const x = Math.round(vx - PAD)
    const y = Math.round(vy - PAD)
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return null
    if (Math.abs(vx - centerOf(x)) > 0.56 || Math.abs(vy - centerOf(y)) > 0.56) return null
    return { x, y }
  }, [])

  const handleMove = React.useCallback((event) => {
    if (!humanTurn) {
      setHover(null)
      return
    }
    setHover(cellFromEvent(event))
  }, [cellFromEvent, humanTurn])

  const handleClick = React.useCallback((event) => {
    if (!humanTurn) return
    const cell = cellFromEvent(event)
    if (cell !== null) onPlace(cell.x, cell.y)
  }, [cellFromEvent, humanTurn, onPlace])

  const handleKeyDown = React.useCallback((event) => {
    const step = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[event.key]
    if (step !== undefined) {
      event.preventDefault()
      setCursor((prev) => ({
        x: Math.min(SIZE - 1, Math.max(0, prev.x + step[0])),
        y: Math.min(SIZE - 1, Math.max(0, prev.y + step[1])),
      }))
      return
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!humanTurn) return
      onPlace(cursor.x, cursor.y)
      return
    }
  }, [cursor.x, cursor.y, humanTurn, onPlace, onUndo, onRestart])

  const gridLines = []
  for (let i = 0; i < SIZE; i += 1) {
    gridLines.push(
      <line key={`h${i}`} className="myg-gridLine" x1={PAD} y1={centerOf(i)} x2={PAD + SPAN} y2={centerOf(i)} />,
      <line key={`v${i}`} className="myg-gridLine" x1={centerOf(i)} y1={PAD} x2={centerOf(i)} y2={PAD + SPAN} />,
    )
  }

  const stars = []
  for (const x of [3, 7, 11]) {
    for (const y of [3, 7, 11]) {
      if ((x === 7) !== (y === 7) && !(x === 7 && y === 7)) continue
      stars.push(<circle key={`s${x}-${y}`} className="myg-star" cx={centerOf(x)} cy={centerOf(y)} r={0.11} />)
    }
  }

  const winSet = new Set((match.winLine ?? []).map(([x, y]) => `${x}:${y}`))
  const winStart = match.winLine?.[0]
  const winEnd = match.winLine?.[match.winLine.length - 1]
  const last = match.lastMove

  return (
    <div className="myg-boardWrap">
      <svg
        ref={svgRef}
        className="myg-board"
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        role="grid"
        aria-label={t('nav')}
        tabIndex={0}
        onPointerMove={handleMove}
        onPointerLeave={() => setHover(null)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        <defs>
          <radialGradient id="myg-stone-black" cx="34%" cy="28%" r="78%">
            <stop offset="0%" className="myg-stopBlackHi" />
            <stop offset="42%" className="myg-stopBlackMid" />
            <stop offset="100%" className="myg-stopBlackLo" />
          </radialGradient>
          <radialGradient id="myg-stone-white" cx="34%" cy="28%" r="78%">
            <stop offset="0%" className="myg-stopWhiteHi" />
            <stop offset="58%" className="myg-stopWhiteMid" />
            <stop offset="100%" className="myg-stopWhiteLo" />
          </radialGradient>
          <filter id="myg-stone-shadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0.055" stdDeviation="0.05" floodColor="var(--myg-stone-shadow-color)" floodOpacity="0.5" />
          </filter>
        </defs>

        <rect className="myg-gridBorder" x={PAD} y={PAD} width={SPAN} height={SPAN} rx={0.08} />
        {gridLines}
        {stars}

        {Array.from({ length: SIZE }, (_, index) => (
          <text key={`cx${index}`} className="myg-coord" x={centerOf(index)} y={0.26} textAnchor="middle">{String.fromCharCode(65 + index)}</text>
        ))}
        {Array.from({ length: SIZE }, (_, index) => (
          <text key={`cy${index}`} className="myg-coord" x={0.26} y={centerOf(index) + 0.1} textAnchor="middle">{index + 1}</text>
        ))}

        {winStart !== undefined && winEnd !== undefined && (
          <line
            className="myg-winLine"
            x1={centerOf(winStart[0])}
            y1={centerOf(winStart[1])}
            x2={centerOf(winEnd[0])}
            y2={centerOf(winEnd[1])}
          />
        )}

        {match.moves.map((move) => {
          const cx = centerOf(move.x)
          const cy = centerOf(move.y)
          const isLast = last !== null && last.x === move.x && last.y === move.y
          const won = winSet.has(`${move.x}:${move.y}`)
          return (
            <g key={`${move.x}-${move.y}`} className="myg-stone">
              <circle
                cx={cx}
                cy={cy}
                r={0.46}
                fill={stoneColor(move.p)}
                filter="url(#myg-stone-shadow)"
              />
              {move.p === BLACK && <circle cx={cx} cy={cy} r={0.46} fill="none" stroke="var(--myg-black-rim)" strokeWidth={0.024} />}
              {isLast && !won && <circle className="myg-stoneLastRing" cx={cx} cy={cy} r={0.2} />}
              {won && <circle className="myg-winRing" cx={cx} cy={cy} r={0.53} />}
            </g>
          )
        })}

        {humanTurn && hover !== null && match.board[hover.y * SIZE + hover.x] === 0 && (
          <circle
            className="myg-ghost"
            cx={centerOf(hover.x)}
            cy={centerOf(hover.y)}
            r={0.43}
            fill={player === BLACK ? 'var(--myg-ghost-dark)' : 'var(--myg-ghost-light)'}
          />
        )}

        {focused && humanTurn && (
          <circle className="myg-cursorRing" cx={centerOf(cursor.x)} cy={centerOf(cursor.y)} r={0.52} />
        )}
      </svg>
    </div>
  )
}
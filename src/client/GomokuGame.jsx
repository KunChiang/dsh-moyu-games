import React from 'react'
import {
  BLACK,
  SIZE,
  candidateMoves,
  cloneBoard,
  otherPlayer,
  pickMove,
  pointScore,
  wouldWin,
} from '../shared/gomoku.js'
import {
  canUndo,
  isAiTurn,
  matchFromMoves,
  newMatch,
  placeStone,
  undoToHumanTurn,
} from '../shared/match.js'
import { GomokuBoard } from './Board.jsx'
import { GAME_GOMOKU, cachedStats, clearLocalGame, loadLocalGame, loadStats, recordResult, resetStats, saveLocalGame } from './storage.js'

const AI_DELAY_MS = 280
const LEVELS = ['easy', 'medium', 'hard']
const QUIPS = ['ai.quip1', 'ai.quip2', 'ai.quip3', 'ai.quip4']

function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  const pad = (value) => String(value).padStart(2, '0')
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
}

function coordinateOf(move) {
  return `${String.fromCharCode(65 + move.x)}${move.y + 1}`
}

function quipFor(board, move, aiPlayer) {
  if (wouldWin(board, SIZE, move.x, move.y, aiPlayer)) return 'ai.closing'
  const opponent = otherPlayer(aiPlayer)
  const mustBlock = candidateMoves(board, SIZE, 2)
    .some((candidate) => wouldWin(board, SIZE, candidate.x, candidate.y, opponent))
  if (mustBlock) return 'ai.block'
  if (pointScore(board, SIZE, move.x, move.y, aiPlayer) >= 50_000) return 'ai.attack'
  return QUIPS[Math.floor(Math.random() * QUIPS.length)]
}

function FishMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.1 12c2.5-3.5 5.9-4.8 9.3-3.5 1.8.7 3.2 1.9 4.3 3.5-1.1 1.6-2.5 2.8-4.3 3.5-3.4 1.3-6.8 0-9.3-3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M7.1 12 3.6 9.1v5.8L7.1 12Z" fill="currentColor" />
      <circle cx="16.1" cy="11.1" r=".95" fill="currentColor" />
      <path d="M10.6 8.9c.8 2 .8 4.2 0 6.2" stroke="currentColor" strokeWidth="1.1" opacity=".5" strokeLinecap="round" />
    </svg>
  )
}

export function PanelIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="4.2" stroke="currentColor" strokeWidth="1.7" opacity=".62" />
      <path d="M9 9.2 12 12l3-2.8M9 14.8 12 12l3 2.8" stroke="currentColor" strokeWidth="1.3" opacity=".45" strokeLinecap="round" />
      <circle cx="8" cy="8" r="2.3" fill="currentColor" />
      <circle cx="16" cy="16" r="2.3" fill="currentColor" />
    </svg>
  )
}

function Segmented({ className, value, options, onChange, label }) {
  return (
    <div className={`myg-seg ${className ?? ''}`} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => {
            if (value !== option.value) onChange(option.value)
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Card({ title, children, className }) {
  return (
    <section className={`myg-card ${className ?? ''}`}>
      {title !== undefined && <h2 className="myg-cardTitle">{title}</h2>}
      {children}
    </section>
  )
}

export function GomokuGame({ ctx, t, active }) {
  const [, bumpLocale] = React.useState(0)

  React.useEffect(() => ctx.locale.subscribe(() => bumpLocale((value) => value + 1)), [ctx])

  const [match, setMatch] = React.useState(() => {
    const saved = loadLocalGame()
    if (saved !== null) {
      try {
        const restored = matchFromMoves(saved)
        if (restored.status === 'playing') return restored
      } catch {
        // 存档损坏时直接开新局。
      }
    }
    return newMatch({ humanColor: BLACK, level: 'medium' })
  })
  const [thinking, setThinking] = React.useState(false)
  const [quip, setQuip] = React.useState(() => (match.turn === match.humanColor ? 'ai.greet' : 'ai.greetFirst'))
  const [stats, setStats] = React.useState(() => cachedStats(GAME_GOMOKU))
  const recorded = React.useRef(null)

  const aiPlayer = otherPlayer(match.humanColor)

  React.useEffect(() => {
    let alive = true
    loadStats(GAME_GOMOKU).then((next) => {
      if (alive) setStats(next)
    })
    return () => {
      alive = false
    }
  }, [])

  React.useEffect(() => {
    if (match.status !== 'playing') {
      clearLocalGame()
      return
    }
    if (match.moves.length > 0) saveLocalGame(match)
    else clearLocalGame()
  }, [match])

  React.useEffect(() => {
    if (match.status === 'playing') return
    if (match.endedAt === null) return
    if (recorded.current === match.id) return
    recorded.current = match.id
    const result = match.status === 'win' ? 'win' : match.status === 'lose' ? 'lose' : 'draw'
    let alive = true
    recordResult(GAME_GOMOKU, result).then((next) => {
      if (alive) setStats(next)
    })
    return () => {
      alive = false
    }
  }, [match.status, match.endedAt, match.id])

  React.useEffect(() => {
    if (match.status === 'win') setQuip('ai.respect')
    else if (match.status === 'lose') setQuip('ai.taunt')
  }, [match.status])

  React.useEffect(() => {
    if (!isAiTurn(match)) return undefined
    let cancelled = false
    setThinking(true)
    const timer = setTimeout(() => {
      if (cancelled) return
      let move = null
      try {
        move = pickMove(cloneBoard(match.board), SIZE, aiPlayer, { level: match.level })
      } catch (error) {
        console.error('[moyu-games] AI failed to choose a move', error)
      }
      if (cancelled) return
      setThinking(false)
      if (move === null) {
        // 搜索异常时的兜底：随便找一个合法空点，绝不把还在进行的棋局判成和棋。
        const fallback = candidateMoves(match.board, SIZE, 2)
        if (fallback.length > 0) move = fallback[Math.floor(Math.random() * fallback.length)]
      }
      if (move === null) {
        setMatch((prev) => (prev.status === 'playing' ? { ...prev, status: 'draw', endedAt: Date.now() } : prev))
        return
      }
      setQuip(quipFor(match.board, move, aiPlayer))
      setMatch((prev) => {
        if (prev.status !== 'playing' || prev.turn !== aiPlayer || prev.moves.length !== match.moves.length) return prev
        return placeStone(prev, move.x, move.y)
      })
    }, AI_DELAY_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [match.turn, match.status, match.moves.length, match.level, aiPlayer, match.board])

  const startNew = React.useCallback((options = {}) => {
    const humanColor = options.humanColor ?? match.humanColor
    const level = options.level ?? match.level
    setThinking(false)
    setQuip(humanColor === BLACK ? 'ai.greet' : 'ai.greetFirst')
    setMatch(newMatch({ humanColor, level }))
  }, [match.humanColor, match.level])

  const undo = React.useCallback(() => {
    if (thinking) return
    setQuip('ai.undo')
    setMatch((prev) => (canUndo(prev) ? undoToHumanTurn(prev) : prev))
  }, [thinking])

  const handlePlace = React.useCallback((x, y) => {
    if (thinking) return
    setMatch((prev) => {
      if (prev.status !== 'playing' || prev.turn !== prev.humanColor) return prev
      return placeStone(prev, x, y)
    })
  }, [thinking])

  const handleLevel = React.useCallback((level) => {
    setMatch((prev) => ({ ...prev, level }))
  }, [])

  const handleSwap = React.useCallback(() => {
    startNew({ humanColor: otherPlayer(match.humanColor) })
  }, [match.humanColor, startNew])

  const handleResetStats = React.useCallback(() => {
    resetStats(GAME_GOMOKU).then(setStats)
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
      if (event.key === 'u' || event.key === 'U') {
        event.preventDefault()
        undo()
      } else if (event.key === 'n' || event.key === 'N') {
        event.preventDefault()
        startNew()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, startNew, undo])

  const humanTurn = match.status === 'playing' && match.turn === match.humanColor && !thinking
  const turnLabel = match.status === 'win'
    ? t('board.win')
    : match.status === 'lose'
      ? t('board.lose')
      : match.status === 'draw'
        ? t('board.draw')
        : humanTurn
          ? t('board.yourTurn')
          : t('board.aiTurn')
  const dotClass = match.status === 'win'
    ? 'done'
    : match.status === 'lose'
      ? 'lost'
      : humanTurn ? '' : 'ai'

  const levelOptions = LEVELS.map((level) => ({ value: level, label: t(`level.${level}`) }))
  const sideOptions = [
    { value: BLACK, label: t('blackStone') },
    { value: otherPlayer(BLACK), label: t('whiteStone') },
  ]

  const resultTitle = match.status === 'win'
    ? t('result.winTitle')
    : match.status === 'lose'
      ? t('result.loseTitle')
      : t('result.drawTitle')
  const elapsed = Math.max(0, ((match.endedAt ?? Date.now()) - match.startedAt) / 1000)
  const resultDesc = match.status === 'win'
    ? t('result.winDesc', { moves: match.moves.length, time: formatClock(elapsed) })
    : match.status === 'lose'
      ? t('result.loseDesc', { moves: match.moves.length, time: formatClock(elapsed) })
      : t('result.drawDesc', { moves: match.moves.length })

  return (
    <div className="myg-main">
      <section className="myg-boardCard">
            {match.status !== 'playing' && (
              <div className={`myg-result ${match.status}`}>
                <div>
                  <div className="myg-resultTitle">{resultTitle}</div>
                  <div className="myg-resultDesc">{resultDesc}</div>
                </div>
                <span className="myg-spacer" />
                <button type="button" className="myg-btn primary" onClick={() => startNew()}>{t('result.again')}</button>
              </div>
            )}

            <div className="myg-boardTop">
              <span className="myg-turn">
                <i className={`myg-turnDot ${dotClass}`} />
                {turnLabel}
                {thinking && <span className="myg-thinking"><i /><i /><i /></span>}
              </span>
              <span className="myg-turnHint">{t('board.youAre', { color: match.humanColor === BLACK ? t('blackStone') : t('whiteStone') })}</span>
              <span className="myg-spacer" />
              <span className="myg-levelChip">{t(`level.${match.level}`)}</span>
            </div>

            <GomokuBoard
              match={match}
              thinking={thinking}
              onPlace={handlePlace}
              onUndo={undo}
              onRestart={startNew}
              t={t}
            />

            <div className="myg-boardFoot">
              <span className="myg-footMeta">
                {match.moves.length > 0 ? t('board.moveNo', { n: match.moves.length }) : ' '}
              </span>
              <span className="myg-spacer" />
              <button type="button" className="myg-btn" onClick={undo} disabled={thinking || !canUndo(match)}>
                {t('undo')}
              </button>
              <button type="button" className="myg-btn" onClick={() => startNew()} disabled={thinking}>
                {t('restart')}
              </button>
            </div>
      </section>

      <aside className="myg-side">
            <Card title={t('opponent')} className="myg-aiCard">
              <div className="myg-ai">
                <div className="myg-avatar"><FishMark size={22} /></div>
                <div className="myg-aiBody">
                  <div className="myg-aiName">{t('opponent.name')} <span>{t('opponent.tag')} · {t(`level.${match.level}`)}</span></div>
                  <div className="myg-bubble">{t(quip)}</div>
                </div>
              </div>
            </Card>

            <Card title={t('settings')}>
              <div className="myg-fieldLabel">
                <span>{t('settings.level')}</span>
                <span>{t(`level.${match.level}Hint`)}</span>
              </div>
              <Segmented className="three" label={t('settings.level')} value={match.level} options={levelOptions} onChange={handleLevel} />
              <div className="myg-fieldLabel">
                <span>{t('settings.side')}</span>
                <span>{t('settings.sideHint')}</span>
              </div>
              <Segmented
                className="two"
                label={t('settings.side')}
                value={match.humanColor}
                options={sideOptions}
                onChange={(color) => startNew({ humanColor: color })}
              />
            </Card>

            <Card title={t('stats')}>
              <div className="myg-stats">
                <div className="myg-stat win"><b>{stats.wins}</b><span>{t('stats.win')}</span></div>
                <div className="myg-stat lose"><b>{stats.losses}</b><span>{t('stats.lose')}</span></div>
                <div className="myg-stat"><b>{stats.draws}</b><span>{t('stats.draw')}</span></div>
                <div className="myg-stat streak"><b>{stats.streak}</b><span>{t('stats.streak')}</span></div>
              </div>
              <div className="myg-fieldLabel">
                <span>{t('stats.best')} {stats.bestStreak}</span>
                <button type="button" className="myg-btn ghost" style={{ height: 22, padding: '0 6px' }} onClick={handleResetStats}>
                  {t('stats.reset')}
                </button>
              </div>
            </Card>

            <Card title={t('moves')}>
              {match.moves.length === 0
                ? <p className="myg-empty">{t('moves.empty')}</p>
                : (
                  <div className="myg-moves">
                    {match.moves.map((move, index) => (
                      <span key={`${move.x}-${move.y}-${index}`} className={`myg-moveChip ${index === match.moves.length - 1 ? 'last' : ''}`}>
                        <i className={move.p === BLACK ? 'black' : 'white'} />
                        {coordinateOf(move)}
                      </span>
                    ))}
                  </div>
                )}
            </Card>

            <div className="myg-hint">
              <span aria-hidden="true">🐟</span>
              <span>{t('hint.body')}</span>
            </div>
      </aside>
    </div>
  )
}

export { FishMark }

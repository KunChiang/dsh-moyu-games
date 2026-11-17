import React from 'react'
import {
  ACTOR_AI,
  ACTOR_HUMAN,
  applyAction,
  cellName,
  chooseDarkAction,
  colorOfActor,
  legalActions,
  matchFromSave,
  newDarkMatch,
  undoToHumanTurn,
} from '../shared/dark-animals.js'
import {
  GAME_DARK_ANIMALS,
  cachedStats,
  clearDarkGame,
  loadDarkGame,
  loadStats,
  recordResult,
  resetStats,
  saveDarkGame,
} from './storage.js'
import { DarkAnimalsBoard } from './DarkAnimalsBoard.jsx'

const LEVELS = ['easy', 'medium', 'hard']
const AI_DELAY_MS = 460

function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  const pad = (value) => String(value).padStart(2, '0')
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
}

export function PawMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="7" cy="8.6" rx="2.1" ry="2.7" transform="rotate(-18 7 8.6)" fill="currentColor" opacity=".85" />
      <ellipse cx="12" cy="6.7" rx="2.1" ry="2.9" fill="currentColor" opacity=".85" />
      <ellipse cx="17" cy="8.6" rx="2.1" ry="2.7" transform="rotate(18 17 8.6)" fill="currentColor" opacity=".85" />
      <path
        d="M12 11.2c3.1 0 5.7 2.2 5.7 4.9 0 2.2-2.1 3.4-5.7 3.4s-5.7-1.2-5.7-3.4c0-2.7 2.6-4.9 5.7-4.9Z"
        fill="currentColor"
      />
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

function colorName(t, color) {
  if (color === null) return t('da.colorUndecided')
  return color === 1 ? t('da.color.teal') : t('da.color.red')
}

function quipFor(next) {
  if (next.status === 'lose') return 'da.quip.taunt'
  if (next.status === 'win') return 'da.quip.respect'
  if (next.lastAction?.captured) return 'da.quip.capture'
  if (next.lastAction?.type === 'flip') return 'da.quip.flip'
  return Math.random() < 0.5 ? 'da.quip.neutral1' : 'da.quip.neutral2'
}

export function DarkAnimalGame({ ctx, t, active }) {
  const [state, setState] = React.useState(() => {
    const saved = loadDarkGame()
    if (saved !== null) {
      try {
        const restored = matchFromSave(saved)
        if (restored !== null) return restored
      } catch {
        // 存档损坏时直接开新局。
      }
    }
    return newDarkMatch({ level: 'medium' })
  })
  const [selected, setSelected] = React.useState(null)
  const [thinking, setThinking] = React.useState(false)
  const [quip, setQuip] = React.useState('da.quip.greet')
  const [stats, setStats] = React.useState(() => cachedStats(GAME_DARK_ANIMALS))
  const recorded = React.useRef(null)

  React.useEffect(() => {
    let alive = true
    loadStats(GAME_DARK_ANIMALS).then((next) => {
      if (alive) setStats(next)
    })
    return () => {
      alive = false
    }
  }, [])

  React.useEffect(() => {
    if (state.status !== 'playing') {
      clearDarkGame()
      return
    }
    if (state.actions.length > 0) saveDarkGame(state)
    else clearDarkGame()
  }, [state])

  React.useEffect(() => {
    if (state.status === 'playing' || state.endedAt === null) return
    if (recorded.current === state.id) return
    recorded.current = state.id
    const result = state.status === 'win' ? 'win' : state.status === 'lose' ? 'lose' : 'draw'
    let alive = true
    recordResult(GAME_DARK_ANIMALS, result).then((next) => {
      if (alive) setStats(next)
    })
    return () => {
      alive = false
    }
  }, [state.status, state.endedAt, state.id])

  React.useEffect(() => {
    if (state.status !== 'playing' || state.turn !== ACTOR_AI) return undefined
    let cancelled = false
    setThinking(true)
    const timer = setTimeout(() => {
      if (cancelled) return
      let action = null
      try {
        action = chooseDarkAction(state, state.level)
      } catch (error) {
        console.error('[moyu-games] dark animals AI failed', error)
      }
      if (cancelled) return
      setThinking(false)
      if (!action) return
      const next = applyAction(state, action)
      setQuip(quipFor(next))
      setState((prev) => (
        prev.status === 'playing' && prev.turn === ACTOR_AI && prev.actions.length === state.actions.length
          ? next
          : prev
      ))
    }, AI_DELAY_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [state.turn, state.status, state.actions.length, state.level])

  const humanTurn = state.status === 'playing' && state.turn === ACTOR_HUMAN && !thinking
  const canUndo = state.actions.some((action) => action.actor === ACTOR_HUMAN)
  const humanColor = colorOfActor(state, ACTOR_HUMAN)

  const restart = React.useCallback(() => {
    setThinking(false)
    setSelected(null)
    setQuip('da.quip.greet')
    setState((prev) => newDarkMatch({ level: prev.level }))
  }, [])

  const undo = React.useCallback(() => {
    if (thinking) return
    setSelected(null)
    setQuip('da.quip.undo')
    setState((prev) => undoToHumanTurn(prev))
  }, [thinking])

  const handleCell = React.useCallback((index) => {
    if (!humanTurn) return
    const actions = legalActions(state, ACTOR_HUMAN)
    if (selected !== null) {
      const move = actions.find((action) => action.type === 'move' && action.from === selected && action.to === index)
      if (move) {
        setSelected(null)
        setState((prev) => applyAction(prev, move))
        return
      }
    }
    const cell = state.cells[index]
    if (cell === null) {
      setSelected(null)
      return
    }
    if (!cell.revealed) {
      setSelected(null)
      setQuip('da.quip.flip')
      setState((prev) => (prev.turn === ACTOR_HUMAN ? applyAction(prev, { type: 'flip', cell: index }) : prev))
      return
    }
    const color = colorOfActor(state, ACTOR_HUMAN)
    if (color !== null && cell.owner === color) {
      setSelected(index)
      return
    }
    setSelected(null)
  }, [humanTurn, selected, state])

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
        restart()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, restart, undo])

  const levelOptions = LEVELS.map((level) => ({ value: level, label: t(`level.${level}`) }))
  const aiCaptured = state.humanColor === null ? [] : state.captured[state.humanColor]
  const youCaptured = state.aiColor === null ? [] : state.captured[state.aiColor]
  const elapsed = Math.max(0, ((state.endedAt ?? Date.now()) - state.startedAt) / 1000)

  const statusKey = state.status === 'win'
    ? 'da.win'
    : state.status === 'lose'
      ? 'da.lose'
      : state.status === 'draw'
        ? 'da.draw'
        : null
  const turnLabel = statusKey !== null
    ? t(statusKey)
    : !state.firstFlipDone
      ? t('da.firstFlip')
      : humanTurn
        ? t('da.turnYou')
        : t('da.turnAi')
  const dotClass = state.status === 'win'
    ? 'done'
    : state.status === 'lose'
      ? 'lost'
      : humanTurn ? '' : 'ai'

  const resultTitle = state.status === 'win'
    ? t('da.result.winTitle')
    : state.status === 'lose'
      ? t('da.result.loseTitle')
      : t('da.result.drawTitle')
  const resultDesc = state.status === 'win'
    ? t('da.result.winDesc', { n: youCaptured.length, time: formatClock(elapsed) })
    : state.status === 'lose'
      ? t('da.result.loseDesc', { n: aiCaptured.length, time: formatClock(elapsed) })
      : t('da.result.drawDesc')

  return (
    <div className="myg-main">
      <section className="myg-boardCard">
        {state.status !== 'playing' && (
          <div className={`myg-result ${state.status}`}>
            <div>
              <div className="myg-resultTitle">{resultTitle}</div>
              <div className="myg-resultDesc">{resultDesc}</div>
            </div>
            <span className="myg-spacer" />
            <button type="button" className="myg-btn primary" onClick={restart}>{t('da.result.again')}</button>
          </div>
        )}

        <div className="myg-boardTop">
          <span className="myg-turn">
            <i className={`myg-turnDot ${dotClass}`} />
            {turnLabel}
            {(thinking || (state.status === 'playing' && state.turn === ACTOR_AI)) && (
              <span className="myg-thinking"><i /><i /><i /></span>
            )}
          </span>
          <span className="myg-turnHint">
            {selected !== null ? t('da.selectHint') : t('da.youAre', { color: colorName(t, humanColor) })}
          </span>
          <span className="myg-spacer" />
          <span className="myg-levelChip">{t(`level.${state.level}`)}</span>
        </div>

        <DarkAnimalsBoard
          state={state}
          selected={selected}
          onCell={handleCell}
          t={t}
          disabled={!humanTurn}
        />

        <div className="myg-boardFoot">
          <span className="myg-footMeta">{t('da.actionNo', { n: state.actions.length })}</span>
          <span className="myg-spacer" />
          <span className="myg-daKey"><i className="teal" />{t('da.color.teal')}</span>
          <span className="myg-daKey"><i className="red" />{t('da.color.red')}</span>
          <button type="button" className="myg-btn" onClick={undo} disabled={thinking || !canUndo}>
            {t('undo')}
          </button>
          <button type="button" className="myg-btn" onClick={restart} disabled={thinking}>
            {t('restart')}
          </button>
        </div>
      </section>

      <aside className="myg-side">
        <Card title={t('opponent')} className="myg-aiCard">
          <div className="myg-ai">
            <div className="myg-avatar"><PawMark size={22} /></div>
            <div className="myg-aiBody">
              <div className="myg-aiName">{t('da.opponent.name')} <span>{t('da.opponent.tag')} · {t(`level.${state.level}`)}</span></div>
              <div className="myg-bubble">{t(quip)}</div>
            </div>
          </div>
        </Card>

        <Card title={t('settings')}>
          <div className="myg-fieldLabel">
            <span>{t('settings.level')}</span>
            <span>{t(`level.${state.level}Hint`)}</span>
          </div>
          <Segmented
            className="three"
            label={t('settings.level')}
            value={state.level}
            options={levelOptions}
            onChange={(level) => setState((prev) => ({ ...prev, level }))}
          />
          <div className="myg-fieldLabel">
            <span>{t('da.rulesTitle')}</span>
          </div>
          <p className="myg-empty" style={{ margin: 0 }}>{t('da.rules')}</p>
        </Card>

        <Card title={t('da.stats')}>
          <div className="myg-stats">
            <div className="myg-stat win"><b>{stats.wins}</b><span>{t('stats.win')}</span></div>
            <div className="myg-stat lose"><b>{stats.losses}</b><span>{t('stats.lose')}</span></div>
            <div className="myg-stat"><b>{stats.draws}</b><span>{t('stats.draw')}</span></div>
            <div className="myg-stat streak"><b>{stats.streak}</b><span>{t('stats.streak')}</span></div>
          </div>
          <div className="myg-fieldLabel">
            <span>{t('stats.best')} {stats.bestStreak}</span>
            <button
              type="button"
              className="myg-btn ghost"
              style={{ height: 22, padding: '0 6px' }}
              onClick={() => resetStats(GAME_DARK_ANIMALS).then(setStats)}
            >
              {t('stats.reset')}
            </button>
          </div>
        </Card>

        <Card title={t('da.captured')}>
          <div className="myg-fieldLabel" style={{ marginTop: 0 }}>
            <span>{t('da.capturedYou')}</span>
          </div>
          <div className="myg-daCaptured">
            {youCaptured.length === 0
              ? <span className="myg-empty">{t('da.none')}</span>
              : youCaptured.map((animal, index) => (
                <span key={`${animal}-${index}`} className="myg-daChip human">{t(`da.animal.${animal}`)}</span>
              ))}
          </div>
          <div className="myg-fieldLabel">
            <span>{t('da.capturedAi')}</span>
          </div>
          <div className="myg-daCaptured">
            {aiCaptured.length === 0
              ? <span className="myg-empty">{t('da.none')}</span>
              : aiCaptured.map((animal, index) => (
                <span key={`${animal}-${index}`} className="myg-daChip ai">{t(`da.animal.${animal}`)}</span>
              ))}
          </div>
        </Card>

        <Card title={t('da.moves')}>
          {state.log.length === 0
            ? <p className="myg-empty">{t('da.moves.empty')}</p>
            : (
              <div className="myg-moves">
                {state.log.map((entry, index) => {
                  const text = entry.type === 'flip'
                    ? `${t('da.flip')} ${cellName(entry.cell)} · ${t(`da.animal.${entry.animal}`)}`
                    : `${cellName(entry.from)}→${cellName(entry.to)}${entry.captured ? ` · ${t('da.captureShort', { animal: t(`da.animal.${entry.captured}`) })}` : ''}`
                  return (
                    <span key={index} className={`myg-daChip ${entry.actor === ACTOR_HUMAN ? 'human' : 'ai'}`}>
                      {text}
                    </span>
                  )
                })}
              </div>
            )}
        </Card>

        <div className="myg-hint">
          <span aria-hidden="true">🐾</span>
          <span>{t('da.hint')}</span>
        </div>
      </aside>
    </div>
  )
}

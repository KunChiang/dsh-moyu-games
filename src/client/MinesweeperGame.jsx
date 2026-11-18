import React from 'react'
import {
  DIFFICULTIES,
  LEVELS,
  analyze,
  chord,
  matchFromSave,
  matchToSave,
  newGame,
  reveal,
  toggleFlag,
} from '../shared/minesweeper.js'
import {
  GAME_MINESWEEPER,
  cachedStats,
  clearMinesweeper,
  loadMinesweeper,
  loadStats,
  recordResult,
  resetStats,
  saveMinesweeper,
} from './storage.js'
import { MinesweeperBoard } from './MinesweeperBoard.jsx'

const MAX_HINTS = 3

function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  const pad = (value) => String(value).padStart(2, '0')
  return `${pad(minutes)}:${pad(seconds)}`
}

export function MineMark({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="5" fill="currentColor" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M19.1 4.9l-2.8 2.8M7.7 16.3l-2.8 2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10.2" cy="10.2" r="1.2" fill="var(--dsw-alias-label-primary-foreground, #fff)" opacity=".6" />
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

export function MinesweeperGame({ ctx, t, active }) {
  const [state, setState] = React.useState(() => {
    const saved = loadMinesweeper()
    if (saved !== null) {
      try {
        const restored = matchFromSave(saved)
        if (restored !== null) return restored
      } catch {
        // 存档损坏时直接开新局。
      }
    }
    return newGame('easy')
  })
  const [flagMode, setFlagMode] = React.useState(false)
  const [hint, setHint] = React.useState(null)
  const [hintMessage, setHintMessage] = React.useState(null)
  const [hintsUsed, setHintsUsed] = React.useState(0)
  const [quip, setQuip] = React.useState('ms.quip.greet')
  const [stats, setStats] = React.useState(() => cachedStats(GAME_MINESWEEPER))
  const [now, setNow] = React.useState(Date.now())
  const recorded = React.useRef(null)

  React.useEffect(() => {
    let alive = true
    loadStats(GAME_MINESWEEPER).then((next) => {
      if (alive) setStats(next)
    })
    return () => {
      alive = false
    }
  }, [])

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  React.useEffect(() => {
    if (state.status === 'ready' || state.status === 'playing') saveMinesweeper(matchToSave(state))
    else clearMinesweeper()
  }, [state])

  React.useEffect(() => {
    if (state.status === 'playing' || state.status === 'ready') return
    if (recorded.current === state.id) return
    recorded.current = state.id
    let alive = true
    recordResult(GAME_MINESWEEPER, state.status === 'won' ? 'win' : 'lose').then((next) => {
      if (alive) setStats(next)
    })
    return () => {
      alive = false
    }
  }, [state.status, state.id])

  const finished = state.status === 'won' || state.status === 'lost'
  const elapsed = state.startedAt !== null ? Math.max(0, ((state.endedAt ?? now) - state.startedAt) / 1000) : 0
  const hidden = state.cells.filter((cell) => !cell.revealed).length
  const canPlay = state.status === 'ready' || state.status === 'playing'

  const restart = React.useCallback((level = state.level) => {
    setState(newGame(level))
    setHint(null)
    setHintMessage(null)
    setHintsUsed(0)
    setQuip('ms.quip.greet')
    setFlagMode(false)
  }, [state.level])

  const apply = React.useCallback((next, action) => {
    setHint(null)
    setHintMessage(null)
    setState(next)
    if (next.status === 'won') setQuip('ms.quip.win')
    else if (next.status === 'lost') setQuip('ms.quip.lose')
    else if (action === 'flag') setQuip('ms.quip.flag')
  }, [])

  const handleReveal = React.useCallback((index) => {
    if (!canPlay) return
    apply(reveal(state, index), 'reveal')
  }, [apply, canPlay, state])

  const handleFlag = React.useCallback((index) => {
    if (!canPlay) return
    apply(toggleFlag(state, index), 'flag')
  }, [apply, canPlay, state])

  const handleChord = React.useCallback((index) => {
    if (state.status !== 'playing') return
    apply(chord(state, index), 'chord')
  }, [apply, state])

  const requestHint = React.useCallback(() => {
    if (state.status !== 'playing') {
      setHintMessage('ms.hintEmpty')
      setQuip('ms.quip.greet')
      return
    }
    if (hintsUsed >= MAX_HINTS) {
      setHintMessage('ms.noHints')
      setQuip('ms.quip.noHints')
      return
    }
    const result = analyze(state)
    setHintsUsed((value) => value + 1)
    if (result.safe.length > 0 || result.mines.length > 0) {
      setHint({ safe: result.safe, mines: result.mines, guess: null })
      setHintMessage(result.safe.length > 0 ? 'ms.hintSafe' : 'ms.hintMine')
      setQuip(result.safe.length > 0 ? 'ms.quip.safe' : 'ms.quip.mine')
      return
    }
    if (result.guess !== null) {
      setHint({ safe: [], mines: [], guess: result.guess })
      setHintMessage('ms.hintGuess')
      setQuip('ms.quip.guess')
      return
    }
    setHintMessage('ms.hintEmpty')
  }, [hintsUsed, state])

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
      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault()
        restart()
      } else if (event.key === 'f' || event.key === 'F') {
        event.preventDefault()
        setFlagMode((value) => !value)
      } else if (event.key === 'h' || event.key === 'H') {
        event.preventDefault()
        requestHint()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [active, requestHint, restart])

  const levelOptions = LEVELS.map((level) => ({ value: level, label: t(`ms.size.${level}`) }))
  const statusLabel = state.status === 'ready'
    ? t('ms.ready')
    : state.status === 'playing'
      ? t('ms.playing')
      : state.status === 'won'
        ? t('ms.won')
        : t('ms.lost')
  const dotClass = state.status === 'won'
    ? 'done'
    : state.status === 'lost'
      ? 'lost'
      : state.status === 'ready'
        ? 'ai'
        : ''
  const resultTitle = state.status === 'won' ? t('ms.result.winTitle') : t('ms.result.loseTitle')
  const resultDesc = state.status === 'won'
    ? t('ms.result.winDesc', { time: formatClock(elapsed), flags: state.flagCount, level: t(`ms.size.${state.level}`) })
    : t('ms.result.loseDesc', { time: formatClock(elapsed), hidden })

  return (
    <div className="myg-main">
      <section className="myg-boardCard">
        {finished && (
          <div className={`myg-result ${state.status === 'won' ? 'win' : 'lose'}`}>
            <div>
              <div className="myg-resultTitle">{resultTitle}</div>
              <div className="myg-resultDesc">{resultDesc}</div>
            </div>
            <span className="myg-spacer" />
            <button type="button" className="myg-btn primary" onClick={() => restart()}>{t('ms.result.again')}</button>
          </div>
        )}

        <div className="myg-boardTop">
          <span className="myg-turn">
            <i className={`myg-turnDot ${dotClass}`} />
            {state.status === 'ready' ? t('ms.readyShort') : statusLabel}
          </span>
          <span className="myg-turnHint">
            {t('ms.mines', { flagged: state.flagCount, total: state.mines })} · {t('ms.time', { time: formatClock(elapsed) })}
          </span>
          <span className="myg-spacer" />
          <span className="myg-levelChip">{t(`ms.size.${state.level}`)}</span>
        </div>

        <MinesweeperBoard
          game={state}
          hint={hint}
          flagMode={flagMode}
          onReveal={handleReveal}
          onFlag={handleFlag}
          onChord={handleChord}
          t={t}
          disabled={!canPlay}
        />

        <div className="myg-boardFoot">
          <span className="myg-footMeta">{t('ms.hintsLeft', { n: Math.max(0, MAX_HINTS - hintsUsed) })}</span>
          <span className="myg-spacer" />
          <button
            type="button"
            className={`myg-btn ${flagMode ? 'primary' : ''}`}
            onClick={() => setFlagMode((value) => !value)}
            disabled={finished}
          >
            {flagMode ? t('ms.flagModeOn') : t('ms.flagMode')}
          </button>
          <button
            type="button"
            className="myg-btn"
            onClick={requestHint}
            disabled={finished || hintsUsed >= MAX_HINTS}
          >
            {t('ms.aiHint')}
          </button>
          <button type="button" className="myg-btn" onClick={() => restart()}>
            {t('restart')}
          </button>
        </div>
      </section>

      <aside className="myg-side">
        <Card title={t('opponent')} className="myg-aiCard">
          <div className="myg-ai">
            <div className="myg-avatar"><MineMark size={22} /></div>
            <div className="myg-aiBody">
              <div className="myg-aiName">{t('opponent.name')} <span>{t('opponent.tag')} · {t(`level.${state.level}`)}</span></div>
              <div className="myg-bubble">{t(quip)}</div>
            </div>
          </div>
        </Card>

        <Card title={t('settings')}>
          <div className="myg-fieldLabel">
            <span>{t('settings.level')}</span>
            <span>{t(`ms.size.${state.level}`)} · {t('ms.mineCount', { n: DIFFICULTIES[state.level].mines })}</span>
          </div>
          <Segmented
            className="three"
            label={t('settings.level')}
            value={state.level}
            options={levelOptions}
            onChange={(level) => restart(level)}
          />
          <div className="myg-fieldLabel">
            <span>{t('ms.rulesTitle')}</span>
          </div>
          <p className="myg-empty" style={{ margin: 0 }}>{t('ms.rules')}</p>
        </Card>

        <Card title={t('ms.stats')}>
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
              onClick={() => resetStats(GAME_MINESWEEPER).then(setStats)}
            >
              {t('stats.reset')}
            </button>
          </div>
        </Card>

        <Card title={t('ms.aiHint')}>
          <p className="myg-empty" style={{ margin: 0 }}>
            {hintMessage !== null
              ? t(hintMessage)
              : state.status === 'ready'
                ? t('ms.ready')
                : t('ms.hintsLeft', { n: Math.max(0, MAX_HINTS - hintsUsed) })}
          </p>
        </Card>

        <div className="myg-hint">
          <span aria-hidden="true">💣</span>
          <span>{t('ms.rules')}</span>
        </div>
      </aside>
    </div>
  )
}

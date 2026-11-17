import React from 'react'
import { GAME_DARK, GAME_GOMOKU, LAST_GAME_KEY, NS, PANEL_ID } from './constants.js'
import { FishMark, GomokuGame } from './GomokuGame.jsx'
import { DarkAnimalGame, PawMark } from './DarkAnimalGame.jsx'

export { NS, PANEL_ID, GAME_DARK, GAME_GOMOKU }

function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  const pad = (value) => String(value).padStart(2, '0')
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
}

function readLastGame() {
  try {
    const value = window.localStorage.getItem(LAST_GAME_KEY)
    return value === GAME_DARK ? GAME_DARK : GAME_GOMOKU
  } catch {
    return GAME_GOMOKU
  }
}

function writeLastGame(game) {
  try {
    window.localStorage.setItem(LAST_GAME_KEY, game)
  } catch {
    // ignore
  }
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

export function MoyuPanel({ ctx, initialGame }) {
  const [, bumpLocale] = React.useState(0)
  const t = ctx.locale.bind(NS)
  React.useEffect(() => ctx.locale.subscribe(() => bumpLocale((value) => value + 1)), [ctx])

  const [game, setGame] = React.useState(() => (
    initialGame === GAME_DARK || initialGame === GAME_GOMOKU ? initialGame : readLastGame()
  ))
  const [seconds, setSeconds] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document === 'undefined' || !document.hidden) setSeconds((value) => value + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const selectGame = React.useCallback((next) => {
    writeLastGame(next)
    setGame(next)
  }, [])

  const goBack = React.useCallback(() => {
    try {
      ctx.get('layout')?.selectPanel(null)
    } catch (error) {
      console.warn('[moyu-games] could not switch panel', error)
    }
  }, [ctx])

  React.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key !== 'Escape') return
      const target = event.target
      const typing = target !== null && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable === true
      )
      if (typing) return
      event.preventDefault()
      goBack()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goBack])

  const isDark = game === GAME_DARK
  return (
    <div className="myg-root">
      <header className="myg-header">
        <div className="myg-brand">
          <div className="myg-brandMark">{isDark ? <PawMark size={21} /> : <FishMark size={21} />}</div>
          <div className="myg-brandCopy">
            <h1 className="myg-title">{t('title')}<small>{t('titleTag')}</small></h1>
            <p className="myg-sub">{isDark ? t('da.subtitle') : t('subtitle')}</p>
          </div>
        </div>
        <div className="myg-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={!isDark}
            className="myg-tab"
            onClick={() => selectGame(GAME_GOMOKU)}
          >
            {t('tab.gomoku')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isDark}
            className="myg-tab"
            onClick={() => selectGame(GAME_DARK)}
          >
            {t('tab.darkAnimals')}
          </button>
          <button type="button" role="tab" aria-selected="false" className="myg-tab" disabled>
            {t('tab.more')}<span className="myg-soon">{t('tab.soon')}</span>
          </button>
        </div>
        <span className="myg-headerSpacer" />
        <div className="myg-time">{t('slackTime')} <b>{formatClock(seconds)}</b></div>
        <button type="button" className="myg-btn ghost" onClick={goBack} title={t('backHint')}>
          ← {t('back')}
        </button>
      </header>
      <div className="myg-scroll">
        {isDark
          ? <DarkAnimalGame ctx={ctx} t={t} active />
          : <GomokuGame ctx={ctx} t={t} active />}
      </div>
    </div>
  )
}

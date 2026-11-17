import React from 'react'
import {
  ACTOR_HUMAN,
  ANIMAL_BY_ID,
  DARK_SIZE,
  cellName,
  colorOfActor,
  legalActions,
} from '../shared/dark-animals.js'

function CloudGlyph() {
  return (
    <svg className="myg-daCloud" viewBox="0 0 32 24" fill="none" aria-hidden="true">
      <path
        d="M8.2 19.2c-2.9 0-5.2-2.2-5.2-5 0-2.6 2-4.7 4.6-5 .8-3 3.5-5.1 6.8-5.1 2.7 0 5.1 1.5 6.2 3.8.5-.2 1.1-.3 1.7-.3 3 0 5.4 2.3 5.4 5.2 0 3.6-2.4 6.4-5.4 6.4H8.2Z"
        fill="currentColor"
      />
    </svg>
  )
}

/** 4×4 暗兽棋棋盘：暗棋、明棋、选中、可走目标、最后一手。 */
export function DarkAnimalsBoard({ state, selected, onCell, t, disabled }) {
  const humanColor = state.humanColor
  const actions = legalActions(state, ACTOR_HUMAN)
  const targets = new Map()
  if (selected !== null) {
    for (const action of actions) {
      if (action.type === 'move' && action.from === selected) {
        targets.set(action.to, state.cells[action.to] !== null)
      }
    }
  }
  const last = state.lastAction
  const playable = !disabled && state.status === 'playing' && state.turn === ACTOR_HUMAN

  return (
    <div className="myg-daWrap">
      <div className="myg-daGrid" role="grid" aria-label={t('tab.darkAnimals')}>
        {state.cells.map((cell, index) => {
          const isTarget = targets.has(index)
          const isCapture = isTarget && targets.get(index)
          const isLast = last !== null && (
            (last.type === 'flip' && last.cell === index) ||
            (last.type === 'move' && last.to === index)
          )
          const classes = ['myg-daCell']
          if (cell === null) classes.push('empty')
          else if (!cell.revealed) classes.push('hidden')
          else classes.push(cell.owner === humanColor ? 'human' : 'ai')
          if (selected === index) classes.push('selected')
          if (isTarget) classes.push('target')
          if (isCapture) classes.push('capture')
          if (isLast) classes.push('last')
          if (isLast && last.actor !== ACTOR_HUMAN) classes.push('ai-last')
          if (playable && (cell === null || !cell.revealed || cell.owner === humanColor || isTarget)) classes.push('playable')

          const label = cell === null
            ? t('da.emptyCell')
            : !cell.revealed
              ? `${cellName(index)} ${t('da.hiddenPiece')}`
              : `${cellName(index)} ${t(`da.animal.${cell.animal}`)}`
          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              className={classes.join(' ')}
              aria-label={label}
              aria-disabled={!playable}
              disabled={!playable || (cell === null && !isTarget)}
              onClick={() => onCell(index)}
            >
              {cell !== null && !cell.revealed && <CloudGlyph />}
              {cell !== null && cell.revealed && (
                <>
                  <span className="myg-daRank">{ANIMAL_BY_ID[cell.animal].rank}</span>
                  <span className="myg-daAnimal">{t(`da.animal.${cell.animal}`)}</span>
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

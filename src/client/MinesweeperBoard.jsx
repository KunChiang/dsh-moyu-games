import React from 'react'

function FlagGlyph() {
  return (
    <svg className="myg-msGlyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 21V4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M7 5h9.5l-2.4 3.1L16.5 11H7" fill="currentColor" />
      <path d="M4.5 21h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function MineGlyph() {
  return (
    <svg className="myg-msGlyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="5.2" fill="currentColor" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M19.1 4.9l-2.8 2.8M7.7 16.3l-2.8 2.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="10.2" cy="10.2" r="1.2" fill="var(--dsw-alias-bg-base, #fff)" opacity=".55" />
    </svg>
  )
}

function cellLabel(t, game, index, cell) {
  const row = Math.floor(index / game.cols) + 1
  const col = (index % game.cols) + 1
  const cellName = `${col}-${row}`
  if (cell.revealed) return t('ms.cellRevealed', { cell: cellName, n: cell.adjacent })
  if (cell.flagged) return t('ms.cellFlagged', { cell: cellName })
  return t('ms.cellHidden', { cell: cellName })
}

/** 扫雷棋盘：隐藏/翻开/插旗/数字/分析高亮。 */
export function MinesweeperBoard({ game, hint, flagMode, onReveal, onFlag, onChord, t, disabled }) {
  const safe = new Set(hint?.safe ?? [])
  const mines = new Set(hint?.mines ?? [])
  const guess = hint?.guess?.index ?? null
  const cellSize = game.cols >= 24 ? 22 : game.cols >= 12 ? 32 : 42
  const cellFont = game.cols >= 24 ? 11 : game.cols >= 12 ? 14 : 17
  const finished = game.status === 'won' || game.status === 'lost'

  return (
    <div className="myg-msScroll">
      <div
        className="myg-msBoard"
        role="grid"
        aria-label={t('ms.boardLabel')}
        style={{ '--cols': game.cols, '--cell': `${cellSize}px`, '--cell-font': `${cellFont}px` }}
      >
        {game.cells.map((cell, index) => {
          const classes = ['myg-msCell']
          if (cell.revealed) classes.push('revealed')
          else classes.push('hidden')
          if (cell.flagged) classes.push('flagged')
          if (cell.revealed && cell.mine) classes.push('mine')
          if (cell.revealed && !cell.mine && cell.adjacent > 0) classes.push(`n${cell.adjacent}`)
          if (safe.has(index)) classes.push('hint-safe')
          if (mines.has(index)) classes.push('hint-mine')
          if (guess === index) classes.push('hint-guess')
          if (flagMode && !cell.revealed && !finished) classes.push('flag-mode')

          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              className={classes.join(' ')}
              aria-label={cellLabel(t, game, index, cell)}
              disabled={finished}
              onClick={() => (flagMode ? onFlag(index) : onReveal(index))}
              onContextMenu={(event) => {
                event.preventDefault()
                if (!finished) onFlag(index)
              }}
              onDoubleClick={() => {
                if (!finished && cell.revealed && cell.adjacent > 0) onChord(index)
              }}
            >
              {cell.revealed
                ? cell.mine
                  ? <MineGlyph />
                  : cell.adjacent > 0 ? <span className="myg-msNumber">{cell.adjacent}</span> : null
                : cell.flagged ? <FlagGlyph /> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { FlagGlyph, MineGlyph }

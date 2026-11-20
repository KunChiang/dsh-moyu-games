/** 摸鱼棋室 —— 全部样式（注入一个 <style data-plugin>，随插件卸载由 HMR 清理）。 */
export const STYLES = `
.myg-root {
  --myg-accent: var(--dsw-static-deepseek-500, #4176e6);
  --myg-board: #f7f8fa;
  --myg-board-deep: #eceef1;
  --myg-line: rgba(15, 17, 21, .16);
  --myg-star: rgba(15, 17, 21, .34);
  --myg-sheen: rgba(255, 255, 255, .62);
  --myg-board-box: inset 0 0 0 1px rgba(15, 17, 21, .08), inset 0 1px 10px rgba(15, 17, 21, .03), 0 10px 24px rgba(15, 17, 21, .06);
  --myg-ghost-dark: rgba(15, 17, 21, .16);
  --myg-ghost-light: rgba(255, 255, 255, .92);
  --myg-stone-black-hi: #7b8494;
  --myg-stone-black-mid: #2b3342;
  --myg-stone-black-lo: #05070d;
  --myg-stone-white-hi: #ffffff;
  --myg-stone-white-mid: #f3f5f8;
  --myg-stone-white-lo: #c6ced9;
  --myg-black-rim: rgba(255, 255, 255, .2);
  --myg-stone-shadow-color: rgba(15, 17, 21, .3);
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: var(--dsw-alias-label-primary);
  background:
    radial-gradient(1100px 420px at 12% -12%, color-mix(in srgb, var(--myg-accent) 7%, transparent), transparent 60%),
    var(--dsw-alias-bg-base);
  container-type: inline-size;
  container-name: myg;
}
[data-ds-dark-theme] .myg-root {
  --myg-board: #202124;
  --myg-board-deep: #18191b;
  --myg-line: rgba(249, 250, 251, .2);
  --myg-sheen: rgba(255, 255, 255, .035);
  --myg-star: rgba(249, 250, 251, .38);
  --myg-board-box: inset 0 0 0 1px rgba(255, 255, 255, .07), inset 0 1px 12px rgba(0, 0, 0, .35), 0 10px 26px rgba(0, 0, 0, .35);
  --myg-ghost-dark: rgba(0, 0, 0, .42);
  --myg-ghost-light: rgba(255, 255, 255, .55);
  --myg-stone-black-hi: #98a2b1;
  --myg-stone-black-mid: #2f3642;
  --myg-stone-black-lo: #0a0c11;
  --myg-stone-white-hi: #ffffff;
  --myg-stone-white-mid: #eceff3;
  --myg-stone-white-lo: #b7bfca;
  --myg-black-rim: rgba(255, 255, 255, .5);
  --myg-stone-shadow-color: rgba(0, 0, 0, .45);
}
.myg-root *, .myg-root *::before, .myg-root *::after { box-sizing: border-box; }

.myg-header {
  flex: none;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 20px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  background: color-mix(in srgb, var(--dsw-alias-bg-base) 82%, transparent);
  backdrop-filter: blur(8px);
}
.myg-brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
.myg-brandMark {
  width: 34px; height: 34px; flex: none;
  display: grid; place-items: center;
  border-radius: 11px;
  color: var(--dsw-alias-label-primary-foreground, #fff);
  background: linear-gradient(145deg, color-mix(in srgb, var(--myg-accent) 82%, #9aa6b8), var(--myg-accent));
  box-shadow: 0 5px 14px color-mix(in srgb, var(--myg-accent) 22%, transparent), inset 0 1px 0 rgba(255,255,255,.28);
}
.myg-brandCopy { min-width: 0; }
.myg-title {
  margin: 0;
  font-size: 16px;
  font-weight: 680;
  letter-spacing: -.01em;
  line-height: 1.25;
  display: flex;
  align-items: center;
  gap: 8px;
}
.myg-title small {
  font-size: 10px;
  font-weight: 550;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--dsw-alias-label-secondary);
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 999px;
  padding: 1px 7px;
}
.myg-sub { margin: 2px 0 0; font-size: 11.5px; color: var(--dsw-alias-label-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.myg-tabs { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; margin-left: 12px; padding: 3px; border-radius: 10px; background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1); max-width: 100%; }
.myg-tab {
  display: inline-flex; align-items: center; gap: 6px;
  height: 26px; padding: 0 11px;
  border: 0; border-radius: 7px;
  background: transparent; color: var(--dsw-alias-label-secondary);
  font: inherit; font-size: 12px; cursor: pointer;
}
.myg-tab[aria-selected="true"] { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.myg-tab:disabled { cursor: default; opacity: .7; }
.myg-tab .myg-soon { font-size: 9px; letter-spacing: .04em; border: 1px solid var(--dsw-alias-border-l2); border-radius: 999px; padding: 0 5px; line-height: 14px; color: var(--dsw-alias-label-secondary); }

.myg-headerSpacer { flex: 1 1 auto; }
.myg-time {
  flex: none; display: inline-flex; align-items: center; gap: 6px;
  height: 26px; padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l1); border-radius: 999px;
  font-size: 11.5px; font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-bg-layer-1);
}
.myg-time b { color: var(--dsw-alias-label-primary); font-weight: 600; }

.myg-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  height: 30px; padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit; font-size: 12.5px; font-weight: 500;
  cursor: pointer;
  transition: background-color .15s ease, border-color .15s ease, transform .1s ease;
  white-space: nowrap;
}
.myg-btn:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.1)); border-color: var(--dsw-alias-border-l3, var(--dsw-alias-border-l2)); }
.myg-btn:active { transform: translateY(1px); }
.myg-btn:disabled { opacity: .42; cursor: not-allowed; transform: none; }
.myg-btn:focus-visible { outline: 2px solid var(--myg-accent); outline-offset: 2px; }
.myg-btn.primary {
  border-color: transparent;
  background: var(--dsw-alias-button-primary-fill, var(--myg-accent));
  color: var(--dsw-alias-label-primary-foreground, #fff);
  font-weight: 600;
  box-shadow: 0 2px 8px color-mix(in srgb, var(--myg-accent) 26%, transparent);
}
.myg-btn.primary:hover { filter: brightness(1.04); }
.myg-btn.ghost { background: transparent; border-color: transparent; color: var(--dsw-alias-label-secondary); }
.myg-btn.ghost:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.1)); }

.myg-scroll { flex: 1 1 auto; min-height: 0; overflow: auto; padding: 18px 20px 26px; }
.myg-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 306px;
  gap: 18px;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  align-items: start;
}

.myg-boardCard {
  min-width: 0;
  display: flex; flex-direction: column; gap: 12px;
  padding: 14px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 18px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 1.5%, var(--dsw-alias-bg-layer-1));
  box-shadow: 0 14px 36px rgba(20, 26, 40, .06);
}
.myg-boardTop { display: flex; align-items: center; gap: 10px; padding: 1px 4px 0; }
.myg-turn { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 620; letter-spacing: -.01em; }
.myg-turnDot { width: 9px; height: 9px; border-radius: 50%; background: var(--myg-accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--myg-accent) 15%, transparent); flex: none; }
.myg-turnDot.ai { background: var(--dsw-alias-state-warn-primary, #d9a441); box-shadow: 0 0 0 4px color-mix(in srgb, var(--dsw-alias-state-warn-primary, #d9a441) 16%, transparent); animation: myg-pulse 1.4s ease-in-out infinite; }
.myg-turnDot.done { background: var(--dsw-alias-state-success-primary, #31a15c); box-shadow: 0 0 0 4px color-mix(in srgb, var(--dsw-alias-state-success-primary, #31a15c) 16%, transparent); }
.myg-turnDot.lost { background: var(--dsw-alias-state-error-primary, #dc4b4b); box-shadow: 0 0 0 4px color-mix(in srgb, var(--dsw-alias-state-error-primary, #dc4b4b) 16%, transparent); }
@keyframes myg-pulse { 0%, 100% { opacity: .55; transform: scale(.92); } 50% { opacity: 1; transform: scale(1.08); } }
.myg-turnHint { font-size: 11.5px; color: var(--dsw-alias-label-secondary); font-weight: 450; }
.myg-boardTop .myg-spacer { flex: 1 1 auto; }
.myg-levelChip {
  flex: none; font-size: 11px; font-weight: 600;
  padding: 3px 9px; border-radius: 999px;
  color: color-mix(in srgb, var(--myg-accent) 80%, var(--dsw-alias-label-primary));
  background: color-mix(in srgb, var(--myg-accent) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--myg-accent) 24%, transparent);
}

.myg-boardWrap {
  position: relative;
  width: min(100%, clamp(420px, calc(100vh - 300px), 680px));
  min-width: 260px;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  border-radius: 14px;
  background:
    radial-gradient(circle at 26% 14%, var(--myg-sheen), transparent 62%),
    linear-gradient(150deg, var(--myg-board), var(--myg-board-deep));
  box-shadow: var(--myg-board-box);
  touch-action: manipulation;
}
.myg-board { display: block; width: 100%; height: 100%; border-radius: 14px; outline: none; cursor: crosshair; }
.myg-board:focus-visible { box-shadow: 0 0 0 3px color-mix(in srgb, var(--myg-accent) 55%, transparent); }
.myg-gridLine { stroke: var(--myg-line); stroke-width: 1px; vector-effect: non-scaling-stroke; }
.myg-gridBorder { stroke: var(--myg-line); stroke-width: 1.5px; fill: none; vector-effect: non-scaling-stroke; }
.myg-star { fill: var(--myg-star); }
.myg-coord { fill: var(--myg-line); font-size: 0.3px; font-family: var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, monospace); text-anchor: middle; user-select: none; pointer-events: none; }

.myg-stopBlackHi { stop-color: var(--myg-stone-black-hi); }
.myg-stopBlackMid { stop-color: var(--myg-stone-black-mid); }
.myg-stopBlackLo { stop-color: var(--myg-stone-black-lo); }
.myg-stopWhiteHi { stop-color: var(--myg-stone-white-hi); }
.myg-stopWhiteMid { stop-color: var(--myg-stone-white-mid); }
.myg-stopWhiteLo { stop-color: var(--myg-stone-white-lo); }
.myg-stone { transition: opacity .15s ease; }
.myg-stoneLastRing { fill: none; stroke: var(--myg-accent); stroke-width: 2px; vector-effect: non-scaling-stroke; opacity: .95; }
.myg-winRing { fill: none; stroke: var(--dsw-alias-state-success-primary, #2fa867); stroke-width: 2.4px; vector-effect: non-scaling-stroke; opacity: .95; animation: myg-win 1.2s ease-in-out infinite; }
@keyframes myg-win { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
.myg-winLine { stroke: color-mix(in srgb, var(--dsw-alias-state-success-primary, #2fa867) 72%, transparent); stroke-width: 4px; vector-effect: non-scaling-stroke; stroke-linecap: round; opacity: .5; }
.myg-ghost { pointer-events: none; }
.myg-cursorRing { fill: none; stroke: var(--myg-accent); stroke-width: 2px; vector-effect: non-scaling-stroke; stroke-dasharray: 4 4; opacity: .8; pointer-events: none; }

.myg-boardFoot { display: flex; align-items: center; gap: 8px; padding: 0 2px; flex-wrap: wrap; }
.myg-boardFoot .myg-spacer { flex: 1 1 auto; }
.myg-footMeta { font-size: 11.5px; color: var(--dsw-alias-label-secondary); }

.myg-side { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
.myg-card {
  min-width: 0;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 14px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 1.2%, var(--dsw-alias-bg-layer-1));
  padding: 13px 14px;
}
.myg-cardTitle { margin: 0 0 10px; font-size: 11px; font-weight: 650; letter-spacing: .06em; color: var(--dsw-alias-label-secondary); }

.myg-seg { display: grid; gap: 2px; padding: 2px; border: 1px solid var(--dsw-alias-border-l1); border-radius: 10px; background: var(--dsw-alias-bg-layer-2); }
.myg-seg.three { grid-template-columns: repeat(3, 1fr); }
.myg-seg.two { grid-template-columns: repeat(2, 1fr); }
.myg-seg button {
  height: 27px; border: 0; border-radius: 7px;
  background: transparent; color: var(--dsw-alias-label-secondary);
  font: inherit; font-size: 12px; cursor: pointer;
  transition: background-color .15s ease, color .15s ease;
}
.myg-seg button:hover { color: var(--dsw-alias-label-primary); }
.myg-seg button[aria-pressed="true"] { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); font-weight: 620; box-shadow: 0 1px 3px rgba(0,0,0,.14); }
.myg-seg button:disabled { opacity: .45; cursor: not-allowed; }
.myg-fieldLabel { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; font-size: 11.5px; color: var(--dsw-alias-label-secondary); margin: 10px 0 5px; }
.myg-fieldLabel > span:last-child { text-align: right; }
.myg-fieldLabel:first-of-type { margin-top: 0; }

.myg-ai { display: flex; gap: 11px; align-items: flex-start; }
.myg-avatar {
  width: 40px; height: 40px; flex: none;
  display: grid; place-items: center;
  border-radius: 13px;
  color: color-mix(in srgb, var(--myg-accent) 82%, #fff);
  background: radial-gradient(circle at 30% 20%, color-mix(in srgb, var(--myg-accent) 22%, transparent), color-mix(in srgb, var(--myg-accent) 6%, transparent));
  border: 1px solid color-mix(in srgb, var(--myg-accent) 24%, var(--dsw-alias-border-l1));
}
.myg-aiBody { min-width: 0; flex: 1 1 auto; }
.myg-aiName { display: flex; align-items: baseline; gap: 6px; font-size: 13px; font-weight: 650; }
.myg-aiName span { font-size: 10.5px; font-weight: 500; color: var(--dsw-alias-label-secondary); }
.myg-bubble {
  position: relative;
  margin-top: 7px;
  padding: 8px 10px;
  border-radius: 4px 10px 10px 10px;
  background: var(--dsw-alias-bg-layer-2);
  border: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  line-height: 1.55;
  overflow-wrap: anywhere;
  min-height: 36px;
}
.myg-bubble::before {
  content: "";
  position: absolute; top: -1px; left: -6px;
  border: 6px solid transparent;
  border-right-color: var(--dsw-alias-bg-layer-2);
  border-top-color: var(--dsw-alias-bg-layer-2);
}

.myg-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.myg-stat { text-align: center; padding: 7px 2px 6px; border-radius: 9px; background: var(--dsw-alias-bg-layer-2); border: 1px solid var(--dsw-alias-border-l1); min-width: 0; }
.myg-stat b { display: block; font-size: 19px; line-height: 1.1; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
.myg-stat span { display: block; margin-top: 2px; font-size: 10px; color: var(--dsw-alias-label-secondary); white-space: nowrap; }
.myg-stat.win b { color: var(--dsw-alias-state-success-primary, #2fa867); }
.myg-stat.lose b { color: var(--dsw-alias-state-error-primary, #dc4b4b); }
.myg-stat.streak b { color: var(--myg-accent); }

.myg-moves { display: flex; flex-wrap: wrap; gap: 5px; max-height: 168px; overflow: auto; padding-right: 2px; }
.myg-moveChip {
  display: inline-flex; align-items: center; gap: 4px;
  height: 22px; padding: 0 7px;
  border-radius: 6px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-2);
  font-size: 10.5px; font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-secondary);
}
.myg-moveChip i { width: 7px; height: 7px; border-radius: 50%; flex: none; }
.myg-moveChip i.black { background: linear-gradient(145deg, #6b7280, #0b1020); }
.myg-moveChip i.white { background: linear-gradient(145deg, #fff, #c7ced8); box-shadow: inset 0 0 0 1px rgba(0,0,0,.18); }
.myg-moveChip.last { border-color: color-mix(in srgb, var(--myg-accent) 38%, var(--dsw-alias-border-l1)); color: var(--dsw-alias-label-primary); }
.myg-empty { font-size: 12px; color: var(--dsw-alias-label-secondary); line-height: 1.55; }

.myg-hint { display: flex; gap: 7px; align-items: flex-start; font-size: 11px; line-height: 1.55; color: var(--dsw-alias-label-secondary); padding: 0 2px; }
.myg-hint kbd {
  font-family: var(--ds-font-family-code, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: 10px; padding: 0 5px; line-height: 16px;
  border: 1px solid var(--dsw-alias-border-l2); border-bottom-width: 2px;
  border-radius: 4px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary);
}

.myg-result {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--dsw-alias-state-success-primary, #2fa867) 26%, var(--dsw-alias-border-l1));
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #2fa867) 7%, var(--dsw-alias-bg-layer-1));
}
.myg-result.lose, .myg-result.draw { border-color: var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-2); }
.myg-resultTitle { font-size: 13.5px; font-weight: 680; }
.myg-resultDesc { font-size: 11.5px; color: var(--dsw-alias-label-secondary); margin-top: 1px; }
.myg-result .myg-spacer { flex: 1 1 auto; }

.myg-thinking { display: inline-flex; gap: 3px; align-items: center; margin-left: 2px; }
.myg-thinking i { width: 3px; height: 3px; border-radius: 50%; background: currentColor; opacity: .4; animation: myg-blink 1s infinite; }
.myg-thinking i:nth-child(2) { animation-delay: .16s; }
.myg-thinking i:nth-child(3) { animation-delay: .32s; }
@keyframes myg-blink { 0%, 100% { opacity: .25; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-1px); } }

@container myg (max-width: 960px) {
  .myg-main { grid-template-columns: minmax(0, 1fr); }
  .myg-boardWrap { width: min(100%, 620px); }
  .myg-side { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }
  .myg-side .myg-card:first-child { grid-column: span 1; }
  .myg-hint { grid-column: 1 / -1; }
}
@container myg (max-width: 620px) {
  .myg-header { flex-wrap: wrap; gap: 10px; padding: 11px 14px; }
  .myg-tabs { margin-left: 0; }
  .myg-scroll { padding: 12px 12px 20px; }
  .myg-side { grid-template-columns: minmax(0, 1fr); }
  .myg-time { display: none; }
  .myg-boardCard { border-radius: 14px; padding: 10px; }
  .myg-sub { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .myg-turnDot.ai, .myg-winRing, .myg-thinking i { animation: none; }
}

.myg-composerBtn {
  display: inline-flex; align-items: center; gap: 5px;
  height: 24px; padding: 0 9px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  font: inherit; font-size: 11.5px;
  cursor: pointer;
  transition: color .15s ease, border-color .15s ease, background-color .15s ease;
}
.myg-composerBtn:hover {
  color: var(--dsw-alias-label-primary);
  border-color: color-mix(in srgb, var(--myg-accent) 38%, var(--dsw-alias-border-l1));
  background: color-mix(in srgb, var(--myg-accent) 7%, var(--dsw-alias-bg-layer-2));
}
.myg-composerBtn svg { flex: none; }


.myg-daWrap {
  position: relative;
  width: min(100%, clamp(360px, calc(100vh - 330px), 560px));
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  padding: 10px;
  border-radius: 14px;
  background:
    radial-gradient(circle at 26% 14%, var(--myg-sheen), transparent 62%),
    linear-gradient(150deg, var(--myg-board), var(--myg-board-deep));
  box-shadow: var(--myg-board-box);
}
.myg-daGrid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(4, minmax(0, 1fr));
  gap: 7px;
  width: 100%;
  height: 100%;
}
.myg-daCell {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
  min-height: 0;
  padding: 0;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 11px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 72%, transparent);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  cursor: default;
  transition: transform .12s ease, border-color .15s ease, background-color .15s ease, box-shadow .15s ease;
  overflow: hidden;
}
.myg-daCell.empty {
  border-style: dashed;
  border-color: var(--dsw-alias-border-l1);
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 28%, transparent);
}
.myg-daCell.hidden {
  color: var(--dsw-alias-label-secondary);
  background:
    repeating-linear-gradient(135deg, color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent) 0 1px, transparent 1px 9px),
    color-mix(in srgb, var(--dsw-alias-bg-layer-1) 70%, transparent);
}
.myg-daCell.playable { cursor: pointer; }
.myg-daCell.playable:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--myg-accent) 46%, var(--dsw-alias-border-l2));
  box-shadow: 0 4px 12px color-mix(in srgb, var(--myg-accent) 14%, transparent);
}
.myg-daCell.human {
  border-color: color-mix(in srgb, var(--myg-accent) 44%, var(--dsw-alias-border-l2));
  background:
    radial-gradient(circle at 35% 25%, color-mix(in srgb, var(--myg-accent) 14%, transparent), transparent 70%),
    color-mix(in srgb, var(--myg-accent) 7%, var(--dsw-alias-bg-layer-1));
}
.myg-daCell.ai {
  border-color: color-mix(in srgb, var(--myg-da-red) 42%, var(--dsw-alias-border-l2));
  background:
    radial-gradient(circle at 35% 25%, color-mix(in srgb, var(--myg-da-red) 14%, transparent), transparent 70%),
    color-mix(in srgb, var(--myg-da-red) 6%, var(--dsw-alias-bg-layer-1));
}
.myg-root { --myg-da-red: #d97706; }
[data-ds-dark-theme] .myg-root { --myg-da-red: #f4a340; }
.myg-daCell.selected {
  outline: 2px solid var(--myg-accent);
  outline-offset: -2px;
  box-shadow: inset 0 0 0 3px color-mix(in srgb, var(--myg-accent) 22%, transparent);
}
.myg-daCell.target::after {
  content: "";
  width: 26%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: color-mix(in srgb, var(--myg-accent) 65%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--myg-accent) 12%, transparent);
  position: absolute;
  pointer-events: none;
}
.myg-daCell.target.capture::after {
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #dc4b4b) 72%, transparent);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--dsw-alias-state-error-primary, #dc4b4b) 14%, transparent);
}
.myg-daCell.last {
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--myg-accent) 55%, transparent);
}
.myg-daCell.last.ai-last {
  box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--myg-da-red) 55%, transparent);
}
.myg-daRank {
  position: absolute; top: 5px; left: 7px;
  font-size: 10px; font-weight: 650;
  opacity: .62; font-variant-numeric: tabular-nums;
}
.myg-daAnimal {
  font-size: clamp(19px, 5.2cqw, 32px);
  font-weight: 720;
  line-height: 1;
  letter-spacing: -.02em;
  padding-bottom: 2px;
}
.myg-daCell.human .myg-daAnimal { color: color-mix(in srgb, var(--myg-accent) 82%, var(--dsw-alias-label-primary)); }
.myg-daCell.ai .myg-daAnimal { color: color-mix(in srgb, var(--myg-da-red) 82%, var(--dsw-alias-label-primary)); }
.myg-daCloud { width: 42%; height: 42%; opacity: .5; }
.myg-daKey { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; color: var(--dsw-alias-label-secondary); }
.myg-daKey i { width: 8px; height: 8px; border-radius: 3px; }
.myg-daKey i.teal { background: color-mix(in srgb, var(--myg-accent) 65%, transparent); }
.myg-daKey i.red { background: color-mix(in srgb, var(--myg-da-red) 65%, transparent); }
.myg-daCaptured { display: flex; flex-wrap: wrap; gap: 4px; min-height: 20px; }
.myg-daChip {
  display: inline-flex; align-items: center; gap: 3px;
  height: 21px; padding: 0 6px;
  border-radius: 6px; border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-2);
  font-size: 10.5px; color: var(--dsw-alias-label-secondary);
}
.myg-daChip.human { border-color: color-mix(in srgb, var(--myg-accent) 30%, var(--dsw-alias-border-l1)); }
.myg-daChip.ai { border-color: color-mix(in srgb, var(--myg-da-red) 30%, var(--dsw-alias-border-l1)); }


.myg-msScroll { width: 100%; overflow: auto; padding: 2px; display: flex; justify-content: center; }
.myg-msBoard {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  gap: 2px;
  width: 100%;
  max-width: calc(var(--cols) * var(--cell));
  min-width: calc(var(--cols) * 14px);
  padding: 7px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-2);
}
.myg-msCell {
  position: relative;
  aspect-ratio: 1 / 1;
  display: grid;
  place-items: center;
  min-width: 0;
  padding: 0;
  border-radius: 4px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: var(--cell-font, 14px);
  font-weight: 720;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  transition: background-color .1s ease, border-color .1s ease, transform .1s ease;
}
.myg-msCell.hidden {
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--dsw-alias-label-primary) 3%, var(--dsw-alias-bg-layer-2)), var(--dsw-alias-bg-layer-2));
  box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 30%, transparent), inset 0 -1px 0 color-mix(in srgb, #000 8%, transparent);
}
.myg-msCell.hidden:hover {
  border-color: color-mix(in srgb, var(--myg-accent) 46%, var(--dsw-alias-border-l2));
  background: color-mix(in srgb, var(--myg-accent) 7%, var(--dsw-alias-bg-layer-2));
}
.myg-msCell.hidden:active { transform: scale(.96); }
.myg-msCell.revealed {
  cursor: default;
  border-color: var(--dsw-alias-border-l1);
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 2%, var(--dsw-alias-bg-layer-1));
  box-shadow: none;
}
.myg-msCell.revealed:hover { border-color: var(--dsw-alias-border-l1); }
.myg-msCell.flagged { color: var(--dsw-alias-state-error-primary, #dc2626); }
.myg-msCell.mine { color: var(--dsw-alias-state-error-primary, #dc2626); background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #dc2626) 9%, var(--dsw-alias-bg-layer-1)); }
.myg-msGlyph { width: 64%; height: 64%; display: block; }
.myg-msNumber { font-size: var(--cell-font, 14px); font-variant-numeric: tabular-nums; }
.myg-msCell.n1 { color: #2563eb; }
.myg-msCell.n2 { color: #15803d; }
.myg-msCell.n3 { color: #dc2626; }
.myg-msCell.n4 { color: #1e3a8a; }
.myg-msCell.n5 { color: #9a3412; }
.myg-msCell.n6 { color: #0f766e; }
.myg-msCell.n7 { color: #111827; }
.myg-msCell.n8 { color: #6b7280; }
[data-ds-dark-theme] .myg-msCell.n1 { color: #60a5fa; }
[data-ds-dark-theme] .myg-msCell.n2 { color: #4ade80; }
[data-ds-dark-theme] .myg-msCell.n3 { color: #f87171; }
[data-ds-dark-theme] .myg-msCell.n4 { color: #93c5fd; }
[data-ds-dark-theme] .myg-msCell.n5 { color: #fb923c; }
[data-ds-dark-theme] .myg-msCell.n6 { color: #2dd4bf; }
[data-ds-dark-theme] .myg-msCell.n7 { color: #e5e7eb; }
[data-ds-dark-theme] .myg-msCell.n8 { color: #9ca3af; }
.myg-msCell.flag-mode.hidden { cursor: cell; }
.myg-msCell.hint-safe { outline: 2px solid color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 78%, transparent); outline-offset: -2px; z-index: 2; }
.myg-msCell.hint-mine { outline: 2px solid color-mix(in srgb, var(--dsw-alias-state-error-primary, #dc2626) 78%, transparent); outline-offset: -2px; z-index: 2; }
.myg-msCell.hint-guess { outline: 2px dashed color-mix(in srgb, var(--myg-da-red, #d97706) 88%, transparent); outline-offset: -2px; z-index: 2; }
.myg-msCell.hint-safe::after, .myg-msCell.hint-guess::after {
  content: "";
  position: absolute; inset: 22%;
  border-radius: 50%;
  pointer-events: none;
}
.myg-msCell.hint-safe::after { background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 18%, transparent); }
.myg-msCell.hint-guess::after { background: color-mix(in srgb, var(--myg-da-red, #d97706) 16%, transparent); }


.myg-stackWrap {
  width: min(100%, 380px);
  aspect-ratio: 360 / 560;
  margin: 0 auto;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--dsw-alias-border-l1);
  box-shadow: 0 10px 26px rgba(15, 23, 42, .10);
}
.myg-stackSvg { display: block; width: 100%; height: 100%; cursor: pointer; outline: none; touch-action: manipulation; }
.myg-stackSvg:focus-visible { box-shadow: inset 0 0 0 2px var(--myg-accent); }
.myg-stackSkyTop { stop-color: #eef6fb; }
.myg-stackSkyBottom { stop-color: #d8e6f0; }
[data-ds-dark-theme] .myg-stackSkyTop { stop-color: #1b2430; }
[data-ds-dark-theme] .myg-stackSkyBottom { stop-color: #101720; }
.myg-stackCloud { fill: #ffffff; opacity: .55; }
.myg-stackFadeStart { stop-color: #d8e6f0; stop-opacity: 0; }
.myg-stackFadeEnd { stop-color: #d8e6f0; stop-opacity: 1; }
[data-ds-dark-theme] .myg-stackCloud { fill: #ffffff; opacity: .06; }
[data-ds-dark-theme] .myg-stackFadeStart { stop-color: #101720; stop-opacity: 0; }
[data-ds-dark-theme] .myg-stackFadeEnd { stop-color: #101720; stop-opacity: 1; }
.myg-stackGround { fill: #b9c7d4; }
[data-ds-dark-theme] .myg-stackGround { fill: #0c1219; }
.myg-stackGroundLine { stroke: rgba(15, 23, 42, .28); stroke-width: 2; }
[data-ds-dark-theme] .myg-stackGroundLine { stroke: rgba(255, 255, 255, .18); }
.myg-stackRail { stroke: rgba(15, 23, 42, .22); stroke-width: 3; stroke-linecap: round; }
[data-ds-dark-theme] .myg-stackRail { stroke: rgba(255, 255, 255, .18); }
.myg-stackTrolley { fill: #475569; }
[data-ds-dark-theme] .myg-stackTrolley { fill: #94a3b8; }
.myg-stackCable { stroke: rgba(15, 23, 42, .45); stroke-width: 1.4; stroke-dasharray: 3 3; }
[data-ds-dark-theme] .myg-stackCable { stroke: rgba(255, 255, 255, .4); }
.myg-stackScores { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.myg-stackScores > div {
  text-align: center; padding: 9px 6px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
  border: 1px solid var(--dsw-alias-border-l1);
}
.myg-stackScores b { display: block; font-size: 24px; line-height: 1.1; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
.myg-stackScores span { display: block; margin-top: 3px; font-size: 10.5px; color: var(--dsw-alias-label-secondary); }

`

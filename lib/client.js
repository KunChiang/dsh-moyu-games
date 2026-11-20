window.__ModuleLoader__.load({
  id: "dsh-moyu-games",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.jsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);
var import_react9 = __toESM(require("react"), 1);

// src/client/Panel.jsx
var import_react8 = __toESM(require("react"), 1);

// src/client/constants.js
var NS = "moyu-games";
var PANEL_ID = "moyu-games";
var GAME_GOMOKU = "gomoku";
var GAME_DARK = "dark-animals";
var GAME_MINESWEEPER = "minesweeper";
var GAME_STACK = "stack";
var LAST_GAME_KEY = "dsh-moyu-games.last-game.v2";

// src/client/GomokuGame.jsx
var import_react2 = __toESM(require("react"), 1);

// src/shared/gomoku.js
var SIZE = 15;
var EMPTY = 0;
var BLACK = 1;
var WHITE = 2;
var DIRECTIONS = Object.freeze([
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1]
]);
var WIN_SCORE = 1e9;
function otherPlayer(player) {
  return player === BLACK ? WHITE : BLACK;
}
function createBoard(size = SIZE) {
  return new Uint8Array(size * size);
}
function cloneBoard(board) {
  return board.slice();
}
function inside(size, x, y) {
  return x >= 0 && y >= 0 && x < size && y < size;
}
function isBoardFull(board) {
  for (let i = 0; i < board.length; i += 1) if (board[i] === EMPTY) return false;
  return true;
}
function findWin(board, size, x, y) {
  if (!inside(size, x, y)) return null;
  const player = board[y * size + x];
  if (player === EMPTY) return null;
  for (const [dx, dy] of DIRECTIONS) {
    const cells = [];
    for (const sign of [-1, 1]) {
      let nx = x + sign * dx;
      let ny = y + sign * dy;
      while (inside(size, nx, ny) && board[ny * size + nx] === player) {
        cells.push([nx, ny]);
        nx += sign * dx;
        ny += sign * dy;
      }
    }
    if (cells.length + 1 >= 5) {
      cells.push([x, y]);
      cells.sort((a, b) => (a[0] - b[0]) * dx + (a[1] - b[1]) * dy);
      return cells;
    }
  }
  return null;
}
function wouldWin(board, size, x, y, player) {
  if (!inside(size, x, y) || board[y * size + x] !== EMPTY) return false;
  for (const [dx, dy] of DIRECTIONS) {
    let count = 1;
    for (const sign of [-1, 1]) {
      let nx = x + sign * dx;
      let ny = y + sign * dy;
      while (inside(size, nx, ny) && board[ny * size + nx] === player) {
        count += 1;
        nx += sign * dx;
        ny += sign * dy;
      }
    }
    if (count >= 5) return true;
  }
  return false;
}
function candidateMoves(board, size, radius = 2) {
  const seen = /* @__PURE__ */ new Set();
  let any = false;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (board[y * size + x] === EMPTY) continue;
      any = true;
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(size - 1, x + radius);
      const y0 = Math.max(0, y - radius);
      const y1 = Math.min(size - 1, y + radius);
      for (let ny = y0; ny <= y1; ny += 1) {
        for (let nx = x0; nx <= x1; nx += 1) {
          if (board[ny * size + nx] !== EMPTY) continue;
          seen.add(ny * size + nx);
        }
      }
    }
  }
  if (!any) {
    const center = size - 1 >> 1;
    return [{ x: center, y: center }];
  }
  const moves = [];
  for (const index of seen) moves.push({ x: index % size, y: index / size | 0 });
  return moves;
}
function rayWindow(board, size, x, y, player, dx, dy) {
  let text = "";
  for (let offset = -4; offset <= 4; offset += 1) {
    if (offset === 0) {
      text += "o";
      continue;
    }
    const nx = x + dx * offset;
    const ny = y + dy * offset;
    if (!inside(size, nx, ny)) {
      text += "#";
      continue;
    }
    const value = board[ny * size + nx];
    text += value === player ? "o" : value === EMPTY ? "." : "#";
  }
  return text;
}
function hasFive(text) {
  for (let i = 0; i <= 4; i += 1) if (text.slice(i, i + 5) === "ooooo") return true;
  return false;
}
function winningCells(text) {
  let total = 0;
  for (let i = 0; i < 9; i += 1) {
    if (text[i] !== ".") continue;
    const next = text.slice(0, i) + "o" + text.slice(i + 1);
    if (hasFive(next)) total += 1;
  }
  return total;
}
function fourMakers(text) {
  let makers = 0;
  let openMakers = 0;
  for (let i = 0; i < 9; i += 1) {
    if (text[i] !== ".") continue;
    const next = text.slice(0, i) + "o" + text.slice(i + 1);
    const ways = winningCells(next);
    if (ways >= 1) makers += 1;
    if (ways >= 2) openMakers += 1;
  }
  return { makers, openMakers };
}
function classifyRay(text) {
  if (hasFive(text)) return { level: 5, open: false };
  const wins = winningCells(text);
  if (wins >= 2) return { level: 4, open: true };
  if (wins === 1) return { level: 4, open: false };
  const fours = fourMakers(text);
  if (fours.openMakers >= 1) return { level: 3, open: true };
  if (fours.makers >= 1) return { level: 3, open: false };
  let left = 0;
  while (left < 4 && text[4 - left - 1] === "o") left += 1;
  let right = 0;
  while (right < 4 && text[4 + right + 1] === "o") right += 1;
  const run = left + right + 1;
  const openEnds = (text[4 - left - 1] === "." ? 1 : 0) + (text[4 + right + 1] === "." ? 1 : 0);
  if (run >= 3) return { level: 3, open: openEnds === 2 };
  if (run === 2) return { level: 2, openEnds };
  return { level: 1, openEnds };
}
function pointScore(board, size, x, y, player) {
  if (!inside(size, x, y) || board[y * size + x] !== EMPTY) return -1;
  let score = 0;
  let fours = 0;
  let openThrees = 0;
  for (const [dx, dy] of DIRECTIONS) {
    const info = classifyRay(rayWindow(board, size, x, y, player, dx, dy));
    if (info.level === 5) return 1e8;
    if (info.level === 4) {
      fours += 1;
      score += info.open ? 3e6 : 4e5;
    } else if (info.level === 3) {
      if (info.open) {
        openThrees += 1;
        score += 6e4;
      } else {
        score += 6e3;
      }
    } else if (info.level === 2) {
      score += info.openEnds === 2 ? 900 : 220;
    } else {
      score += info.openEnds === 2 ? 40 : 10;
    }
  }
  if (fours >= 2) score += 4e6;
  if (openThrees >= 2) score += 3e5;
  return score;
}
function quickScore(board, size, x, y, player) {
  if (board[y * size + x] !== EMPTY) return -1;
  if (wouldWin(board, size, x, y, player)) return 5e7;
  let score = 0;
  for (const [dx, dy] of DIRECTIONS) {
    let left = 0;
    let right = 0;
    for (let sign of [-1, 1]) {
      let run2 = 0;
      let nx = x + sign * dx;
      let ny = y + sign * dy;
      while (inside(size, nx, ny) && board[ny * size + nx] === player) {
        run2 += 1;
        nx += sign * dx;
        ny += sign * dy;
      }
      if (sign === -1) left = run2;
      else right = run2;
    }
    const run = left + right + 1;
    const open = (inside(size, x - (left + 1) * dx, y - (left + 1) * dy) && board[(y - (left + 1) * dy) * size + (x - (left + 1) * dx)] === EMPTY ? 1 : 0) + (inside(size, x + (right + 1) * dx, y + (right + 1) * dy) && board[(y + (right + 1) * dy) * size + (x + (right + 1) * dx)] === EMPTY ? 1 : 0);
    if (run >= 5) score += 1e7;
    else if (run === 4) score += open >= 2 ? 1e5 : open === 1 ? 2e4 : 0;
    else if (run === 3) score += open === 2 ? 4e3 : 600;
    else if (run === 2) score += open === 2 ? 300 : 80;
    else score += open === 2 ? 12 : 3;
  }
  return score;
}
function boardScore(board, size, player) {
  let score = 0;
  for (const [dx, dy] of DIRECTIONS) {
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (board[y * size + x] !== player) continue;
        const px = x - dx;
        const py = y - dy;
        if (inside(size, px, py) && board[py * size + px] === player) continue;
        let length = 0;
        let nx = x;
        let ny = y;
        while (inside(size, nx, ny) && board[ny * size + nx] === player) {
          length += 1;
          nx += dx;
          ny += dy;
        }
        const before = inside(size, x - dx, y - dy) && board[(y - dy) * size + (x - dx)] === EMPTY;
        const after = inside(size, nx, ny) && board[ny * size + nx] === EMPTY;
        const open = (before ? 1 : 0) + (after ? 1 : 0);
        if (length >= 5) score += 1e7;
        else if (length === 4) score += open === 2 ? 1e6 : open === 1 ? 12e4 : 0;
        else if (length === 3) score += open === 2 ? 24e3 : open === 1 ? 2400 : 0;
        else if (length === 2) score += open === 2 ? 1200 : open === 1 ? 160 : 0;
        else score += open === 2 ? 30 : 6;
      }
    }
  }
  return score;
}
function evaluateBoard(board, size, player) {
  const opponent = otherPlayer(player);
  return boardScore(board, size, player) * 1.02 - boardScore(board, size, opponent) * 1.12;
}
function orderedMoves(board, size, player, limit, accurate) {
  const moves = candidateMoves(board, size, 2);
  const opponent = otherPlayer(player);
  const weight = accurate ? 1 : 1;
  const scored = [];
  for (const move of moves) {
    const own = accurate ? pointScore(board, size, move.x, move.y, player) : quickScore(board, size, move.x, move.y, player);
    const deny = accurate ? pointScore(board, size, move.x, move.y, opponent) : quickScore(board, size, move.x, move.y, opponent);
    scored.push({ ...move, weight: own + deny * weight });
  }
  scored.sort((a, b) => b.weight - a.weight);
  return scored.slice(0, limit);
}
function minimax(board, size, aiPlayer, opponent, turn, depth, alpha, beta, context) {
  context.nodes += 1;
  if (depth <= 0) return evaluateBoard(board, size, aiPlayer);
  if (context.nodes > context.budget) return evaluateBoard(board, size, aiPlayer);
  if ((context.nodes & 255) === 0 && Date.now() > context.deadline) {
    context.timedOut = true;
    return evaluateBoard(board, size, aiPlayer);
  }
  const moves = orderedMoves(board, size, turn, depth >= 3 ? 8 : 10, false);
  if (moves.length === 0) return 0;
  if (turn === aiPlayer) {
    let best2 = -Infinity;
    for (const move of moves) {
      const index = move.y * size + move.x;
      board[index] = turn;
      const win = findWin(board, size, move.x, move.y);
      let value;
      if (win) value = WIN_SCORE + depth;
      else value = minimax(board, size, aiPlayer, opponent, opponent, depth - 1, alpha, beta, context);
      board[index] = EMPTY;
      if (value > best2) best2 = value;
      if (best2 > alpha) alpha = best2;
      if (alpha >= beta) break;
      if (context.timedOut) break;
    }
    return best2;
  }
  let best = Infinity;
  for (const move of moves) {
    const index = move.y * size + move.x;
    board[index] = turn;
    const win = findWin(board, size, move.x, move.y);
    let value;
    if (win) value = -WIN_SCORE - depth;
    else value = minimax(board, size, aiPlayer, opponent, aiPlayer, depth - 1, alpha, beta, context);
    board[index] = EMPTY;
    if (value < best) best = value;
    if (best < beta) beta = best;
    if (alpha >= beta) break;
    if (context.timedOut) break;
  }
  return best;
}
var LEVEL_CONFIG = {
  easy: { maxDepth: 0, top: 8 },
  medium: { maxDepth: 2, top: 12, budget: 4e4, timeLimitMs: 240 },
  hard: { maxDepth: 6, top: 10, budget: 55e3, timeLimitMs: 320 }
};
function pickMove(board, size, player, options = {}) {
  const level = LEVEL_CONFIG[options.level] !== void 0 ? options.level : "medium";
  const config = LEVEL_CONFIG[level];
  const random = options.random ?? Math.random;
  const opponent = otherPlayer(player);
  if (isBoardFull(board)) return null;
  const candidates = candidateMoves(board, size, 2);
  if (candidates.length === 0) return null;
  for (const move of candidates) {
    if (wouldWin(board, size, move.x, move.y, player)) return move;
  }
  const blocks = candidates.filter((move) => wouldWin(board, size, move.x, move.y, opponent));
  if (blocks.length > 0) {
    let best2 = blocks[0];
    let bestScore = -Infinity;
    for (const move of blocks) {
      const score = pointScore(board, size, move.x, move.y, player) + pointScore(board, size, move.x, move.y, opponent) * 1.1 + random() * 1e-3;
      if (score > bestScore) {
        bestScore = score;
        best2 = move;
      }
    }
    return best2;
  }
  const ranked = candidates.map((move) => {
    const attack = pointScore(board, size, move.x, move.y, player);
    const defense = pointScore(board, size, move.x, move.y, opponent);
    return { ...move, attack, defense, score: attack + defense * 1.08 };
  }).sort((a, b) => b.score - a.score);
  if (level === "easy") {
    const pool = ranked.slice(0, Math.min(config.top, ranked.length));
    const noise = 0.22;
    if (pool.length > 1 && random() < noise) {
      return pool[1 + Math.floor(random() * (pool.length - 1))];
    }
    if (pool.length > 1 && random() < 0.12) {
      return pool[Math.floor(random() * pool.length)];
    }
    return pool[0];
  }
  const ctx = {
    nodes: 0,
    budget: config.budget,
    deadline: Date.now() + (options.timeLimitMs ?? config.timeLimitMs),
    timedOut: false
  };
  const work = cloneBoard(board);
  let best = ranked[0];
  let bestValue = -Infinity;
  const widths = { 2: Math.min(config.top, 10), 4: Math.min(config.top, 8) };
  for (let depth = 2; depth <= config.maxDepth; depth += 2) {
    const width = widths[depth] ?? Math.min(config.top, 8);
    let depthBest = null;
    let depthBestValue = -Infinity;
    let alpha = -Infinity;
    for (const move of ranked.slice(0, width)) {
      const index = move.y * size + move.x;
      work[index] = player;
      const win = findWin(work, size, move.x, move.y);
      let value;
      if (win) value = WIN_SCORE;
      else value = minimax(work, size, player, opponent, opponent, depth - 1, alpha, Infinity, ctx);
      work[index] = EMPTY;
      if (value > depthBestValue) {
        depthBestValue = value;
        depthBest = move;
      }
      if (value > alpha) alpha = value;
      if (ctx.nodes > ctx.budget || ctx.timedOut) break;
    }
    if (depthBest !== null) {
      best = depthBest;
      bestValue = depthBestValue;
    }
    if (ctx.nodes > ctx.budget || ctx.timedOut) break;
    if (bestValue >= WIN_SCORE / 2) break;
  }
  if (best === null || best === void 0) return ranked[0];
  return { x: best.x, y: best.y };
}

// src/shared/match.js
var LEVELS = ["easy", "medium", "hard"];
function normalizeLevel(level) {
  return LEVELS.includes(level) ? level : "medium";
}
function newMatch({ humanColor = BLACK, level = "medium" } = {}) {
  return {
    id: `m${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    board: createBoard(SIZE),
    moves: [],
    turn: BLACK,
    status: "playing",
    winLine: null,
    lastMove: null,
    humanColor,
    level: normalizeLevel(level),
    startedAt: Date.now(),
    endedAt: null
  };
}
function aiColorOf(match) {
  return otherPlayer(match.humanColor);
}
function isAiTurn(match) {
  return match.status === "playing" && match.turn === aiColorOf(match);
}
function canUndo(match) {
  return match.moves.some((move) => move.p === match.humanColor);
}
function placeStone(match, x, y) {
  if (match.status !== "playing") return match;
  if (!Number.isInteger(x) || !Number.isInteger(y)) return match;
  if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return match;
  const index = y * SIZE + x;
  if (match.board[index] !== EMPTY) return match;
  const player = match.turn;
  const board = cloneBoard(match.board);
  board[index] = player;
  const winLine = findWin(board, SIZE, x, y);
  const move = { x, y, p: player };
  const moves = [...match.moves, move];
  let status = "playing";
  let endedAt = null;
  if (winLine !== null) {
    status = player === match.humanColor ? "win" : "lose";
    endedAt = Date.now();
  } else if (isBoardFull(board)) {
    status = "draw";
    endedAt = Date.now();
  }
  return {
    ...match,
    board,
    moves,
    turn: otherPlayer(player),
    status,
    winLine,
    lastMove: move,
    endedAt
  };
}
function undoToHumanTurn(match) {
  let lastHuman = -1;
  for (let i = match.moves.length - 1; i >= 0; i -= 1) {
    if (match.moves[i].p === match.humanColor) {
      lastHuman = i;
      break;
    }
  }
  if (lastHuman < 0) return match;
  const moves = match.moves.slice(0, lastHuman);
  const board = createBoard(SIZE);
  for (const move of moves) board[move.y * SIZE + move.x] = move.p;
  return {
    ...match,
    board,
    moves,
    turn: moves.length > 0 ? otherPlayer(moves[moves.length - 1].p) : BLACK,
    status: "playing",
    winLine: null,
    lastMove: moves.length > 0 ? moves[moves.length - 1] : null,
    endedAt: null
  };
}
function matchFromMoves({ moves, humanColor, level, startedAt }) {
  let match = {
    ...newMatch({ humanColor, level }),
    startedAt: Number.isFinite(startedAt) ? startedAt : Date.now()
  };
  for (const move of Array.isArray(moves) ? moves : []) {
    if (!move || !Number.isInteger(move.x) || !Number.isInteger(move.y) || move.p !== BLACK && move.p !== otherPlayer(BLACK)) {
      continue;
    }
    match = placeStone(match, move.x, move.y);
  }
  return match;
}

// src/client/Board.jsx
var import_react = __toESM(require("react"), 1);
var import_jsx_runtime = require("react/jsx-runtime");
var PAD = 0.5;
var SPAN = SIZE - 1;
var VIEW = SIZE;
function centerOf(index) {
  return PAD + index;
}
function stoneColor(player) {
  return player === BLACK ? "url(#myg-stone-black)" : "url(#myg-stone-white)";
}
function GomokuBoard({ match, thinking, onPlace, onUndo, onRestart, t }) {
  const [hover, setHover] = import_react.default.useState(null);
  const [cursor, setCursor] = import_react.default.useState({ x: 7, y: 7 });
  const [focused, setFocused] = import_react.default.useState(false);
  const svgRef = import_react.default.useRef(null);
  const humanTurn = match.status === "playing" && match.turn === match.humanColor && !thinking;
  const player = match.turn;
  const cellFromEvent = import_react.default.useCallback((event) => {
    const svg = svgRef.current;
    if (svg === null) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const vx = (event.clientX - rect.left) / rect.width * VIEW;
    const vy = (event.clientY - rect.top) / rect.height * VIEW;
    const x = Math.round(vx - PAD);
    const y = Math.round(vy - PAD);
    if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return null;
    if (Math.abs(vx - centerOf(x)) > 0.56 || Math.abs(vy - centerOf(y)) > 0.56) return null;
    return { x, y };
  }, []);
  const handleMove = import_react.default.useCallback((event) => {
    if (!humanTurn) {
      setHover(null);
      return;
    }
    setHover(cellFromEvent(event));
  }, [cellFromEvent, humanTurn]);
  const handleClick = import_react.default.useCallback((event) => {
    if (!humanTurn) return;
    const cell = cellFromEvent(event);
    if (cell !== null) onPlace(cell.x, cell.y);
  }, [cellFromEvent, humanTurn, onPlace]);
  const handleKeyDown = import_react.default.useCallback((event) => {
    const step = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[event.key];
    if (step !== void 0) {
      event.preventDefault();
      setCursor((prev) => ({
        x: Math.min(SIZE - 1, Math.max(0, prev.x + step[0])),
        y: Math.min(SIZE - 1, Math.max(0, prev.y + step[1]))
      }));
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!humanTurn) return;
      onPlace(cursor.x, cursor.y);
      return;
    }
  }, [cursor.x, cursor.y, humanTurn, onPlace, onUndo, onRestart]);
  const gridLines = [];
  for (let i = 0; i < SIZE; i += 1) {
    gridLines.push(
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", { className: "myg-gridLine", x1: PAD, y1: centerOf(i), x2: PAD + SPAN, y2: centerOf(i) }, `h${i}`),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", { className: "myg-gridLine", x1: centerOf(i), y1: PAD, x2: centerOf(i), y2: PAD + SPAN }, `v${i}`)
    );
  }
  const stars = [];
  for (const x of [3, 7, 11]) {
    for (const y of [3, 7, 11]) {
      if (x === 7 !== (y === 7) && !(x === 7 && y === 7)) continue;
      stars.push(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { className: "myg-star", cx: centerOf(x), cy: centerOf(y), r: 0.11 }, `s${x}-${y}`));
    }
  }
  const winSet = new Set((match.winLine ?? []).map(([x, y]) => `${x}:${y}`));
  const winStart = match.winLine?.[0];
  const winEnd = match.winLine?.[match.winLine.length - 1];
  const last = match.lastMove;
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "myg-boardWrap", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "svg",
    {
      ref: svgRef,
      className: "myg-board",
      viewBox: `0 0 ${VIEW} ${VIEW}`,
      role: "grid",
      "aria-label": t("nav"),
      tabIndex: 0,
      onPointerMove: handleMove,
      onPointerLeave: () => setHover(null),
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", { id: "myg-stone-black", cx: "34%", cy: "28%", r: "78%", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "0%", className: "myg-stopBlackHi" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "42%", className: "myg-stopBlackMid" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "100%", className: "myg-stopBlackLo" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", { id: "myg-stone-white", cx: "34%", cy: "28%", r: "78%", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "0%", className: "myg-stopWhiteHi" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "58%", className: "myg-stopWhiteMid" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", { offset: "100%", className: "myg-stopWhiteLo" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("filter", { id: "myg-stone-shadow", x: "-40%", y: "-40%", width: "180%", height: "180%", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feDropShadow", { dx: "0", dy: "0.055", stdDeviation: "0.05", floodColor: "var(--myg-stone-shadow-color)", floodOpacity: "0.5" }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { className: "myg-gridBorder", x: PAD, y: PAD, width: SPAN, height: SPAN, rx: 0.08 }),
        gridLines,
        stars,
        Array.from({ length: SIZE }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { className: "myg-coord", x: centerOf(index), y: 0.26, textAnchor: "middle", children: String.fromCharCode(65 + index) }, `cx${index}`)),
        Array.from({ length: SIZE }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", { className: "myg-coord", x: 0.26, y: centerOf(index) + 0.1, textAnchor: "middle", children: index + 1 }, `cy${index}`)),
        winStart !== void 0 && winEnd !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "line",
          {
            className: "myg-winLine",
            x1: centerOf(winStart[0]),
            y1: centerOf(winStart[1]),
            x2: centerOf(winEnd[0]),
            y2: centerOf(winEnd[1])
          }
        ),
        match.moves.map((move) => {
          const cx = centerOf(move.x);
          const cy = centerOf(move.y);
          const isLast = last !== null && last.x === move.x && last.y === move.y;
          const won = winSet.has(`${move.x}:${move.y}`);
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { className: "myg-stone", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "circle",
              {
                cx,
                cy,
                r: 0.46,
                fill: stoneColor(move.p),
                filter: "url(#myg-stone-shadow)"
              }
            ),
            move.p === BLACK && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx, cy, r: 0.46, fill: "none", stroke: "var(--myg-black-rim)", strokeWidth: 0.024 }),
            isLast && !won && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { className: "myg-stoneLastRing", cx, cy, r: 0.2 }),
            won && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { className: "myg-winRing", cx, cy, r: 0.53 })
          ] }, `${move.x}-${move.y}`);
        }),
        humanTurn && hover !== null && match.board[hover.y * SIZE + hover.x] === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
          "circle",
          {
            className: "myg-ghost",
            cx: centerOf(hover.x),
            cy: centerOf(hover.y),
            r: 0.43,
            fill: player === BLACK ? "var(--myg-ghost-dark)" : "var(--myg-ghost-light)"
          }
        ),
        focused && humanTurn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { className: "myg-cursorRing", cx: centerOf(cursor.x), cy: centerOf(cursor.y), r: 0.52 })
      ]
    }
  ) });
}

// src/client/storage.js
var STATS_KEY = "dsh-moyu-games.stats.v1";
var STATS_KEY_PREFIX = "dsh-moyu-games.stats.v2.";
var GAME_KEY = "dsh-moyu-games.game.v1";
var DARK_GAME_KEY = "dsh-moyu-games.dark-animals.game.v1";
var MINESWEEPER_GAME_KEY = "dsh-moyu-games.minesweeper.game.v1";
var STACK_GAME_KEY = "dsh-moyu-games.stack.game.v1";
var STACK_BEST_KEY = "dsh-moyu-games.stack.best.v1";
var API = "moyu-games/api/stats";
var GAME_GOMOKU2 = "gomoku";
var GAME_DARK_ANIMALS = "dark-animals";
var GAME_MINESWEEPER2 = "minesweeper";
var EMPTY_STATS = Object.freeze({
  wins: 0,
  losses: 0,
  draws: 0,
  streak: 0,
  bestStreak: 0
});
function statsKey(game) {
  return game === GAME_GOMOKU2 ? STATS_KEY : `${STATS_KEY_PREFIX}${game}`;
}
function readLocal(key) {
  try {
    const text = window.localStorage.getItem(key);
    return text === null ? null : JSON.parse(text);
  } catch {
    return null;
  }
}
function writeLocal(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
  }
}
function removeLocal(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
  }
}
function sanitize(raw) {
  const stats = { ...EMPTY_STATS };
  if (typeof raw !== "object" || raw === null) return stats;
  for (const key of Object.keys(EMPTY_STATS)) {
    if (Number.isFinite(raw[key]) && raw[key] >= 0) stats[key] = Math.floor(raw[key]);
  }
  return stats;
}
function cachedStats(game = GAME_GOMOKU2) {
  return sanitize(readLocal(statsKey(game)));
}
async function callHost(url, method, body, timeoutMs = 1800) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method,
      headers: body === void 0 ? void 0 : { "content-type": "application/json" },
      body: body === void 0 ? void 0 : JSON.stringify(body),
      credentials: "same-origin",
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (typeof data?.stats !== "object") throw new Error("bad payload");
    return sanitize(data.stats);
  } finally {
    clearTimeout(timer);
  }
}
async function loadStats(game = GAME_GOMOKU2) {
  try {
    const stats = await callHost(`${API}?game=${encodeURIComponent(game)}`, "GET");
    writeLocal(statsKey(game), stats);
    return stats;
  } catch {
    return cachedStats(game);
  }
}
async function recordResult(game, result) {
  const local = cachedStats(game);
  const optimistic = { ...local };
  if (result === "win") {
    optimistic.wins += 1;
    optimistic.streak += 1;
    optimistic.bestStreak = Math.max(optimistic.bestStreak, optimistic.streak);
  } else if (result === "lose") {
    optimistic.losses += 1;
    optimistic.streak = 0;
  } else {
    optimistic.draws += 1;
    optimistic.streak = 0;
  }
  writeLocal(statsKey(game), optimistic);
  try {
    const stats = await callHost(API, "POST", { game, result });
    writeLocal(statsKey(game), stats);
    return stats;
  } catch {
    return optimistic;
  }
}
async function resetStats(game = GAME_GOMOKU2) {
  writeLocal(statsKey(game), EMPTY_STATS);
  try {
    const stats = await callHost(API, "POST", { game, reset: true });
    writeLocal(statsKey(game), stats);
    return stats;
  } catch {
    return { ...EMPTY_STATS };
  }
}
function saveLocalGame(match) {
  if (!match || !Array.isArray(match.moves)) return;
  writeLocal(GAME_KEY, {
    moves: match.moves,
    humanColor: match.humanColor,
    level: match.level,
    startedAt: match.startedAt
  });
}
function loadLocalGame() {
  const saved = readLocal(GAME_KEY);
  if (saved === null || typeof saved !== "object" || !Array.isArray(saved.moves)) return null;
  if (saved.moves.length === 0) return null;
  return saved;
}
function clearLocalGame() {
  removeLocal(GAME_KEY);
}
function saveDarkGame(state) {
  if (!state || !Array.isArray(state.seed)) return;
  writeLocal(DARK_GAME_KEY, {
    seed: state.seed,
    actions: state.actions.map(({ actor, ...action }) => action),
    level: state.level,
    startedAt: state.startedAt
  });
}
function loadDarkGame() {
  const saved = readLocal(DARK_GAME_KEY);
  if (saved === null || typeof saved !== "object") return null;
  return saved;
}
function clearDarkGame() {
  removeLocal(DARK_GAME_KEY);
}
function saveMinesweeper(saved) {
  if (!saved || !Array.isArray(saved.cells)) return;
  writeLocal(MINESWEEPER_GAME_KEY, saved);
}
function loadMinesweeper() {
  const saved = readLocal(MINESWEEPER_GAME_KEY);
  if (saved === null || typeof saved !== "object" || !Array.isArray(saved.cells)) return null;
  return saved;
}
function clearMinesweeper() {
  removeLocal(MINESWEEPER_GAME_KEY);
}
function saveStack(tower) {
  if (!tower || !Array.isArray(tower.blocks)) return;
  writeLocal(STACK_GAME_KEY, tower);
}
function loadStack() {
  const saved = readLocal(STACK_GAME_KEY);
  if (saved === null || typeof saved !== "object" || !Array.isArray(saved.blocks)) return null;
  return saved;
}
function clearStack() {
  removeLocal(STACK_GAME_KEY);
}
function stackBest() {
  const saved = readLocal(STACK_BEST_KEY);
  return Number.isFinite(saved) && saved >= 0 ? Math.floor(saved) : 0;
}
function setStackBest(score) {
  if (!Number.isFinite(score) || score < 0) return;
  writeLocal(STACK_BEST_KEY, Math.floor(score));
}

// src/client/GomokuGame.jsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var AI_DELAY_MS = 280;
var LEVELS2 = ["easy", "medium", "hard"];
var QUIPS = ["ai.quip1", "ai.quip2", "ai.quip3", "ai.quip4"];
function formatClock(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor(safe % 3600 / 60);
  const seconds = safe % 60;
  const pad = (value) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}
function coordinateOf(move) {
  return `${String.fromCharCode(65 + move.x)}${move.y + 1}`;
}
function quipFor(board, move, aiPlayer) {
  if (wouldWin(board, SIZE, move.x, move.y, aiPlayer)) return "ai.closing";
  const opponent = otherPlayer(aiPlayer);
  const mustBlock = candidateMoves(board, SIZE, 2).some((candidate) => wouldWin(board, SIZE, candidate.x, candidate.y, opponent));
  if (mustBlock) return "ai.block";
  if (pointScore(board, SIZE, move.x, move.y, aiPlayer) >= 5e4) return "ai.attack";
  return QUIPS[Math.floor(Math.random() * QUIPS.length)];
}
function FishMark({ size = 20 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
      "path",
      {
        d: "M7.1 12c2.5-3.5 5.9-4.8 9.3-3.5 1.8.7 3.2 1.9 4.3 3.5-1.1 1.6-2.5 2.8-4.3 3.5-3.4 1.3-6.8 0-9.3-3.5Z",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinejoin: "round"
      }
    ),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M7.1 12 3.6 9.1v5.8L7.1 12Z", fill: "currentColor" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "16.1", cy: "11.1", r: ".95", fill: "currentColor" }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M10.6 8.9c.8 2 .8 4.2 0 6.2", stroke: "currentColor", strokeWidth: "1.1", opacity: ".5", strokeLinecap: "round" })
  ] });
}
function Segmented({ className, value, options, onChange, label }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: `myg-seg ${className ?? ""}`, role: "group", "aria-label": label, children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
    "button",
    {
      type: "button",
      "aria-pressed": value === option.value,
      onClick: () => {
        if (value !== option.value) onChange(option.value);
      },
      children: option.label
    },
    option.value
  )) });
}
function Card({ title, children, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: `myg-card ${className ?? ""}`, children: [
    title !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { className: "myg-cardTitle", children: title }),
    children
  ] });
}
function GomokuGame({ ctx, t, active }) {
  const [, bumpLocale] = import_react2.default.useState(0);
  import_react2.default.useEffect(() => ctx.locale.subscribe(() => bumpLocale((value) => value + 1)), [ctx]);
  const [match, setMatch] = import_react2.default.useState(() => {
    const saved = loadLocalGame();
    if (saved !== null) {
      try {
        const restored = matchFromMoves(saved);
        if (restored.status === "playing") return restored;
      } catch {
      }
    }
    return newMatch({ humanColor: BLACK, level: "medium" });
  });
  const [thinking, setThinking] = import_react2.default.useState(false);
  const [quip, setQuip] = import_react2.default.useState(() => match.turn === match.humanColor ? "ai.greet" : "ai.greetFirst");
  const [stats, setStats] = import_react2.default.useState(() => cachedStats(GAME_GOMOKU2));
  const recorded = import_react2.default.useRef(null);
  const aiPlayer = otherPlayer(match.humanColor);
  import_react2.default.useEffect(() => {
    let alive = true;
    loadStats(GAME_GOMOKU2).then((next) => {
      if (alive) setStats(next);
    });
    return () => {
      alive = false;
    };
  }, []);
  import_react2.default.useEffect(() => {
    if (match.status !== "playing") {
      clearLocalGame();
      return;
    }
    if (match.moves.length > 0) saveLocalGame(match);
    else clearLocalGame();
  }, [match]);
  import_react2.default.useEffect(() => {
    if (match.status === "playing") return;
    if (match.endedAt === null) return;
    if (recorded.current === match.id) return;
    recorded.current = match.id;
    const result = match.status === "win" ? "win" : match.status === "lose" ? "lose" : "draw";
    let alive = true;
    recordResult(GAME_GOMOKU2, result).then((next) => {
      if (alive) setStats(next);
    });
    return () => {
      alive = false;
    };
  }, [match.status, match.endedAt, match.id]);
  import_react2.default.useEffect(() => {
    if (match.status === "win") setQuip("ai.respect");
    else if (match.status === "lose") setQuip("ai.taunt");
  }, [match.status]);
  import_react2.default.useEffect(() => {
    if (!isAiTurn(match)) return void 0;
    let cancelled = false;
    setThinking(true);
    const timer = setTimeout(() => {
      if (cancelled) return;
      let move = null;
      try {
        move = pickMove(cloneBoard(match.board), SIZE, aiPlayer, { level: match.level });
      } catch (error) {
        console.error("[moyu-games] AI failed to choose a move", error);
      }
      if (cancelled) return;
      setThinking(false);
      if (move === null) {
        const fallback = candidateMoves(match.board, SIZE, 2);
        if (fallback.length > 0) move = fallback[Math.floor(Math.random() * fallback.length)];
      }
      if (move === null) {
        setMatch((prev) => prev.status === "playing" ? { ...prev, status: "draw", endedAt: Date.now() } : prev);
        return;
      }
      setQuip(quipFor(match.board, move, aiPlayer));
      setMatch((prev) => {
        if (prev.status !== "playing" || prev.turn !== aiPlayer || prev.moves.length !== match.moves.length) return prev;
        return placeStone(prev, move.x, move.y);
      });
    }, AI_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [match.turn, match.status, match.moves.length, match.level, aiPlayer, match.board]);
  const startNew = import_react2.default.useCallback((options = {}) => {
    const humanColor = options.humanColor ?? match.humanColor;
    const level = options.level ?? match.level;
    setThinking(false);
    setQuip(humanColor === BLACK ? "ai.greet" : "ai.greetFirst");
    setMatch(newMatch({ humanColor, level }));
  }, [match.humanColor, match.level]);
  const undo = import_react2.default.useCallback(() => {
    if (thinking) return;
    setQuip("ai.undo");
    setMatch((prev) => canUndo(prev) ? undoToHumanTurn(prev) : prev);
  }, [thinking]);
  const handlePlace = import_react2.default.useCallback((x, y) => {
    if (thinking) return;
    setMatch((prev) => {
      if (prev.status !== "playing" || prev.turn !== prev.humanColor) return prev;
      return placeStone(prev, x, y);
    });
  }, [thinking]);
  const handleLevel = import_react2.default.useCallback((level) => {
    setMatch((prev) => ({ ...prev, level }));
  }, []);
  const handleSwap = import_react2.default.useCallback(() => {
    startNew({ humanColor: otherPlayer(match.humanColor) });
  }, [match.humanColor, startNew]);
  const handleResetStats = import_react2.default.useCallback(() => {
    resetStats(GAME_GOMOKU2).then(setStats);
  }, []);
  import_react2.default.useEffect(() => {
    const onKeyDown = (event) => {
      if (!active) return;
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const typing = target !== null && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable === true);
      if (typing) return;
      if (event.key === "u" || event.key === "U") {
        event.preventDefault();
        undo();
      } else if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        startNew();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, startNew, undo]);
  const humanTurn = match.status === "playing" && match.turn === match.humanColor && !thinking;
  const turnLabel = match.status === "win" ? t("board.win") : match.status === "lose" ? t("board.lose") : match.status === "draw" ? t("board.draw") : humanTurn ? t("board.yourTurn") : t("board.aiTurn");
  const dotClass = match.status === "win" ? "done" : match.status === "lose" ? "lost" : humanTurn ? "" : "ai";
  const levelOptions = LEVELS2.map((level) => ({ value: level, label: t(`level.${level}`) }));
  const sideOptions = [
    { value: BLACK, label: t("blackStone") },
    { value: otherPlayer(BLACK), label: t("whiteStone") }
  ];
  const resultTitle = match.status === "win" ? t("result.winTitle") : match.status === "lose" ? t("result.loseTitle") : t("result.drawTitle");
  const elapsed = Math.max(0, ((match.endedAt ?? Date.now()) - match.startedAt) / 1e3);
  const resultDesc = match.status === "win" ? t("result.winDesc", { moves: match.moves.length, time: formatClock(elapsed) }) : match.status === "lose" ? t("result.loseDesc", { moves: match.moves.length, time: formatClock(elapsed) }) : t("result.drawDesc", { moves: match.moves.length });
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "myg-main", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("section", { className: "myg-boardCard", children: [
      match.status !== "playing" && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: `myg-result ${match.status}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "myg-resultTitle", children: resultTitle }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "myg-resultDesc", children: resultDesc })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "myg-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "myg-btn primary", onClick: () => startNew(), children: t("result.again") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "myg-boardTop", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "myg-turn", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("i", { className: `myg-turnDot ${dotClass}` }),
          turnLabel,
          thinking && /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: "myg-thinking", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("i", {}),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("i", {}),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("i", {})
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "myg-turnHint", children: t("board.youAre", { color: match.humanColor === BLACK ? t("blackStone") : t("whiteStone") }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "myg-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "myg-levelChip", children: t(`level.${match.level}`) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        GomokuBoard,
        {
          match,
          thinking,
          onPlace: handlePlace,
          onUndo: undo,
          onRestart: startNew,
          t
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "myg-boardFoot", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "myg-footMeta", children: match.moves.length > 0 ? t("board.moveNo", { n: match.moves.length }) : " " }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { className: "myg-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "myg-btn", onClick: undo, disabled: thinking || !canUndo(match), children: t("undo") }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "myg-btn", onClick: () => startNew(), disabled: thinking, children: t("restart") })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("aside", { className: "myg-side", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Card, { title: t("opponent"), className: "myg-aiCard", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "myg-ai", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "myg-avatar", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(FishMark, { size: 22 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "myg-aiBody", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "myg-aiName", children: [
            t("opponent.name"),
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
              t("opponent.tag"),
              " \xB7 ",
              t(`level.${match.level}`)
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "myg-bubble", children: t(quip) })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(Card, { title: t("settings"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "myg-fieldLabel", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("settings.level") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t(`level.${match.level}Hint`) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Segmented, { className: "three", label: t("settings.level"), value: match.level, options: levelOptions, onChange: handleLevel }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "myg-fieldLabel", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("settings.side") }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("settings.sideHint") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
          Segmented,
          {
            className: "two",
            label: t("settings.side"),
            value: match.humanColor,
            options: sideOptions,
            onChange: (color) => startNew({ humanColor: color })
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(Card, { title: t("stats"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "myg-stats", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "myg-stat win", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("b", { children: stats.wins }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("stats.win") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "myg-stat lose", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("b", { children: stats.losses }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("stats.lose") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "myg-stat", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("b", { children: stats.draws }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("stats.draw") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "myg-stat streak", children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("b", { children: stats.streak }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("stats.streak") })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "myg-fieldLabel", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { children: [
            t("stats.best"),
            " ",
            stats.bestStreak
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("button", { type: "button", className: "myg-btn ghost", style: { height: 22, padding: "0 6px" }, onClick: handleResetStats, children: t("stats.reset") })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(Card, { title: t("moves"), children: match.moves.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "myg-empty", children: t("moves.empty") }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "myg-moves", children: match.moves.map((move, index) => /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("span", { className: `myg-moveChip ${index === match.moves.length - 1 ? "last" : ""}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("i", { className: move.p === BLACK ? "black" : "white" }),
        coordinateOf(move)
      ] }, `${move.x}-${move.y}-${index}`)) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "myg-hint", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { "aria-hidden": "true", children: "\u{1F41F}" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: t("hint.body") })
      ] })
    ] })
  ] });
}

// src/client/DarkAnimalGame.jsx
var import_react4 = __toESM(require("react"), 1);

// src/shared/dark-animals.js
var DARK_SIZE = 4;
var DARK_CELLS = DARK_SIZE * DARK_SIZE;
var ANIMALS = Object.freeze([
  { id: "elephant", name: "\u8C61", rank: 1, power: 8 },
  { id: "lion", name: "\u72EE", rank: 2, power: 7 },
  { id: "tiger", name: "\u864E", rank: 3, power: 6 },
  { id: "leopard", name: "\u8C79", rank: 4, power: 5 },
  { id: "wolf", name: "\u72FC", rank: 5, power: 4 },
  { id: "dog", name: "\u72D7", rank: 6, power: 3 },
  { id: "cat", name: "\u732B", rank: 7, power: 2 },
  { id: "rat", name: "\u9F20", rank: 8, power: 1 }
]);
var ANIMAL_BY_ID = Object.freeze(Object.fromEntries(ANIMALS.map((animal) => [animal.id, animal])));
var POWER = Object.freeze(Object.fromEntries(ANIMALS.map((animal) => [animal.id, animal.power])));
var VALUE = Object.freeze({
  elephant: 100,
  lion: 78,
  tiger: 62,
  leopard: 46,
  wolf: 33,
  dog: 24,
  cat: 17,
  rat: 13
});
var FILES = "ABCD";
var ACTOR_HUMAN = 1;
var ACTOR_AI = 2;
var WIN = 1e9;
var NO_PROGRESS_DRAW_PLIES = 100;
function cellName(index) {
  return `${FILES[index % DARK_SIZE]}${Math.floor(index / DARK_SIZE) + 1}`;
}
function otherActor(actor) {
  return actor === ACTOR_HUMAN ? ACTOR_AI : ACTOR_HUMAN;
}
function createSeed(random = Math.random) {
  const pieces = [];
  for (const animal of ANIMALS) {
    pieces.push({ animal: animal.id, owner: 1 });
    pieces.push({ animal: animal.id, owner: 2 });
  }
  for (let i = pieces.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = pieces[i];
    pieces[i] = pieces[j];
    pieces[j] = tmp;
  }
  return pieces;
}
function newId() {
  return `d${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function newDarkMatch({ level = "medium", random = Math.random } = {}) {
  const seed = createSeed(random);
  return {
    id: newId(),
    seed,
    cells: seed.map((piece) => ({ ...piece, revealed: false })),
    turn: ACTOR_HUMAN,
    status: "playing",
    winner: null,
    humanColor: null,
    aiColor: null,
    firstFlipDone: false,
    actions: [],
    log: [],
    captured: { 1: [], 2: [] },
    noProgress: 0,
    repetitions: { [serializePublic({ seed, cells: seed.map((piece) => ({ ...piece, revealed: false })), turn: ACTOR_HUMAN, humanColor: null })]: 1 },
    startedAt: Date.now(),
    endedAt: null,
    lastAction: null,
    level
  };
}
function cloneCells(cells) {
  return cells.map((cell) => cell === null ? null : { ...cell });
}
function serializePublic(state) {
  const cells = state.cells.map((cell) => cell === null ? "-" : cell.revealed ? `${cell.animal}${cell.owner}` : "?").join(",");
  return `${cells}|${state.turn}|${state.humanColor ?? "-"}`;
}
function colorOfActor(state, actor) {
  if (state.humanColor === null) return null;
  return actor === ACTOR_HUMAN ? state.humanColor : state.aiColor;
}
function canCapture(attacker, defender) {
  if (attacker === "rat" && defender === "elephant") return true;
  if (attacker === "elephant" && defender === "rat") return false;
  return POWER[attacker] >= POWER[defender];
}
function isAdjacent(from, to) {
  const fx = from % DARK_SIZE;
  const fy = Math.floor(from / DARK_SIZE);
  const tx = to % DARK_SIZE;
  const ty = Math.floor(to / DARK_SIZE);
  return Math.abs(fx - tx) + Math.abs(fy - ty) === 1;
}
function legalActions(state, actor = state.turn) {
  if (state.status !== "playing") return [];
  const actions = [];
  for (let index = 0; index < state.cells.length; index += 1) {
    if (state.cells[index] !== null && !state.cells[index].revealed) actions.push({ type: "flip", cell: index });
  }
  const color = colorOfActor(state, actor);
  if (color === null) return actions;
  for (let index = 0; index < state.cells.length; index += 1) {
    const cell = state.cells[index];
    if (cell === null || !cell.revealed || cell.owner !== color) continue;
    const x = index % DARK_SIZE;
    const y = Math.floor(index / DARK_SIZE);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= DARK_SIZE || ny >= DARK_SIZE) continue;
      const target = ny * DARK_SIZE + nx;
      const occupant = state.cells[target];
      if (occupant === null) {
        actions.push({ type: "move", from: index, to: target });
        continue;
      }
      if (!occupant.revealed) continue;
      if (occupant.owner === color) continue;
      if (!canCapture(cell.animal, occupant.animal)) continue;
      actions.push({ type: "move", from: index, to: target });
    }
  }
  return actions;
}
function hasAnyAction(state, actor = state.turn) {
  return legalActions(state, actor).length > 0;
}
function settle(state, actor) {
  const next = { ...state };
  const opponent = otherActor(actor);
  const opponentColor = next.humanColor === null ? null : opponent === ACTOR_HUMAN ? next.humanColor : next.aiColor;
  if (opponentColor !== null) {
    const remaining = next.cells.some((cell) => cell !== null && cell.owner === opponentColor);
    if (!remaining) return finish(next, actor, "win");
  }
  if (!hasAnyAction(next, opponent)) return finish(next, actor, "win");
  if (next.noProgress >= NO_PROGRESS_DRAW_PLIES) return finishDraw(next);
  const key = serializePublic(next);
  const count = (next.repetitions[key] ?? 0) + 1;
  next.repetitions = { ...next.repetitions, [key]: count };
  if (count >= 3) return finishDraw(next);
  return next;
}
function finish(state, winner, kind) {
  const status = kind === "draw" ? "draw" : winner === ACTOR_HUMAN ? "win" : "lose";
  return {
    ...state,
    status,
    winner: kind === "draw" ? null : winner,
    endedAt: Date.now()
  };
}
function finishDraw(state) {
  return { ...state, status: "draw", winner: null, endedAt: Date.now() };
}
function applyAction(state, action) {
  if (state.status !== "playing" || !action) return state;
  const actor = state.turn;
  const cells = cloneCells(state.cells);
  let captured = state.captured;
  let noProgress = state.noProgress + 1;
  let humanColor = state.humanColor;
  let aiColor = state.aiColor;
  let firstFlipDone = state.firstFlipDone;
  let lastAction = null;
  if (action.type === "flip") {
    const cell = cells[action.cell];
    if (!cell || cell.revealed) return state;
    cell.revealed = true;
    if (!firstFlipDone) {
      firstFlipDone = true;
      if (actor === ACTOR_HUMAN) {
        humanColor = cell.owner;
        aiColor = 3 - cell.owner;
      } else {
        aiColor = cell.owner;
        humanColor = 3 - cell.owner;
      }
    }
    noProgress = 0;
    lastAction = { type: "flip", cell: action.cell, actor, animal: cell.animal, owner: cell.owner };
  } else if (action.type === "move") {
    if (!firstFlipDone) return state;
    const from = cells[action.from];
    const to = cells[action.to];
    if (!from || !from.revealed) return state;
    const myColor = actor === ACTOR_HUMAN ? humanColor : aiColor;
    if (from.owner !== myColor) return state;
    if (!isAdjacent(action.from, action.to)) return state;
    if (to !== null && !to.revealed) return state;
    if (to !== null) {
      if (to.owner === myColor) return state;
      if (!canCapture(from.animal, to.animal)) return state;
      captured = {
        ...state.captured,
        [to.owner]: [...state.captured[to.owner], to.animal]
      };
      noProgress = 0;
    }
    cells[action.to] = from;
    cells[action.from] = null;
    lastAction = {
      type: "move",
      from: action.from,
      to: action.to,
      actor,
      animal: from.animal,
      captured: to !== null && to.revealed ? to.animal : null,
      capturedOwner: to !== null && to.revealed ? to.owner : null
    };
  } else {
    return state;
  }
  const next = {
    ...state,
    cells,
    captured,
    noProgress,
    humanColor,
    aiColor,
    firstFlipDone,
    turn: otherActor(actor),
    actions: [...state.actions, { ...action, actor }],
    log: [...state.log ?? [], lastAction],
    lastAction
  };
  return settle(next, actor);
}
function undoToHumanTurn2(state) {
  let lastHuman = -1;
  for (let i = state.actions.length - 1; i >= 0; i -= 1) {
    if (state.actions[i].actor === ACTOR_HUMAN) {
      lastHuman = i;
      break;
    }
  }
  if (lastHuman < 0) return state;
  const actions = state.actions.slice(0, lastHuman);
  return replay(state.seed, actions, {
    id: state.id,
    level: state.level,
    startedAt: state.startedAt
  });
}
function replay(seed, actions, meta = {}) {
  let state = {
    id: meta.id ?? newId(),
    seed,
    cells: seed.map((piece) => ({ ...piece, revealed: false })),
    turn: ACTOR_HUMAN,
    status: "playing",
    winner: null,
    humanColor: null,
    aiColor: null,
    firstFlipDone: false,
    actions: [],
    log: [],
    captured: { 1: [], 2: [] },
    noProgress: 0,
    repetitions: { [serializePublic({ seed, cells: seed.map((piece) => ({ ...piece, revealed: false })), turn: ACTOR_HUMAN, humanColor: null })]: 1 },
    startedAt: meta.startedAt ?? Date.now(),
    endedAt: null,
    lastAction: null,
    level: meta.level ?? "medium"
  };
  for (const action of Array.isArray(actions) ? actions : []) {
    const next = applyAction(state, action);
    if (next === state) break;
    state = next;
  }
  return state;
}
function matchFromSave(saved) {
  if (!saved || !Array.isArray(saved.seed) || saved.seed.length !== DARK_CELLS) return null;
  const seed = saved.seed.filter((piece) => piece && ANIMAL_BY_ID[piece.animal] && (piece.owner === 1 || piece.owner === 2));
  if (seed.length !== DARK_CELLS) return null;
  const state = replay(seed, Array.isArray(saved.actions) ? saved.actions : [], {
    level: saved.level,
    startedAt: saved.startedAt
  });
  return state.status === "playing" ? state : null;
}
function pieceValue(cell, opponentCells) {
  let value = VALUE[cell.animal] ?? 10;
  if (cell.animal === "rat" && opponentCells.some((other) => other.revealed && other.animal === "elephant")) value += 12;
  if (cell.animal === "elephant") value += 4;
  return value;
}
function evaluate(state, actor) {
  const color = colorOfActor(state, actor);
  if (color === null) return 0;
  const opponentColor = 3 - color;
  let score = 0;
  const ownCells = state.cells.filter((cell) => cell !== null && cell.revealed && cell.owner === color);
  const enemyCells = state.cells.filter((cell) => cell !== null && cell.revealed && cell.owner === opponentColor);
  for (const cell of ownCells) score += pieceValue(cell, enemyCells);
  for (const cell of enemyCells) score -= pieceValue(cell, ownCells);
  score += legalActions(state, actor).filter((action) => action.type === "move").length * 0.6;
  score -= legalActions(state, otherActor(actor)).filter((action) => action.type === "move").length * 0.4;
  return score;
}
function terminalValue(state, rootActor) {
  if (state.status === "draw") return 0;
  if (state.status === "playing") return null;
  return state.winner === rootActor ? WIN : -WIN;
}
function negamax(state, actor, depth, rootActor, alpha, beta) {
  const terminal = terminalValue(state, rootActor);
  if (terminal !== null) return terminal;
  if (depth <= 0) return evaluate(state, actor);
  const moves = legalActions(state, actor).filter((action) => action.type === "move");
  if (moves.length === 0) return evaluate(state, actor);
  let best = -Infinity;
  for (const move of moves) {
    const next = applyAction(state, move);
    const value = -negamax(next, otherActor(actor), depth - 1, rootActor, -beta, -alpha);
    if (value > best) best = value;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}
function bestMove(state, moves, depth, random) {
  let best = null;
  let bestValue = -Infinity;
  for (const move of moves) {
    const next = applyAction(state, move);
    const terminal = terminalValue(next, ACTOR_AI);
    const value = terminal !== null ? terminal === WIN ? WIN : terminal : -negamax(next, ACTOR_HUMAN, Math.max(0, depth - 1), ACTOR_AI, -Infinity, Infinity);
    const jitter = random() * 1e-3;
    if (value + jitter > bestValue) {
      bestValue = value + jitter;
      best = move;
    }
  }
  return { action: best, value: bestValue };
}
function chooseDarkAction(state, level = "medium", random = Math.random) {
  const actions = legalActions(state, state.turn);
  if (actions.length === 0) return null;
  const flips = actions.filter((action2) => action2.type === "flip");
  const moves = actions.filter((action2) => action2.type === "move");
  if (moves.length === 0) return flips[Math.floor(random() * flips.length)];
  if (level === "easy") {
    if (random() < 0.4) return actions[Math.floor(random() * actions.length)];
    const { action: action2 } = bestMove(state, moves, 1, random);
    return action2;
  }
  const depth = level === "hard" ? 3 : 2;
  const { action, value } = bestMove(state, moves, depth, random);
  if (level !== "easy" && value < -150 && flips.length > 0 && random() < 0.65) {
    return flips[Math.floor(random() * flips.length)];
  }
  return action;
}

// src/client/DarkAnimalsBoard.jsx
var import_react3 = __toESM(require("react"), 1);
var import_jsx_runtime3 = require("react/jsx-runtime");
function CloudGlyph() {
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { className: "myg-daCloud", viewBox: "0 0 32 24", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
    "path",
    {
      d: "M8.2 19.2c-2.9 0-5.2-2.2-5.2-5 0-2.6 2-4.7 4.6-5 .8-3 3.5-5.1 6.8-5.1 2.7 0 5.1 1.5 6.2 3.8.5-.2 1.1-.3 1.7-.3 3 0 5.4 2.3 5.4 5.2 0 3.6-2.4 6.4-5.4 6.4H8.2Z",
      fill: "currentColor"
    }
  ) });
}
function DarkAnimalsBoard({ state, selected, onCell, t, disabled }) {
  const humanColor = state.humanColor;
  const actions = legalActions(state, ACTOR_HUMAN);
  const targets = /* @__PURE__ */ new Map();
  if (selected !== null) {
    for (const action of actions) {
      if (action.type === "move" && action.from === selected) {
        targets.set(action.to, state.cells[action.to] !== null);
      }
    }
  }
  const last = state.lastAction;
  const playable = !disabled && state.status === "playing" && state.turn === ACTOR_HUMAN;
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "myg-daWrap", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "myg-daGrid", role: "grid", "aria-label": t("tab.darkAnimals"), children: state.cells.map((cell, index) => {
    const isTarget = targets.has(index);
    const isCapture = isTarget && targets.get(index);
    const isLast = last !== null && (last.type === "flip" && last.cell === index || last.type === "move" && last.to === index);
    const classes = ["myg-daCell"];
    if (cell === null) classes.push("empty");
    else if (!cell.revealed) classes.push("hidden");
    else classes.push(cell.owner === humanColor ? "human" : "ai");
    if (selected === index) classes.push("selected");
    if (isTarget) classes.push("target");
    if (isCapture) classes.push("capture");
    if (isLast) classes.push("last");
    if (isLast && last.actor !== ACTOR_HUMAN) classes.push("ai-last");
    if (playable && (cell === null || !cell.revealed || cell.owner === humanColor || isTarget)) classes.push("playable");
    const label = cell === null ? t("da.emptyCell") : !cell.revealed ? `${cellName(index)} ${t("da.hiddenPiece")}` : `${cellName(index)} ${t(`da.animal.${cell.animal}`)}`;
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
      "button",
      {
        type: "button",
        role: "gridcell",
        className: classes.join(" "),
        "aria-label": label,
        "aria-disabled": !playable,
        disabled: !playable || cell === null && !isTarget,
        onClick: () => onCell(index),
        children: [
          cell !== null && !cell.revealed && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(CloudGlyph, {}),
          cell !== null && cell.revealed && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "myg-daRank", children: ANIMAL_BY_ID[cell.animal].rank }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "myg-daAnimal", children: t(`da.animal.${cell.animal}`) })
          ] })
        ]
      },
      index
    );
  }) }) });
}

// src/client/DarkAnimalGame.jsx
var import_jsx_runtime4 = require("react/jsx-runtime");
var LEVELS3 = ["easy", "medium", "hard"];
var AI_DELAY_MS2 = 460;
function formatClock2(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor(safe % 3600 / 60);
  const seconds = safe % 60;
  const pad = (value) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}
function PawMark({ size = 20 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("ellipse", { cx: "7", cy: "8.6", rx: "2.1", ry: "2.7", transform: "rotate(-18 7 8.6)", fill: "currentColor", opacity: ".85" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("ellipse", { cx: "12", cy: "6.7", rx: "2.1", ry: "2.9", fill: "currentColor", opacity: ".85" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("ellipse", { cx: "17", cy: "8.6", rx: "2.1", ry: "2.7", transform: "rotate(18 17 8.6)", fill: "currentColor", opacity: ".85" }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      "path",
      {
        d: "M12 11.2c3.1 0 5.7 2.2 5.7 4.9 0 2.2-2.1 3.4-5.7 3.4s-5.7-1.2-5.7-3.4c0-2.7 2.6-4.9 5.7-4.9Z",
        fill: "currentColor"
      }
    )
  ] });
}
function Segmented2({ className, value, options, onChange, label }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: `myg-seg ${className ?? ""}`, role: "group", "aria-label": label, children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
    "button",
    {
      type: "button",
      "aria-pressed": value === option.value,
      onClick: () => {
        if (value !== option.value) onChange(option.value);
      },
      children: option.label
    },
    option.value
  )) });
}
function Card2({ title, children, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: `myg-card ${className ?? ""}`, children: [
    title !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("h2", { className: "myg-cardTitle", children: title }),
    children
  ] });
}
function colorName(t, color) {
  if (color === null) return t("da.colorUndecided");
  return color === 1 ? t("da.color.teal") : t("da.color.red");
}
function quipFor2(next) {
  if (next.status === "lose") return "da.quip.taunt";
  if (next.status === "win") return "da.quip.respect";
  if (next.lastAction?.captured) return "da.quip.capture";
  if (next.lastAction?.type === "flip") return "da.quip.flip";
  return Math.random() < 0.5 ? "da.quip.neutral1" : "da.quip.neutral2";
}
function DarkAnimalGame({ ctx, t, active }) {
  const [state, setState] = import_react4.default.useState(() => {
    const saved = loadDarkGame();
    if (saved !== null) {
      try {
        const restored = matchFromSave(saved);
        if (restored !== null) return restored;
      } catch {
      }
    }
    return newDarkMatch({ level: "medium" });
  });
  const [selected, setSelected] = import_react4.default.useState(null);
  const [thinking, setThinking] = import_react4.default.useState(false);
  const [quip, setQuip] = import_react4.default.useState("da.quip.greet");
  const [stats, setStats] = import_react4.default.useState(() => cachedStats(GAME_DARK_ANIMALS));
  const recorded = import_react4.default.useRef(null);
  import_react4.default.useEffect(() => {
    let alive = true;
    loadStats(GAME_DARK_ANIMALS).then((next) => {
      if (alive) setStats(next);
    });
    return () => {
      alive = false;
    };
  }, []);
  import_react4.default.useEffect(() => {
    if (state.status !== "playing") {
      clearDarkGame();
      return;
    }
    if (state.actions.length > 0) saveDarkGame(state);
    else clearDarkGame();
  }, [state]);
  import_react4.default.useEffect(() => {
    if (state.status === "playing" || state.endedAt === null) return;
    if (recorded.current === state.id) return;
    recorded.current = state.id;
    const result = state.status === "win" ? "win" : state.status === "lose" ? "lose" : "draw";
    let alive = true;
    recordResult(GAME_DARK_ANIMALS, result).then((next) => {
      if (alive) setStats(next);
    });
    return () => {
      alive = false;
    };
  }, [state.status, state.endedAt, state.id]);
  import_react4.default.useEffect(() => {
    if (state.status !== "playing" || state.turn !== ACTOR_AI) return void 0;
    let cancelled = false;
    setThinking(true);
    const timer = setTimeout(() => {
      if (cancelled) return;
      let action = null;
      try {
        action = chooseDarkAction(state, state.level);
      } catch (error) {
        console.error("[moyu-games] dark animals AI failed", error);
      }
      if (cancelled) return;
      setThinking(false);
      if (!action) return;
      const next = applyAction(state, action);
      setQuip(quipFor2(next));
      setState((prev) => prev.status === "playing" && prev.turn === ACTOR_AI && prev.actions.length === state.actions.length ? next : prev);
    }, AI_DELAY_MS2);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [state.turn, state.status, state.actions.length, state.level]);
  const humanTurn = state.status === "playing" && state.turn === ACTOR_HUMAN && !thinking;
  const canUndo2 = state.actions.some((action) => action.actor === ACTOR_HUMAN);
  const humanColor = colorOfActor(state, ACTOR_HUMAN);
  const restart = import_react4.default.useCallback(() => {
    setThinking(false);
    setSelected(null);
    setQuip("da.quip.greet");
    setState((prev) => newDarkMatch({ level: prev.level }));
  }, []);
  const undo = import_react4.default.useCallback(() => {
    if (thinking) return;
    setSelected(null);
    setQuip("da.quip.undo");
    setState((prev) => undoToHumanTurn2(prev));
  }, [thinking]);
  const handleCell = import_react4.default.useCallback((index) => {
    if (!humanTurn) return;
    const actions = legalActions(state, ACTOR_HUMAN);
    if (selected !== null) {
      const move = actions.find((action) => action.type === "move" && action.from === selected && action.to === index);
      if (move) {
        setSelected(null);
        setState((prev) => applyAction(prev, move));
        return;
      }
    }
    const cell = state.cells[index];
    if (cell === null) {
      setSelected(null);
      return;
    }
    if (!cell.revealed) {
      setSelected(null);
      setQuip("da.quip.flip");
      setState((prev) => prev.turn === ACTOR_HUMAN ? applyAction(prev, { type: "flip", cell: index }) : prev);
      return;
    }
    const color = colorOfActor(state, ACTOR_HUMAN);
    if (color !== null && cell.owner === color) {
      setSelected(index);
      return;
    }
    setSelected(null);
  }, [humanTurn, selected, state]);
  import_react4.default.useEffect(() => {
    const onKeyDown = (event) => {
      if (!active) return;
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const typing = target !== null && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable === true);
      if (typing) return;
      if (event.key === "u" || event.key === "U") {
        event.preventDefault();
        undo();
      } else if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        restart();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, restart, undo]);
  const levelOptions = LEVELS3.map((level) => ({ value: level, label: t(`level.${level}`) }));
  const aiCaptured = state.humanColor === null ? [] : state.captured[state.humanColor];
  const youCaptured = state.aiColor === null ? [] : state.captured[state.aiColor];
  const elapsed = Math.max(0, ((state.endedAt ?? Date.now()) - state.startedAt) / 1e3);
  const statusKey = state.status === "win" ? "da.win" : state.status === "lose" ? "da.lose" : state.status === "draw" ? "da.draw" : null;
  const turnLabel = statusKey !== null ? t(statusKey) : !state.firstFlipDone ? t("da.firstFlip") : humanTurn ? t("da.turnYou") : t("da.turnAi");
  const dotClass = state.status === "win" ? "done" : state.status === "lose" ? "lost" : humanTurn ? "" : "ai";
  const resultTitle = state.status === "win" ? t("da.result.winTitle") : state.status === "lose" ? t("da.result.loseTitle") : t("da.result.drawTitle");
  const resultDesc = state.status === "win" ? t("da.result.winDesc", { n: youCaptured.length, time: formatClock2(elapsed) }) : state.status === "lose" ? t("da.result.loseDesc", { n: aiCaptured.length, time: formatClock2(elapsed) }) : t("da.result.drawDesc");
  return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "myg-main", children: [
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("section", { className: "myg-boardCard", children: [
      state.status !== "playing" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: `myg-result ${state.status}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "myg-resultTitle", children: resultTitle }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "myg-resultDesc", children: resultDesc })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "myg-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "myg-btn primary", onClick: restart, children: t("da.result.again") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "myg-boardTop", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "myg-turn", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("i", { className: `myg-turnDot ${dotClass}` }),
          turnLabel,
          (thinking || state.status === "playing" && state.turn === ACTOR_AI) && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "myg-thinking", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("i", {}),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("i", {}),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("i", {})
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "myg-turnHint", children: selected !== null ? t("da.selectHint") : t("da.youAre", { color: colorName(t, humanColor) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "myg-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "myg-levelChip", children: t(`level.${state.level}`) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
        DarkAnimalsBoard,
        {
          state,
          selected,
          onCell: handleCell,
          t,
          disabled: !humanTurn
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "myg-boardFoot", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "myg-footMeta", children: t("da.actionNo", { n: state.actions.length }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "myg-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "myg-daKey", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("i", { className: "teal" }),
          t("da.color.teal")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "myg-daKey", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("i", { className: "red" }),
          t("da.color.red")
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "myg-btn", onClick: undo, disabled: thinking || !canUndo2, children: t("undo") }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { type: "button", className: "myg-btn", onClick: restart, disabled: thinking, children: t("restart") })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("aside", { className: "myg-side", children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Card2, { title: t("opponent"), className: "myg-aiCard", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "myg-ai", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "myg-avatar", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(PawMark, { size: 22 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "myg-aiBody", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "myg-aiName", children: [
            t("da.opponent.name"),
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
              t("da.opponent.tag"),
              " \xB7 ",
              t(`level.${state.level}`)
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "myg-bubble", children: t(quip) })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Card2, { title: t("settings"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "myg-fieldLabel", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t("settings.level") }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t(`level.${state.level}Hint`) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
          Segmented2,
          {
            className: "three",
            label: t("settings.level"),
            value: state.level,
            options: levelOptions,
            onChange: (level) => setState((prev) => ({ ...prev, level }))
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "myg-fieldLabel", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t("da.rulesTitle") }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "myg-empty", style: { margin: 0 }, children: t("da.rules") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Card2, { title: t("da.stats"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "myg-stats", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "myg-stat win", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("b", { children: stats.wins }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t("stats.win") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "myg-stat lose", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("b", { children: stats.losses }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t("stats.lose") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "myg-stat", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("b", { children: stats.draws }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t("stats.draw") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "myg-stat streak", children: [
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("b", { children: stats.streak }),
            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t("stats.streak") })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "myg-fieldLabel", children: [
          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { children: [
            t("stats.best"),
            " ",
            stats.bestStreak
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
            "button",
            {
              type: "button",
              className: "myg-btn ghost",
              style: { height: 22, padding: "0 6px" },
              onClick: () => resetStats(GAME_DARK_ANIMALS).then(setStats),
              children: t("stats.reset")
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(Card2, { title: t("da.captured"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "myg-fieldLabel", style: { marginTop: 0 }, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t("da.capturedYou") }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "myg-daCaptured", children: youCaptured.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "myg-empty", children: t("da.none") }) : youCaptured.map((animal, index) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "myg-daChip human", children: t(`da.animal.${animal}`) }, `${animal}-${index}`)) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "myg-fieldLabel", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t("da.capturedAi") }) }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "myg-daCaptured", children: aiCaptured.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "myg-empty", children: t("da.none") }) : aiCaptured.map((animal, index) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "myg-daChip ai", children: t(`da.animal.${animal}`) }, `${animal}-${index}`)) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Card2, { title: t("da.moves"), children: state.log.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("p", { className: "myg-empty", children: t("da.moves.empty") }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "myg-moves", children: state.log.map((entry, index) => {
        const text = entry.type === "flip" ? `${t("da.flip")} ${cellName(entry.cell)} \xB7 ${t(`da.animal.${entry.animal}`)}` : `${cellName(entry.from)}\u2192${cellName(entry.to)}${entry.captured ? ` \xB7 ${t("da.captureShort", { animal: t(`da.animal.${entry.captured}`) })}` : ""}`;
        return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: `myg-daChip ${entry.actor === ACTOR_HUMAN ? "human" : "ai"}`, children: text }, index);
      }) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "myg-hint", children: [
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { "aria-hidden": "true", children: "\u{1F43E}" }),
        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { children: t("da.hint") })
      ] })
    ] })
  ] });
}

// src/client/MinesweeperGame.jsx
var import_react6 = __toESM(require("react"), 1);

// src/shared/minesweeper.js
var LEVELS4 = ["easy", "medium", "hard"];
var DIFFICULTIES = Object.freeze({
  easy: { cols: 9, rows: 9, mines: 10, label: "9\xD79" },
  medium: { cols: 16, rows: 16, mines: 40, label: "16\xD716" },
  hard: { cols: 30, rows: 16, mines: 99, label: "16\xD730" }
});
var NEIGHBOR_OFFSETS = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1]
];
function neighbors(cols, rows, index) {
  const x = index % cols;
  const y = Math.floor(index / cols);
  const out = [];
  for (const [dx, dy] of NEIGHBOR_OFFSETS) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) out.push(ny * cols + nx);
  }
  return out;
}
function newGame(level = "easy", random = Math.random) {
  const config = DIFFICULTIES[level] ?? DIFFICULTIES.easy;
  const total = config.cols * config.rows;
  return {
    id: `ms${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    level: DIFFICULTIES[level] ? level : "easy",
    cols: config.cols,
    rows: config.rows,
    mines: config.mines,
    cells: Array.from({ length: total }, () => ({
      mine: false,
      adjacent: 0,
      revealed: false,
      flagged: false
    })),
    placed: false,
    status: "ready",
    revealed: 0,
    flagCount: 0,
    startedAt: null,
    endedAt: null
  };
}
function placeMines(game, safeIndex, random) {
  const total = game.cols * game.rows;
  const safe = /* @__PURE__ */ new Set([safeIndex, ...neighbors(game.cols, game.rows, safeIndex)]);
  let candidates = [];
  for (let i = 0; i < total; i += 1) if (!safe.has(i)) candidates.push(i);
  if (candidates.length < game.mines) {
    candidates = [];
    for (let i = 0; i < total; i += 1) if (i !== safeIndex) candidates.push(i);
  }
  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const tmp = candidates[i];
    candidates[i] = candidates[j];
    candidates[j] = tmp;
  }
  const mineSet = new Set(candidates.slice(0, game.mines));
  const cells = game.cells.map((cell, index) => ({ ...cell, mine: mineSet.has(index) }));
  for (let i = 0; i < total; i += 1) {
    if (cells[i].mine) continue;
    cells[i].adjacent = neighbors(game.cols, game.rows, i).filter((n) => cells[n].mine).length;
  }
  return { ...game, cells, placed: true, status: "playing", startedAt: Date.now() };
}
function floodReveal(game, cells, start) {
  const queue = [start];
  const seen = /* @__PURE__ */ new Set();
  let revealed = game.revealed;
  while (queue.length > 0) {
    const index = queue.pop();
    if (seen.has(index)) continue;
    seen.add(index);
    const cell = cells[index];
    if (!cell || cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    revealed += 1;
    if (cell.adjacent === 0) {
      for (const n of neighbors(game.cols, game.rows, index)) {
        if (!cells[n].revealed && !cells[n].flagged) queue.push(n);
      }
    }
  }
  return revealed;
}
function finishIfWon(game, cells, revealed) {
  const totalSafe = game.cols * game.rows - game.mines;
  if (revealed < totalSafe) return { cells, revealed, status: game.status, endedAt: game.endedAt };
  const nextCells = cells.map((cell) => cell.mine && !cell.flagged ? { ...cell, flagged: true } : cell);
  const flagCount = nextCells.filter((cell) => cell.flagged).length;
  return { cells: nextCells, revealed, status: "won", endedAt: Date.now(), flagCount };
}
function reveal(game, index, random = Math.random) {
  if (game.status !== "ready" && game.status !== "playing") return game;
  if (!Number.isInteger(index) || index < 0 || index >= game.cells.length) return game;
  const start = game.placed ? game : placeMines(game, index, random);
  const target = start.cells[index];
  if (target.revealed || target.flagged) return start;
  const cells = start.cells.map((cell) => ({ ...cell }));
  if (cells[index].mine) {
    const lost = cells.map((cell) => {
      if (cell.mine) return { ...cell, revealed: true };
      if (cell.flagged) return { ...cell, flagged: false };
      return cell;
    });
    return { ...start, cells: lost, status: "lost", endedAt: Date.now() };
  }
  const revealed = floodReveal(start, cells, index);
  const finished = finishIfWon(start, cells, revealed);
  return { ...start, ...finished };
}
function toggleFlag(game, index) {
  if (game.status !== "ready" && game.status !== "playing") return game;
  if (!Number.isInteger(index) || index < 0 || index >= game.cells.length) return game;
  const cell = game.cells[index];
  if (cell.revealed) return game;
  if (!cell.flagged && game.flagCount >= game.mines) return game;
  const cells = game.cells.map((c, i) => i === index ? { ...c, flagged: !c.flagged } : c);
  return {
    ...game,
    cells,
    flagCount: game.flagCount + (cell.flagged ? -1 : 1)
  };
}
function chord(game, index, random = Math.random) {
  if (game.status !== "playing") return game;
  const cell = game.cells[index];
  if (!cell.revealed || cell.adjacent === 0) return game;
  const around = neighbors(game.cols, game.rows, index);
  const flags = around.filter((n) => game.cells[n].flagged).length;
  if (flags !== cell.adjacent) return game;
  let next = game;
  for (const n of around) {
    if (next.cells[n].revealed || next.cells[n].flagged) continue;
    next = reveal(next, n, random);
    if (next.status !== "playing") break;
  }
  return next;
}
function buildConstraints(game, knownMines) {
  const constraints = [];
  for (let i = 0; i < game.cells.length; i += 1) {
    const cell = game.cells[i];
    if (!cell.revealed || cell.mine || cell.adjacent === 0) continue;
    const unknown = [];
    let flagged = 0;
    for (const n of neighbors(game.cols, game.rows, i)) {
      const other = game.cells[n];
      if (other.revealed) continue;
      if (other.flagged || knownMines.has(n)) flagged += 1;
      else unknown.push(n);
    }
    if (unknown.length === 0) continue;
    constraints.push({ unknown, remaining: cell.adjacent - flagged });
  }
  return constraints;
}
function analyze(game) {
  const knownMines = /* @__PURE__ */ new Set();
  const safe = /* @__PURE__ */ new Set();
  if (game.status !== "playing") return { safe: [], mines: [], guess: null };
  let changed = true;
  let rounds = 0;
  while (changed && rounds < 40) {
    changed = false;
    rounds += 1;
    const constraints2 = buildConstraints(game, knownMines);
    for (const { unknown, remaining } of constraints2) {
      if (remaining <= 0) {
        for (const n of unknown) if (!safe.has(n)) {
          safe.add(n);
          changed = true;
        }
      } else if (remaining >= unknown.length) {
        for (const n of unknown) if (!knownMines.has(n)) {
          knownMines.add(n);
          changed = true;
        }
      }
    }
    if (changed) continue;
    const subsetConstraints = buildConstraints(game, knownMines);
    for (const a of subsetConstraints) {
      for (const b of subsetConstraints) {
        if (a === b) continue;
        const setB = new Set(b.unknown);
        if (!a.unknown.every((n) => setB.has(n))) continue;
        const diff = b.unknown.filter((n) => !a.unknown.includes(n));
        if (diff.length === 0) continue;
        const diffMines = b.remaining - a.remaining;
        if (diffMines === 0) {
          for (const n of diff) if (!safe.has(n)) {
            safe.add(n);
            changed = true;
          }
        } else if (diffMines === diff.length) {
          for (const n of diff) if (!knownMines.has(n)) {
            knownMines.add(n);
            changed = true;
          }
        }
      }
      if (changed) break;
    }
  }
  const safeList = [...safe].filter((n) => !game.cells[n].revealed && !game.cells[n].flagged);
  const mineList = [...knownMines].filter((n) => !game.cells[n].revealed && !game.cells[n].flagged);
  if (safeList.length > 0 || mineList.length > 0) {
    return { safe: safeList, mines: mineList, guess: null };
  }
  const constraints = buildConstraints(game, knownMines);
  const probability = /* @__PURE__ */ new Map();
  for (let i = 0; i < game.cells.length; i += 1) {
    if (game.cells[i].revealed || game.cells[i].flagged) continue;
    const touch = constraints.filter((c) => c.unknown.includes(i));
    if (touch.length === 0) {
      const hidden = game.cells.filter((cell) => !cell.revealed && !cell.flagged).length;
      const remaining = game.mines - game.flagCount;
      probability.set(i, hidden > 0 ? remaining / hidden : 1);
    } else {
      let worst = 0;
      for (const c of touch) worst = Math.max(worst, c.remaining / c.unknown.length);
      probability.set(i, Math.min(0.98, worst));
    }
  }
  let guess = null;
  for (const [index, chance] of probability) {
    if (guess === null || chance < guess.chance) guess = { index, chance };
  }
  return { safe: [], mines: [], guess };
}
function matchToSave(game) {
  return {
    id: game.id,
    level: game.level,
    cols: game.cols,
    rows: game.rows,
    mines: game.mines,
    cells: game.cells,
    placed: game.placed,
    status: game.status,
    revealed: game.revealed,
    flagCount: game.flagCount,
    startedAt: game.startedAt,
    endedAt: game.endedAt
  };
}
function matchFromSave2(saved) {
  if (!saved || !Array.isArray(saved.cells) || !Number.isInteger(saved.cols) || !Number.isInteger(saved.rows)) return null;
  if (saved.cells.length !== saved.cols * saved.rows) return null;
  if (saved.status !== "ready" && saved.status !== "playing") return null;
  const cells = saved.cells.map((cell) => ({
    mine: cell?.mine === true,
    adjacent: Number.isInteger(cell?.adjacent) ? cell.adjacent : 0,
    revealed: cell?.revealed === true,
    flagged: cell?.flagged === true
  }));
  return {
    id: typeof saved.id === "string" ? saved.id : `ms${Date.now().toString(36)}`,
    level: LEVELS4.includes(saved.level) ? saved.level : "easy",
    cols: saved.cols,
    rows: saved.rows,
    mines: Number.isInteger(saved.mines) ? saved.mines : DIFFICULTIES.easy.mines,
    cells,
    placed: saved.placed === true,
    status: saved.status,
    revealed: Number.isInteger(saved.revealed) ? saved.revealed : cells.filter((cell) => cell.revealed && !cell.mine).length,
    flagCount: cells.filter((cell) => cell.flagged).length,
    startedAt: Number.isFinite(saved.startedAt) ? saved.startedAt : Date.now(),
    endedAt: null
  };
}

// src/client/MinesweeperBoard.jsx
var import_react5 = __toESM(require("react"), 1);
var import_jsx_runtime5 = require("react/jsx-runtime");
function FlagGlyph() {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("svg", { className: "myg-msGlyph", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M7 21V4", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M7 5h9.5l-2.4 3.1L16.5 11H7", fill: "currentColor" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M4.5 21h7", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" })
  ] });
}
function MineGlyph() {
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("svg", { className: "myg-msGlyph", viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("circle", { cx: "12", cy: "12", r: "5.2", fill: "currentColor" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("path", { d: "M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M19.1 4.9l-2.8 2.8M7.7 16.3l-2.8 2.8", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("circle", { cx: "10.2", cy: "10.2", r: "1.2", fill: "var(--dsw-alias-bg-base, #fff)", opacity: ".55" })
  ] });
}
function cellLabel(t, game, index, cell) {
  const row = Math.floor(index / game.cols) + 1;
  const col = index % game.cols + 1;
  const cellName2 = `${col}-${row}`;
  if (cell.revealed) return t("ms.cellRevealed", { cell: cellName2, n: cell.adjacent });
  if (cell.flagged) return t("ms.cellFlagged", { cell: cellName2 });
  return t("ms.cellHidden", { cell: cellName2 });
}
function MinesweeperBoard({ game, hint, flagMode, onReveal, onFlag, onChord, t, disabled }) {
  const safe = new Set(hint?.safe ?? []);
  const mines = new Set(hint?.mines ?? []);
  const guess = hint?.guess?.index ?? null;
  const cellSize = game.cols >= 24 ? 22 : game.cols >= 12 ? 32 : 42;
  const cellFont = game.cols >= 24 ? 11 : game.cols >= 12 ? 14 : 17;
  const finished = game.status === "won" || game.status === "lost";
  return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "myg-msScroll", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
    "div",
    {
      className: "myg-msBoard",
      role: "grid",
      "aria-label": t("ms.boardLabel"),
      style: { "--cols": game.cols, "--cell": `${cellSize}px`, "--cell-font": `${cellFont}px` },
      children: game.cells.map((cell, index) => {
        const classes = ["myg-msCell"];
        if (cell.revealed) classes.push("revealed");
        else classes.push("hidden");
        if (cell.flagged) classes.push("flagged");
        if (cell.revealed && cell.mine) classes.push("mine");
        if (cell.revealed && !cell.mine && cell.adjacent > 0) classes.push(`n${cell.adjacent}`);
        if (safe.has(index)) classes.push("hint-safe");
        if (mines.has(index)) classes.push("hint-mine");
        if (guess === index) classes.push("hint-guess");
        if (flagMode && !cell.revealed && !finished) classes.push("flag-mode");
        return /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
          "button",
          {
            type: "button",
            role: "gridcell",
            className: classes.join(" "),
            "aria-label": cellLabel(t, game, index, cell),
            disabled: finished,
            onClick: () => flagMode ? onFlag(index) : onReveal(index),
            onContextMenu: (event) => {
              event.preventDefault();
              if (!finished) onFlag(index);
            },
            onDoubleClick: () => {
              if (!finished && cell.revealed && cell.adjacent > 0) onChord(index);
            },
            children: cell.revealed ? cell.mine ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(MineGlyph, {}) : cell.adjacent > 0 ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "myg-msNumber", children: cell.adjacent }) : null : cell.flagged ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FlagGlyph, {}) : null
          },
          index
        );
      })
    }
  ) });
}

// src/client/MinesweeperGame.jsx
var import_jsx_runtime6 = require("react/jsx-runtime");
var MAX_HINTS = 3;
function formatClock3(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  const pad = (value) => String(value).padStart(2, "0");
  return `${pad(minutes)}:${pad(seconds)}`;
}
function MineMark({ size = 20 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("circle", { cx: "12", cy: "12", r: "5", fill: "currentColor" }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("path", { d: "M12 2v4M12 18v4M2 12h4M18 12h4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M19.1 4.9l-2.8 2.8M7.7 16.3l-2.8 2.8", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("circle", { cx: "10.2", cy: "10.2", r: "1.2", fill: "var(--dsw-alias-label-primary-foreground, #fff)", opacity: ".6" })
  ] });
}
function Segmented3({ className, value, options, onChange, label }) {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: `myg-seg ${className ?? ""}`, role: "group", "aria-label": label, children: options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
    "button",
    {
      type: "button",
      "aria-pressed": value === option.value,
      onClick: () => {
        if (value !== option.value) onChange(option.value);
      },
      children: option.label
    },
    option.value
  )) });
}
function Card3({ title, children, className }) {
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("section", { className: `myg-card ${className ?? ""}`, children: [
    title !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { className: "myg-cardTitle", children: title }),
    children
  ] });
}
function MinesweeperGame({ ctx, t, active }) {
  const [state, setState] = import_react6.default.useState(() => {
    const saved = loadMinesweeper();
    if (saved !== null) {
      try {
        const restored = matchFromSave2(saved);
        if (restored !== null) return restored;
      } catch {
      }
    }
    return newGame("easy");
  });
  const [flagMode, setFlagMode] = import_react6.default.useState(false);
  const [hint, setHint] = import_react6.default.useState(null);
  const [hintMessage, setHintMessage] = import_react6.default.useState(null);
  const [hintsUsed, setHintsUsed] = import_react6.default.useState(0);
  const [quip, setQuip] = import_react6.default.useState("ms.quip.greet");
  const [stats, setStats] = import_react6.default.useState(() => cachedStats(GAME_MINESWEEPER2));
  const [now, setNow] = import_react6.default.useState(Date.now());
  const recorded = import_react6.default.useRef(null);
  import_react6.default.useEffect(() => {
    let alive = true;
    loadStats(GAME_MINESWEEPER2).then((next) => {
      if (alive) setStats(next);
    });
    return () => {
      alive = false;
    };
  }, []);
  import_react6.default.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1e3);
    return () => clearInterval(timer);
  }, []);
  import_react6.default.useEffect(() => {
    if (state.status === "ready" || state.status === "playing") saveMinesweeper(matchToSave(state));
    else clearMinesweeper();
  }, [state]);
  import_react6.default.useEffect(() => {
    if (state.status === "playing" || state.status === "ready") return;
    if (recorded.current === state.id) return;
    recorded.current = state.id;
    let alive = true;
    recordResult(GAME_MINESWEEPER2, state.status === "won" ? "win" : "lose").then((next) => {
      if (alive) setStats(next);
    });
    return () => {
      alive = false;
    };
  }, [state.status, state.id]);
  const finished = state.status === "won" || state.status === "lost";
  const elapsed = state.startedAt !== null ? Math.max(0, ((state.endedAt ?? now) - state.startedAt) / 1e3) : 0;
  const hidden = state.cells.filter((cell) => !cell.revealed).length;
  const canPlay = state.status === "ready" || state.status === "playing";
  const restart = import_react6.default.useCallback((level = state.level) => {
    setState(newGame(level));
    setHint(null);
    setHintMessage(null);
    setHintsUsed(0);
    setQuip("ms.quip.greet");
    setFlagMode(false);
  }, [state.level]);
  const apply2 = import_react6.default.useCallback((next, action) => {
    setHint(null);
    setHintMessage(null);
    setState(next);
    if (next.status === "won") setQuip("ms.quip.win");
    else if (next.status === "lost") setQuip("ms.quip.lose");
    else if (action === "flag") setQuip("ms.quip.flag");
  }, []);
  const handleReveal = import_react6.default.useCallback((index) => {
    if (!canPlay) return;
    apply2(reveal(state, index), "reveal");
  }, [apply2, canPlay, state]);
  const handleFlag = import_react6.default.useCallback((index) => {
    if (!canPlay) return;
    apply2(toggleFlag(state, index), "flag");
  }, [apply2, canPlay, state]);
  const handleChord = import_react6.default.useCallback((index) => {
    if (state.status !== "playing") return;
    apply2(chord(state, index), "chord");
  }, [apply2, state]);
  const requestHint = import_react6.default.useCallback(() => {
    if (state.status !== "playing") {
      setHintMessage("ms.hintEmpty");
      setQuip("ms.quip.greet");
      return;
    }
    if (hintsUsed >= MAX_HINTS) {
      setHintMessage("ms.noHints");
      setQuip("ms.quip.noHints");
      return;
    }
    const result = analyze(state);
    setHintsUsed((value) => value + 1);
    if (result.safe.length > 0 || result.mines.length > 0) {
      setHint({ safe: result.safe, mines: result.mines, guess: null });
      setHintMessage(result.safe.length > 0 ? "ms.hintSafe" : "ms.hintMine");
      setQuip(result.safe.length > 0 ? "ms.quip.safe" : "ms.quip.mine");
      return;
    }
    if (result.guess !== null) {
      setHint({ safe: [], mines: [], guess: result.guess });
      setHintMessage("ms.hintGuess");
      setQuip("ms.quip.guess");
      return;
    }
    setHintMessage("ms.hintEmpty");
  }, [hintsUsed, state]);
  import_react6.default.useEffect(() => {
    const onKeyDown = (event) => {
      if (!active) return;
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const typing = target !== null && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable === true);
      if (typing) return;
      if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        restart();
      } else if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        setFlagMode((value) => !value);
      } else if (event.key === "h" || event.key === "H") {
        event.preventDefault();
        requestHint();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, requestHint, restart]);
  const levelOptions = LEVELS4.map((level) => ({ value: level, label: t(`ms.size.${level}`) }));
  const statusLabel = state.status === "ready" ? t("ms.ready") : state.status === "playing" ? t("ms.playing") : state.status === "won" ? t("ms.won") : t("ms.lost");
  const dotClass = state.status === "won" ? "done" : state.status === "lost" ? "lost" : state.status === "ready" ? "ai" : "";
  const resultTitle = state.status === "won" ? t("ms.result.winTitle") : t("ms.result.loseTitle");
  const resultDesc = state.status === "won" ? t("ms.result.winDesc", { time: formatClock3(elapsed), flags: state.flagCount, level: t(`ms.size.${state.level}`) }) : t("ms.result.loseDesc", { time: formatClock3(elapsed), hidden });
  return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "myg-main", children: [
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("section", { className: "myg-boardCard", children: [
      finished && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: `myg-result ${state.status === "won" ? "win" : "lose"}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "myg-resultTitle", children: resultTitle }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "myg-resultDesc", children: resultDesc })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "myg-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { type: "button", className: "myg-btn primary", onClick: () => restart(), children: t("ms.result.again") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "myg-boardTop", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "myg-turn", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("i", { className: `myg-turnDot ${dotClass}` }),
          state.status === "ready" ? t("ms.readyShort") : statusLabel
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "myg-turnHint", children: [
          t("ms.mines", { flagged: state.flagCount, total: state.mines }),
          " \xB7 ",
          t("ms.time", { time: formatClock3(elapsed) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "myg-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "myg-levelChip", children: t(`ms.size.${state.level}`) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
        MinesweeperBoard,
        {
          game: state,
          hint,
          flagMode,
          onReveal: handleReveal,
          onFlag: handleFlag,
          onChord: handleChord,
          t,
          disabled: !canPlay
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "myg-boardFoot", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "myg-footMeta", children: t("ms.hintsLeft", { n: Math.max(0, MAX_HINTS - hintsUsed) }) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "myg-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "button",
          {
            type: "button",
            className: `myg-btn ${flagMode ? "primary" : ""}`,
            onClick: () => setFlagMode((value) => !value),
            disabled: finished,
            children: flagMode ? t("ms.flagModeOn") : t("ms.flagMode")
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "button",
          {
            type: "button",
            className: "myg-btn",
            onClick: requestHint,
            disabled: finished || hintsUsed >= MAX_HINTS,
            children: t("ms.aiHint")
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { type: "button", className: "myg-btn", onClick: () => restart(), children: t("restart") })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("aside", { className: "myg-side", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Card3, { title: t("opponent"), className: "myg-aiCard", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "myg-ai", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "myg-avatar", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(MineMark, { size: 22 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "myg-aiBody", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "myg-aiName", children: [
            t("opponent.name"),
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { children: [
              t("opponent.tag"),
              " \xB7 ",
              t(`level.${state.level}`)
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "myg-bubble", children: t(quip) })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(Card3, { title: t("settings"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "myg-fieldLabel", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("settings.level") }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { children: [
            t(`ms.size.${state.level}`),
            " \xB7 ",
            t("ms.mineCount", { n: DIFFICULTIES[state.level].mines })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          Segmented3,
          {
            className: "three",
            label: t("settings.level"),
            value: state.level,
            options: levelOptions,
            onChange: (level) => restart(level)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "myg-fieldLabel", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("ms.rulesTitle") }) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "myg-empty", style: { margin: 0 }, children: t("ms.rules") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(Card3, { title: t("ms.stats"), children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "myg-stats", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "myg-stat win", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("b", { children: stats.wins }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("stats.win") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "myg-stat lose", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("b", { children: stats.losses }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("stats.lose") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "myg-stat", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("b", { children: stats.draws }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("stats.draw") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "myg-stat streak", children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("b", { children: stats.streak }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("stats.streak") })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "myg-fieldLabel", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { children: [
            t("stats.best"),
            " ",
            stats.bestStreak
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
            "button",
            {
              type: "button",
              className: "myg-btn ghost",
              style: { height: 22, padding: "0 6px" },
              onClick: () => resetStats(GAME_MINESWEEPER2).then(setStats),
              children: t("stats.reset")
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(Card3, { title: t("ms.aiHint"), children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("p", { className: "myg-empty", style: { margin: 0 }, children: hintMessage !== null ? t(hintMessage) : state.status === "ready" ? t("ms.ready") : t("ms.hintsLeft", { n: Math.max(0, MAX_HINTS - hintsUsed) }) }) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "myg-hint", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { "aria-hidden": "true", children: "\u{1F4A3}" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: t("ms.rules") })
      ] })
    ] })
  ] });
}

// src/client/StackGame.jsx
var import_react7 = __toESM(require("react"), 1);

// src/shared/stack.js
var STACK = Object.freeze({
  width: 360,
  height: 560,
  blockHeight: 32,
  baseY: 520,
  baseWidth: 150,
  visibleFloors: 9,
  maxLean: 1.1,
  perfectTolerance: 4
});
function createTower() {
  const x = (STACK.width - STACK.baseWidth) / 2;
  return {
    blocks: [{ x, width: STACK.baseWidth, level: 0 }],
    score: 0,
    lean: 0,
    status: "playing",
    reason: null
  };
}
function topBlock(tower) {
  return tower.blocks[tower.blocks.length - 1];
}
function cameraOffset(count) {
  return Math.max(0, (count - STACK.visibleFloors) * STACK.blockHeight);
}
function tiltOf(tower) {
  const lean = Math.max(-STACK.maxLean, Math.min(STACK.maxLean, tower.lean));
  return lean * 7;
}
function resolveDrop(tower, center) {
  if (tower.status !== "playing") return { tower, outcome: "none", block: null };
  const top = topBlock(tower);
  const width = top.width;
  const left = center - width / 2;
  const right = center + width / 2;
  const overlapLeft = Math.max(top.x, left);
  const overlapRight = Math.min(top.x + top.width, right);
  const overlap = overlapRight - overlapLeft;
  const minimumSupport = width * 0.25;
  if (overlap < minimumSupport) {
    return {
      tower: { ...tower, status: "over", reason: "miss" },
      outcome: "miss",
      block: null
    };
  }
  const topCenter = top.x + top.width / 2;
  const offset = center - topCenter;
  const normalized = offset / width;
  const perfect = Math.abs(offset) <= Math.min(STACK.perfectTolerance, width * 0.06);
  const block = perfect ? { x: top.x, width: top.width, level: tower.blocks.length } : { x: left, width, level: tower.blocks.length };
  let lean = tower.lean * 0.68 + normalized * 1.4;
  if (perfect) lean = tower.lean * 0.45;
  const blocks = [...tower.blocks, block];
  const next = {
    ...tower,
    blocks,
    score: tower.score + 1,
    lean
  };
  if (Math.abs(lean) >= STACK.maxLean) {
    return {
      tower: { ...next, status: "over", reason: "topple" },
      outcome: "topple",
      block
    };
  }
  return { tower: next, outcome: perfect ? "perfect" : "landed", block };
}
function towerToSave(tower) {
  return {
    blocks: tower.blocks,
    score: tower.score,
    lean: tower.lean
  };
}
function towerFromSave(saved) {
  if (!saved || !Array.isArray(saved.blocks) || saved.blocks.length === 0) return null;
  const blocks = [];
  for (const block of saved.blocks) {
    if (!Number.isFinite(block?.x) || !Number.isFinite(block?.width)) return null;
    if (block.width <= 0) return null;
    blocks.push({ x: block.x, width: block.width, level: blocks.length });
  }
  return {
    blocks,
    score: Number.isFinite(saved.score) ? saved.score : blocks.length - 1,
    lean: Number.isFinite(saved.lean) ? saved.lean : 0,
    status: "playing",
    reason: null
  };
}

// src/client/StackGame.jsx
var import_jsx_runtime7 = require("react/jsx-runtime");
var CRANE_RAIL_Y = 58;
var CRANE_BLOCK_Y = 96;
var BLOCK_HEIGHT = STACK.blockHeight;
var BLOCK_GAP = 2;
var PALETTE = ["#5eead4", "#93c5fd", "#c4b5fd", "#fcd34d", "#fca5a5", "#86efac", "#67e8f9", "#f9a8d4"];
function blockColor(level) {
  return PALETTE[level % PALETTE.length];
}
function StackMark({ size = 20 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("rect", { x: "4", y: "15", width: "16", height: "4", rx: "1.2", fill: "currentColor", opacity: ".9" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("rect", { x: "6", y: "10", width: "12", height: "4", rx: "1.2", fill: "currentColor", opacity: ".7" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("rect", { x: "8", y: "5", width: "8", height: "4", rx: "1.2", fill: "currentColor", opacity: ".5" }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("path", { d: "M12 2v2M9.6 3.2 12 4l2.4-.8", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round" })
  ] });
}
function Card4({ title, children }) {
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { className: "myg-card", children: [
    title !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h2", { className: "myg-cardTitle", children: title }),
    children
  ] });
}
function StackGame({ t, active }) {
  const initial = (() => {
    const saved = loadStack();
    const restored = saved !== null ? towerFromSave(saved) : null;
    return restored ?? createTower();
  })();
  const [game, setGame] = import_react7.default.useState(initial);
  const [phase, setPhase] = import_react7.default.useState("aiming");
  const [crane, setCrane] = import_react7.default.useState({ x: STACK.width / 2, clock: 0 });
  const [fallY, setFallY] = import_react7.default.useState(null);
  const [pending, setPending] = import_react7.default.useState(null);
  const [quip, setQuip] = import_react7.default.useState("stack.quip.greet");
  const [best, setBest] = import_react7.default.useState(stackBest);
  const [newBest, setNewBest] = import_react7.default.useState(false);
  const gameRef = import_react7.default.useRef(game);
  gameRef.current = game;
  const phaseRef = import_react7.default.useRef("aiming");
  const craneRef = import_react7.default.useRef(STACK.width / 2);
  const directionRef = import_react7.default.useRef(1);
  const pendingRef = import_react7.default.useRef(null);
  const bestRef = import_react7.default.useRef(best);
  bestRef.current = best;
  import_react7.default.useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  import_react7.default.useEffect(() => {
    if (phase !== "aiming") return void 0;
    let raf = 0;
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(40, now - last);
      last = now;
      const current = gameRef.current;
      if (current.status === "playing") {
        const top2 = topBlock(current);
        const min = top2.width / 2 + 12;
        const max = STACK.width - top2.width / 2 - 12;
        const speed = 0.16 + Math.min(0.14, current.score * 6e-3);
        let x = craneRef.current + directionRef.current * speed * dt;
        if (x <= min) {
          x = min;
          directionRef.current = 1;
        } else if (x >= max) {
          x = max;
          directionRef.current = -1;
        }
        craneRef.current = x;
        setCrane({ x, clock: now });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);
  import_react7.default.useEffect(() => {
    if (phase !== "dropping" || pending === null) return void 0;
    let raf = 0;
    let start = null;
    const duration = 240;
    const step = (now) => {
      if (start === null) start = now;
      const progress = Math.min(1, (now - start) / duration);
      setFallY(pending.from + (pending.to - pending.from) * progress * progress);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
        return;
      }
      settle2();
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase, pending]);
  const settle2 = import_react7.default.useCallback(() => {
    const current = pendingRef.current;
    if (current === null) return;
    const next = current.result.tower;
    gameRef.current = next;
    setGame(next);
    setPending(null);
    setFallY(null);
    phaseRef.current = next.status === "over" ? "over" : "aiming";
    setPhase(phaseRef.current);
    const outcome = current.result.outcome;
    if (outcome === "perfect") setQuip("stack.quip.perfect");
    else if (outcome === "miss") setQuip("stack.quip.miss");
    else if (outcome === "topple") setQuip("stack.quip.topple");
    else if (Math.abs(next.lean) > 0.65) setQuip("stack.quip.risky");
    else setQuip("stack.quip.landed");
    if (next.status === "over" && next.score > bestRef.current) {
      bestRef.current = next.score;
      setBest(next.score);
      setNewBest(true);
      setStackBest(next.score);
    }
  }, []);
  import_react7.default.useEffect(() => {
    if (game.status === "playing") saveStack(towerToSave(game));
    else clearStack();
  }, [game]);
  const drop = import_react7.default.useCallback(() => {
    if (phaseRef.current !== "aiming") return;
    const current = gameRef.current;
    if (current.status !== "playing") return;
    const top2 = topBlock(current);
    const camera2 = cameraOffset(current.blocks.length);
    const cameraX2 = top2.x + top2.width / 2 - STACK.width / 2;
    const worldCenter = craneRef.current + cameraX2;
    const result = resolveDrop(current, worldCenter);
    const target = STACK.baseY - (current.blocks.length + 1) * BLOCK_HEIGHT + camera2;
    const pendingDrop = {
      result,
      from: CRANE_BLOCK_Y,
      to: target,
      width: top2.width,
      x: worldCenter - top2.width / 2,
      level: current.blocks.length
    };
    pendingRef.current = pendingDrop;
    phaseRef.current = "dropping";
    setPending(pendingDrop);
    setFallY(CRANE_BLOCK_Y);
    setPhase("dropping");
  }, []);
  const restart = import_react7.default.useCallback(() => {
    const fresh = createTower();
    gameRef.current = fresh;
    phaseRef.current = "aiming";
    setGame(fresh);
    setPhase("aiming");
    setFallY(null);
    setPending(null);
    pendingRef.current = null;
    setNewBest(false);
    setQuip("stack.quip.greet");
    craneRef.current = STACK.width / 2;
    directionRef.current = 1;
    clearStack();
  }, []);
  import_react7.default.useEffect(() => {
    const onKeyDown = (event) => {
      if (!active) return;
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const typing = target !== null && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable === true);
      if (typing) return;
      if (event.key === " " || event.key === "Enter") {
        if (target !== null && target.closest?.("button") !== null) return;
        event.preventDefault();
        drop();
      } else if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        restart();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, drop, restart]);
  const top = topBlock(game);
  const angle = tiltOf(game) + (game.status === "playing" ? Math.sin(crane.clock / 330) * Math.min(2.4, Math.abs(game.lean) * 2.2) : 0);
  const camera = cameraOffset(game.blocks.length);
  const topCenter = top.x + top.width / 2;
  const cameraX = topCenter - STACK.width / 2;
  const baseCenter = topBlock(game).x + topBlock(game).width / 2;
  const vertical = phase === "dropping" ? fallY : CRANE_BLOCK_Y;
  const visibleBlock = phase === "dropping" && pending !== null ? { x: pending.x - cameraX, width: pending.width, level: pending.level } : { x: crane.x - top.width / 2, width: top.width, level: game.blocks.length };
  const resultTitle = t("stack.result.title");
  const resultDesc = t("stack.result.desc", { n: game.score, best });
  return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "myg-main", children: [
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { className: "myg-boardCard", children: [
      game.status === "over" && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "myg-result lose", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "myg-resultTitle", children: resultTitle }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "myg-resultDesc", children: [
            resultDesc,
            newBest ? ` \xB7 ${t("stack.newBest")}` : ""
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "myg-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "myg-btn primary", onClick: restart, children: t("stack.result.again") })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "myg-boardTop", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "myg-turn", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("i", { className: `myg-turnDot ${game.status === "over" ? "lost" : ""}` }),
          t("stack.floors", { n: game.score })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "myg-turnHint", children: t("stack.tip") }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "myg-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "myg-levelChip", children: t("stack.bestLabel", { n: best }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "myg-stackWrap", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
        "svg",
        {
          className: "myg-stackSvg",
          viewBox: `0 0 ${STACK.width} ${STACK.height}`,
          role: "button",
          tabIndex: 0,
          "aria-label": t("stack.tip"),
          onClick: drop,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("defs", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("linearGradient", { id: "myg-stackSky", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("stop", { offset: "0", className: "myg-stackSkyTop" }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("stop", { offset: "1", className: "myg-stackSkyBottom" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("linearGradient", { id: "myg-stackFade", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("stop", { offset: "0", className: "myg-stackFadeStart" }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("stop", { offset: "1", className: "myg-stackFadeEnd" })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("rect", { width: STACK.width, height: STACK.height, fill: "url(#myg-stackSky)" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("circle", { cx: "72", cy: "130", r: "26", className: "myg-stackCloud" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("circle", { cx: "300", cy: "210", r: "20", className: "myg-stackCloud" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("circle", { cx: "210", cy: "88", r: "14", className: "myg-stackCloud" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("g", { transform: `translate(${-cameraX} ${camera})`, children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("rect", { x: "-2000", y: STACK.baseY, width: "4360", height: STACK.height - STACK.baseY, className: "myg-stackGround" }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("line", { x1: "-2000", y1: STACK.baseY, x2: "2360", y2: STACK.baseY, className: "myg-stackGroundLine" }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("g", { transform: `rotate(${angle} ${baseCenter} ${STACK.baseY})`, children: game.blocks.map((block) => /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "rect",
                {
                  x: block.x,
                  y: STACK.baseY - (block.level + 1) * BLOCK_HEIGHT + BLOCK_GAP,
                  width: block.width,
                  height: BLOCK_HEIGHT - BLOCK_GAP,
                  rx: 3,
                  fill: blockColor(block.level),
                  stroke: "rgba(15, 23, 42, .22)",
                  strokeWidth: "1"
                },
                block.level
              )) })
            ] }),
            camera > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("rect", { x: "0", y: STACK.height - 110, width: STACK.width, height: "110", fill: "url(#myg-stackFade)", pointerEvents: "none" }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("g", { className: "myg-stackCrane", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("line", { x1: "20", y1: CRANE_RAIL_Y, x2: STACK.width - 20, y2: CRANE_RAIL_Y, className: "myg-stackRail" }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("rect", { x: crane.x - 19, y: CRANE_RAIL_Y - 14, width: "38", height: "15", rx: "4", className: "myg-stackTrolley" }),
              phase !== "dropping" && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("line", { x1: crane.x, y1: CRANE_RAIL_Y + 1, x2: crane.x, y2: CRANE_BLOCK_Y, className: "myg-stackCable" }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                "rect",
                {
                  x: visibleBlock.x,
                  y: vertical,
                  width: visibleBlock.width,
                  height: 16,
                  rx: 3,
                  fill: blockColor(visibleBlock.level),
                  stroke: "rgba(15, 23, 42, .22)",
                  strokeWidth: "1"
                }
              )
            ] })
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "myg-boardFoot", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "myg-footMeta", children: t("stack.bestLabel", { n: best }) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "myg-spacer" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "myg-btn primary", onClick: drop, disabled: phase !== "aiming", children: t("stack.drop") }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "myg-btn", onClick: restart, children: t("restart") })
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("aside", { className: "myg-side", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Card4, { title: t("opponent"), children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "myg-ai", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "myg-avatar", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(StackMark, { size: 22 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "myg-aiBody", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "myg-aiName", children: [
            t("opponent.name"),
            " ",
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: t("opponent.tag") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "myg-bubble", children: t(quip) })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Card4, { title: t("stack.stats"), children: /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "myg-stackScores", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("b", { children: game.score }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: t("stack.current") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("b", { children: best }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: t("stack.best") })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(Card4, { title: t("stack.rulesTitle"), children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("p", { className: "myg-empty", style: { margin: 0 }, children: t("stack.rules") }) }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "myg-hint", children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { "aria-hidden": "true", children: "\u{1F3D7}\uFE0F" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: t("stack.tip") })
      ] })
    ] })
  ] });
}

// src/client/Panel.jsx
var import_jsx_runtime8 = require("react/jsx-runtime");
function formatClock4(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor(safe % 3600 / 60);
  const seconds = safe % 60;
  const pad = (value) => String(value).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}
function readLastGame() {
  try {
    const value = window.localStorage.getItem(LAST_GAME_KEY);
    if (value === GAME_DARK || value === GAME_MINESWEEPER || value === GAME_STACK) return value;
    return GAME_GOMOKU;
  } catch {
    return GAME_GOMOKU;
  }
}
function writeLastGame(game) {
  try {
    window.localStorage.setItem(LAST_GAME_KEY, game);
  } catch {
  }
}
function PanelIcon({ size = 18 }) {
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", "aria-hidden": "true", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("rect", { x: "3.2", y: "3.2", width: "17.6", height: "17.6", rx: "4.2", stroke: "currentColor", strokeWidth: "1.7", opacity: ".62" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("path", { d: "M9 9.2 12 12l3-2.8M9 14.8 12 12l3 2.8", stroke: "currentColor", strokeWidth: "1.3", opacity: ".45", strokeLinecap: "round" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("circle", { cx: "8", cy: "8", r: "2.3", fill: "currentColor" }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("circle", { cx: "16", cy: "16", r: "2.3", fill: "currentColor" })
  ] });
}
function MoyuPanel({ ctx, initialGame }) {
  const [, bumpLocale] = import_react8.default.useState(0);
  const t = ctx.locale.bind(NS);
  import_react8.default.useEffect(() => ctx.locale.subscribe(() => bumpLocale((value) => value + 1)), [ctx]);
  const [game, setGame] = import_react8.default.useState(() => [GAME_DARK, GAME_GOMOKU, GAME_MINESWEEPER, GAME_STACK].includes(initialGame) ? initialGame : readLastGame());
  const [seconds, setSeconds] = import_react8.default.useState(0);
  import_react8.default.useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document === "undefined" || !document.hidden) setSeconds((value) => value + 1);
    }, 1e3);
    return () => clearInterval(timer);
  }, []);
  const selectGame = import_react8.default.useCallback((next) => {
    writeLastGame(next);
    setGame(next);
  }, []);
  const goBack = import_react8.default.useCallback(() => {
    try {
      ctx.get("layout")?.selectPanel(null);
    } catch (error) {
      console.warn("[moyu-games] could not switch panel", error);
    }
  }, [ctx]);
  import_react8.default.useEffect(() => {
    const onKeyDown = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key !== "Escape") return;
      const target = event.target;
      const typing = target !== null && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable === true);
      if (typing) return;
      event.preventDefault();
      goBack();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goBack]);
  const isDark = game === GAME_DARK;
  const isMines = game === GAME_MINESWEEPER;
  const isStack = game === GAME_STACK;
  return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "myg-root", children: [
    /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("header", { className: "myg-header", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "myg-brand", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "myg-brandMark", children: isDark ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(PawMark, { size: 21 }) : isMines ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(MineMark, { size: 21 }) : isStack ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(StackMark, { size: 21 }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(FishMark, { size: 21 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "myg-brandCopy", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("h1", { className: "myg-title", children: [
            t("title"),
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("small", { children: t("titleTag") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "myg-sub", children: isDark ? t("da.subtitle") : isMines ? t("ms.subtitle") : isStack ? t("stack.subtitle") : t("subtitle") })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "myg-tabs", role: "tablist", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": !isDark && !isMines && !isStack,
            className: "myg-tab",
            onClick: () => selectGame(GAME_GOMOKU),
            children: t("tab.gomoku")
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": isDark,
            className: "myg-tab",
            onClick: () => selectGame(GAME_DARK),
            children: t("tab.darkAnimals")
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": isMines,
            className: "myg-tab",
            onClick: () => selectGame(GAME_MINESWEEPER),
            children: t("tab.minesweeper")
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
          "button",
          {
            type: "button",
            role: "tab",
            "aria-selected": isStack,
            className: "myg-tab",
            onClick: () => selectGame(GAME_STACK),
            children: t("tab.stack")
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { className: "myg-headerSpacer" }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "myg-time", children: [
        t("slackTime"),
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("b", { children: formatClock4(seconds) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("button", { type: "button", className: "myg-btn ghost", onClick: goBack, title: t("backHint"), children: [
        "\u2190 ",
        t("back")
      ] })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "myg-scroll", children: isDark ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(DarkAnimalGame, { ctx, t, active: true }) : isMines ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(MinesweeperGame, { ctx, t, active: true }) : isStack ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(StackGame, { t, active: true }) : /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(GomokuGame, { ctx, t, active: true }) })
  ] });
}

// src/client/styles.js
var STYLES = `
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

`;

// src/client/i18n.js
var zh = {
  "nav": "\u6478\u9C7C\u68CB\u5BA4",
  "title": "\u6478\u9C7C\u68CB\u5BA4",
  "titleTag": "M\u014CY\xDA",
  "subtitle": "\u4E94\u5B50\u68CB \xB7 \u8001\u677F\u952E Esc \u4E00\u952E\u56DE\u5230\u5BF9\u8BDD",
  "tab.gomoku": "\u4E94\u5B50\u68CB",
  "tab.more": "\u66F4\u591A\u6E38\u620F",
  "tab.soon": "\u7B79\u5907\u4E2D",
  "back": "\u56DE\u5230\u5BF9\u8BDD",
  "backHint": "Esc",
  "slackTime": "\u5DF2\u6478\u9C7C",
  "board.yourTurn": "\u8F6E\u5230\u4F60\u843D\u5B50",
  "board.aiTurn": "\u9C7C\u5C0F\u4E03\u601D\u8003\u4E2D",
  "board.win": "\u4E94\u5B50\u8FDE\u73E0\uFF0C\u4F60\u8D62\u4E86",
  "board.lose": "\u9C7C\u5C0F\u4E03\u8FDE\u6210\u4E94\u5B50",
  "board.draw": "\u68CB\u76D8\u6EE1\u4E86\uFF0C\u548C\u68CB",
  "board.moveNo": "\u7B2C {n} \u624B",
  "board.youAre": "\u4F60\u6267{color}",
  "black": "\u9ED1",
  "white": "\u767D",
  "blackStone": "\u9ED1\u68CB",
  "whiteStone": "\u767D\u68CB",
  "level.easy": "\u6478\u9C7C",
  "level.medium": "\u8BA4\u771F",
  "level.hard": "\u5377\u738B",
  "level.easyHint": "AI \u4F1A\u5076\u5C14\u8D70\u795E\uFF0C\u9002\u5408\u771F\xB7\u6478\u9C7C",
  "level.mediumHint": "AI \u4F1A\u7B97\u4E24\u6B65\uFF0C\u6B63\u5E38\u6C34\u5E73",
  "level.hardHint": "AI \u4F1A\u7B97\u56DB\u5230\u516D\u6B65\uFF0C\u614E\u5165",
  "settings": "\u5BF9\u5C40\u8BBE\u7F6E",
  "settings.level": "AI \u96BE\u5EA6",
  "settings.side": "\u6211\u7684\u6267\u5B50",
  "settings.sideHint": "\u6362\u624B\u4F1A\u91CD\u5F00\u4E00\u5C40",
  "undo": "\u6094\u68CB",
  "restart": "\u91CD\u5F00",
  "swap": "\u6362\u624B",
  "opponent": "\u5BF9\u624B",
  "opponent.name": "\u9C7C\u5C0F\u4E03",
  "opponent.tag": "\u672C\u5730 AI",
  "stats": "\u6478\u9C7C\u6218\u7EE9",
  "stats.win": "\u80DC",
  "stats.lose": "\u8D1F",
  "stats.draw": "\u548C",
  "stats.streak": "\u8FDE\u80DC",
  "stats.best": "\u6700\u4F73\u8FDE\u80DC",
  "stats.reset": "\u6E05\u96F6",
  "moves": "\u68CB\u8C31",
  "moves.empty": "\u8FD8\u6CA1\u6709\u843D\u5B50\u3002\u70B9\u68CB\u76D8\u4EA4\u53C9\u70B9\uFF0C\u6216\u805A\u7126\u68CB\u76D8\u540E\u6309\u56DE\u8F66\u3002",
  "hint.title": "\u6478\u9C7C\u5C0F\u8D34\u58EB",
  "hint.body": "\u70B9\u51FB/\u56DE\u8F66\u843D\u5B50\uFF0C\u65B9\u5411\u952E\u79FB\u52A8\u5149\u6807\uFF0CU \u6094\u68CB\uFF0CN \u91CD\u5F00\uFF0CEsc \u56DE\u5230\u5BF9\u8BDD\u3002",
  "result.winTitle": "\u4F60\u8D62\u4E86\uFF01",
  "result.loseTitle": "\u60DC\u8D25",
  "result.drawTitle": "\u548C\u68CB",
  "result.winDesc": "\u7528\u65F6 {time}\uFF0C{moves} \u624B\u62FF\u4E0B\u9C7C\u5C0F\u4E03\u3002",
  "result.loseDesc": "\u7528\u65F6 {time}\uFF0C{moves} \u624B\u3002\u518D\u6765\u4E00\u5C40\u627E\u56DE\u573A\u5B50\uFF1F",
  "result.drawDesc": "{moves} \u624B\u6218\u5E73\uFF0C\u68CB\u76D8\u90FD\u6EE1\u4E86\u3002",
  "result.again": "\u518D\u6765\u4E00\u5C40",
  "ai.greet": "\u5F00\u5C40\u4E86\u3002\u4F60\u5148\u8BF7\uFF0C\u6211\u968F\u4FBF\u4E0B\u4E0B\u3002",
  "ai.greetFirst": "\u6211\u5148\u843D\u5B50\uFF0C\u4F60\u968F\u610F\u3002",
  "ai.closing": "\u8FD9\u624B\u6210\u4E86\uFF0C\u627F\u8BA9\u3002",
  "ai.block": "\u8FD9\u624B\u5F97\u5835\uFF0C\u4E0D\u7136\u4F60\u8981\u5077\u9E21\u3002",
  "ai.attack": "\u8BE5\u6211\u53D1\u529B\u4E86\uFF0C\u6CE8\u610F\u53F3\u8FB9\u3002",
  "ai.quip1": "\u55EF\uFF0C\u8FD9\u6B65\u6709\u70B9\u610F\u601D\u3002",
  "ai.quip2": "\u522B\u6025\uFF0C\u6162\u6162\u60F3\uFF0C\u53CD\u6B63\u4E5F\u662F\u6478\u9C7C\u3002",
  "ai.quip3": "\u4F60\u8FD9\u4E00\u6B65\uFF0C\u8001\u677F\u770B\u4E86\u90FD\u8BF4\u7A33\u3002",
  "ai.quip4": "\u6211\u5148\u559D\u53E3\u6C34\uFF0C\u4F60\u7EE7\u7EED\u3002",
  "ai.taunt": "\u9C7C\u67D0\u4FA5\u5E78\u3002\u8981\u4E0D\u8981\u518D\u6765\u4E00\u76D8\uFF1F",
  "ai.respect": "\u597D\u68CB\uFF0C\u8FD9\u6761\u9C7C\u8BA4\u8F93\u3002",
  "ai.undo": "\u6094\u68CB\u662F\u5427\uFF1F\u5F53\u6211\u6CA1\u770B\u89C1\u3002",
  "tab.stack": "\u53E0\u697C",
  "stack.subtitle": "\u540A\u8F66\u5DE6\u53F3\u6643 \xB7 \u770B\u51C6\u65F6\u673A\u653E\u697C\u5C42",
  "stack.rulesTitle": "\u73A9\u6CD5",
  "stack.rules": "\u70B9\u51FB\u753B\u9762\u6216\u6309\u7A7A\u683C\u653E\u4E0B\u697C\u5C42\u3002\u697C\u677F\u6574\u5757\u4FDD\u7559\u3001\u53EF\u4EE5\u4F38\u51FA\u60AC\u7A7A\uFF1B\u4F46\u652F\u6491\u592A\u5C11\u4F1A\u6389\u4E0B\u53BB\u3002\u8FDE\u7EED\u53E0\u6B6A\u4F1A\u8BA9\u697C\u8D8A\u6765\u8D8A\u6643\uFF0C\u592A\u6B6A\u4F1A\u6574\u5EA7\u584C\u6389\u3002\u5B8C\u5168\u5BF9\u9F50\u6700\u7A33\u3002",
  "stack.score": "\u697C\u5C42",
  "stack.best": "\u6700\u9AD8",
  "stack.current": "\u672C\u5C40",
  "stack.result.title": "\u697C\u584C\u4E86",
  "stack.result.desc": "\u53E0\u4E86 {n} \u5C42\uFF0C\u6700\u9AD8 {best} \u5C42\u3002",
  "stack.result.again": "\u518D\u6765\u4E00\u5C40",
  "stack.drop": "\u653E\u4E0B",
  "stack.perfect": "\u5B8C\u7F8E\u5BF9\u9F50",
  "stack.landed": "\u7A33\u4F4F\u4E86",
  "stack.miss": "\u653E\u6B6A\u4E86\uFF0C\u6389\u4E0B\u53BB\u4E86",
  "stack.topple": "\u697C\u592A\u6B6A\uFF0C\u584C\u4E86",
  "stack.tip": "\u70B9\u51FB\u753B\u9762\u6216\u6309\u7A7A\u683C\u653E\u4E0B",
  "stack.height": "\u7B2C {n} \u5C42",
  "stack.floors": "\u5DF2\u53E0 {n} \u5C42",
  "stack.bestLabel": "\u6700\u9AD8 {n} \u5C42",
  "stack.newBest": "\u65B0\u7EAA\u5F55\uFF01",
  "stack.stats": "\u53E0\u697C\u8BB0\u5F55",
  "stack.quip.greet": "\u5148\u6765\u4E00\u5C42\uFF0C\u7A33\u4E00\u70B9\u3002",
  "stack.quip.perfect": "\u6F02\u4EAE\uFF0C\u6B63\u4E2D\u95F4\uFF01",
  "stack.quip.landed": "\u8FD8\u884C\uFF0C\u7EE7\u7EED\u3002",
  "stack.quip.risky": "\u6709\u70B9\u6B6A\uFF0C\u6CE8\u610F\u5E73\u8861\u3002",
  "stack.quip.miss": "\u554A\uFF0C\u6389\u4E0B\u53BB\u4E86\u3002",
  "stack.quip.topple": "\u697C\u584C\u4E86\uFF0C\u91CD\u6765\u3002",
  "tab.minesweeper": "\u626B\u96F7",
  "ms.subtitle": "9\xD79 \u8D77 \xB7 \u9996\u70B9\u5B89\u5168 \xB7 \u672C\u5730 AI \u63D0\u793A",
  "ms.ready": "\u70B9\u7B2C\u4E00\u683C\u5F00\u59CB\uFF08\u9996\u70B9\u53CA\u5468\u56F4\u5B89\u5168\uFF09",
  "ms.readyShort": "\u70B9\u7B2C\u4E00\u683C\u5F00\u59CB",
  "ms.playing": "\u7EE7\u7EED\u6392\u67E5",
  "ms.won": "\u96F7\u533A\u6E05\u7A7A\uFF0C\u4F60\u8D62\u4E86",
  "ms.lost": "\u8E29\u96F7\u4E86",
  "ms.result.winTitle": "\u626B\u96F7\u6210\u529F\uFF01",
  "ms.result.loseTitle": "\u8E29\u96F7\u4E86",
  "ms.result.winDesc": "\u7528\u65F6 {time}\uFF0C{flags} \u9762\u65D7\uFF0C\u96BE\u5EA6 {level}\u3002",
  "ms.result.loseDesc": "\u7528\u65F6 {time}\uFF0C\u8FD8\u5269 {hidden} \u683C\u6CA1\u6392\u3002\u518D\u6765\u4E00\u5C40\uFF1F",
  "ms.result.again": "\u518D\u6765\u4E00\u5C40",
  "ms.mines": "\u96F7 {flagged}/{total}",
  "ms.mineCount": "{n} \u96F7",
  "ms.flags": "\u65D7 {count}",
  "ms.time": "\u7528\u65F6 {time}",
  "ms.aiHint": "AI \u63D0\u793A",
  "ms.hintsLeft": "\u5269\u4F59 {n} \u6B21",
  "ms.noHints": "\u63D0\u793A\u6B21\u6570\u7528\u5B8C\u4E86",
  "ms.hintSafe": "\u5206\u6790\u5B8C\u6210\uFF1A\u9AD8\u4EAE\u4F4D\u7F6E\u5B89\u5168",
  "ms.hintMine": "\u5206\u6790\u5B8C\u6210\uFF1A\u9AD8\u4EAE\u4F4D\u7F6E\u662F\u96F7",
  "ms.hintGuess": "\u6CA1\u6709\u7EDD\u5BF9\u5B89\u5168\u7684\u4F4D\u7F6E\uFF0C\u8BD5\u8BD5\u9AD8\u4EAE\u683C",
  "ms.hintEmpty": "\u6682\u65F6\u6CA1\u6709\u53EF\u5206\u6790\u7684\u7EBF\u7D22\uFF0C\u5148\u7FFB\u4E00\u683C",
  "ms.flagMode": "\u63D2\u65D7\u6A21\u5F0F",
  "ms.flagModeOn": "\u63D2\u65D7\u6A21\u5F0F\uFF1A\u5F00",
  "ms.rulesTitle": "\u73A9\u6CD5",
  "ms.rules": "\u5DE6\u952E\u7FFB\u5F00\uFF0C\u53F3\u952E\u63D2\u65D7\uFF1B\u6570\u5B57\u8868\u793A\u5468\u56F4 8 \u683C\u7684\u96F7\u6570\u3002\u9996\u70B9\u53CA\u5176\u5468\u56F4\u4FDD\u8BC1\u5B89\u5168\u3002\u7FFB\u5F00\u6240\u6709\u975E\u96F7\u683C\u83B7\u80DC\uFF0C\u8E29\u96F7\u5931\u8D25\u3002\u53CC\u51FB\u6570\u5B57\u53EF\u5728\u65D7\u6570\u6B63\u786E\u65F6\u5FEB\u901F\u7FFB\u5F00\u5468\u56F4\u3002",
  "ms.stats": "\u626B\u96F7\u6218\u7EE9",
  "ms.size.easy": "9\xD79",
  "ms.size.medium": "16\xD716",
  "ms.size.hard": "16\xD730",
  "ms.boardLabel": "\u626B\u96F7\u68CB\u76D8",
  "ms.cellHidden": "{cell} \u672A\u7FFB\u5F00",
  "ms.cellFlagged": "{cell} \u5DF2\u63D2\u65D7",
  "ms.cellRevealed": "{cell} \u5468\u56F4 {n} \u96F7",
  "ms.quip.greet": "\u5148\u70B9\u4E00\u683C\uFF0C\u5269\u4E0B\u7684\u4EA4\u7ED9\u8FD0\u6C14\u548C\u903B\u8F91\u3002",
  "ms.quip.safe": "\u8FD9\u5757\u533A\u57DF\u662F\u5B89\u5168\u7684\u3002",
  "ms.quip.mine": "\u8FD9\u683C\u662F\u96F7\uFF0C\u522B\u70B9\u3002",
  "ms.quip.guess": "\u6CA1\u6709\u7A33\u89E3\u4E86\uFF0C\u53EA\u80FD\u8D4C\u4E00\u628A\u3002",
  "ms.quip.win": "\u96F7\u533A\u6E05\u7A7A\uFF0C\u6F02\u4EAE\u3002",
  "ms.quip.lose": "\u8F70\u3002\u4E0B\u628A\u6CE8\u610F\u811A\u4E0B\u3002",
  "ms.quip.flag": "\u65D7\u5B50\u63D2\u597D\uFF0C\u522B\u624B\u6296\u3002",
  "ms.quip.noHints": "\u63D0\u793A\u7528\u5B8C\u4E86\uFF0C\u81EA\u5DF1\u63A8\u7406\u5427\u3002",
  "tab.darkAnimals": "\u6697\u517D\u68CB",
  "da.subtitle": "4\xD74 \u7FFB\u7FFB\u68CB \xB7 \u9996\u7FFB\u5B9A\u9635\u8425",
  "da.youAre": "\u4F60\u6267{color}",
  "da.color.teal": "\u9752",
  "da.color.red": "\u6731",
  "da.colorUndecided": "\u5F85\u5B9A",
  "da.turnYou": "\u8F6E\u5230\u4F60\u884C\u52A8",
  "da.turnAi": "\u517D\u5C0F\u4E03\u601D\u8003\u4E2D",
  "da.firstFlip": "\u5148\u7FFB\u4E00\u679A\u6697\u68CB\uFF0C\u51B3\u5B9A\u4F60\u7684\u9635\u8425",
  "da.selectHint": "\u70B9\u5DF1\u65B9\u660E\u517D\uFF0C\u518D\u70B9\u76F8\u90BB\u683C",
  "da.win": "\u5403\u5149\u5BF9\u65B9\uFF0C\u4F60\u8D62\u4E86",
  "da.lose": "\u517D\u5C0F\u4E03\u5403\u5149\u4E86\u4F60\u7684\u517D\u68CB",
  "da.draw": "\u4E00\u767E\u624B\u65E0\u8FDB\u5C55\uFF0C\u548C\u68CB",
  "da.opponent.name": "\u517D\u5C0F\u4E03",
  "da.opponent.tag": "\u672C\u5730 AI",
  "da.rulesTitle": "\u73A9\u6CD5",
  "da.rules": "4\xD74 \u7FFB\u7FFB\u68CB\u3002\u9996\u7FFB\u5B9A\u8272\uFF1B\u6BCF\u56DE\u5408\u7FFB\u4E00\u679A\u6697\u68CB\uFF0C\u6216\u8BA9\u5DF1\u65B9\u660E\u517D\u6B63\u4EA4\u8D70\u4E00\u683C\u3002\u7B49\u7EA7 1 \u8C61 \u2192 8 \u9F20\uFF0C\u9AD8\u7EA7\u5403\u4F4E\u7EA7\u3001\u540C\u7EA7\u4E92\u5403\uFF1B\u9F20\u53EF\u5403\u8C61\uFF0C\u8C61\u4E0D\u80FD\u5403\u9F20\u3002",
  "da.stats": "\u6697\u517D\u68CB\u6218\u7EE9",
  "da.captured": "\u5DF2\u5403\u68CB\u5B50",
  "da.capturedYou": "\u4F60\u5403",
  "da.capturedAi": "AI \u5403",
  "da.none": "\u65E0",
  "da.hiddenPiece": "\u6697\u68CB",
  "da.emptyCell": "\u7A7A\u683C",
  "da.flip": "\u7FFB",
  "da.captureShort": "\u5403{animal}",
  "da.moves": "\u5BF9\u5C40\u8BB0\u5F55",
  "da.moves.empty": "\u8FD8\u6CA1\u6709\u52A8\u4F5C\uFF0C\u5148\u7FFB\u5F00\u7B2C\u4E00\u679A\u6697\u68CB\u3002",
  "da.actionNo": "\u7B2C {n} \u624B",
  "da.result.winTitle": "\u4F60\u8D62\u4E86\uFF01",
  "da.result.loseTitle": "\u60DC\u8D25",
  "da.result.drawTitle": "\u548C\u68CB",
  "da.result.winDesc": "\u5403\u6389\u5BF9\u65B9 {n} \u679A\u517D\u68CB\uFF0C\u7528\u65F6 {time}\u3002",
  "da.result.loseDesc": "\u88AB\u5403 {n} \u679A\uFF0C\u7528\u65F6 {time}\u3002\u518D\u6765\u4E00\u5C40\uFF1F",
  "da.result.drawDesc": "\u4E00\u767E\u624B\u65E0\u8FDB\u5C55\uFF0C\u63E1\u624B\u8A00\u548C\u3002",
  "da.result.again": "\u518D\u6765\u4E00\u5C40",
  "da.quip.greet": "\u8FD9\u6B21\u662F\u6697\u68CB\uFF0C\u7FFB\u5230\u4EC0\u4E48\u5168\u770B\u624B\u6C14\u3002",
  "da.quip.flip": "\u7FFB\u5F00\u770B\u770B\u2026\u2026",
  "da.quip.capture": "\u8FD9\u53EA\u6211\u6536\u4E0B\u4E86\u3002",
  "da.quip.attack": "\u8BE5\u6211\u52A8\u624B\u4E86\u3002",
  "da.quip.taunt": "\u6697\u68CB\u5C31\u662F\u8FD9\u6837\uFF0C\u8BA4\u547D\u5427\u3002",
  "da.quip.respect": "\u597D\u624B\u6BB5\uFF0C\u8FD9\u5C40\u4F60\u8D62\u3002",
  "da.quip.undo": "\u6094\u68CB\u662F\u5427\uFF1F\u5F53\u6211\u6CA1\u770B\u89C1\u3002",
  "da.quip.neutral1": "\u6697\u68CB\u561B\uFF0C\u5148\u63A2\u63A2\u8DEF\u3002",
  "da.quip.neutral2": "\u8FD9\u4E00\u6B65\uFF0C\u4F60\u731C\u6211\u60F3\u5E72\u561B\uFF1F",
  "da.hint": "\u70B9\u6697\u68CB\u7FFB\u5F00\uFF1B\u70B9\u5DF1\u65B9\u660E\u517D\u518D\u70B9\u76F8\u90BB\u683C\u79FB\u52A8\u3002U \u6094\u68CB\uFF0CN \u91CD\u5F00\uFF0CEsc \u56DE\u5BF9\u8BDD\u3002",
  "da.animal.elephant": "\u8C61",
  "da.animal.lion": "\u72EE",
  "da.animal.tiger": "\u864E",
  "da.animal.leopard": "\u8C79",
  "da.animal.wolf": "\u72FC",
  "da.animal.dog": "\u72D7",
  "da.animal.cat": "\u732B",
  "da.animal.rat": "\u9F20",
  "ai.thinking": "\u601D\u8003\u4E2D"
};
var en = {
  "nav": "Slack Arcade",
  "title": "Slack Arcade",
  "titleTag": "M\u014CY\xDA",
  "subtitle": "Gomoku \xB7 press Esc to snap back to work",
  "tab.gomoku": "Gomoku",
  "tab.more": "More games",
  "tab.soon": "soon",
  "back": "Back to chat",
  "backHint": "Esc",
  "slackTime": "Slacking for",
  "board.yourTurn": "Your move",
  "board.aiTurn": "Xiaoqi is thinking",
  "board.win": "Five in a row \u2014 you win",
  "board.lose": "Xiaoqi got five",
  "board.draw": "Board full \u2014 draw",
  "board.moveNo": "Move {n}",
  "board.youAre": "You are {color}",
  "black": "Black",
  "white": "White",
  "blackStone": "black",
  "whiteStone": "white",
  "level.easy": "Easy",
  "level.medium": "Normal",
  "level.hard": "Grind",
  "level.easyHint": "The AI daydreams a little \u2014 proper slacking",
  "level.mediumHint": "The AI looks two plies ahead",
  "level.hardHint": "The AI looks four to six plies ahead \u2014 beware",
  "settings": "Match settings",
  "settings.level": "AI difficulty",
  "settings.side": "Your stones",
  "settings.sideHint": "Switching sides restarts the game",
  "undo": "Undo",
  "restart": "Restart",
  "swap": "Swap sides",
  "opponent": "Opponent",
  "opponent.name": "Xiaoqi",
  "opponent.tag": "Local AI",
  "stats": "Slack record",
  "stats.win": "Won",
  "stats.lose": "Lost",
  "stats.draw": "Drawn",
  "stats.streak": "Streak",
  "stats.best": "Best streak",
  "stats.reset": "Reset",
  "moves": "Move log",
  "moves.empty": "No stones yet. Click an intersection, or focus the board and press Enter.",
  "hint.title": "Slacking tips",
  "hint.body": "Click or Enter to place. Arrow keys move the cursor, U undoes, N restarts, Esc returns to chat.",
  "result.winTitle": "You win!",
  "result.loseTitle": "Defeated",
  "result.drawTitle": "Draw",
  "result.winDesc": "{moves} moves, {time} \u2014 Xiaoqi has been schooled.",
  "result.loseDesc": "{moves} moves, {time}. Run it back?",
  "result.drawDesc": "A {moves}-move standoff. Every intersection is full.",
  "result.again": "Play again",
  "ai.greet": "Here we go. You first \u2014 I will take it easy.",
  "ai.greetFirst": "I will open. Take your time.",
  "ai.closing": "That is five. Good game.",
  "ai.block": "Had to block that \u2014 nice try.",
  "ai.attack": "My turn to push. Watch the right side.",
  "ai.quip1": "Hm, that is an interesting move.",
  "ai.quip2": "Take your time. We are technically on the clock.",
  "ai.quip3": "Your boss would call that move stable.",
  "ai.quip4": "Let me grab some water. You keep going.",
  "ai.taunt": "Lucky fish. Rematch?",
  "ai.respect": "Good game. This fish concedes.",
  "ai.undo": "Undo? I saw nothing.",
  "tab.stack": "Stack",
  "stack.subtitle": "Swinging crane \xB7 time the drop",
  "stack.rulesTitle": "How to play",
  "stack.rules": "Click the stage or press Space to drop the slab. The whole slab stays, overhang included; too little support and it falls. Repeated off-center drops make the tower lean more \u2014 lean too far and it collapses. Perfect drops are the most stable.",
  "stack.score": "Floors",
  "stack.best": "Best",
  "stack.current": "Run",
  "stack.result.title": "The tower fell",
  "stack.result.desc": "{n} floors, best {best}.",
  "stack.result.again": "Play again",
  "stack.drop": "Drop",
  "stack.perfect": "Perfect",
  "stack.landed": "Landed",
  "stack.miss": "Missed \u2014 it fell",
  "stack.topple": "Too crooked \u2014 collapsed",
  "stack.tip": "Click the stage or press Space to drop",
  "stack.height": "Floor {n}",
  "stack.floors": "{n} floors stacked",
  "stack.bestLabel": "Best {n} floors",
  "stack.newBest": "New record!",
  "stack.stats": "Stack record",
  "stack.quip.greet": "Start steady. One floor at a time.",
  "stack.quip.perfect": "Dead center. Beautiful.",
  "stack.quip.landed": "That will hold. Keep going.",
  "stack.quip.risky": "Getting crooked \u2014 watch the balance.",
  "stack.quip.miss": "And down it goes.",
  "stack.quip.topple": "The tower is gone. Again?",
  "tab.minesweeper": "Minesweeper",
  "ms.subtitle": "From 9\xD79 \xB7 safe first click \xB7 local AI hints",
  "ms.ready": "Click any cell to start (first click and its neighbors are safe)",
  "ms.readyShort": "Click to start",
  "ms.playing": "Keep clearing",
  "ms.won": "Minefield cleared \u2014 you win",
  "ms.lost": "Boom",
  "ms.result.winTitle": "Minefield cleared!",
  "ms.result.loseTitle": "Boom",
  "ms.result.winDesc": "{time}, {flags} flags, {level}.",
  "ms.result.loseDesc": "{time}, {hidden} cells left. Run it back?",
  "ms.result.again": "Play again",
  "ms.mines": "Mines {flagged}/{total}",
  "ms.mineCount": "{n} mines",
  "ms.flags": "Flags {count}",
  "ms.time": "Time {time}",
  "ms.aiHint": "AI hint",
  "ms.hintsLeft": "{n} left",
  "ms.noHints": "No hints left",
  "ms.hintSafe": "Analysis done: highlighted cells are safe",
  "ms.hintMine": "Analysis done: highlighted cells are mines",
  "ms.hintGuess": "No guaranteed safe move \u2014 try the highlighted cell",
  "ms.hintEmpty": "No clues yet \u2014 reveal a cell first",
  "ms.flagMode": "Flag mode",
  "ms.flagModeOn": "Flag mode: on",
  "ms.rulesTitle": "How to play",
  "ms.rules": "Left-click reveals, right-click flags. A number counts mines in the 8 neighbors. The first click and its neighbors are always safe. Reveal every safe cell to win; a mine ends the run. Double-click a number to chord when its flags match.",
  "ms.stats": "Minesweeper record",
  "ms.size.easy": "9\xD79",
  "ms.size.medium": "16\xD716",
  "ms.size.hard": "16\xD730",
  "ms.boardLabel": "Minesweeper board",
  "ms.cellHidden": "{cell} hidden",
  "ms.cellFlagged": "{cell} flagged",
  "ms.cellRevealed": "{cell} with {n} adjacent mines",
  "ms.quip.greet": "Open one cell; luck and logic handle the rest.",
  "ms.quip.safe": "This area is safe.",
  "ms.quip.mine": "That one is a mine. Do not click it.",
  "ms.quip.guess": "No certain move left \u2014 take the gamble.",
  "ms.quip.win": "Minefield cleared. Nicely done.",
  "ms.quip.lose": "Boom. Watch your step next time.",
  "ms.quip.flag": "Flag planted. Steady hands.",
  "ms.quip.noHints": "Out of hints \u2014 reason it out.",
  "tab.darkAnimals": "Dark Beasts",
  "da.subtitle": "4\xD74 hidden beasts \xB7 first flip picks your side",
  "da.youAre": "You are {color}",
  "da.color.teal": "Teal",
  "da.color.red": "Vermilion",
  "da.colorUndecided": "undecided",
  "da.turnYou": "Your move",
  "da.turnAi": "Xiaoqi is thinking",
  "da.firstFlip": "Flip a hidden piece to pick your side",
  "da.selectHint": "Pick one of your revealed beasts, then an adjacent cell",
  "da.win": "All enemy beasts captured \u2014 you win",
  "da.lose": "Xiaoqi captured all your beasts",
  "da.draw": "100 quiet plies \u2014 draw",
  "da.opponent.name": "Xiaoqi",
  "da.opponent.tag": "Local AI",
  "da.rulesTitle": "How to play",
  "da.rules": "4\xD74 hidden beast chess. The first flip decides sides. Each turn: flip one hidden piece, or move a revealed beast one orthogonal step. Ranks 1 elephant \u2192 8 rat; higher captures lower, equal captures trade the defender; rat beats elephant, elephant cannot beat rat.",
  "da.stats": "Dark beasts record",
  "da.captured": "Captured",
  "da.capturedYou": "You took",
  "da.capturedAi": "AI took",
  "da.none": "none",
  "da.hiddenPiece": "hidden",
  "da.emptyCell": "empty",
  "da.flip": "flip",
  "da.captureShort": "takes {animal}",
  "da.moves": "Match log",
  "da.moves.empty": "No actions yet. Flip the first hidden piece.",
  "da.actionNo": "Move {n}",
  "da.result.winTitle": "You win!",
  "da.result.loseTitle": "Defeated",
  "da.result.drawTitle": "Draw",
  "da.result.winDesc": "Captured {n} enemy beasts in {time}.",
  "da.result.loseDesc": "{n} of your beasts were captured in {time}. Run it back?",
  "da.result.drawDesc": "100 quiet plies. A fair draw.",
  "da.result.again": "Play again",
  "da.quip.greet": "Hidden beasts this time \u2014 luck decides the opening.",
  "da.quip.flip": "Let us see what is under here\u2026",
  "da.quip.capture": "I will take this one.",
  "da.quip.attack": "My turn to strike.",
  "da.quip.taunt": "That is hidden chess for you.",
  "da.quip.respect": "Well played. This one is yours.",
  "da.quip.undo": "Undo? I saw nothing.",
  "da.quip.neutral1": "Just scouting the board.",
  "da.quip.neutral2": "Guess what I am planning.",
  "da.hint": "Flip a hidden piece, or pick your beast then an adjacent cell. U undo, N restart, Esc back to chat.",
  "da.animal.elephant": "Elephant",
  "da.animal.lion": "Lion",
  "da.animal.tiger": "Tiger",
  "da.animal.leopard": "Leopard",
  "da.animal.wolf": "Wolf",
  "da.animal.dog": "Dog",
  "da.animal.cat": "Cat",
  "da.animal.rat": "Rat",
  "ai.thinking": "thinking"
};

// src/client/index.jsx
var import_jsx_runtime9 = require("react/jsx-runtime");
var PLUGIN_ID = "dsh-moyu-games";
var STYLE_ID = `${PLUGIN_ID}/styles`;
var stylesInstalled = false;
function installStyles() {
  if (stylesInstalled || typeof document === "undefined") return;
  const existing = document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`);
  if (existing !== null) {
    stylesInstalled = true;
    return;
  }
  const tag = document.createElement("style");
  tag.dataset.plugin = PLUGIN_ID;
  tag.dataset.pluginCss = STYLE_ID;
  tag.textContent = STYLES;
  document.head.appendChild(tag);
  stylesInstalled = true;
}
var appCtx = null;
function openArcade(ctx) {
  try {
    ctx.get("layout")?.selectPanel(PANEL_ID);
  } catch (error) {
    console.warn("[moyu-games] cannot open the arcade panel", error);
  }
}
function ComposerButton({ t }) {
  return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(
    "button",
    {
      type: "button",
      className: "myg-composerBtn",
      title: t("subtitle"),
      onClick: () => openArcade(appCtx),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(PanelIcon, { size: 13 }),
        t("nav")
      ]
    }
  );
}
var name = "moyu-games";
var inject = ["slots", "locale"];
function apply(ctx) {
  appCtx = ctx;
  installStyles();
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "moyu-games: dictionaries");
  ctx.slots.inject("main", () => ctx.slots.register({
    name: "main",
    key: PANEL_ID,
    locale: NS
  }, (props) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(MoyuPanel, { ctx, initialGame: props?.initialGame })));
  ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
    name: "sidebar.panellist",
    id: PANEL_ID,
    order: 72,
    label: () => ctx.locale.bind(NS)("nav"),
    locale: NS
  }, (props) => /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(PanelIcon, { size: props.size ?? 18, active: props.active === true })));
  ctx.slots.inject("conversation.input.left", () => ctx.slots.register({
    name: "conversation.input.left",
    id: PANEL_ID,
    order: 40,
    label: () => ctx.locale.bind(NS)("nav"),
    locale: NS
  }, ComposerButton));
}

    return module.exports;
  },
});

# 提交到 awesome-dsh-plugin / dsh-market

本目录里的 `KunChiang__dsh-moyu-games.yml` 是已经写好的条目文件。

## 收录前检查

- 仓库创建满 1 天后才能通过 CI（当前仓库创建于 2026-11-17 10:15 UTC）。
- 给仓库添加 `dsh-plugin` topic：仓库首页 → About 右侧齿轮 → Topics。
- `package.json` 已同时声明 `dsh.bundle` 与 `dsh.client`，仓库根目录已有 `cordis.patch.yml`。
- 图标：`assets/icon-180.png`；截图：`screenshots.json`。

## 提交 PR

1. Fork <https://github.com/awesome-dsh-plugin/awesome-dsh-plugin>。
2. 在 fork 中新建 `data/plugins/KunChiang__dsh-moyu-games.yml`，内容复制本目录同名文件。
3. 只提交这一个文件，不要改 README。
4. 向上游 `main` 发起 PR。

条目内容：

```yaml
url: https://github.com/KunChiang/dsh-moyu-games
name: KunChiang/dsh-moyu-games
category: fun
description:
  en: 'Three local games for DeepSeek Harness: 15×15 Gomoku and a 4×4 hidden-beast chess variant against a local AI, plus a 9×9 to 16×30 minesweeper with safe first click and AI hints. Difficulty levels, undo, per-game stats, and an Esc boss key back to chat.'
  zh: 'DeepSeek Harness 里的三款摸鱼游戏：对本地 AI 的 15×15 五子棋与 4×4 暗兽棋，以及 9×9 到 16×30、首点安全并可 AI 提示的扫雷；支持难度、悔棋、分棋种战绩和 Esc 老板键回到对话。'
icon: https://raw.githubusercontent.com/KunChiang/dsh-moyu-games/main/assets/icon-180.png
```

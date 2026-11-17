import React from 'react'
import { MoyuPanel, PanelIcon, NS, PANEL_ID } from './Panel.jsx'
import { STYLES } from './styles.js'
import { zh, en } from './i18n.js'

const PLUGIN_ID = 'dsh-moyu-games'
const STYLE_ID = `${PLUGIN_ID}/styles`

let stylesInstalled = false

/** 注入插件样式；HMR 会按 data-plugin 清理旧标签，所以每次 materialize 都重试。 */
function installStyles() {
  if (stylesInstalled || typeof document === 'undefined') return
  const existing = document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`)
  if (existing !== null) {
    stylesInstalled = true
    return
  }
  const tag = document.createElement('style')
  tag.dataset.plugin = PLUGIN_ID
  tag.dataset.pluginCss = STYLE_ID
  tag.textContent = STYLES
  document.head.appendChild(tag)
  stylesInstalled = true
}

let appCtx = null

function openArcade(ctx) {
  try {
    ctx.get('layout')?.selectPanel(PANEL_ID)
  } catch (error) {
    console.warn('[moyu-games] cannot open the arcade panel', error)
  }
}

function ComposerButton({ t }) {
  return (
    <button
      type="button"
      className="myg-composerBtn"
      title={t('subtitle')}
      onClick={() => openArcade(appCtx)}
    >
      <PanelIcon size={13} />
      {t('nav')}
    </button>
  )
}

export const name = 'moyu-games'
export const inject = ['slots', 'locale']

export function apply(ctx) {
  appCtx = ctx
  installStyles()

  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'moyu-games: dictionaries')

  // 主动登记主面板，保证侧栏按钮第一次点击时 main 已有可渲染的 key。
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main',
    key: PANEL_ID,
    locale: NS,
  }, (props) => <MoyuPanel ctx={ctx} initialGame={props?.initialGame} />))

  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist',
    id: PANEL_ID,
    order: 72,
    label: () => ctx.locale.bind(NS)('nav'),
    locale: NS,
  }, (props) => <PanelIcon size={props.size ?? 18} active={props.active === true} />))

  // 输入框左侧的小入口：不用离开当前会话就能摸一局。
  ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
    name: 'conversation.input.left',
    id: PANEL_ID,
    order: 40,
    label: () => ctx.locale.bind(NS)('nav'),
    locale: NS,
  }, ComposerButton))
}
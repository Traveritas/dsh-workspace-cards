window.__ModuleLoader__.load({
  id: 'dsh-workspace-cards',
  factory(require) {
    'use strict';

    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback } = React;

    let createPortal = null;
    try {
      const rd = require('react-dom');
      if (rd && typeof rd.createPortal === 'function') createPortal = rd.createPortal;
    } catch (error) {
      createPortal = null;
    }

    const PLUGIN_ID = 'dsh-workspace-cards';
    const STORE_KEY = 'dsh.workspaceCards.v1';
    const SERIF = '"Source Serif 4", "Songti SC", "Noto Serif SC", serif';
    const NOOP_HOOK = () => undefined;
    const EXPAND_MS = 240;

    /* ────────────────────────── 文案 ────────────────────────── */

    const ZH = {
      workspaces: '工作区',
      search: '搜索会话',
      view: '视图选项',
      add: '添加工作区',
      back: '返回',
      more: '更多',
      collapse: '收起',
      newSession: '新会话',
      names: '名称',
      namesShow: '常显',
      namesHide: '仅悬停',
      sort: '排序',
      sortManual: '手动',
      sortRecent: '最近活跃',
      archive: '归档',
      archiveHide: '隐藏已归档',
      archiveAll: '全部对话',
      archiveOnly: '仅显示已归档',
      untitled: '未命名',
      emptyWorkspace: '还没有会话',
      addHint: '添加工作区…',
      expandMore: '展开其余 {n} 个会话',
      noMatch: '没有匹配的会话',
      searchPlaceholder: '搜索会话名称',
      iconTitle: '设置图标',
      renameTitle: '重命名工作区',
      deleteTitle: '删除工作区',
      iconChar: '字符',
      iconLib: '图标库',
      iconSvg: '自定义 SVG',
      iconCharHint: '一个字、一个字母或一个 emoji',
      pickFile: '选择 SVG 文件…',
      apply: '应用',
      save: '保存',
      cancel: '取消',
      clear: '清除图标',
      renameHint: '工作区标题',
      deleteWarn: '只删除工作区登记，会话与文件夹都不会被删除。会话会落到「未分组」。',
      delete: '删除',
      open: '打开',
      fork: '分叉',
      archiveIt: '归档',
      copyId: '复制会话 ID',
      copyOk: '已复制会话 ID',
      copyPath: '复制路径',
      copyPathOk: '已复制路径',
      archivedRow: '已归档',
      nameDup: '名字重复',
      nameEmpty: '名字不能为空',
      archivedOpenBlocked: '已归档的会话需要先取消归档',
      errorGeneric: '操作失败：{message}',
    };

    const EN = {
      workspaces: 'Workspaces',
      search: 'Search sessions',
      view: 'View options',
      add: 'Add workspace',
      back: 'Back',
      more: 'More',
      collapse: 'Collapse',
      newSession: 'New session',
      names: 'Names',
      namesShow: 'Always',
      namesHide: 'On hover',
      sort: 'Sort',
      sortManual: 'Manual',
      sortRecent: 'Recent',
      archive: 'Archive',
      archiveHide: 'Hide archived',
      archiveAll: 'All conversations',
      archiveOnly: 'Archived only',
      untitled: 'Untitled',
      emptyWorkspace: 'No sessions yet',
      addHint: 'Add a workspace…',
      expandMore: 'Show {n} more sessions',
      noMatch: 'No matching sessions',
      searchPlaceholder: 'Search session titles',
      iconTitle: 'Workspace icon',
      renameTitle: 'Rename workspace',
      deleteTitle: 'Delete workspace',
      iconChar: 'Character',
      iconLib: 'Library',
      iconSvg: 'Custom SVG',
      iconCharHint: 'One character, letter, or emoji',
      pickFile: 'Choose SVG file…',
      apply: 'Apply',
      save: 'Save',
      cancel: 'Cancel',
      clear: 'Clear icon',
      renameHint: 'Workspace title',
      deleteWarn: 'Only the workspace registration is removed. Sessions and folders stay; sessions move to Ungrouped.',
      delete: 'Delete',
      open: 'Open',
      fork: 'Fork',
      archiveIt: 'Archive',
      copyId: 'Copy session ID',
      copyOk: 'Session ID copied',
      copyPath: 'Copy path',
      copyPathOk: 'Path copied',
      archivedRow: 'Archived',
      nameDup: 'Name already used',
      nameEmpty: 'Name cannot be empty',
      archivedOpenBlocked: 'Unarchive this session before opening it',
      errorGeneric: 'Failed: {message}',
    };

    function fill(template, vars) {
      return String(template).replace(/\{(\w+)\}/g, (_, key) => (vars && vars[key] !== undefined ? String(vars[key]) : ''));
    }

    /* ────────────────────────── 存储 ────────────────────────── */

    const DEFAULT_STORE = {
      icons: {},
      order: [],
      showNames: true,
      sort: 'manual',
      archived: 'hide',
    };

    function readStore() {
      try {
        const raw = JSON.parse(window.localStorage.getItem(STORE_KEY) || 'null');
        if (!raw || typeof raw !== 'object') return { ...DEFAULT_STORE, icons: {}, order: [] };
        return {
          ...DEFAULT_STORE,
          ...raw,
          icons: raw.icons && typeof raw.icons === 'object' ? raw.icons : {},
          order: Array.isArray(raw.order) ? raw.order : [],
        };
      } catch (error) {
        return { ...DEFAULT_STORE, icons: {}, order: [] };
      }
    }

    function writeStore(value) {
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify({
          icons: value.icons,
          order: value.order,
          showNames: value.showNames,
          sort: value.sort,
          archived: value.archived,
        }));
      } catch (error) {
        /* 隐私模式下 localStorage 不可写，退化成内存态即可 */
      }
    }

    /* ────────────────────────── 小工具 ────────────────────────── */

    /** 两段式字标：分段取首字母（dsh-theme → dt），单段取前两个字（gaotie → ga）。 */
    function monogramOf(text) {
      const parts = String(text || '').trim().split(/[\s\-_./]+/).filter(Boolean);
      if (!parts.length) return { text: '·', count: 1 };
      const head = Array.from(parts[0]);
      if (parts.length === 1) {
        const chars = head.slice(0, 2).join('');
        return { text: chars || '·', count: chars.length };
      }
      const second = Array.from(parts[1])[0] || '';
      const text2 = (head[0] || '') + second;
      return { text: text2 || '·', count: text2.length };
    }

    /** 同一屏内撞车时把字标加长到 3 位，保证两两可辨。 */
    function monogramSet(titles) {
      const list = titles.map((title) => monogramOf(title));
      const groups = new Map();
      list.forEach((mono, index) => {
        if (!groups.has(mono.text)) groups.set(mono.text, []);
        groups.get(mono.text).push(index);
      });
      groups.forEach((indexes, text) => {
        if (indexes.length < 2) return;
        indexes.forEach((index) => {
          const parts = String(titles[index] || '').trim().split(/[\s\-_./]+/).filter(Boolean);
          let longer = text;
          if (parts.length > 1) {
            const tail = Array.from(parts[parts.length - 1]);
            longer = text + (tail[1] || tail[0] || '');
          } else {
            longer = Array.from(parts[0] || '').slice(0, 3).join('');
          }
          const chars = Array.from(longer || text);
          list[index] = { text: chars.join(''), count: chars.length };
        });
      });
      return list;
    }

    function toSet(value) {
      if (!value) return new Set();
      if (value instanceof Set) return value;
      if (Array.isArray(value)) return new Set(value);
      return new Set();
    }

    function sessionTime(session) {
      const value = session && session.updatedAt;
      return typeof value === 'number' ? value : 0;
    }

    function relativeTime(timestamp) {
      if (!timestamp) return '';
      const delta = Date.now() - timestamp;
      if (delta < 60 * 1000) return '刚刚';
      if (delta < 60 * 60 * 1000) return Math.floor(delta / 60000) + '分钟';
      if (delta < 24 * 60 * 60 * 1000) return Math.floor(delta / 3600000) + '小时';
      if (delta < 30 * 24 * 60 * 60 * 1000) return Math.floor(delta / 86400000) + '天';
      if (delta < 365 * 24 * 60 * 60 * 1000) return Math.floor(delta / (30 * 86400000)) + '个月';
      return Math.floor(delta / (365 * 86400000)) + '年';
    }

    function sanitizeSvg(markup) {
      return String(markup)
        .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, '')
        .replace(/<\s*foreignObject[\s\S]*?<\s*\/\s*foreignObject\s*>/gi, '')
        .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/javascript:/gi, '');
    }

    function statusOf(statuses, id) {
      if (!statuses) return null;
      if (typeof statuses.get === 'function') return statuses.get(id) || null;
      return statuses[id] || null;
    }

    function pendingOf(status) {
      if (!status || !status.pendingInteraction) return null;
      const kind = status.pendingInteraction.kind || status.pendingInteraction.type;
      return kind || 'pending';
    }

    /* ────────────────────────── 图标 ────────────────────────── */

    const PATHS = {
      search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'm16.2 16.2 4.3 4.3'],
      sliders: ['M4 7h16', 'M4 12h16', 'M4 17h16', 'M9 5l2 2-2 2-2-2Z', 'M15 10l2 2-2 2-2-2Z', 'M9 15l2 2-2 2-2-2Z'],
      add: ['M12 5v14', 'M5 12h14'],
      addFolder: ['M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z', 'M12 11v6', 'M9 14h6'],
      back: ['m14 6-6 6 6 6'],
      more: ['M6 12h.01', 'M12 12h.01', 'M18 12h.01'],
      close: ['M6 6l12 12', 'M18 6 6 18'],
      check: ['m5 12 4 4 10-10'],
      collapse: ['m6 14 6-6 6 6'],
      exit: ['M9 6 3 12l6 6', 'M4 12h11', 'M15 5h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4'],
      fork: ['M7 4v9a4 4 0 0 0 4 4h6', 'm14 13 3 4-3 4', 'M17 4v9'],
      archive: ['M4 7h16', 'M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7', 'M10 11h4'],
      copy: ['M9 9h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z', 'M5 15V4a2 2 0 0 1 2-2h9'],
      pen: ['M4 20l4-1L19 8a2 2 0 0 0-3-3L5 16Z', 'M14 5l3 3'],
      trash: ['M4 7h16', 'M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2', 'M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12'],
      palette: ['M12 3a9 9 0 1 0 0 18c1.6 0 2-1 2-2 0-1.6 1.4-2 3-2h1a3 3 0 0 0 3-3c0-6-4.5-11-9-11Z', 'M8 9h.01', 'M7 14h.01', 'M12 7h.01'],
      folder: ['M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'],
      code: ['m8 8-4 4 4 4', 'm16 8 4 4-4 4'],
      terminal: ['M3 5h18v14H3Z', 'm7 10 2 2-2 2', 'M12 14h4'],
      book: ['M5 4h6a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H5Z', 'M19 4h-2a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h2Z'],
      chart: ['M4 20V4', 'M4 20h16', 'M8 16v-4', 'M12 16V8', 'M16 16v-6'],
      database: ['M12 4c4 0 7 1.3 7 3s-3 3-7 3-7-1.3-7-3 3-3 7-3Z', 'M5 7v10c0 1.7 3 3 7 3s7-1.3 7-3V7'],
      robot: ['M8 8h8a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-5a3 3 0 0 1 3-3Z', 'M12 4v4', 'M9.5 13h.01', 'M14.5 13h.01'],
      spark: ['m12 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z'],
      leaf: ['M20 4C10 4 4 9 4 16c0 2 2 4 4 4 7 0 12-6 12-16Z', 'M6 18c3-5 7-8 11-9'],
      mountain: ['M3 19h18L14 6l-3 6-2-2Z'],
      cube: ['m12 3 8 4.5v9L12 21l-8-4.5v-9Z', 'M12 12l8-4.5', 'M12 12 4 7.5', 'M12 12v9'],
      wave: ['M3 12c3 0 3-5 6-5s3 10 6 10 3-5 6-5'],
      flask: ['M9 3h6', 'M10 3v6l-5 8a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-8V3'],
      flag: ['M6 3v18', 'M6 4h11l-2 4 2 4H6'],
      planet: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M5 17c8 3 14-1 14-1'],
    };

    const LIB_ICONS = ['folder', 'code', 'terminal', 'book', 'chart', 'database', 'robot', 'spark', 'leaf', 'mountain', 'cube', 'wave', 'flask', 'flag', 'planet', 'pen'];

    function Icon(props) {
      const paths = PATHS[props.name] || PATHS.folder;
      const size = props.size || 16;
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: props.weight || 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        focusable: 'false',
        style: props.style,
      }, paths.map((d, index) => h('path', { key: index, d })));
    }

    function IconNode(props) {
      const { spec, size, title } = props;
      if (spec && spec.kind === 'lib' && PATHS[spec.value]) {
        return h('span', { className: 'dwc-glyph', style: { width: size, height: size } }, h(Icon, { name: spec.value, size, weight: 1.5 }));
      }
      if (spec && spec.kind === 'svg' && spec.value) {
        return h('span', {
          className: 'dwc-glyph dwc-glyph-svg',
          style: { width: size, height: size },
          dangerouslySetInnerHTML: { __html: sanitizeSvg(spec.value) },
        });
      }
      const mono = props.glyph || monogramOf(title);
      const text = spec && spec.kind === 'char' && spec.value ? spec.value : mono.text;
      const count = spec && spec.kind === 'char' && spec.value ? Array.from(spec.value).length : mono.count;
      const ratio = count >= 3 ? 0.46 : count === 2 ? 0.62 : 0.88;
      return h('span', {
        className: 'dwc-glyph dwc-glyph-char',
        style: { width: size, height: size, fontSize: Math.round(size * ratio) + 'px' },
      }, text);
    }

    /* ────────────────────────── 样式 ────────────────────────── */

    const CSS = `
.dwc-root {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  padding: 0 4px;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
}
.dwc-root *, .dwc-root *::before, .dwc-root *::after { box-sizing: border-box; }

.dwc-head {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 36px;
  flex: 0 0 auto;
  padding: 0 2px;
  min-width: 0;
}
.dwc-head-label {
  flex: 1;
  min-width: 0;
  padding-left: 6px;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
  letter-spacing: 0.02em;
}

.dwc-ib {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: var(--dsw-radius-md);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  padding: 0;
  transition: background-color 120ms ease, color 120ms ease;
}
.dwc-ib:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.dwc-ib:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 1px; }

.dwc-search-row { display: flex; align-items: center; gap: 4px; flex: 1; min-width: 0; }
.dwc-input {
  flex: 1;
  min-width: 0;
  height: 28px;
  padding: 0 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-md);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  outline: none;
}
.dwc-input::placeholder { color: var(--dsw-alias-label-caption); }
.dwc-input:focus { border-color: var(--dsw-alias-state-business-primary); }

/* ── 舞台：网格与展开卡片共处一层 ── */
.dwc-stage { position: relative; flex: 1; min-height: 0; }

.dwc-grid {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  align-content: start;
  padding: 4px 2px 16px;
}
.dwc-grid, .dwc-sr, .dwc-panel-body { animation: dwc-in 160ms ease both; }
.dwc-grid[aria-hidden="true"] { pointer-events: none; }
@keyframes dwc-in { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }

.dwc-tile {
  position: relative;
  width: 100%;
  height: 76px;
  padding: 6px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 0;
  border-radius: 16px;
  background: var(--dsw-alias-bg-layer-2);
  box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  transition: transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease, border-radius 180ms ease;
}
.dwc-tile:hover {
  transform: translateY(-1px);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l2), var(--dsw-shadow-lv1);
}
.dwc-tile:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: 1px; }
.dwc-tile.is-current {
  color: var(--dsw-alias-label-primary);
  box-shadow: inset 0 0 0 1.5px var(--dsw-alias-state-business-primary);
}
.dwc-tile.is-dragging { opacity: 0.45; }
.dwc-tile.is-drop { box-shadow: inset 0 0 0 1.5px var(--dsw-alias-state-business-primary); }
.dwc-tile.is-compact { height: 64px; }

.dwc-tile-icon { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; }
.dwc-glyph { display: inline-flex; align-items: center; justify-content: center; overflow: hidden; }
.dwc-glyph-char { font-family: ${SERIF}; line-height: 1; letter-spacing: 0.01em; color: inherit; }
.dwc-glyph-svg svg { width: 100%; height: 100%; display: block; }
.dwc-glyph-svg { color: inherit; }
.dwc-tile-name-wrap { display: flex; justify-content: center; width: 100%; min-width: 0; }
.dwc-tile-name {
  max-width: 100%;
  font-size: 10px;
  line-height: 1.15;
  color: var(--dsw-alias-label-caption);
}
.dwc-tile:hover .dwc-tile-name, .dwc-tile.is-current .dwc-tile-name { color: var(--dsw-alias-label-secondary); }

.dwc-tile.dwc-add {
  background: transparent;
  box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l2);
  color: var(--dsw-alias-label-caption);
}
.dwc-tile.dwc-add:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-secondary); box-shadow: inset 0 0 0 1px var(--dsw-alias-border-l2); transform: none; }
.dwc-add-name { font-size: 10px; }

.dwc-badge { position: absolute; top: 8px; right: 8px; width: 7px; height: 7px; border-radius: 50%; }
.dwc-badge[data-kind="pending"] { background: var(--dsw-alias-state-warn-primary); }
.dwc-badge[data-kind="running"] { background: var(--dsw-alias-state-business-primary); animation: dwc-pulse 1.7s ease-in-out infinite; }
.dwc-badge[data-kind="done"] { background: transparent; box-shadow: inset 0 0 0 1.4px var(--dsw-alias-state-success-secondary); }
@keyframes dwc-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.45; transform: scale(0.78); } }

/* ── 展开后的卡片 ── */
.dwc-panel {
  position: absolute;
  inset: 0;
  z-index: 5;
  overflow: hidden;
  transform-origin: 0 0;
  border-radius: 20px;
  background-color: var(--dsw-alias-bg-base);
  background-image: linear-gradient(var(--dsw-alias-bg-layer-1), var(--dsw-alias-bg-layer-1));
  border: 1px solid var(--dsw-alias-border-l1);
  box-shadow: var(--dsw-shadow-lv2);
}
.dwc-panel-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  opacity: 0;
  transition: opacity 140ms ease;
}
.dwc-panel.is-open .dwc-panel-inner { opacity: 1; }
.dwc-panel.is-opening .dwc-panel-inner { transition-delay: 110ms; }

.dwc-panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  flex: 0 0 auto;
  padding: 0 8px 0 12px;
  cursor: pointer;
}
.dwc-panel-head.is-static { cursor: default; }
.dwc-panel-actions { flex: 0 0 auto; display: flex; align-items: center; gap: 2px; }
.dwc-collapse-hint { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; color: var(--dsw-alias-label-caption); transition: color 120ms ease; }
.dwc-panel-head:hover .dwc-collapse-hint { color: var(--dsw-alias-label-secondary); }
.dwc-panel-head-icon { flex: 0 0 auto; display: flex; width: 20px; height: 20px; align-items: center; justify-content: center; color: var(--dsw-alias-label-secondary); }
.dwc-scrolltext { display: block; min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.dwc-scrolltext-inner { display: inline-block; white-space: nowrap; transition-property: transform; transition-timing-function: linear; }

.dwc-panel-name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
}
.dwc-panel-header {
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
  border-radius: 20px 20px 0 0;
  transition: background-color 130ms ease, border-radius 170ms ease;
}
.dwc-panel-header:hover,
.dwc-panel-header:focus-within { background-color: var(--dsw-alias-interactive-bg-hover); border-radius: 20px 20px 14px 14px; }
.dwc-panel-header.is-static:hover { background-color: transparent; border-radius: 20px 20px 0 0; }
.dwc-panel-sub {
  display: flex;
  justify-content: center;
  padding: 0 12px;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  font-size: 11px;
  line-height: 1.4;
  color: var(--dsw-alias-label-caption);
  transition: max-height 170ms ease, opacity 130ms ease, padding-bottom 170ms ease;
}
.dwc-panel-header:hover .dwc-panel-sub,
.dwc-panel-header:focus-within .dwc-panel-sub {
  max-height: 30px;
  opacity: 1;
  padding: 2px 12px 8px;
}
.dwc-panel-sub .dwc-scrolltext { max-width: 100%; }
.dwc-panel-body { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; padding: 2px 6px 12px; }

.dwc-row {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  flex: 0 0 auto;
  padding: 0 4px 0 6px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
  text-align: left;
  font: inherit;
}
.dwc-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dwc-row.is-current { background: var(--dsw-alias-interactive-bg-hover); }
.dwc-row:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary); outline-offset: -2px; }
.dwc-row.is-archived { color: var(--dsw-alias-label-caption); }
.dwc-row-title { flex: 1; min-width: 0; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dwc-row-time { flex: 0 0 auto; font-size: 11px; color: var(--dsw-alias-label-caption); }
.dwc-row-more {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  opacity: 0;
  padding: 0;
}
.dwc-row:hover .dwc-row-more, .dwc-row-more:focus-visible { opacity: 1; }
.dwc-row-more:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }

.dwc-dot { flex: 0 0 auto; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; }
.dwc-dot i { display: block; width: 7px; height: 7px; border-radius: 50%; }
.dwc-dot[data-kind="pending"] i { background: var(--dsw-alias-state-warn-primary); }
.dwc-dot[data-kind="running"] i { background: var(--dsw-alias-state-business-primary); animation: dwc-pulse 1.7s ease-in-out infinite; }
.dwc-dot[data-kind="done"] i { background: transparent; box-shadow: inset 0 0 0 1.4px var(--dsw-alias-state-success-secondary); }
.dwc-dot[data-kind="idle"] i { display: none; }

.dwc-row-new { color: var(--dsw-alias-state-business-primary); }
.dwc-row-new .dwc-row-title { font-weight: 500; }

.dwc-more-row {
  flex: 0 0 auto;
  height: 28px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  cursor: pointer;
  text-align: left;
  padding: 0 8px;
}
.dwc-more-row:hover { color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-interactive-bg-hover); }

.dwc-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 12px;
  color: var(--dsw-alias-label-caption);
  font-size: 12px;
  text-align: center;
}
.dwc-empty-icon { opacity: 0.7; }

.dwc-sr { position: absolute; inset: 0; overflow-y: auto; padding: 2px 2px 12px; display: flex; flex-direction: column; gap: 2px; }
.dwc-sr-item { display: flex; flex-direction: column; gap: 2px; padding: 6px 8px; border: 0; border-radius: 10px; background: transparent; cursor: pointer; text-align: left; width: 100%; }
.dwc-sr-item:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dwc-sr-title { font-size: 13px; color: var(--dsw-alias-label-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dwc-sr-meta { font-size: 11px; color: var(--dsw-alias-label-caption); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.dwc-backdrop { position: fixed; inset: 0; z-index: 50; }
.dwc-pop {
  z-index: 60;
  width: 196px;
  padding: 4px;
  background: var(--dsw-alias-bg-layer-3);
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 14px;
  box-shadow: var(--dsw-shadow-lv2);
}
.dwc-mgroup + .dwc-mgroup { margin-top: 4px; padding-top: 4px; border-top: 1px solid var(--dsw-alias-border-l1); }
.dwc-mlabel { padding: 4px 8px 2px; font-size: 11px; color: var(--dsw-alias-label-caption); }
.dwc-mi {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 28px;
  padding: 0 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
}
.dwc-mi:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dwc-mi.is-danger { color: var(--dsw-alias-state-error-primary); }
.dwc-mi-label { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dwc-mi-icon { flex: 0 0 auto; color: var(--dsw-alias-label-tertiary); display: inline-flex; }

.dwc-toast {
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: 6px;
  z-index: 40;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-3);
  border: 1px solid var(--dsw-alias-border-l2);
  box-shadow: var(--dsw-shadow-lv1);
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
}

.dwc-pane { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 10px; padding: 4px 12px 14px; overflow-y: auto; }
.dwc-seg { display: flex; gap: 2px; padding: 2px; border-radius: 10px; background: var(--dsw-alias-bg-layer-2); }
.dwc-seg button {
  flex: 1;
  height: 24px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.dwc-seg button.is-on { background: var(--dsw-alias-bg-layer-1); color: var(--dsw-alias-label-primary); box-shadow: var(--dsw-shadow-lv1); }

.dwc-preview { display: flex; align-items: center; justify-content: center; height: 64px; border-radius: 14px; background: var(--dsw-alias-bg-layer-2); color: var(--dsw-alias-label-primary); }

.dwc-lib { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
.dwc-lib button {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}
.dwc-lib button:hover { color: var(--dsw-alias-label-primary); border-color: var(--dsw-alias-border-l2); }
.dwc-lib button.is-on { border-color: var(--dsw-alias-state-business-primary); color: var(--dsw-alias-label-primary); }

.dwc-textarea {
  width: 100%;
  min-height: 96px;
  resize: vertical;
  padding: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 11px;
  line-height: 1.5;
  outline: none;
}
.dwc-textarea:focus { border-color: var(--dsw-alias-state-business-primary); }

.dwc-hint { font-size: 11px; color: var(--dsw-alias-label-caption); }
.dwc-actions { display: flex; gap: 6px; justify-content: flex-end; }
.dwc-btn {
  height: 26px;
  padding: 0 12px;
  border-radius: 9px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.dwc-btn:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dwc-btn.is-primary { border-color: transparent; background: var(--dsw-alias-state-business-primary); color: var(--dsw-alias-label-primary-foreground); }
.dwc-btn.is-danger { border-color: transparent; background: var(--dsw-alias-state-error-primary); color: var(--dsw-alias-label-primary-foreground); }
.dwc-btn:disabled { opacity: 0.4; cursor: default; }

.dwc-rail { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 4px 0 12px; }
.dwc-root.is-rail { padding: 0; }
.dwc-rail button {
  position: relative;
  width: 36px;
  height: 36px;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
}
.dwc-rail button.is-current { color: var(--dsw-alias-label-primary); box-shadow: inset 0 0 0 1.5px var(--dsw-alias-state-business-primary); }

@media (prefers-reduced-motion: reduce) {
  .dwc-grid, .dwc-sr, .dwc-badge[data-kind="running"], .dwc-dot[data-kind="running"] i { animation: none; }
  .dwc-panel { transition: none; }
}
`;

    /* ────────────────────────── 基础控件 ────────────────────────── */

    function IconButton(props) {
      return h('button', {
        type: 'button',
        className: 'dwc-ib' + (props.className ? ' ' + props.className : ''),
        title: props.label,
        'aria-label': props.label,
        onClick: props.onClick,
      }, h(Icon, { name: props.icon, size: props.size || 16 }));
    }

    function Popover(props) {
      const ref = useRef(null);
      const anchorRef = useRef(props.anchor);
      const [style, setStyle] = useState({ position: 'fixed', left: -9999, top: -9999, visibility: 'hidden' });

      useLayoutEffect(() => {
        const node = ref.current;
        const anchor = anchorRef.current;
        if (!node || !anchor || typeof anchor.getBoundingClientRect !== 'function') return;
        const box = anchor.getBoundingClientRect();
        const menu = node.getBoundingClientRect();
        let left = box.right - menu.width;
        left = Math.max(8, Math.min(left, window.innerWidth - menu.width - 8));
        let top = box.bottom + 6;
        if (top + menu.height > window.innerHeight - 8) top = Math.max(8, box.top - 6 - menu.height);
        setStyle({ position: 'fixed', left, top, visibility: 'visible' });
      }, []);

      const node = h('div', { ref, className: 'dwc-pop', style, role: 'menu' }, props.children);
      return createPortal ? createPortal(node, document.body) : node;
    }

    function MenuItem(props) {
      return h('button', {
        type: 'button',
        role: 'menuitem',
        className: 'dwc-mi' + (props.danger ? ' is-danger' : ''),
        onClick: props.onClick,
      },
      props.icon ? h('span', { className: 'dwc-mi-icon' }, h(Icon, { name: props.icon, size: 14 })) : null,
      h('span', { className: 'dwc-mi-label' }, props.label),
      props.checked ? h(Icon, { name: 'check', size: 14 }) : null);
    }

    /* ────────────────────────── 悬停横向滚动 ────────────────────────── */

    /** 截断文本：静止时省略号，悬停时按 0.05px/ms 滚到末端，指针离开回到开头。 */
    function ScrollingText(props) {
      const ref = useRef(null);
      const [selfHover, setSelfHover] = useState(false);
      const hover = props.active === undefined ? selfHover : props.active;
      const [offset, setOffset] = useState(0);
      const [duration, setDuration] = useState(600);

      useEffect(() => {
        if (!hover) { setOffset(0); return undefined; }
        const el = ref.current;
        if (!el) return undefined;
        const inner = el.firstElementChild;
        const contentWidth = inner ? inner.offsetWidth : el.scrollWidth;
        const distance = contentWidth - el.clientWidth;
        if (distance < 1) return undefined;
        setDuration(Math.max(480, Math.round(distance / 0.05)));
        const raf = requestAnimationFrame(() => setOffset(distance));
        return () => { cancelAnimationFrame(raf); setOffset(0); };
      }, [hover]);

      const className = 'dwc-scrolltext' + (props.className ? ' ' + props.className : '');
      return h('span', {
        ref,
        className,
        onMouseEnter: () => setSelfHover(true),
        onMouseLeave: () => setSelfHover(false),
      }, hover
        ? h('span', {
          className: 'dwc-scrolltext-inner',
          style: {
            transform: 'translateX(' + (-offset) + 'px)',
            transitionDuration: (offset ? duration : 160) + 'ms',
          },
        }, props.text)
        : props.text);
    }

    /* ────────────────────────── 会话行 ────────────────────────── */
    function SessionRow(props) {
      const { session, status, current, archived, t, onOpen, onMenu } = props;
      const pending = pendingOf(status);
      const running = status && status.running;
      const done = status && status.completionUnread;
      const kind = pending ? 'pending' : running ? 'running' : done ? 'done' : 'idle';
      const title = (session && session.displayTitle) || t('untitled');
      const time = session && relativeTime(sessionTime(session));

      return h('div', {
        className: 'dwc-row' + (current ? ' is-current' : '') + (archived ? ' is-archived' : ''),
        role: 'button',
        tabIndex: 0,
        title: archived ? t('archivedRow') : title,
        onClick: onOpen,
        onKeyDown: (event) => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onOpen(); }
        },
        onContextMenu: (event) => { event.preventDefault(); onMenu(event.currentTarget); },
      },
      h('span', { className: 'dwc-dot', 'data-kind': kind }, h('i', null)),
      h('span', { className: 'dwc-row-title' }, title),
      archived ? h('span', { className: 'dwc-row-time' }, t('archivedRow')) : (time ? h('span', { className: 'dwc-row-time' }, time) : null),
      h('button', {
        type: 'button',
        className: 'dwc-row-more',
        title: t('more'),
        'aria-label': t('more'),
        onClick: (event) => { event.stopPropagation(); onMenu(event.currentTarget); },
      }, h(Icon, { name: 'more', size: 14 })));
    }

    /* ────────────────────────── 图标编辑 ────────────────────────── */

    function IconScreen(props) {
      const { spec, t, onSaveIcon, onClear, onBack } = props;
      const [tab, setTab] = useState(spec && spec.kind ? spec.kind : 'char');
      const [char, setChar] = useState(spec && spec.kind === 'char' ? spec.value : '');
      const [lib, setLib] = useState(spec && spec.kind === 'lib' ? spec.value : '');
      const [svg, setSvg] = useState(spec && spec.kind === 'svg' ? spec.value : '');
      const fileRef = useRef(null);

      const draft = tab === 'char'
        ? { kind: 'char', value: Array.from(char.trim())[0] || '' }
        : tab === 'lib'
          ? { kind: 'lib', value: lib }
          : { kind: 'svg', value: svg };

      const preview = draft.kind === 'char'
        ? (draft.value ? draft : null)
        : draft.kind === 'lib'
          ? (draft.value ? draft : null)
          : (draft.value.trim() ? draft : null);

      return h('div', { className: 'dwc-pane' },
        h('div', { className: 'dwc-preview' }, h(IconNode, { spec: preview, size: 44, title: props.title })),
        h('div', { className: 'dwc-seg' },
          h('button', { type: 'button', className: tab === 'char' ? 'is-on' : '', onClick: () => setTab('char') }, t('iconChar')),
          h('button', { type: 'button', className: tab === 'lib' ? 'is-on' : '', onClick: () => setTab('lib') }, t('iconLib')),
          h('button', { type: 'button', className: tab === 'svg' ? 'is-on' : '', onClick: () => setTab('svg') }, t('iconSvg'))),

        tab === 'char' ? h('div', null,
          h('input', {
            className: 'dwc-input',
            value: char,
            maxLength: 4,
            placeholder: '◆ 星 叁 🪷',
            onChange: (event) => setChar(event.target.value),
          }),
          h('div', { className: 'dwc-hint', style: { marginTop: 6 } }, t('iconCharHint'))) : null,

        tab === 'lib' ? h('div', { className: 'dwc-lib' },
          LIB_ICONS.map((name) => h('button', {
            key: name,
            type: 'button',
            className: lib === name ? 'is-on' : '',
            title: name,
            onClick: () => setLib(name),
          }, h(Icon, { name, size: 16 })))) : null,

        tab === 'svg' ? h('div', null,
          h('textarea', {
            className: 'dwc-textarea',
            value: svg,
            placeholder: '<svg viewBox="0 0 24 24">…</svg>',
            onChange: (event) => setSvg(event.target.value),
          }),
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 } },
            h('button', { type: 'button', className: 'dwc-btn', onClick: () => fileRef.current && fileRef.current.click() }, t('pickFile')),
            h('input', {
              ref: fileRef,
              type: 'file',
              accept: '.svg,image/svg+xml',
              style: { display: 'none' },
              onChange: (event) => {
                const file = event.target.files && event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setSvg(String(reader.result || ''));
                reader.readAsText(file);
                event.target.value = '';
              },
            }))) : null,

        h('div', { className: 'dwc-actions' },
          h('button', { type: 'button', className: 'dwc-btn', onClick: () => { onClear(); onBack(); } }, t('clear')),
          h('button', { type: 'button', className: 'dwc-btn is-primary', disabled: !preview, onClick: () => { if (preview) onSaveIcon(preview); onBack(); } }, t('apply'))));
    }

    function RenameScreen(props) {
      const { ws, items, t, onSave, onBack } = props;
      const [value, setValue] = useState(ws.title || '');
      const trimmed = value.trim();
      const duplicate = items.some((item) => item.workspaceId !== ws.workspaceId && item.title === trimmed);
      const error = !trimmed ? t('nameEmpty') : duplicate ? t('nameDup') : '';
      return h('div', { className: 'dwc-pane' },
        h('input', {
          className: 'dwc-input',
          autoFocus: true,
          value,
          placeholder: t('renameHint'),
          onChange: (event) => setValue(event.target.value),
          onKeyDown: (event) => { if (event.key === 'Enter' && !error) onSave(trimmed); },
        }),
        error ? h('div', { className: 'dwc-hint', style: { color: 'var(--dsw-alias-state-error-primary)' } }, error) : null,
        h('div', { className: 'dwc-actions' },
          h('button', { type: 'button', className: 'dwc-btn', onClick: onBack }, t('cancel')),
          h('button', { type: 'button', className: 'dwc-btn is-primary', disabled: !!error || trimmed === ws.title, onClick: () => onSave(trimmed) }, t('save'))));
    }

    function DeleteScreen(props) {
      const { ws, t, onDelete, onBack } = props;
      return h('div', { className: 'dwc-pane' },
        h('div', { className: 'dwc-hint', style: { lineHeight: 1.7 } }, t('deleteWarn')),
        h('div', { className: 'dwc-hint', style: { color: 'var(--dsw-alias-label-secondary)' } }, ws.path),
        h('div', { className: 'dwc-actions' },
          h('button', { type: 'button', className: 'dwc-btn', onClick: onBack }, t('cancel')),
          h('button', { type: 'button', className: 'dwc-btn is-danger', onClick: onDelete }, t('delete'))));
    }

    /* ────────────────────────── 根组件 ────────────────────────── */

    function WorkspaceCards(props) {
      const api = props.api || {};
      const t = (key, vars) => fill(api.t ? api.t(key) : key, vars);
      const wide = props.wide !== false;
      const apiRef = useRef(api);
      apiRef.current = api;

      const useW = typeof props.useWorkspaces === 'function' ? props.useWorkspaces : NOOP_HOOK;
      const useS = typeof props.useSessions === 'function' ? props.useSessions : NOOP_HOOK;
      const useStatus = typeof props.useSessionStatus === 'function' ? props.useSessionStatus : NOOP_HOOK;
      const usePanel = typeof props.usePanelInfo === 'function' ? props.usePanelInfo : NOOP_HOOK;

      const wsnap = useW((state) => state) || {};
      const sessionSnap = useS((state) => state) || {};
      const statuses = useStatus((state) => state) || null;
      const panelActive = !!usePanel((info) => !!info && info.activePanelId !== null);

      const items = Array.isArray(wsnap.items) ? wsnap.items : [];
      const byId = sessionSnap.byId || {};
      const archived = useMemo(() => toSet(wsnap.archivedSessionIds), [wsnap.archivedSessionIds]);

      const [store, setStoreState] = useState(readStore);
      const [expanded, setExpanded] = useState(null);
      const [panelOpen, setPanelOpen] = useState(false);
      const [panelMode, setPanelMode] = useState('sessions');
      const [searchOpen, setSearchOpen] = useState(false);
      const [query, setQuery] = useState('');
      const [remote, setRemote] = useState([]);
      const [reveal, setReveal] = useState(0);
      const [stageHeight, setStageHeight] = useState(0);
      const [menu, setMenu] = useState(null);
      const [toast, setToast] = useState(null);
      const [dragId, setDragId] = useState(null);
      const [dropId, setDropId] = useState(null);
      const [hoverTile, setHoverTile] = useState(null);
      const rootRef = useRef(null);
      const stageRef = useRef(null);
      const panelRef = useRef(null);
      const closingRef = useRef(false);

      const patchStore = useCallback((patch) => {
        setStoreState((prev) => {
          const next = { ...prev, ...patch };
          writeStore(next);
          return next;
        });
      }, []);

      useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(() => setToast(null), 3200);
        return () => clearTimeout(timer);
      }, [toast]);

      useEffect(() => () => {
        if (panelRef.current) {
          try { panelRef.current.getAnimations().forEach((anim) => anim.cancel()); } catch (error) { /* noop */ }
        }
      }, []);

      useLayoutEffect(() => {
        if (!expanded) { setPanelOpen(false); return undefined; }
        const el = panelRef.current;
        const stage = stageRef.current;
        setPanelOpen(false);
        closingRef.current = false;
        if (!el || !stage) return undefined;

        const box = stage.getBoundingClientRect();
        const from = expanded.from;
        const sx = from.width / Math.max(1, box.width);
        const sy = from.height / Math.max(1, box.height);
        let animation = null;
        try {
          animation = el.animate([
            {
              transform: 'translate(' + from.left + 'px, ' + from.top + 'px) scale(' + sx + ', ' + sy + ')',
              borderRadius: '16px',
            },
            { transform: 'none', borderRadius: '20px' },
          ], { duration: EXPAND_MS, easing: 'cubic-bezier(.2, .8, .2, 1)' });
        } catch (error) {
          animation = null;
        }
        const timer = setTimeout(() => setPanelOpen(true), 100);
        return () => {
          clearTimeout(timer);
          if (animation) { try { animation.cancel(); } catch (error) { /* noop */ } }
        };
      }, [expanded && expanded.id]);

      useEffect(() => { setReveal(0); setPanelMode('sessions'); }, [expanded && expanded.id]);

      useEffect(() => {
        const el = stageRef.current;
        if (!el) return undefined;
        const update = () => setStageHeight(el.clientHeight);
        update();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
      }, [wide]);

      const bodyRoom = () => Math.max(0, (stageHeight || 528) - 44 - 30);

      useEffect(() => {
        if (!wide) {
          setExpanded(null);
          setSearchOpen(false);
        }
      }, [wide]);

      useEffect(() => {
        if (expanded && !items.some((item) => item.workspaceId === expanded.id)) {
          setExpanded(null);
        }
      }, [expanded, items]);

      const currentId = useMemo(() => {
        if (panelActive) return null;
        const ids = Array.isArray(sessionSnap.ids) ? sessionSnap.ids : Object.keys(byId);
        for (const id of ids) {
          const session = byId[id];
          if (session && session.retainedBy && (session.retainedBy.mainView || 0) > 0) return id;
        }
        return null;
      }, [sessionSnap.ids, byId, panelActive]);

      const visibleIdsOf = useCallback((ws) => {
        const ids = Array.isArray(ws.sessionIds) ? ws.sessionIds : [];
        const out = [];
        for (const id of ids) {
          const session = byId[id];
          if (!session) continue;
          if (session.origin === 'subagent') continue;
          const isArchived = archived.has(id);
          if (store.archived === 'hide' && isArchived) continue;
          if (store.archived === 'only' && !isArchived) continue;
          if (session.blank && id !== currentId) continue;
          out.push(id);
        }
        out.sort((a, b) => sessionTime(byId[b]) - sessionTime(byId[a]));
        if (currentId && out.includes(currentId) && byId[currentId] && byId[currentId].blank) {
          out.splice(out.indexOf(currentId), 1);
          out.unshift(currentId);
        }
        return out;
      }, [byId, archived, store.archived, currentId]);

      const badgeOf = useCallback((ids) => {
        let running = false;
        let done = false;
        for (const id of ids) {
          const status = statusOf(statuses, id);
          if (!status) continue;
          if (pendingOf(status)) return 'pending';
          if (status.running) running = true;
          if (status.completionUnread) done = true;
        }
        return running ? 'running' : done ? 'done' : null;
      }, [statuses]);

      const cards = useMemo(() => {
        const orderIndex = new Map(store.order.map((id, index) => [id, index]));
        const list = items.map((ws, index) => {
          const ids = visibleIdsOf(ws);
          const latest = ids.reduce((max, id) => Math.max(max, sessionTime(byId[id])), 0);
          return {
            ws,
            index,
            ids,
            latest,
            badge: badgeOf(ids),
            current: !!currentId && (ws.sessionIds || []).includes(currentId),
            archivedOnly: store.archived === 'only' && !ids.some((id) => archived.has(id)),
          };
        }).filter((card) => !card.archivedOnly);

        if (store.sort === 'recent') {
          list.sort((a, b) => b.latest - a.latest || a.index - b.index);
        } else {
          list.sort((a, b) => {
            const ai = orderIndex.has(a.ws.workspaceId) ? orderIndex.get(a.ws.workspaceId) : 1e9 + a.index;
            const bi = orderIndex.has(b.ws.workspaceId) ? orderIndex.get(b.ws.workspaceId) : 1e9 + b.index;
            return ai - bi;
          });
        }
        return list;
      }, [items, byId, visibleIdsOf, badgeOf, archived, store.order, store.sort, store.archived, currentId]);

      const wsById = useMemo(() => {
        const map = new Map();
        for (const item of items) map.set(item.workspaceId, item);
        return map;
      }, [items]);

      const showToast = useCallback((text) => setToast(text), []);

      const run = useCallback(async (operation, fallback) => {
        try {
          await operation();
        } catch (error) {
          const message = (error && (error.message || error.code)) || 'unknown';
          showToast(t('errorGeneric', { message }) || fallback || message);
        }
      }, [showToast, t]);

      const collapse = useCallback(() => {
        if (!expanded || closingRef.current) return;
        closingRef.current = true;
        setPanelMode('sessions');
        setPanelOpen(false);

        const el = panelRef.current;
        const stage = stageRef.current;
        const card = stage ? stage.querySelector('[data-ws-id="' + expanded.id + '"]') : null;
        const done = () => {
          setExpanded(null);
          closingRef.current = false;
        };
        if (!el || !stage || !card) { done(); return; }

        const box = stage.getBoundingClientRect();
        const rect = card.getBoundingClientRect();
        const sx = rect.width / Math.max(1, box.width);
        const sy = rect.height / Math.max(1, box.height);
        let animation = null;
        try {
          animation = el.animate([
            { transform: 'none', borderRadius: '20px' },
            {
              transform: 'translate(' + (rect.left - box.left) + 'px, ' + (rect.top - box.top) + 'px) scale(' + sx + ', ' + sy + ')',
              borderRadius: '16px',
            },
          ], { duration: EXPAND_MS, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' });
        } catch (error) {
          animation = null;
        }
        if (animation) animation.onfinish = done; else done();
      }, [expanded]);

      const openCard = useCallback((workspaceId, element) => {
        const stage = stageRef.current;
        if (!stage || !element) return;
        const box = stage.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        try { element.blur(); } catch (error) { /* noop */ }
        setExpanded({
          id: workspaceId,
          from: {
            left: rect.left - box.left,
            top: rect.top - box.top,
            width: rect.width,
            height: rect.height,
          },
        });
        setPanelMode('sessions');
      }, []);

      const openSearch = useCallback(() => {
        if (expanded) { setExpanded(null); }
        setSearchOpen(true);
        setQuery('');
        setRemote([]);
      }, [expanded]);

      const closeSearch = useCallback(() => {
        setSearchOpen(false);
        setQuery('');
        setRemote([]);
      }, []);

      const selectSession = useCallback((sessionId) => {
        if (archived.has(sessionId)) {
          showToast(t('archivedOpenBlocked'));
          return;
        }
        api.openSession(sessionId);
      }, [api, archived, showToast, t]);

      useEffect(() => {
        const onKeyDown = (event) => {
          if (event.key !== 'Escape') return;
          if (menu) { setMenu(null); return; }
          if (searchOpen) { setSearchOpen(false); setQuery(''); return; }
          if (expanded && panelMode !== 'sessions') { setPanelMode('sessions'); return; }
          if (expanded) { collapse(); }
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
      }, [menu, searchOpen, expanded, panelMode, collapse]);

      useEffect(() => {
        if (!searchOpen) return undefined;
        const text = query.trim();
        setRemote([]);
        const service = apiRef.current;
        if (text.length < 2 || typeof service.search !== 'function') return undefined;
        const controller = new AbortController();
        const timer = setTimeout(() => {
          Promise.resolve(service.search(text, controller.signal)).then((result) => {
            if (controller.signal.aborted) return;
            const value = result && result.ok ? result.value : null;
            setRemote(value && Array.isArray(value.items) ? value.items : []);
          }).catch(() => {});
        }, 250);
        return () => {
          clearTimeout(timer);
          controller.abort();
        };
      }, [query, searchOpen]);

      const searchResults = useMemo(() => {
        const text = query.trim().toLowerCase();
        if (!text) return [];
        const rows = [];
        const seen = new Set();
        for (const ws of items) {
          const wsHit = String(ws.title || '').toLowerCase().includes(text) || String(ws.path || '').toLowerCase().includes(text);
          for (const id of ws.sessionIds || []) {
            const session = byId[id];
            if (!session || session.blank) continue;
            const titleHit = String(session.displayTitle || '').toLowerCase().includes(text);
            if (!wsHit && !titleHit) continue;
            if (seen.has(id)) continue;
            seen.add(id);
            rows.push({ id, title: session.displayTitle || t('untitled'), ws: ws.title, snippet: '' });
          }
        }
        for (const hit of remote) {
          const id = hit.sessionId || hit.id;
          if (!id || seen.has(id)) continue;
          seen.add(id);
          const session = byId[id];
          const ws = items.find((item) => (item.sessionIds || []).includes(id));
          rows.push({ id, title: (session && session.displayTitle) || t('untitled'), ws: ws ? ws.title : '', snippet: hit.snippet || '' });
        }
        return rows.slice(0, 20);
      }, [query, items, byId, remote, t]);

      const copySessionId = useCallback((sessionId) => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(sessionId).then(() => showToast(t('copyOk'))).catch(() => {});
          }
        } catch (error) {
          /* 剪贴板不可用时静默 */
        }
      }, [showToast, t]);

      const sessionMenu = useCallback((sessionId, anchor) => {
        setMenu({
          anchor,
          render: (close) => h(React.Fragment, null,
            h(MenuItem, { icon: 'exit', label: t('open'), onClick: () => { close(); selectSession(sessionId); } }),
            h(MenuItem, { icon: 'fork', label: t('fork'), onClick: () => { close(); run(() => api.forkSession(sessionId)); } }),
            h(MenuItem, { icon: 'archive', label: t('archiveIt'), onClick: () => { close(); run(() => api.archiveSession(sessionId)); } }),
            h(MenuItem, { icon: 'copy', label: t('copyId'), onClick: () => { close(); copySessionId(sessionId); } })),
        });
      }, [api, copySessionId, run, selectSession, t]);

      const copyPath = useCallback((ws) => {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText && ws.path) {
            navigator.clipboard.writeText(ws.path).then(() => showToast(t('copyPathOk'))).catch(() => {});
          }
        } catch (error) {
          /* 剪贴板不可用时静默 */
        }
      }, [showToast, t]);

      const workspaceMenu = useCallback((ws, anchor) => {
        setMenu({
          anchor,
          render: (close) => h(React.Fragment, null,
            h(MenuItem, { icon: 'copy', label: t('copyPath'), onClick: () => { close(); copyPath(ws); } }),
            h(MenuItem, { icon: 'palette', label: t('iconTitle'), onClick: () => { close(); setPanelMode('icon'); } }),
            h(MenuItem, { icon: 'pen', label: t('renameTitle'), onClick: () => { close(); setPanelMode('rename'); } }),
            h(MenuItem, { icon: 'trash', label: t('deleteTitle'), danger: true, onClick: () => { close(); setPanelMode('delete'); } })),
        });
      }, [copyPath, t]);

      const viewMenu = useCallback((anchor) => {
        const group = (label, options) => h('div', { className: 'dwc-mgroup', key: label },
          h('div', { className: 'dwc-mlabel' }, label),
          options.map((option) => h(MenuItem, {
            key: option.key,
            label: option.label,
            checked: option.checked,
            onClick: option.onClick,
          })));
        setMenu({
          anchor,
          render: (close) => h(React.Fragment, null,
            group(t('names'), [
              { key: 'show', label: t('namesShow'), checked: store.showNames, onClick: () => { close(); patchStore({ showNames: true }); } },
              { key: 'hide', label: t('namesHide'), checked: !store.showNames, onClick: () => { close(); patchStore({ showNames: false }); } },
            ]),
            group(t('sort'), [
              { key: 'manual', label: t('sortManual'), checked: store.sort === 'manual', onClick: () => { close(); patchStore({ sort: 'manual' }); } },
              { key: 'recent', label: t('sortRecent'), checked: store.sort === 'recent', onClick: () => { close(); patchStore({ sort: 'recent' }); } },
            ]),
            group(t('archive'), [
              { key: 'hide', label: t('archiveHide'), checked: store.archived === 'hide', onClick: () => { close(); patchStore({ archived: 'hide' }); } },
              { key: 'all', label: t('archiveAll'), checked: store.archived === 'all', onClick: () => { close(); patchStore({ archived: 'all' }); } },
              { key: 'only', label: t('archiveOnly'), checked: store.archived === 'only', onClick: () => { close(); patchStore({ archived: 'only' }); } },
            ])),
        });
      }, [patchStore, store, t]);

      const addWorkspace = useCallback(() => {
        run(async () => {
          const path = await api.pickDirectory();
          if (path) await api.createWorkspace(path);
        });
      }, [api, run]);

      const commitOrder = useCallback((fromId, toId) => {
        if (!fromId || !toId || fromId === toId) return;
        const ids = cards.map((card) => card.ws.workspaceId).filter((id) => id !== fromId);
        const at = ids.indexOf(toId);
        if (at < 0) return;
        ids.splice(at, 0, fromId);
        patchStore({ order: ids });
      }, [cards, patchStore]);

      const moveFocus = useCallback((event) => {
        const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'];
        if (keys.indexOf(event.key) < 0) return;
        const nodes = Array.from(rootRef.current ? rootRef.current.querySelectorAll('.dwc-tile') : []);
        const index = nodes.indexOf(document.activeElement);
        if (index < 0) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'ArrowRight') next = index + 1;
        if (event.key === 'ArrowLeft') next = index - 1;
        if (event.key === 'ArrowDown') next = index + 3;
        if (event.key === 'ArrowUp') next = index - 3;
        if (next >= 0 && next < nodes.length) nodes[next].focus();
      }, []);

      /* ── 头部（始终是工作区区头，不随展开变化）── */

      function headerNode() {
        if (searchOpen) {
          return h('div', { className: 'dwc-head' },
            h('div', { className: 'dwc-search-row' },
              h('input', {
                className: 'dwc-input',
                autoFocus: true,
                value: query,
                placeholder: t('searchPlaceholder'),
                onChange: (event) => setQuery(event.target.value),
                onKeyDown: (event) => { if (event.key === 'Escape') closeSearch(); },
              }),
              h(IconButton, { icon: 'close', label: t('back'), onClick: closeSearch })));
        }

        return h('div', { className: 'dwc-head' },
          h('span', { className: 'dwc-head-label' }, t('workspaces')),
          h(IconButton, { icon: 'search', label: t('search'), onClick: openSearch }),
          h(IconButton, { icon: 'sliders', label: t('view'), onClick: (event) => viewMenu(event.currentTarget) }),
          h(IconButton, { icon: 'addFolder', label: t('add'), onClick: addWorkspace }));
      }

      /* ── 网格 ── */

      function gridNode() {
        if (!cards.length && store.archived === 'only') {
          return h('div', { className: 'dwc-empty' },
            h('span', { className: 'dwc-empty-icon' }, h(Icon, { name: 'archive', size: 22 })),
            h('span', null, t('noMatch')));
        }

        const monos = monogramSet(cards.map((card) => card.ws.title));

        const tiles = cards.map((card, cardIndex) => {
          const ws = card.ws;
          return h('button', {
            key: ws.workspaceId,
            type: 'button',
            'data-ws-id': ws.workspaceId,
            className: 'dwc-tile'
              + (card.current ? ' is-current' : '')
              + (store.showNames ? '' : ' is-compact')
              + (dragId === ws.workspaceId ? ' is-dragging' : '')
              + (dropId === ws.workspaceId ? ' is-drop' : ''),
            title: store.showNames ? undefined : ws.title,
            'aria-label': ws.title + (ws.path ? ' · ' + ws.path : ''),
            onMouseEnter: () => setHoverTile(ws.workspaceId),
            onMouseLeave: () => setHoverTile((current) => (current === ws.workspaceId ? null : current)),
            draggable: store.sort === 'manual',
            onClick: (event) => openCard(ws.workspaceId, event.currentTarget),
            onKeyDown: (event) => {
              if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openCard(ws.workspaceId, event.currentTarget); }
            },
            onDragStart: (event) => {
              setDragId(ws.workspaceId);
              try { event.dataTransfer.setData('text/plain', ws.workspaceId); } catch (error) { /* noop */ }
              event.dataTransfer.effectAllowed = 'move';
            },
            onDragOver: (event) => {
              if (!dragId || dragId === ws.workspaceId) return;
              event.preventDefault();
              setDropId(ws.workspaceId);
            },
            onDragLeave: () => { if (dropId === ws.workspaceId) setDropId(null); },
            onDrop: (event) => {
              event.preventDefault();
              commitOrder(dragId, ws.workspaceId);
              setDragId(null);
              setDropId(null);
            },
            onDragEnd: () => { setDragId(null); setDropId(null); },
          },
          h('span', { className: 'dwc-tile-icon' },
            h(IconNode, { spec: store.icons[ws.workspaceId], size: 26, title: ws.title, glyph: monos[cardIndex] })),
          store.showNames ? h('span', { className: 'dwc-tile-name-wrap' },
            h(ScrollingText, { className: 'dwc-tile-name', text: ws.title, active: hoverTile === ws.workspaceId })) : null,
          card.badge ? h('i', { className: 'dwc-badge', 'data-kind': card.badge }) : null);
        });

        tiles.push(h('button', {
          key: '__add',
          type: 'button',
          className: 'dwc-tile dwc-add',
          title: t('add'),
          onClick: addWorkspace,
        },
        h('span', { className: 'dwc-tile-icon' }, h(Icon, { name: 'add', size: 18 })),
        store.showNames ? h('span', { className: 'dwc-tile-name dwc-add-name' }, t('addHint')) : null));

        return h('div', { className: 'dwc-grid', role: 'grid', 'aria-label': t('workspaces'), onKeyDown: moveFocus, 'aria-hidden': expanded ? 'true' : undefined }, tiles);
      }

      /* ── 展开的卡片 ── */

      function panelBody(ws) {
        if (panelMode === 'icon') {
          return h(IconScreen, {
            spec: store.icons[ws.workspaceId],
            title: ws.title,
            t,
            onBack: () => setPanelMode('sessions'),
            onSaveIcon: (spec) => {
              const icons = { ...store.icons };
              icons[ws.workspaceId] = spec;
              patchStore({ icons });
            },
            onClear: () => {
              const icons = { ...store.icons };
              delete icons[ws.workspaceId];
              patchStore({ icons });
            },
          });
        }
        if (panelMode === 'rename') {
          return h(RenameScreen, {
            ws,
            items,
            t,
            onBack: () => setPanelMode('sessions'),
            onSave: (title) => {
              run(() => api.renameWorkspace(ws.workspaceId, title)).then(() => setPanelMode('sessions'));
            },
          });
        }
        if (panelMode === 'delete') {
          return h(DeleteScreen, {
            ws,
            t,
            onBack: () => setPanelMode('sessions'),
            onDelete: () => {
              run(() => api.deleteWorkspace(ws.workspaceId)).then(() => {
                setPanelMode('sessions');
                setExpanded(null);
                setPanelOpen(false);
              });
            },
          });
        }

        const ids = visibleIdsOf(ws);
        const maxPlain = Math.max(1, Math.floor((bodyRoom() - 34) / 34));
        const maxWithMore = Math.max(1, Math.floor((bodyRoom() - 64) / 34));
        const want = maxPlain + reveal;
        const take = want >= ids.length ? ids.length : Math.max(1, maxWithMore + reveal);
        const shown = ids.slice(0, take);
        const rest = ids.length - shown.length;

        const rows = shown.map((id) => h(SessionRow, {
          key: id,
          session: byId[id],
          status: statusOf(statuses, id),
          current: id === currentId,
          archived: archived.has(id),
          t,
          onOpen: () => selectSession(id),
          onMenu: (anchor) => sessionMenu(id, anchor),
        }));

        return h('div', { className: 'dwc-panel-body', role: 'list' },
          h('div', {
            className: 'dwc-row dwc-row-new',
            role: 'button',
            tabIndex: 0,
            onClick: () => run(() => api.startSession(ws.workspaceId)),
            onKeyDown: (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); run(() => api.startSession(ws.workspaceId)); } },
          },
          h('span', { className: 'dwc-dot' }, h(Icon, { name: 'add', size: 14 })),
          h('span', { className: 'dwc-row-title' }, t('newSession'))),
          rows.length ? rows : h('div', { className: 'dwc-empty' }, h('span', null, t('emptyWorkspace'))),
          rest > 0 ? h('button', {
            type: 'button',
            className: 'dwc-more-row',
            onClick: () => setReveal((value) => value + maxWithMore),
          }, t('expandMore', { n: rest })) : null);
      }

      function panelHead(ws) {
        if (panelMode !== 'sessions') {
          const label = panelMode === 'icon' ? t('iconTitle') : panelMode === 'rename' ? t('renameTitle') : t('deleteTitle');
          return h('div', { className: 'dwc-panel-head is-static' },
            h(IconButton, { icon: 'back', label: t('back'), onClick: () => setPanelMode('sessions') }),
            h('span', { className: 'dwc-panel-name' }, label));
        }

        return h('div', {
          className: 'dwc-panel-head',
          role: 'button',
          tabIndex: 0,
          'aria-label': ws.title + ' · ' + t('collapse'),
          onClick: collapse,
          onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); collapse(); }
          },
        },
        h('span', { className: 'dwc-panel-head-icon' }, h(IconNode, { spec: store.icons[ws.workspaceId], size: 18, title: ws.title })),
        h(ScrollingText, { className: 'dwc-panel-name', text: ws.title }),
        h('span', { className: 'dwc-panel-actions' },
          h('button', {
            type: 'button',
            className: 'dwc-ib',
            'aria-label': t('more'),
            onClick: (event) => { event.stopPropagation(); workspaceMenu(ws, event.currentTarget); },
          }, h(Icon, { name: 'more', size: 16 })),
          h('span', { className: 'dwc-collapse-hint', 'aria-hidden': 'true' }, h(Icon, { name: 'collapse', size: 16 }))));
      }

      function panelNode() {
        if (!expanded) return null;
        const ws = wsById.get(expanded.id);
        if (!ws) return null;

        return h('div', {
          className: 'dwc-panel' + (panelOpen ? ' is-open' : ''),
          ref: panelRef,
          role: 'dialog',
          'aria-label': ws.title,
        },
        h('div', { className: 'dwc-panel-inner' },
          h('div', { className: 'dwc-panel-header' + (panelMode !== 'sessions' ? ' is-static' : '') },
            panelHead(ws),
            panelMode === 'sessions' ? h('div', { className: 'dwc-panel-sub' }, h(ScrollingText, { text: ws.path || '' })) : null),
          panelBody(ws)));
      }

      /* ── 搜索 ── */

      function searchNode() {
        if (!searchResults.length) {
          return h('div', { className: 'dwc-empty' },
            h('span', { className: 'dwc-empty-icon' }, h(Icon, { name: 'search', size: 22 })),
            h('span', null, t('noMatch')));
        }
        return h('div', { className: 'dwc-sr', role: 'list' },
          searchResults.map((row) => h('button', {
            key: row.id,
            type: 'button',
            className: 'dwc-sr-item',
            role: 'listitem',
            onClick: () => { closeSearch(); selectSession(row.id); },
          },
          h('span', { className: 'dwc-sr-title' }, row.title),
          h('span', { className: 'dwc-sr-meta' }, row.snippet ? row.ws + ' · ' + row.snippet : row.ws))));
      }

      /* ── 窄栏 ── */

      function railNode() {
        const monos = monogramSet(items.map((ws) => ws.title));
        return h('div', { className: 'dwc-rail' },
          items.map((ws, index) => {
            const badge = badgeOf(visibleIdsOf(ws));
            return h('button', {
              key: ws.workspaceId,
              type: 'button',
              className: (currentId && (ws.sessionIds || []).includes(currentId)) ? 'is-current' : '',
              title: ws.title,
              onClick: () => {
                if (typeof props.expandSidebar === 'function') props.expandSidebar();
              },
            },
            h(IconNode, { spec: store.icons[ws.workspaceId], size: 20, title: ws.title, glyph: monos[index] }),
            badge ? h('i', { className: 'dwc-badge', 'data-kind': badge }) : null);
          }));
      }

      return h('div', { className: 'dwc-root' + (wide ? '' : ' is-rail'), ref: rootRef },
        wide ? headerNode() : null,
        wide
          ? h('div', { className: 'dwc-stage', ref: stageRef },
            searchOpen ? searchNode() : gridNode(),
            searchOpen ? null : panelNode())
          : railNode(),
        toast ? h('div', { className: 'dwc-toast', role: 'status' }, toast) : null,
        menu ? h(React.Fragment, null,
          h('div', { className: 'dwc-backdrop', onMouseDown: () => setMenu(null) }),
          h(Popover, { anchor: menu.anchor }, menu.render(() => setMenu(null)))) : null);
    }

    /* ────────────────────────── 插件体 ────────────────────────── */

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.effect(() => {
          const tag = document.createElement('style');
          tag.dataset.plugin = PLUGIN_ID;
          tag.textContent = CSS;
          document.head.appendChild(tag);
          return () => { tag.remove(); };
        }, 'workspace-cards: stylesheet');

        const locale = ctx.get('locale');
        const translate = (key) => {
          let id = 'zh';
          try {
            const snap = locale && locale.getLocale ? locale.getLocale() : null;
            id = (snap && (snap.id || snap.locale)) || 'zh';
          } catch (error) {
            id = 'zh';
          }
          const dict = String(id).toLowerCase().indexOf('en') === 0 ? EN : ZH;
          return dict[key] !== undefined ? dict[key] : (ZH[key] !== undefined ? ZH[key] : key);
        };

        const api = {
          t: translate,
          openSession(sessionId) {
            const service = ctx.get('uiWorkspace');
            if (service && typeof service.openSession === 'function') service.openSession(sessionId);
          },
          startSession(workspaceId) {
            const service = ctx.get('uiWorkspace');
            if (service && typeof service.startSession === 'function') service.startSession(workspaceId);
          },
          forkSession(sessionId) {
            const service = ctx.get('uiWorkspace');
            if (service && typeof service.forkSession === 'function') return service.forkSession(sessionId);
            const sessions = ctx.get('sessions');
            if (sessions && typeof sessions.fork === 'function') return sessions.fork({ sessionId });
            return Promise.resolve();
          },
          archiveSession(sessionId) {
            const service = ctx.get('uiWorkspace');
            if (service && typeof service.archiveSession === 'function') return service.archiveSession(sessionId);
            return Promise.resolve();
          },
          pickDirectory() {
            const service = ctx.get('uiWorkspace');
            if (service && typeof service.pickDirectory === 'function') return service.pickDirectory();
            return Promise.resolve(null);
          },
          createWorkspace(path) {
            const service = ctx.get('workspaces');
            if (service && typeof service.create === 'function') return service.create({ path });
            return Promise.resolve();
          },
          renameWorkspace(workspaceId, title) {
            const service = ctx.get('workspaces');
            if (service && typeof service.rename === 'function') return service.rename(workspaceId, title);
            return Promise.resolve();
          },
          deleteWorkspace(workspaceId) {
            const service = ctx.get('workspaces');
            if (service && typeof service.delete === 'function') return service.delete(workspaceId);
            return Promise.resolve();
          },
          search(query, signal) {
            const sessions = ctx.get('sessions');
            if (sessions && typeof sessions.search === 'function') return sessions.search(query, signal);
            return Promise.resolve(null);
          },
        };

        ctx.effect(() => ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register({
          name: 'sidebar.workspaces',
          priority: -1,
          inject: () => ({ api }),
        }, WorkspaceCards)), 'workspace-cards: slot');
      },
    };
  },
});

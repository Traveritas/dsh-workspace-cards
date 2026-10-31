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
    /* 样式接口版本：皮肤插件用 html[data-dwc-api] 门控，接口不兼容时整段不生效 */
    const PLUGIN_VERSION = '0.2.0';
    const SKIN_API = '1';
    const STORE_KEY = 'dsh.workspaceCards.v1';
    /* v1 → v2：名称默认改「仅悬停」；v2 → v3：圆角从像素改成占边长的百分比。 */
    const STORE_VERSION = 3;
    const ICON_ROUTE = '/dsh-workspace-cards/icons';
    const ICON_POLL_MS = 2000;
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
      scrollbar: '滚动条',
      scrollbarShow: '显示',
      scrollbarHide: '隐藏',
      settingsTitle: '工作区卡片',
      settingsSub: '卡片与显示',
      settingsLayout: '布局',
      settingsLayoutHint: '列数随侧栏宽度和卡片大小自动排列，整行居中；圆角 0% 是方块、50% 是整圆。拖动即时生效。',
      settingsDisplay: '显示',
      settingsPreview: '预览',
      cardSize: '卡片大小',
      cardRadius: '圆角',
      cardIcon: '图标大小',
      settingsReset: '恢复默认',
      sort: '排序',
      sortManual: '手动',
      sortRecent: '最近活跃',
      archive: '归档',
      archiveHide: '隐藏已归档',
      archiveAll: '全部对话',
      archiveOnly: '仅显示已归档',
      untitled: '未命名',
      emptyWorkspace: '还没有会话',
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
      agentDraw: '让 agent 画',
      agentCopied: '已复制',
      fileIcon: '文件图标',
      fileIconNow: '当前使用这个文件图标',
      fileIconOverridden: '本地自定义优先，文件图标被覆盖',
      fileIconPath: 'agent 存到：{path}',
      fileIconNoDir: 'Host 半未就绪；装好或更新后重启 DSH',
      fileIconLoad: '载入编辑',
      fileIconUse: '改用文件图标',
      fileIconRefresh: '刷新',
      fileIconManaged: '删掉这个文件即可移除文件图标',
      clearLocal: '清除本地图标',
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
      scrollbar: 'Scrollbar',
      scrollbarShow: 'Show',
      scrollbarHide: 'Hide',
      settingsTitle: 'Workspace cards',
      settingsSub: 'Cards & display',
      settingsLayout: 'Layout',
      settingsLayoutHint: 'Columns follow the sidebar width and card size; rows stay centered. Radius 0% is a square, 50% a full circle.',
      settingsDisplay: 'Display',
      settingsPreview: 'Preview',
      cardSize: 'Card size',
      cardRadius: 'Radius',
      cardIcon: 'Icon size',
      settingsReset: 'Reset',
      sort: 'Sort',
      sortManual: 'Manual',
      sortRecent: 'Recent',
      archive: 'Archive',
      archiveHide: 'Hide archived',
      archiveAll: 'All conversations',
      archiveOnly: 'Archived only',
      untitled: 'Untitled',
      emptyWorkspace: 'No sessions yet',
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
      agentDraw: 'Let agent draw',
      agentCopied: 'Copied',
      fileIcon: 'File icon',
      fileIconNow: 'Using this file icon',
      fileIconOverridden: 'Local custom icon wins; file icon is hidden',
      fileIconPath: 'Agent saves to: {path}',
      fileIconNoDir: 'Host half not ready; install or update, then restart DSH',
      fileIconLoad: 'Load into editor',
      fileIconUse: 'Use file icon',
      fileIconRefresh: 'Refresh',
      fileIconManaged: 'Delete the file to remove this icon',
      clearLocal: 'Clear local icon',
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

    /** 文件图标的落点：<图标目录>/<workspaceId>.svg，按宿主目录的分隔符拼。 */
    function iconPathOf(dir, id) {
      if (!dir || !id) return '';
      const sep = String(dir).indexOf('\\') >= 0 ? '\\' : '/';
      return String(dir).replace(/[\\/]+$/, '') + sep + String(id) + '.svg';
    }

    /** 复制给 agent 的提示词：画法 + 工作区信息 + 真实存放路径。 */
    function agentPromptOf(ws, file) {
      const title = (ws && ws.title) || '这个工作区';
      const workspacePath = (ws && ws.path) || '（未提供）';
      const workspaceId = (ws && ws.workspaceId) || '（未知）';
      return [
        `给 DSH 工作区「${title}」画一个 24×24 的线性图标，并直接存成文件。`,
        '',
        `工作区：${title}`,
        `工作区路径：${workspacePath}`,
        `workspaceId：${workspaceId}`,
        `存放位置：${file || '（图标目录未就绪）'}`,
        '',
        '画法：',
        '- viewBox="0 0 24 24"；fill="none"；stroke="currentColor"；stroke-width="1.5"；',
        '  stroke-linecap="round"；stroke-linejoin="round"。',
        '- 主体控制在 4–20 的坐标范围内，视觉重心放在 (12,12)。',
        '- 从工作区名或路径取一个明确的意象；轮廓简洁，16px 下仍能辨认。',
        '- 最多 5 条 path；不要文字、渐变、滤镜、位图、外链或 <style>。',
        '- 直接写入上面的文件（UTF-8；目录不存在就创建），不要只贴代码，也不要改插件代码。',
        '- 写完后只回复文件路径和一句图标说明。',
        '',
        '如果当前沙箱不允许写这个路径，请告诉我原因，并把完整 <svg> 代码贴出来作为退路。',
      ].join('\n');
    }

    async function copyText(text) {
      try {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
          await navigator.clipboard.writeText(text);
          return true;
        }
      } catch (error) {
        /* 权限或焦点问题，走下面的兜底 */
      }
      try {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.left = '-9999px';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        area.remove();
        return ok;
      } catch (error) {
        return false;
      }
    }

    /* ────────────────────────── 存储 ────────────────────────── */

    /** 卡片相关数值的范围；设置页的滑块和读盘时的夹取共用这一份。 */
    const LIMITS = {
      cardSize: { min: 56, max: 120, step: 2, def: 76, unit: ' px' },
      /* 圆角按边长百分比：0% = 方块，50% = 整圆 */
      radius: { min: 0, max: 50, step: 1, def: 21, unit: '%' },
      iconSize: { min: 14, max: 40, step: 1, def: 26, unit: ' px' },
    };

    const DEFAULT_STORE = {
      icons: {},
      order: [],
      showNames: false,
      scrollbars: 'show',
      cardSize: LIMITS.cardSize.def,
      radius: LIMITS.radius.def,
      iconSize: LIMITS.iconSize.def,
      sort: 'manual',
      archived: 'hide',
    };

    function clampNumber(raw, limit) {
      const value = Math.round(Number(raw));
      if (!Number.isFinite(value)) return limit.def;
      return Math.min(limit.max, Math.max(limit.min, value));
    }

    function normalizeStore(raw) {
      const src = raw && typeof raw === 'object' ? raw : {};
      const version = Number.isFinite(Number(src.v)) ? Number(src.v) : 1;
      const cardSize = clampNumber(src.cardSize, LIMITS.cardSize);
      /* v3 起 radius 存百分比；更早的存档是像素，按当前边长换算。 */
      const legacyRadius = Number.isFinite(Number(src.radius))
        ? Math.round((Number(src.radius) / cardSize) * 100)
        : LIMITS.radius.def;
      return {
        ...DEFAULT_STORE,
        ...src,
        v: STORE_VERSION,
        icons: src.icons && typeof src.icons === 'object' ? src.icons : {},
        order: Array.isArray(src.order) ? src.order : [],
        showNames: version >= 2 ? src.showNames === true : DEFAULT_STORE.showNames,
        scrollbars: src.scrollbars === 'hide' ? 'hide' : 'show',
        cardSize,
        radius: version >= 3 ? clampNumber(src.radius, LIMITS.radius) : clampNumber(legacyRadius, LIMITS.radius),
        iconSize: clampNumber(src.iconSize, LIMITS.iconSize),
      };
    }

    /** 边长 / 圆角 / 图标 → 悬停名称的站位，以及图标要不要上移 / 缩一点给名字让位。 */
    function cardMetrics(store) {
      const size = store.cardSize;
      const radiusPx = (size * store.radius) / 100;
      const nameBottom = Math.max(5, Math.round(radiusPx * 0.5));
      const nameInset = Math.max(6, Math.round(radiusPx * 0.35));
      const badgeInset = Math.max(8, Math.round(radiusPx * 0.4));

      /* 悬停时名字从底部浮出：名字上方那块（卡顶留 6px）是图标能待的地方。
         放得下就只上移；放不下再等比缩小。 */
      const padTop = 6;
      const nameLine = 12;
      const nameTop = size - nameBottom - nameLine;
      const free = Math.max(8, nameTop - padTop);
      const icon = Math.max(1, store.iconSize);
      const hoverScale = Math.min(1, Math.max(0.45, free / icon));
      let lift = 0;
      if (icon > free) {
        lift = (padTop + nameTop) / 2 - size / 2;
      } else {
        lift = Math.min(0, nameTop - (size + icon) / 2);
      }
      return { nameBottom, nameInset, badgeInset, hoverScale, hoverLift: Math.round(lift) };
    }

    function readStore() {
      try {
        return normalizeStore(JSON.parse(window.localStorage.getItem(STORE_KEY) || 'null'));
      } catch (error) {
        return normalizeStore(null);
      }
    }

    function writeStore(value) {
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify({
          v: STORE_VERSION,
          icons: value.icons,
          order: value.order,
          showNames: value.showNames,
          scrollbars: value.scrollbars,
          cardSize: value.cardSize,
          radius: value.radius,
          iconSize: value.iconSize,
          sort: value.sort,
          archived: value.archived,
        }));
      } catch (error) {
        /* 隐私模式下 localStorage 不可写，退化成内存态即可 */
      }
    }

    /** 侧栏和设置页共用同一份 store：任一处改了，另一处即时跟着重渲染。 */
    const storeHub = {
      state: null,
      listeners: new Set(),
      get() {
        if (!this.state) this.state = readStore();
        return this.state;
      },
      set(patch) {
        const next = normalizeStore({ ...this.get(), ...patch });
        this.state = next;
        writeStore(next);
        this.listeners.forEach((fn) => { try { fn(next); } catch (error) { /* 单个订阅者出错不影响其它 */ } });
        return next;
      },
      subscribe(fn) {
        this.listeners.add(fn);
        return () => { this.listeners.delete(fn); };
      },
    };

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
      pen: ['M4 20l4-1L19 8a2 2 0 0 0-3-3L5 16Z', 'M14 7l3 3'],
      trash: ['M4 7h16', 'M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2', 'M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12'],
      palette: ['M12 3a9 9 0 1 0 0 18c1.6 0 2-1 2-2 0-1.6 1.4-2 3-2h1a3 3 0 0 0 3-3c0-6-4.5-11-9-11Z', 'M8 9h.01', 'M7 14h.01', 'M12 7h.01'],
      folder: ['M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z'],
      code: ['m8 8-4 4 4 4', 'm16 8 4 4-4 4'],
      terminal: ['M3 5h18v14H3Z', 'm7 10 2 2-2 2', 'M12 14h4'],
      book: ['M4 4h4a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H4Z', 'M20 4h-4a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h5Z'],
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
      home: ['M3.5 11 12 4l8.5 7', 'M6 9.5V20h12V9.5', 'M10 20v-5h4v5'],
      chat: ['M5 5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z', 'M8 10h.01', 'M12 10h.01', 'M16 10h.01'],
      mail: ['M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z', 'm3 7 9 6 9-6'],
      calendar: ['M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z', 'M4 10h16', 'M8 3.5V6', 'M16 3.5V6'],
      clock: ['M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z', 'M12 8v4.5l3 1.8'],
      file: ['M6 4h7l4 4v12H6Z', 'M13 4v4h4', 'M9 12h5', 'M9 15.5h5'],
      image: ['M4 5h16v14H4Z', 'M5 18l5-5 3.5 3.5L17 12l3 3', 'M9 9h.01'],
      music: ['M8 16V6l10-2v10', 'M8 16a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z', 'M18 14a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z'],
      video: ['M3 7h12v10H3Z', 'm15 10 6-3v10l-6-3Z'],
      gamepad: ['M6 9h12a4 4 0 0 1 3.6 5.8l-1.2 2.4A2.5 2.5 0 0 1 16 18l-1.5-2h-5L8 18a2.5 2.5 0 0 1-4.4-1.8l-1.2-2.4A4 4 0 0 1 6 9Z', 'M8 11v4', 'M6 13h4', 'M15.5 12h.01', 'M18 14h.01'],
      globe: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M3 12h18', 'M12 3c3.5 3.5 3.5 14.5 0 18', 'M12 3c-3.5 3.5-3.5 14.5 0 18'],
      map: ['m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2Z', 'M9 4v14', 'M15 6v14'],
      bulb: ['M12 3a6 6 0 0 0-3.5 10.9V17h7v-3.1A6 6 0 0 0 12 3Z', 'M9.5 20h5'],
      shield: ['M12 3 20 6v6c0 5-3.3 7.6-8 9-4.7-1.4-8-4-8-9V6Z', 'm8.5 12 2.5 2.5 4.5-4.5'],
      tag: ['M4 4h7l9 9-7 7-9-9Z', 'M8 8h.01'],
      cloud: ['M7 18h10a4 4 0 0 0 .6-7.9A6 6 0 0 0 6 9.5 4.5 4.5 0 0 0 7 18Z'],
      sun: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M12 2v2', 'M12 20v2', 'M2 12h2', 'M20 12h2', 'm5 5 1.4 1.4', 'm17.6 17.6 1.4 1.4', 'm19 5-1.4 1.4', 'm6.4 17.6-1.4 1.4'],
      moon: ['M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z'],
      heart: ['M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10Z'],
      link: ['M10 14a4 4 0 0 1 0-5.7l3-3a4 4 0 0 1 5.7 5.7l-2 2', 'M14 10a4 4 0 0 1 0 5.7l-3 3a4 4 0 0 1-5.7-5.7l2-2'],
    };

    const LIB_ICONS = ['folder', 'code', 'terminal', 'book', 'chart', 'database', 'robot', 'spark', 'leaf', 'mountain', 'cube', 'wave', 'flask', 'flag', 'planet', 'pen', 'home', 'chat', 'mail', 'calendar', 'clock', 'file', 'image', 'music', 'video', 'gamepad', 'globe', 'map', 'bulb', 'shield', 'tag', 'cloud', 'sun', 'moon', 'heart', 'link'];

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
  /* 官方侧栏的 regionArea 用 margin-right: -inline-padding 把右边界拉到栏边
     （给滚动条让位），挂进去的内容会比左边界多出 12px；这里补回右侧内边距，
     卡片和标题行才会在栏内左右等距。 */
  padding: 0 calc(4px + var(--dsh-sidebar-inline-padding, 12px)) 0 4px;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  line-height: 1.4;
  -webkit-font-smoothing: antialiased;
}
.dwc-root *, .dwc-root *::before, .dwc-root *::after { box-sizing: border-box; }
/* 视图选项「滚动条 → 隐藏」：只关显示，滚轮 / 触控板 / 键盘照常滚 */
.dwc-root.dwc-nobars, .dwc-root.dwc-nobars * { scrollbar-width: none; }
.dwc-root.dwc-nobars::-webkit-scrollbar, .dwc-root.dwc-nobars *::-webkit-scrollbar { display: none; }

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
  grid-template-columns: repeat(auto-fill, var(--dwc-card-size, 76px));
  justify-content: center;
  gap: var(--dwc-grid-gap, 8px);
  align-content: start;
  padding: 4px 2px 16px;
  background: var(--dwc-grid-bg, transparent);
}
.dwc-grid, .dwc-sr, .dwc-panel-body { animation: dwc-in 160ms ease both; }
.dwc-grid[aria-hidden="true"] { pointer-events: none; }
@keyframes dwc-in { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; } }

.dwc-tile {
  position: relative;
  width: 100%;
  height: var(--dwc-card-size, 76px);
  padding: 6px 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border: 0;
  /* 应用默认是 superellipse 圆角；卡片这里用正圆，50% 才是真正的整圆 */
  corner-shape: round;
  border-radius: var(--dwc-card-radius, 21%);
  background: var(--dwc-tile-bg, var(--dsw-alias-bg-layer-2));
  /* 角标描边要跟卡片底同色；皮肤画了不透明底时，把 --dwc-badge-ring(-hover) 设成同一色 */
  --dwc-tile-fill: var(--dwc-badge-ring, var(--dsw-alias-bg-layer-2));
  box-shadow: var(--dwc-tile-ring, inset 0 0 0 1px var(--dsw-alias-border-l1));
  color: var(--dwc-tile-label, var(--dsw-alias-label-secondary));
  cursor: pointer;
  overflow: hidden;
  isolation: isolate;
  transition: transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease, border-radius 180ms ease;
}
.dwc-tile:hover {
  transform: translateY(-1px);
  background: var(--dwc-tile-bg-hover, var(--dsw-alias-bg-layer-1));
  --dwc-tile-fill: var(--dwc-badge-ring-hover, var(--dsw-alias-bg-layer-1));
  color: var(--dwc-tile-label-hover, var(--dsw-alias-label-primary));
  box-shadow: var(--dwc-tile-ring-hover, inset 0 0 0 1px var(--dsw-alias-border-l2), var(--dsw-shadow-lv1));
}
.dwc-tile:focus-visible { outline: 2px solid var(--dwc-focus-ring, var(--dsw-alias-state-business-primary)); outline-offset: 1px; }
.dwc-tile.is-current {
  color: var(--dwc-tile-label-current, var(--dsw-alias-label-primary));
  box-shadow: var(--dwc-tile-ring-current, inset 0 0 0 1.5px var(--dsw-alias-state-business-primary));
}
.dwc-tile.is-dragging { opacity: 0.45; }
.dwc-tile.is-drop { box-shadow: var(--dwc-tile-ring-current, inset 0 0 0 1.5px var(--dsw-alias-state-business-primary)); }

/* 皮肤绘制层：基座只留空位，不写背景；皮肤在这上面画动态底 / 纹理 / 光效 */
.dwc-tile-paint,
.dwc-panel-paint {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: block;
  pointer-events: none;
  border-radius: inherit;
}
.dwc-tile-paint { overflow: hidden; }

.dwc-tile-icon { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; width: var(--dwc-icon-size, 26px); height: var(--dwc-icon-size, 26px); transition: transform 140ms ease; }
.dwc-glyph { display: inline-flex; align-items: center; justify-content: center; overflow: hidden; }
.dwc-glyph-char { font-family: var(--dwc-glyph-font, ${SERIF}); line-height: 1; letter-spacing: 0.01em; color: inherit; }
.dwc-glyph-svg svg { width: 100%; height: 100%; display: block; }
.dwc-glyph-svg { color: inherit; }
.dwc-tile-name-wrap { position: relative; z-index: 1; display: flex; justify-content: center; width: 100%; min-width: 0; }
.dwc-tile-name {
  max-width: 100%;
  font-size: 10px;
  font-family: var(--dwc-name-font, inherit);
  line-height: 1.15;
  color: var(--dwc-name-label, var(--dsw-alias-label-caption));
}
.dwc-tile:hover .dwc-tile-name, .dwc-tile.is-current .dwc-tile-name { color: var(--dwc-name-label-hover, var(--dsw-alias-label-secondary)); }
/* 名称「仅悬停」：不占排版，悬停时浮在卡片底部；圆角越大，站位越往里收 */
.dwc-tile.is-names-hover .dwc-tile-name-wrap {
  position: absolute;
  left: var(--dwc-name-inset, 6px);
  right: var(--dwc-name-inset, 6px);
  bottom: var(--dwc-name-bottom, 5px);
  width: auto;
  opacity: 0;
  transition: opacity 120ms ease;
}
.dwc-tile.is-names-hover:hover .dwc-tile-name-wrap,
.dwc-tile.is-names-hover:focus-visible .dwc-tile-name-wrap { opacity: 1; }
/* 图标过大时，悬停上移让位给名称，再放不下才等比缩小（数值由 cardMetrics 算好） */
.dwc-tile.is-names-hover:hover .dwc-tile-icon,
.dwc-tile.is-names-hover:focus-visible .dwc-tile-icon { transform: translateY(var(--dwc-hover-icon-lift, 0px)) scale(var(--dwc-hover-icon-scale, 1)); }

.dwc-badge { position: absolute; z-index: 2; top: var(--dwc-badge-inset, 8px); right: var(--dwc-badge-inset, 8px); width: var(--dwc-badge-size, 7px); height: var(--dwc-badge-size, 7px); border-radius: 50%; box-shadow: 0 0 0 2px var(--dwc-tile-fill, var(--dsw-alias-bg-layer-2)); }
.dwc-badge[data-kind="pending"] { background: var(--dwc-badge-pending, var(--dsw-alias-state-warn-primary)); }
.dwc-badge[data-kind="running"] { background: var(--dwc-badge-running, var(--dsw-alias-state-business-primary)); animation: dwc-pulse 1.7s ease-in-out infinite; }
.dwc-badge[data-kind="done"] { background: transparent; box-shadow: inset 0 0 0 1.4px var(--dwc-badge-done, var(--dsw-alias-state-success-secondary)), 0 0 0 2px var(--dwc-tile-fill, var(--dsw-alias-bg-layer-2)); }
@keyframes dwc-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.45; transform: scale(0.78); } }

/* ── 展开后的卡片 ── */
.dwc-panel {
  position: absolute;
  inset: 0;
  z-index: 5;
  overflow: hidden;
  transform-origin: 0 0;
  border-radius: 20px;
  background-color: var(--dwc-panel-bg, var(--dsw-alias-bg-base));
  background-image: var(--dwc-panel-bg-image, linear-gradient(var(--dsw-alias-bg-layer-1), var(--dsw-alias-bg-layer-1)));
  border: var(--dwc-panel-ring, 1px solid var(--dsw-alias-border-l1));
  box-shadow: var(--dwc-panel-shadow, var(--dsw-shadow-lv2));
}
.dwc-panel-inner {
  position: relative;
  z-index: 1;
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

.dwc-svg-actions { display: flex; gap: 6px; align-items: center; margin-top: 6px; }
.dwc-svg-actions .dwc-btn { flex: 1; min-width: 0; padding: 0 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dwc-file {
  padding: 8px 9px;
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-2);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.dwc-file-head { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.dwc-file-label { font-size: 11px; color: var(--dsw-alias-label-secondary); }
.dwc-file-path { display: flex; flex-direction: column; gap: 1px; font-size: 10px; line-height: 1.45; color: var(--dsw-alias-label-caption); font-family: ui-monospace, "Cascadia Mono", "Microsoft YaHei", monospace; }
.dwc-file-dir, .dwc-file-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dwc-file-name { color: var(--dsw-alias-label-secondary); }
.dwc-file-note { font-size: 10px; line-height: 1.45; color: var(--dsw-alias-label-caption); }
.dwc-file-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.dwc-file-btn {
  height: 22px;
  padding: 0 8px;
  border-radius: 7px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
}
.dwc-file-btn:hover { background: var(--dsw-alias-interactive-bg-hover); }
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

/* ── 设置页（DSH 设置 → 工作区卡片） ── */
.dwc-set { display: flex; flex-direction: column; gap: 14px; }
.dwc-set-head { display: flex; align-items: baseline; gap: 10px; }
.dwc-set-title { font-size: 17px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.dwc-set-sub { font-size: 12px; color: var(--dsw-alias-label-caption); }
.dwc-set-group { border: 1px solid var(--dsw-alias-border-l1); border-radius: 14px; padding: 4px 16px; background: var(--dsw-alias-bg-layer-1); }
.dwc-set-group + .dwc-set-group { margin-top: 2px; }
.dwc-set-group-title { padding: 10px 0 0; font-size: 12px; color: var(--dsw-alias-label-caption); }
.dwc-set-hint { padding: 4px 0 8px; font-size: 11px; line-height: 1.5; color: var(--dsw-alias-label-caption); }
.dwc-set-row { display: flex; align-items: center; gap: 16px; min-height: 44px; }
.dwc-set-row + .dwc-set-row { border-top: 1px solid var(--dsw-alias-border-l1); }
.dwc-set-label { flex: 0 0 84px; font-size: 13px; color: var(--dsw-alias-label-secondary); }
.dwc-set-control { flex: 1; min-width: 0; display: flex; align-items: center; gap: 12px; }
.dwc-set-range { flex: 1; min-width: 0; height: 20px; margin: 0; accent-color: var(--dsw-alias-state-business-primary); cursor: pointer; }
.dwc-set-value { flex: 0 0 46px; text-align: right; font-size: 12px; color: var(--dsw-alias-label-caption); font-variant-numeric: tabular-nums; }
.dwc-set-chips { display: flex; gap: 6px; }
.dwc-set-chip {
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease;
}
.dwc-set-chip:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.dwc-set-chip.is-on { border-color: var(--dsw-alias-state-business-primary); color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-layer-2); }
.dwc-set-preview { flex: 1; display: flex; align-items: flex-start; gap: 8px; padding: 8px 0; min-width: 0; }
.dwc-set-preview .dwc-tile { flex: 0 0 auto; width: var(--dwc-card-size, 76px); cursor: default; }
.dwc-set-foot { display: flex; justify-content: flex-end; }
.dwc-set-btn { height: 30px; padding: 0 12px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 8px; background: transparent; color: var(--dsw-alias-label-secondary); font: inherit; font-size: 12px; cursor: pointer; }
.dwc-set-btn:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }

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
      const { spec, ws, t, fileIcon, iconDir, onRefresh, onSaveIcon, onClear, onBack } = props;
      const title = (ws && ws.title) || props.title || '';
      const hasFile = !!fileIcon;
      const [tab, setTab] = useState(spec && spec.kind ? spec.kind : (hasFile ? 'svg' : 'char'));
      const [char, setChar] = useState(spec && spec.kind === 'char' ? spec.value : '');
      const [lib, setLib] = useState(spec && spec.kind === 'lib' ? spec.value : '');
      const [svg, setSvg] = useState(spec && spec.kind === 'svg' ? spec.value : '');
      const [copied, setCopied] = useState(false);
      const fileRef = useRef(null);
      const copyTimer = useRef(0);
      const fileId = ws && ws.workspaceId ? String(ws.workspaceId) : '';
      const fileName = fileId ? fileId + '.svg' : '';
      const filePath = iconPathOf(iconDir, fileId);
      const fileSpec = hasFile ? { kind: 'svg', value: fileIcon } : null;

      useEffect(() => () => clearTimeout(copyTimer.current), []);

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
      /* 没有本地自定义时，预览直接显示文件图标；有本地自定义时以本地为准。 */
      const shown = preview || (!spec && fileSpec ? fileSpec : null);

      const copyPrompt = async () => {
        if (!iconDir || !ws) return;
        const ok = await copyText(agentPromptOf(ws, filePath));
        if (!ok) return;
        setCopied(true);
        clearTimeout(copyTimer.current);
        copyTimer.current = setTimeout(() => setCopied(false), 1600);
      };

      return h('div', { className: 'dwc-pane' },
        h('div', { className: 'dwc-preview' }, h(IconNode, { spec: shown, size: 44, title })),

        hasFile ? h('div', { className: 'dwc-file' },
          h('div', { className: 'dwc-file-head' },
            h('span', { className: 'dwc-file-label' }, t('fileIcon')),
            h('button', {
              type: 'button',
              className: 'dwc-file-btn',
              onClick: () => { if (typeof onRefresh === 'function') onRefresh(); },
            }, t('fileIconRefresh'))),
          h('div', { className: 'dwc-file-path', title: filePath },
            h('span', { className: 'dwc-file-dir' }, iconDir || '…'),
            h('span', { className: 'dwc-file-name' }, fileName || '…')),
          h('div', { className: 'dwc-file-note' }, spec ? t('fileIconOverridden') : t('fileIconNow')),
          h('div', { className: 'dwc-file-actions' },
            h('button', {
              type: 'button',
              className: 'dwc-file-btn',
              onClick: () => { setSvg(fileIcon); setTab('svg'); },
            }, t('fileIconLoad')),
            spec ? h('button', {
              type: 'button',
              className: 'dwc-file-btn',
              onClick: () => { onClear(); onBack(); },
            }, t('fileIconUse')) : null),
          h('div', { className: 'dwc-file-note' }, t('fileIconManaged'))) : null,

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
          h('div', { className: 'dwc-svg-actions' },
            h('button', { type: 'button', className: 'dwc-btn', onClick: () => fileRef.current && fileRef.current.click() }, t('pickFile')),
            h('button', {
              type: 'button',
              className: 'dwc-btn',
              disabled: !iconDir || !ws,
              title: iconDir ? '' : t('fileIconNoDir'),
              onClick: copyPrompt,
            }, copied ? t('agentCopied') : t('agentDraw')),
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
            })),
          !hasFile ? h('div', { className: 'dwc-hint', style: { marginTop: 6, overflowWrap: 'anywhere' } },
            iconDir ? t('fileIconPath', { path: filePath }) : t('fileIconNoDir')) : null) : null,

        h('div', { className: 'dwc-actions' },
          spec ? h('button', { type: 'button', className: 'dwc-btn', onClick: () => { onClear(); onBack(); } }, hasFile ? t('clearLocal') : t('clear')) : null,
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

    /* ────────────────────────── 设置页 ────────────────────────── */

    function SettingsScreen(props) {
      const t = props.t || ((key) => key);
      const hub = props.store || storeHub;
      const [state, setState] = useState(() => hub.get());

      useEffect(() => hub.subscribe(setState), [hub]);

      const set = (patch) => hub.set(patch);

      const sliderRow = (key, label, limit) => h('div', { className: 'dwc-set-row', key },
        h('span', { className: 'dwc-set-label' }, label),
        h('div', { className: 'dwc-set-control' },
          h('input', {
            className: 'dwc-set-range',
            type: 'range',
            min: limit.min,
            max: limit.max,
            step: limit.step,
            value: state[key],
            'aria-label': label,
            onChange: (event) => set({ [key]: Number(event.target.value) }),
          }),
          h('span', { className: 'dwc-set-value' }, state[key] + (limit.unit || ''))));

      const chipRow = (key, label, options) => h('div', { className: 'dwc-set-row', key },
        h('span', { className: 'dwc-set-label' }, label),
        h('div', { className: 'dwc-set-control' },
          h('div', { className: 'dwc-set-chips' }, options.map((option) => h('button', {
            key: String(option.value),
            type: 'button',
            className: 'dwc-set-chip' + (state[key] === option.value ? ' is-on' : ''),
            'aria-pressed': state[key] === option.value,
            onClick: () => set({ [key]: option.value }),
          }, option.label)))));

      const previewMetrics = cardMetrics(state);
      const preview = h('div', {
        className: 'dwc-set-preview',
        style: {
          '--dwc-card-size': state.cardSize + 'px',
          '--dwc-card-radius': state.radius + '%',
          '--dwc-icon-size': state.iconSize + 'px',
          '--dwc-name-bottom': previewMetrics.nameBottom + 'px',
          '--dwc-name-inset': previewMetrics.nameInset + 'px',
          '--dwc-badge-inset': previewMetrics.badgeInset + 'px',
          '--dwc-hover-icon-scale': String(previewMetrics.hoverScale),
          '--dwc-hover-icon-lift': previewMetrics.hoverLift + 'px',
        },
      }, ['dt', 'wr', 'ga'].map((glyph, index) => h('div', {
        key: glyph,
        className: 'dwc-tile' + (state.showNames ? '' : ' is-names-hover'),
        'aria-hidden': 'true',
      },
      h('span', { className: 'dwc-tile-paint', 'aria-hidden': 'true' }),
      h('span', { className: 'dwc-tile-icon' },
        h('span', {
          className: 'dwc-glyph dwc-glyph-char',
          style: { width: state.iconSize + 'px', height: state.iconSize + 'px', fontSize: Math.round(state.iconSize * 0.62) + 'px' },
        }, glyph)),
      h('span', { className: 'dwc-tile-name-wrap' },
        h('span', { className: 'dwc-tile-name' }, ['dsh-theme', 'writemyway', 'gaotie'][index])))));

      return h('div', { className: 'dwc-set' },
        h('div', { className: 'dwc-set-head' },
          h('span', { className: 'dwc-set-title' }, t('settingsTitle')),
          h('span', { className: 'dwc-set-sub' }, t('settingsSub'))),
        h('div', { className: 'dwc-set-group' },
          h('div', { className: 'dwc-set-group-title' }, t('settingsLayout')),
          h('div', { className: 'dwc-set-hint' }, t('settingsLayoutHint')),
          sliderRow('cardSize', t('cardSize'), LIMITS.cardSize),
          sliderRow('radius', t('cardRadius'), LIMITS.radius),
          sliderRow('iconSize', t('cardIcon'), LIMITS.iconSize),
          h('div', { className: 'dwc-set-row' },
            h('span', { className: 'dwc-set-label' }, t('settingsPreview')),
            preview)),
        h('div', { className: 'dwc-set-group' },
          h('div', { className: 'dwc-set-group-title' }, t('settingsDisplay')),
          chipRow('showNames', t('names'), [
            { value: true, label: t('namesShow') },
            { value: false, label: t('namesHide') },
          ]),
          chipRow('scrollbars', t('scrollbar'), [
            { value: 'show', label: t('scrollbarShow') },
            { value: 'hide', label: t('scrollbarHide') },
          ])),
        h('div', { className: 'dwc-set-foot' },
          h('button', {
            type: 'button',
            className: 'dwc-set-btn',
            onClick: () => set({
              cardSize: LIMITS.cardSize.def,
              radius: LIMITS.radius.def,
              iconSize: LIMITS.iconSize.def,
              showNames: DEFAULT_STORE.showNames,
              scrollbars: DEFAULT_STORE.scrollbars,
            }),
          }, t('settingsReset'))));
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

      const [store, setStoreState] = useState(() => storeHub.get());
      const [fileIcons, setFileIcons] = useState({});
      const [iconDir, setIconDir] = useState('');
      const [iconRouteDown, setIconRouteDown] = useState(false);
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

      useEffect(() => storeHub.subscribe(setStoreState), []);

      const patchStore = useCallback((patch) => {
        storeHub.set(patch);
      }, []);

      /* 文件图标由 Host 半读目录；Host 没装/没重启时静默保持本地图标。 */
      const loadFileIcons = useCallback(async () => {
        try {
          const response = await fetch(ICON_ROUTE, { cache: 'no-store', credentials: 'same-origin' });
          if (!response.ok) {
            setIconRouteDown(true);
            return;
          }
          setIconRouteDown(false);
          const data = await response.json();
          if (data && typeof data.dir === 'string' && data.dir) {
            setIconDir((prev) => (prev === data.dir ? prev : data.dir));
          }
          if (data && data.icons && typeof data.icons === 'object') {
            const next = data.icons;
            setFileIcons((prev) => {
              const keys = Object.keys(next);
              if (keys.length === Object.keys(prev).length && keys.every((key) => prev[key] === next[key])) return prev;
              return next;
            });
          }
        } catch (error) {
          /* 路由不可用：不提示，继续用本地自定义 */
        }
      }, []);

      const iconSpecOf = (workspaceId) => store.icons[workspaceId]
        || (fileIcons[workspaceId] ? { kind: 'svg', value: fileIcons[workspaceId] } : null);

      useEffect(() => { loadFileIcons(); }, [loadFileIcons]);

      useEffect(() => {
        if (panelMode !== 'icon') return undefined;
        loadFileIcons();
        const timer = setInterval(loadFileIcons, iconRouteDown ? 10000 : ICON_POLL_MS);
        return () => clearInterval(timer);
      }, [panelMode, loadFileIcons, iconRouteDown]);

      /* 图标页关着时也慢速轮询：agent 存完，网格不刷新也能自己变。 */
      useEffect(() => {
        if (panelMode === 'icon') return undefined;
        const timer = setInterval(() => {
          if (typeof document !== 'undefined' && document.visibilityState === 'visible') loadFileIcons();
        }, iconRouteDown ? 15000 : 5000);
        return () => clearInterval(timer);
      }, [panelMode, loadFileIcons, iconRouteDown]);

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
              + (store.showNames ? '' : ' is-names-hover')
              + (dragId === ws.workspaceId ? ' is-dragging' : '')
              + (dropId === ws.workspaceId ? ' is-drop' : ''),
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
          h('span', { className: 'dwc-tile-paint', 'aria-hidden': 'true' }),
          h('span', { className: 'dwc-tile-icon' },
            h(IconNode, { spec: iconSpecOf(ws.workspaceId), size: store.iconSize, title: ws.title, glyph: monos[cardIndex] })),
          h('span', { className: 'dwc-tile-name-wrap' },
            h(ScrollingText, { className: 'dwc-tile-name', text: ws.title, active: hoverTile === ws.workspaceId })),
          card.badge ? h('i', { className: 'dwc-badge', 'data-kind': card.badge }) : null);
        });

        return h('div', { className: 'dwc-grid', role: 'grid', 'aria-label': t('workspaces'), onKeyDown: moveFocus, 'aria-hidden': expanded ? 'true' : undefined }, tiles);
      }

      /* ── 展开的卡片 ── */

      function panelBody(ws) {
        if (panelMode === 'icon') {
          return h(IconScreen, {
            spec: store.icons[ws.workspaceId],
            ws,
            title: ws.title,
            fileIcon: fileIcons[ws.workspaceId] || '',
            iconDir,
            onRefresh: loadFileIcons,
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
        h('span', { className: 'dwc-panel-head-icon' }, h(IconNode, { spec: iconSpecOf(ws.workspaceId), size: 18, title: ws.title })),
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
        h('span', { className: 'dwc-panel-paint', 'aria-hidden': 'true' }),
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
            h(IconNode, { spec: iconSpecOf(ws.workspaceId), size: 20, title: ws.title, glyph: monos[index] }),
            badge ? h('i', { className: 'dwc-badge', 'data-kind': badge }) : null);
          }));
      }

      /* 卡片尺寸 / 圆角 / 图标大小走 CSS 变量，设置页改 store 即时生效 */
      const metrics = cardMetrics(store);
      const rootStyle = {
        '--dwc-card-size': store.cardSize + 'px',
        '--dwc-card-radius': store.radius + '%',
        '--dwc-icon-size': store.iconSize + 'px',
        '--dwc-name-bottom': metrics.nameBottom + 'px',
        '--dwc-name-inset': metrics.nameInset + 'px',
        '--dwc-badge-inset': metrics.badgeInset + 'px',
        '--dwc-hover-icon-scale': String(metrics.hoverScale),
        '--dwc-hover-icon-lift': metrics.hoverLift + 'px',
      };

      return h('div', { className: 'dwc-root' + (wide ? '' : ' is-rail') + (store.scrollbars === 'hide' ? ' dwc-nobars' : ''), style: rootStyle, ref: rootRef },
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

        /* 样式接口标记：皮肤插件只在 data-dwc-api 匹配时生效，卸载或换版都不会半残 */
        ctx.effect(() => {
          const root = document.documentElement;
          root.setAttribute('data-dwc-api', SKIN_API);
          root.setAttribute('data-dwc-version', PLUGIN_VERSION);
          return () => {
            root.removeAttribute('data-dwc-api');
            root.removeAttribute('data-dwc-version');
          };
        }, 'workspace-cards: skin api');

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

        /* 设置 → 「工作区卡片」：卡片尺寸 / 圆角 / 图标 / 名称 / 滚动条。 */
        ctx.effect(() => ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: PLUGIN_ID,
          order: 50,
          label: () => translate('settingsTitle'),
          inject: () => ({ t: translate, store: storeHub }),
        }, SettingsScreen)), 'workspace-cards: settings section');
      },
    };
  },
});

/**
 * Host 半：给浏览器端读「文件图标」。
 *
 * 工作区卡片本身仍在 client.js；这里只做一件浏览器做不到的事——
 * 把 ~/.dsh/workspace-icons/<workspaceId>.svg 读出来，通过同源路由交给页面。
 * agent 把 SVG 写进这个目录后，页面刷新（或图标页轮询）即可看到。
 *
 * 目录可用 patch 行的 config.iconDir 覆盖；默认在 DSH 家目录下。
 */
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const inject = ['webServer'];

export const ICON_ROUTE = '/dsh-workspace-cards/icons';
export const DEFAULT_ICON_DIR = path.join(os.homedir(), '.dsh', 'workspace-icons');

const MAX_FILE_BYTES = 256 * 1024;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const FILE_NAME = /^[A-Za-z0-9_-]+\.svg$/;

/**
 * 同源路由仍要过一遍 connection 的请求准入；没有 connection 服务时放行，
 * 保持旧版兼容（与 dsh-annotation 的做法一致）。
 * @returns {boolean} true 表示已经拒绝并写完响应
 */
function deniedByConnection(ctx, req, res) {
  let rejection;
  try {
    const connection = typeof ctx.get === 'function' ? ctx.get('connection') : null;
    rejection = connection && typeof connection.requestRejection === 'function'
      ? connection.requestRejection(req)
      : undefined;
  } catch (error) {
    rejection = undefined;
  }
  if (!rejection) return false;
  res.statusCode = rejection;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: rejection === 401 ? 'unauthorized' : 'forbidden' }));
  return true;
}

function sendJson(res, status, payload) {
  if (res.writableEnded) return;
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(payload));
}

async function readIcons(iconDir) {
  const icons = {};
  let total = 0;
  let entries;
  try {
    entries = await fs.readdir(iconDir, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === 'ENOENT') return icons;
    throw error;
  }
  for (const entry of entries) {
    if (!entry.isFile() || !FILE_NAME.test(entry.name)) continue;
    const file = path.join(iconDir, entry.name);
    try {
      const stat = await fs.stat(file);
      if (!stat.isFile() || stat.size > MAX_FILE_BYTES) continue;
      if (total + stat.size > MAX_TOTAL_BYTES) break;
      const markup = await fs.readFile(file, 'utf8');
      total += stat.size;
      icons[entry.name.slice(0, -4)] = markup;
    } catch (error) {
      /* 单个文件读失败不影响其它图标 */
    }
  }
  return icons;
}

export function apply(ctx, config) {
  const configured = config && typeof config.iconDir === 'string' ? config.iconDir.trim() : '';
  const iconDir = configured ? path.resolve(configured) : DEFAULT_ICON_DIR;

  /* 先把目录摆出来，agent 拿到的路径从第一次打开图标页起就是真实存在的 */
  fs.mkdir(iconDir, { recursive: true }).catch((error) => {
    ctx.logger?.warn?.(error);
  });

  const handler = async (req, res) => {
    if (req.method !== 'GET') return sendJson(res, 405, { error: 'method not allowed' });
    try {
      const icons = await readIcons(iconDir);
      return sendJson(res, 200, { dir: iconDir, icons });
    } catch (error) {
      ctx.logger?.warn?.(error);
      return sendJson(res, 500, { error: '图标目录读取失败' });
    }
  };

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: ICON_ROUTE,
    handler: (req, res) => (deniedByConnection(ctx, req, res) ? undefined : handler(req, res)),
  }), 'workspace-cards: icon files');
}

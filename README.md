# dsh-workspace-cards

AveritA 的 DSH 侧栏插件：把「工作区」区换成**图标网格**；点卡片原地放大成会话面板，点标题收回。

> 纯客户端插件。浏览器半（`client.js`）以 priority `-1` 接管官方 `sidebar.workspaces` 座位，
> Host 半（`index.js`）是空壳。

| 网格 | 展开的卡片 | 展开（深色） |
| --- | --- | --- |
| <img src="docs/grid.png" width="220" alt="网格"> | <img src="docs/panel.png" width="220" alt="展开的卡片"> | <img src="docs/dark.png" width="220" alt="深色"> |

## 形态

- **网格**：每行 3 张卡片（约 80×76），统一底色（不按工作区上色）、圆角 16px、
  图标 + 10px 单行名称（可关）。
- **角标**：一卡一枚，实心 = 待你处理，脉冲点 = 运行中，空心环 = 未读完成。
- **点卡片**：卡片用 240ms 缩放动画**原地放大**成铺满网格区的面板（圆角 20px），
  盖住其它卡片；点标题行任意处收回（右侧 `⌃` 只是提示，不可单独点击），动画缩回原卡片位置。面板是**粘的**——
  选完会话不收回。
- **条数按高度铺满**：会话行按面板可视高度算（约 11 条），放不下的收进「展开其余 N 个会话」。
- **截断滚动**：标题、路径、卡片小字标签被截断时，悬停按 0.05px/ms 横向滚到末端，指针离开回到开头。
- **路径随标题展开**：路径默认收起；鼠标停在标题行时整块向下展开露出完整路径，标题与路径共用同一块高亮（底角 14px）。
- **复制路径**：标题行「⋯」菜单里第一项就是「复制路径」。
- **一个页面**：区头始终是「工作区 ⌕ ⊞ ＋」，不随展开切换；搜索也只是临时顶替网格区。
- **视图选项**：名称（常显 / 仅悬停）、排序（手动 / 最近活跃）、归档（隐藏 / 全部 / 仅已归档）。
- **图标**：字符（汉字 / 字母 / emoji）、内置 16 个线性图标、自定义 SVG（粘贴或选文件）。
- **搜索**：标题 + 工作区名本地匹配，另接 `ctx.sessions.search` 做内容搜索（250ms 防抖）。
- **窄栏**：侧栏折叠时退化成单列图标。

## 存储

浏览器 `localStorage` 键 `dsh.workspaceCards.v1`：

```json
{
  "icons": { "<workspaceId>": { "kind": "char|lib|svg", "value": "..." } },
  "order": ["<workspaceId>", "..."],
  "showNames": true,
  "sort": "manual",
  "archived": "hide"
}
```

卡片顺序只存在本地——`ctx.workspaces` 没有工作区重排接口，官方顺序无法回写 Host。

## 未做 / 已知限制

- **每工作区配色**：这一版统一底色，颜色那套没接（存储里也不再写 `colors`）。
- **会话重命名、置顶**：没接。`ctx.sessions.using + rename` 与 `ctx.uiWorkspace.pinSession`
  在不同版本里是否存在需要实例核实。
- **「让 agent 画图标」**：未接，图标目前只存本地，agent 写不进来（要等 Host 半的图标文件）。
- **未分组会话**：工作区被删后落进「未分组」的会话不显示，因为网格只遍历已登记工作区。
- **第三方行内扩展**：替换座位后，别的插件挂在 `sidebar.session.row.*` / `sidebar.workspaces.session.*`
  上的东西不会渲染（slot 的「声明即认领」规则）。当前 profile 里没有这类插件。
- **字标**：分段取首字母（`dsh-theme` → `dt`），单段取前两个字（`gaotie` → `ga`）；
  同屏撞车时自动加长到 3 位（`gaotie` → `gao`，`gonglingzhishou-aii` → `gai`）。

## 安装 / 卸载

```bash
# 安装（或在 DSH「设置 → 插件」里给绝对路径）
dsh plugin --profile desktop add link:D:\Documents\HTA\My Projects\dsh-workspace-cards
```

卸载后官方工作区列表原样回来（本插件不写官方任何状态）。

## 文件

| 文件 | 作用 |
| --- | --- |
| `index.js` | Host 空壳 |
| `client.js` | 全部 UI：样式、网格、抽屉、图标面板、搜索、菜单 |
| `cordis.patch.yml` | bundle patch：插入 `workspace-cards` 一行 |
| `locale/*.json` | 插件管理器的标题 / 描述 |
| `icon.svg` | 插件管理器图标 |

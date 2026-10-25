# 本仓库是 Ship 的游戏站模板 game-template-next（或由它生成的站）

所有 agent（Claude Code / Codex / pi …）通用规则以 `~/Desktop/david/Ship/AGENTS.md` 开头的「🧭 建站铁律」为准，开工前先读。要点：

- **这里是模板仓库**（根目录有 `TEMPLATE.md`、没有 `.template.json`）：改动就是给以后所有新站改。修 bug 提交信息以 `fix` 开头——用本模板建的站每天巡检会被点名「有修复没同步」。不要留未提交的改动（Ship 的 `new-site.mjs` 会拒绝用脏模板建站）。改完在 `CHANGELOG.md` 记一行
- **这里是由模板生成的站**（根目录有 `.template.json`）：修了一个 bug，先想它是不是模板带来的——是就回 `~/Desktop/david/Ship/game-template-next` 修同样的问题并提交（`fix` 开头），下一个站就不会再踩
- 建新站只走 `node ~/Desktop/david/Ship/scripts/new-site.mjs game-next <slug> <域名> -- --name "Game" --roblox <placeId>`，不要直接跑本仓库的 `scripts/new-site.mjs`、也不要 cp 现有站
- 上线最后一步：`node ~/Desktop/david/Ship/scripts/site-onboard.mjs <域名> --game`，全 ✓ 才算完成
- 部署 = git commit + push（GitHub Actions → wrangler deploy）。提交前 `git status` 看未跟踪文件

## 主题（Ship/game-themes）

- 主题文件 `src/styles/theme/base.css` + `src/styles/theme/theme.css` 是从 `Ship/game-themes` **原样复制**的，**不要在站里改**。主题有问题：先在 `game-themes` 改并提交，再在站里 `node scripts/sync-theme.mjs` 同步（每日巡检会点名主题落后的站）
- 换主题：`node scripts/sync-theme.mjs --theme <id>`（会改字体依赖、`.theme.json`、`.template.json`）
- 页面只用主题契约：颜色 `paper / paper-edge / card / ink / ink-soft / ink-faint / rule / rule-hard / rust（主强调）/ ember-lite / ochre / moss`（Tailwind 类如 `bg-card text-ink-soft border-rule text-rust`），字体 `font-serif`（展示字）/ `font-sans` / `font-mono`，类 `.card .tile .tag .btn-ember .hero-glow table.data .glass .nav-link .arrow-link`。**不写死颜色**，换一个 theme.css 全站换皮
- 主题类（`.btn-ember` `.card` 等）不在 Tailwind 的 layer 里，会盖过同一元素上的 `hidden` / `flex` 等工具类：响应式显隐写在外层包裹元素上
- 正文链接用 `.text-link`（墨色字 + 强调色下划线），别把强调色当正文字色（comic 的红在黄底上只有 3.5:1）
- 字体只走主题里的 `@fontsource` import（自托管）。**禁止 `next/font/google`**

## 站点结构

- 唯一配置：`src/config/site.json`（站名、域名、官方游戏链接 `game.official`、GA id、实体命名）。`game.official` 必须是真实的 `roblox.com/games/<placeId>/…` 或 `store.steampowered.com/app/<appid>/`——巡检靠它盯游戏更新
- 游戏数据：`src/data/game.json`（码、实体、攻略、FAQ、未公开项）。不知道的写 `null`，页面显示缺口，不编数字。码要 2 个以上独立来源
- 一个实体一页（`src/app/units/[slug]`）。改名 pets / weapons 时文件夹和 `site.json` 的 `entity.path` 一起改
- 新加页面要进 `src/app/sitemap.ts`，并且至少有一个站内入链
- 文案口语、短句、去 AI 味；视觉别加 AI 指纹（全大写加字距小标签、米白底 + 衬线 + 等宽）

## 提交前

```bash
pnpm install
pnpm build        # prebuild 写部署标记；postbuild（scripts/check-export.mjs）查部署标记 / sitemap 域名 / robots，不过就失败
pnpm typecheck && pnpm lint
```

本地构建永远用 `pnpm build`，别用裸 `next build`（不跑 prebuild，部署标记会缺）。

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

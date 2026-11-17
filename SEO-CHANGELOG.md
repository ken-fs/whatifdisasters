# SEO 改动台账 · what-if-disasters.wiki

每次 SEO 调整记一条：为什么、预期、复查日、指标。到期补结果。

## 2026-11-17 · 首页 GEO 补齐（Organization + WebSite dateModified + VideoGame + FAQPage）

**为什么**：每日巡检「GEO 没做齐」点名。`node scripts/geo-check.mjs what-if-disasters.wiki` 改前：首页结构化数据只有 WebSite，缺 Organization、VideoGame、FAQPage；JSON-LD 没有 dateModified（爬虫能进、/about、页面上的更新日期本来就 ✓）。规则见 `Ship/docs/CONVENTIONS.md`「AI 可见性 / GEO」：AI 搜索（ChatGPT / Perplexity / AI Overviews）引用时靠这几样认出「这是谁做的、讲的是哪个游戏、什么时候更新的」。模板 game-template-next 11-07 已修（5840e8f + 683c582），本站建于 11-07 以前没跟上。

**改了什么**
- 首页 JSON-LD 改成一个 @graph：Organization（粉丝站，logo = 站点图标，有联系邮箱；不写 sameAs / SearchAction）、WebSite（inLanguage、dateModified = lastChecked，和页面上「Updated …」同一天）、VideoGame（url = 官方商店页，不冒充发行商）、FAQPage
- WebSite 从 layout（每页都输出）挪到首页
- Roblox 组名是占位名（random named group i hvent named yet），「是不是官方」那条写 the game's developer，不念组名；首页广告下面加可见的同一份 FAQ，schema 不说页面上没有的话（`src/lib/home-faq.ts`）

**基线**（GSC 10-18～11-14，28 天）：全站 476 点击 / 4715 曝光 / 平均第 5.3 名；首页 215 / 2262 / 5.7（点击 / 曝光 / 平均排名）

**预期**：geo-check 全 ✓；首页被 AI 搜索引用的机会变多（ChatGPT / Perplexity 推荐进站）；Google 端首页排名不应变差（只加结构化数据和底部 FAQ，标题 / H1 / 首屏没动）

**复查**：📅 2026-12-07（GSC 首页曝光 / 点击 / 排名对比基线；GA / CF 分析里 chatgpt.com、perplexity.ai 来源有没有出现；富结果报告里 FAQ 有没有报错）

**结果**：（待补）

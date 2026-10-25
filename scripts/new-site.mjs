#!/usr/bin/env node
// Generate a new game site from this template (zero dependencies).
//
// Normally called through the Ship entry point, which first pulls this template and
// Ship/game-themes to the latest commit and afterwards writes .template.json:
//   node ~/Desktop/david/Ship/scripts/new-site.mjs game-next <slug> <domain> -- --name "Game Name" --roblox <placeId>
//
// Direct use (Ship passes --themes-dir automatically):
//   node scripts/new-site.mjs <slug> <domain> [--name "Game Name"] [--roblox <placeId> | --steam <appid>]
//        [--keywords "<target keywords>"] [--theme <id>] [--exclude a,b] [--themes-dir <path>]
//        [--developer "Studio"] [--dir ../<slug>]
//
// What it does: copy the git-tracked template files → pick the theme (pick.mjs from
// game-themes, or --theme) and copy its two CSS files + fonts → fill src/config/site.json,
// wrangler.jsonc (worker = slug, apex + www custom domains), package.json, deploy.yml →
// write .theme.json + README.md → refresh pnpm-lock.yaml → git init + first commit →
// print the remaining steps (last one: site-onboard.mjs).

import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyTheme, findThemesDir, themeIds, themesCommit } from "./theme-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const VALUE_FLAGS = ["name", "roblox", "steam", "keywords", "theme", "exclude", "themes-dir", "developer", "dir"];

// ─── args ────────────────────────────────────────────────────────────────────
const positional = [];
const flags = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 1) {
  const a = argv[i];
  const eq = a.match(/^--([a-z-]+)=(.*)$/s);
  if (eq && VALUE_FLAGS.includes(eq[1])) flags[eq[1]] = eq[2];
  else if (a.startsWith("--") && VALUE_FLAGS.includes(a.slice(2))) flags[a.slice(2)] = argv[++i];
  else if (a === "-h" || a === "--help") flags.help = true;
  else if (a.startsWith("--")) fail(`unknown option ${a}`);
  else positional.push(a);
}

function fail(msg) {
  console.error(`✗ ${msg}\n`);
  console.error(
    'usage: node scripts/new-site.mjs <slug> <domain> [--name "Game Name"] [--roblox <placeId> | --steam <appid>] [--keywords "..."] [--theme <id>] [--exclude a,b] [--themes-dir <path>] [--developer "Studio"] [--dir ../<slug>]',
  );
  process.exit(1);
}
if (flags.help) fail("help");

const [slug, rawDomain] = positional;
if (!slug || !rawDomain) fail("missing <slug> or <domain>");
if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(slug)) fail("slug: lowercase letters, digits and - only (it becomes the Worker name)");
const domain = rawDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "").toLowerCase();
if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) fail(`domain looks wrong: ${rawDomain}`);
if (flags.roblox && flags.steam) fail("pass --roblox or --steam, not both");
if (flags.roblox && !/^\d{4,}$/.test(flags.roblox)) fail(`--roblox wants the numeric placeId (from roblox.com/games/<placeId>/...), got ${flags.roblox}`);
if (flags.steam && !/^\d{3,}$/.test(flags.steam)) fail(`--steam wants the numeric appid (from store.steampowered.com/app/<appid>), got ${flags.steam}`);

const name = flags.name ?? slug.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
const keywords = flags.keywords ?? "";
const platform = flags.steam ? "steam" : "roblox";
const kebab = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const official = flags.roblox
  ? `https://www.roblox.com/games/${flags.roblox}/${kebab}`
  : flags.steam
    ? `https://store.steampowered.com/app/${flags.steam}/`
    : "https://www.roblox.com/games/<placeId>/" + kebab;
const target = resolve(flags.dir ?? join(ROOT, "..", slug));
if (existsSync(target) && readdirSync(target).length > 0) fail(`target directory exists and is not empty: ${target}`);

// ─── theme ───────────────────────────────────────────────────────────────────
let themesDir;
try {
  themesDir = findThemesDir(ROOT, flags["themes-dir"]);
} catch (e) {
  fail(e.message);
}
const exclude = (flags.exclude ?? "").split(",").map((s) => s.trim()).filter(Boolean);
let theme;
const warnings = [];
if (flags.theme) {
  if (!themeIds(themesDir).includes(flags.theme)) fail(`unknown theme "${flags.theme}". Available: ${themeIds(themesDir).join(", ")}`);
  if (exclude.includes(flags.theme)) warnings.push(`--theme ${flags.theme} is also in --exclude; using it because you asked explicitly`);
  theme = { id: flags.theme, pickedBy: "--theme", hits: [] };
} else {
  const text = [name, keywords, platform].filter(Boolean).join(" ");
  const args = [join(themesDir, "pick.mjs"), text, "--json", ...(exclude.length ? [`--exclude=${exclude.join(",")}`] : [])];
  let pick;
  try {
    pick = JSON.parse(execFileSync(process.execPath, args, { encoding: "utf8" }));
  } catch (e) {
    fail(`pick.mjs failed: ${e.message}`);
  }
  if (!pick.id) fail("pick.mjs returned no theme (everything excluded?) — pass --theme <id>");
  theme = { id: pick.id, pickedBy: "pick.mjs", hits: pick.hits ?? [] };
  console.log(`✓ pick.mjs "${text}" → ${pick.id} (${pick.name}), hits: ${pick.hits?.join(", ") || "none"}${pick.alternatives?.length ? `, alternatives: ${pick.alternatives.join(", ")}` : ""}`);
  if (pick.fallback)
    warnings.push(`No genre word matched, so ${pick.id} is only the platform default. Confirm with the user and re-run with --theme <id> (see game-themes/THEMES.md「怎么选」).`);
  if (pick.tie)
    warnings.push(`Tie: ${pick.id} and ${pick.alternatives?.[0]} scored the same (${pick.hits.join(", ")}). Pick on purpose: check competitor colours (THEMES.md step 3), then re-run with --theme <id> or switch later with scripts/sync-theme.mjs --theme <id>.`);
}

// ─── copy ────────────────────────────────────────────────────────────────────
// Template-only files stay behind; a site gets its own README.md below.
const NEVER = [
  /(^|\/)\.git(\/|$)/,
  /(^|\/)node_modules(\/|$)/,
  /(^|\/)\.(next|wrangler)(\/|$)/,
  /^out\//,
  /(^|\/)\.env/,
  /^public\/\.well-known\/(deploy|anvilwiki-deploy)\.txt$/,
  /(^|\/)\.DS_Store$/,
  /^(TEMPLATE|CHANGELOG)\.md$/,
  /^\.theme\.json$/,
  /^next-env\.d\.ts$/,
  /\.tsbuildinfo$/,
];
const git = spawnSync("git", ["ls-files", "-co", "--exclude-standard", "-z"], { cwd: ROOT, encoding: "utf8" });
if (git.status !== 0) fail("template is not a git checkout (git ls-files failed)");
const files = git.stdout.split("\0").filter((f) => f && !NEVER.some((re) => re.test(f)) && existsSync(join(ROOT, f)));
for (const f of files) {
  mkdirSync(dirname(join(target, f)), { recursive: true });
  copyFileSync(join(ROOT, f), join(target, f));
}
console.log(`✓ copied ${files.length} files → ${target}`);

const { fonts } = applyTheme(target, themesDir, theme.id);
console.log(`✓ theme ${theme.id}: src/styles/theme/{base,theme}.css + fonts ${fonts.join(", ")}`);

// ─── configs ─────────────────────────────────────────────────────────────────
function edit(rel, fn) {
  const p = join(target, rel);
  const before = readFileSync(p, "utf8");
  const after = fn(before);
  if (after === before) warnings.push(`${rel}: nothing was rewritten (template changed?)`);
  writeFileSync(p, after);
}

edit("src/config/site.json", (s) => {
  const c = JSON.parse(s);
  c.siteName = `${name} Wiki`;
  c.shortName = name;
  c.domain = domain;
  c.contactEmail = `hello@${domain}`;
  c.description = c.description.replaceAll("Example Game", name);
  c.game = { ...c.game, name, platform, official, developer: flags.developer ?? "", community: "" };
  c.gaId = "";
  return JSON.stringify(c, null, 2) + "\n";
});
edit("wrangler.jsonc", (s) => s.replace(/("name":\s*)"[^"]*"/, `$1"${slug}"`).replaceAll("example.com", domain));
edit(".github/workflows/deploy.yml", (s) => s.replaceAll("example.com", domain));
edit("package.json", (s) => {
  const p = JSON.parse(s);
  p.name = slug;
  p.version = "0.1.0";
  return JSON.stringify(p, null, 2) + "\n";
});

writeFileSync(join(target, ".theme.json"), JSON.stringify(theme, null, 2) + "\n");
const tCommit = themesCommit(themesDir);
writeFileSync(
  join(target, "README.md"),
  `# ${name} — ${domain}

Fan reference site for ${name} (${platform === "steam" ? "Steam" : "Roblox"}): ${official}

Built from \`game-template-next\` (Next.js static export → Cloudflare Workers). Rules for agents: \`AGENTS.md\`.

## Theme

\`${theme.id}\` from Ship/game-themes${tCommit ? ` @ ${tCommit.slice(0, 7)}` : ""}, picked by ${theme.pickedBy}${theme.hits.length ? ` (matched: ${theme.hits.join(", ")})` : ""}.
Why this one / competitor colours: _fill in_.
Refresh or switch: \`node scripts/sync-theme.mjs [--theme <id>]\` — never edit \`src/styles/theme/*.css\` by hand.

## Where things live

| What | File |
|---|---|
| Site name, domain, official game link, GA id, entity naming | \`src/config/site.json\` |
| Codes, entities, guide, FAQ, gaps (all game facts) | \`src/data/game.json\` |
| Ad units (this site's own keys only) | \`src/lib/ads.ts\` |

## Commands

\`\`\`bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # prebuild writes the deploy marker, postbuild checks out/
pnpm typecheck && pnpm lint
\`\`\`

Deploy = commit + push to main (GitHub Actions → wrangler deploy).
`,
);

// Font deps changed → refresh the lockfile so CI's --frozen-lockfile passes.
const lock = spawnSync("pnpm", ["install", "--lockfile-only", "--silent"], { cwd: target, encoding: "utf8", timeout: 180000 });
const lockOk = lock.status === 0;
if (!lockOk) warnings.push(`pnpm install --lockfile-only failed (${(lock.stderr || lock.error?.message || "").trim().split("\n")[0]}). Run \`pnpm install\` in the site and commit pnpm-lock.yaml before the first push, or CI fails on --frozen-lockfile.`);
else console.log("✓ pnpm-lock.yaml refreshed for the theme fonts");

// ─── git ─────────────────────────────────────────────────────────────────────
const g = (...a) => execFileSync("git", a, { cwd: target, stdio: ["ignore", "ignore", "inherit"] });
// ─── official game art（不写占位：拉不到就保持主题布局，素材块 build 时自动不渲染） ─
// 用户 2026-10-15 定的规则：游戏 wiki 站必须有官方素材，不靠后续提醒。拉取失败只警告，不挡建站。
if (flags.roblox || flags.steam) {
  const fm = spawnSync(process.execPath, [join(ROOT, "scripts", "fetch-media.mjs")], { cwd: target, stdio: "inherit" });
  if (fm.status !== 0) warnings.push("official media fetch failed — re-run node scripts/fetch-media.mjs after the game publishes art");
}

g("init", "-q", "-b", "main");
g("add", "-A");
g("commit", "-q", "-m", `chore: scaffold ${name} (${domain}) from game-template-next, theme ${theme.id}`);
console.log("✓ git init + first commit");

// ─── next steps ──────────────────────────────────────────────────────────────
if (warnings.length) {
  console.log("\n⚠️  Check these:");
  for (const w of warnings) console.log(`  - ${w}`);
}
const steps = [
  `cd ${target} && pnpm install && pnpm dev — look at it`,
  !flags.roblox && !flags.steam
    ? "set game.official in src/config/site.json to the real roblox.com/games/<placeId>/… or store.steampowered.com/app/<appid>/ link (the daily patrol needs it)"
    : `game.official = ${official} ✓ (add developer / community link in src/config/site.json)`,
  "replace the placeholder data in src/data/game.json with sourced data (badge API / creator videos / 2+ code sources), then set _placeholder: false",
  "entity naming: rename src/app/units together with entity.path/singular/plural in src/config/site.json if the game has pets/weapons/fish…",
  "write the copy in plain words (Ship memory: site-copy-plain-voice)",
  "official art: public/media/ should already have screenshots + the game icon (fetch-media.mjs ran at scaffold). If empty: node scripts/fetch-media.mjs. Pages auto-render media blocks only when files exist",
  "pnpm build && pnpm typecheck && pnpm lint (postbuild checks the deploy marker, sitemap domain and robots)",
  `create the private GitHub repo ken-fs/${slug}, then: python3 ~/Desktop/david/Ship/scripts/setup-gh-deploy.py ${target} ken-fs/${slug} ${domain} — it stores the Cloudflare secrets; the workflow is already in .github/workflows/deploy.yml (re-writing it is fine)`,
  `Cloudflare zone for ${domain} must be ACTIVE before the first push (wrangler.jsonc binds ${domain} + www.${domain} as custom domains; binding on a pending zone leaves a certificate that never issues)`,
  `HTTPS + www (hard rule): zone settings always_use_https=on, min_tls_version=1.2, then python3 ~/Desktop/david/Ship/scripts/cf-www-redirect.py ${domain}`,
  "commit + push to main = deploy; check https://" + domain + "/.well-known/deploy.txt equals git rev-parse HEAD",
  `GSC: node ~/Desktop/david/Ship/scripts/gsc-verify-domain.mjs ${domain}; IndexNow: node ~/Desktop/david/Ship/scripts/indexnow.mjs ${domain}; GA4: put the id in src/config/site.json gaId; Adsterra: this site's own units in src/lib/ads.ts`,
  `Clash: add DOMAIN-SUFFIX,${domain},DIRECT + fake-ip-filter "+.${domain}" to Merge.yaml if local checks fail`,
  `launch check (required, last): cd ~/Desktop/david/Ship && node scripts/site-onboard.mjs ${domain} --game`,
];
console.log(`\nNew site: ${name} · ${domain} · theme ${theme.id} · ${target}\n\nRemaining steps:`);
steps.forEach((s, i) => console.log(`  ${String(i + 1).padStart(2)}. ${s}`));
console.log("");

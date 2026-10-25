#!/usr/bin/env node
/**
 * Post-build check of ./out (runs as `postbuild`, zero dependencies).
 *
 * Fails the build (exit 1) on things the daily patrol would flag as broken:
 *   - deploy marker missing / not a commit SHA
 *   - sitemap missing, empty, or any URL not on this site's domain
 *   - a sitemap URL with no page behind it
 *   - robots.txt not blocking the RSC sidecars (/*__next) or not pointing at the sitemap
 *   - the entity folder under src/app not matching `entity.path` in site.json
 * Warns (exit 0) about unfinished setup: placeholder data, placeholder official link,
 * example.com domain, no GA id.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "out");
const site = JSON.parse(readFileSync(join(root, "src/config/site.json"), "utf8"));
// game.json only exists in Roblox/Steam game sites (answers/tool sites store data elsewhere)
const gameJsonPath = join(root, "src/data/game.json");
const game = existsSync(gameJsonPath) ? JSON.parse(readFileSync(gameJsonPath, "utf8")) : null;
const origin = (process.env.NEXT_PUBLIC_SITE_URL || `https://${site.domain}`).replace(/\/+$/, "");

const errors = [];
const warnings = [];
const read = (rel) => (existsSync(join(out, rel)) ? readFileSync(join(out, rel), "utf8") : null);

// 1. deploy markers
for (const f of [".well-known/deploy.txt", ".well-known/anvilwiki-deploy.txt"]) {
  const v = read(f)?.trim();
  if (!v) errors.push(`${f} missing (build with \`pnpm build\`, not \`next build\`: prebuild writes it)`);
  else if (!/^[0-9a-f]{40}$/.test(v)) warnings.push(`${f} = "${v}" (not a commit SHA: no git repo yet?)`);
}

// 2. sitemap
const sitemap = read("sitemap.xml");
if (!sitemap) errors.push("sitemap.xml missing");
else {
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!locs.length) errors.push("sitemap.xml has no URLs");
  const foreign = locs.filter((u) => !u.startsWith(origin + "/"));
  if (foreign.length) errors.push(`sitemap has ${foreign.length} URL(s) not on ${origin}: ${foreign.slice(0, 3).join(", ")}`);
  for (const u of locs.filter((u) => u.startsWith(origin + "/"))) {
    const path = u.slice(origin.length).replace(/^\//, "");
    if (!existsSync(join(out, path, "index.html")) && !existsSync(join(out, path || "index.html"))) errors.push(`sitemap lists ${u} but out/${path}index.html does not exist`);
  }
  console.log(`[check-export] sitemap: ${locs.length} URLs on ${origin}`);
}

// 3. robots (2026-10-22: these two checks used to sit in the share-card `else` branch — with a share card
// present robots was checked, without one it wasn't; and a missing robots.txt crashed on robots.includes)
const robots = read("robots.txt");
if (!robots) errors.push("robots.txt missing");
else {
  if (!/Disallow:\s*\/\*__next/.test(robots)) errors.push("robots.txt does not block /*__next (RSC sidecars get indexed as soft 404s)");
  if (!robots.includes(`${origin}/sitemap.xml`)) errors.push(`robots.txt does not point at ${origin}/sitemap.xml`);
}

// Share card (2026-10-12): 9 sites from this template shipped with no og:image, so every social share was a bare link.
const home = read("index.html") ?? "";
if (!/<meta[^>]+property="og:image"/.test(home)) errors.push("index.html has no og:image (src/app/opengraph-image.tsx draws it at build)");
if (!existsSync(join(out, "opengraph-image"))) errors.push("out/opengraph-image missing (share card was not generated)");

// 4. entity folder (dynamic segment may be [slug], [dive], …)
const entityDir = join(root, "src/app", site.entity.path);
const hasDynamicPage =
  existsSync(entityDir) && readdirSync(entityDir).some((d) => /^\[.+\]$/.test(d) && existsSync(join(entityDir, d, "page.tsx")));
if (!hasDynamicPage)
  errors.push(`src/app/${site.entity.path}/[<dynamic>]/page.tsx not found — rename the folder together with entity.path in site.json`);

// 5. unfinished setup (warnings)
const isTemplate = site.domain === "example.com";
if (isTemplate) warnings.push("domain is example.com (fine in the template repo, not in a site)");
if (site.game.platform === "web") {
  if (!/^https:\/\//.test(site.game.official) || site.game.official.includes("<"))
    warnings.push(`game.official is a placeholder (${site.game.official}).`);
} else if (!/roblox\.com\/games\/\d{6,}|store\.steampowered\.com\/app\/\d{3,}/.test(site.game.official))
  warnings.push(`game.official is a placeholder (${site.game.official}). The daily patrol needs the real Roblox/Steam link.`);
if (game?._placeholder) warnings.push("src/data/game.json still has _placeholder: true — replace the example data");
if (!site.gaId && !process.env.NEXT_PUBLIC_GA_ID) warnings.push("no GA id (site.json gaId) — the consent banner and analytics stay off");

for (const w of warnings) console.log(`[check-export] ⚠ ${w}`);
for (const e of errors) console.error(`[check-export] ✗ ${e}`);
if (errors.length) process.exit(1);
console.log("[check-export] ✓ deploy marker, sitemap, robots, share card OK");

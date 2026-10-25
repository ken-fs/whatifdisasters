#!/usr/bin/env node
// Fetch the game's official artwork into public/media/ (zero dependencies).
//
// Why: a game wiki with no game art reads as an AI content farm, and the homepage
// LCP deserves the real thing. Only developer-uploaded assets are used (Roblox
// games/media + game icon; Steam store screenshots + capsule) — fan-site reference
// use is industry convention; never scrape competitor sites' art.
//
//   node scripts/fetch-media.mjs            # reads src/config/site.json (game.official / game.platform)
//
// Idempotent: skips files that already exist unless --force. Pages render media
// blocks only when the files exist (build-time check), so a game with zero media
// just shows the themed layout — never a broken img.
//
// Output: public/media/shot-1.jpg … shot-N.jpg (game screenshots), game-icon.jpg,
//         and src/app/icon.png (favicon = game icon, overwriting the template SVG).

import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, renameSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

// 站点根 = 调用时的 cwd（new-site.mjs 在新站目录里调用本脚本；手动跑也是 cd 到站点）。
// 不能用脚本位置反推——脚本在模板仓库里，素材要写进新站。
const ROOT = process.cwd();
const FORCE = process.argv.includes("--force");
const site = JSON.parse(readFileSync(join(ROOT, "src", "config", "site.json"), "utf8"));
const official = site.game?.official ?? "";
const platform = site.game?.platform ?? "roblox";
const OUT = join(ROOT, "public", "media");
mkdirSync(OUT, { recursive: true });

const warn = (m) => console.warn(`⚠ fetch-media: ${m}`);
const ok = (m) => console.log(`✓ fetch-media: ${m}`);

async function getJson(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r.json();
}

async function download(url, file) {
  if (existsSync(file) && !FORCE) return false;
  const r = await fetch(url, { signal: AbortSignal.timeout(40000) });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  return true;
}

/** PNG → JPEG with macOS built-in sips (no dep). Falls back to keeping the PNG bytes with a .jpg name — still a valid image, just larger. */
function toJpeg(pngPath, jpgPath) {
  try {
    execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "82", pngPath, "--out", jpgPath], { stdio: "pipe" });
    rmSync(pngPath);
  } catch {
    try {
      renameSync(pngPath, jpgPath);
    } catch {}
  }
}

async function roblox(placeId) {
  const u = await getJson(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
  if (!u.universeId) throw new Error(`no universeId for placeId ${placeId}`);
  const media = await getJson(`https://games.roblox.com/v1/games/${u.universeId}/media`);
  const imageIds = (media.data ?? []).filter((m) => m.assetType === "Image" && m.imageId && m.approved).map((m) => m.imageId);
  let shots = [];
  if (imageIds.length) {
    const t = await getJson(`https://thumbnails.roblox.com/v1/assets?assetIds=${imageIds.join(",")}&size=768x432&format=Png&isCircular=false`);
    shots = (t.data ?? []).map((x) => x.imageUrl).filter(Boolean);
  }
  const icons = await getJson(`https://thumbnails.roblox.com/v1/games/icons?universeIds=${u.universeId}&size=512x512&format=Png&isCircular=false`);
  const iconUrl = icons.data?.[0]?.imageUrl;
  return { shots, iconUrl };
}

async function steam(appid) {
  const d = await getJson(`https://store.steampowered.com/api/appdetails?appids=${appid}&filters=basic,screenshots`);
  const app = d[appid]?.data;
  if (!app) throw new Error(`no appdetails for ${appid}`);
  return { shots: (app.screenshots ?? []).slice(0, 6).map((s) => s.path_full), iconUrl: app.header_image };
}

try {
  let shots = [],
    iconUrl = null;
  if (platform === "roblox") {
    const placeId = official.match(/roblox\.com\/games\/(\d+)/)?.[1];
    if (!placeId) throw new Error(`game.official has no placeId: ${official}`);
    ({ shots, iconUrl } = await roblox(placeId));
  } else if (platform === "steam") {
    const appid = official.match(/app\/(\d+)/)?.[1];
    if (!appid) throw new Error(`game.official has no appid: ${official}`);
    ({ shots, iconUrl } = await steam(appid));
  }

  let n = 0;
  for (const [i, url] of shots.slice(0, 6).entries()) {
    const jpg = join(OUT, `shot-${i + 1}.jpg`);
    if (existsSync(jpg) && !FORCE) continue;
    const tmp = join(OUT, `.tmp-${i + 1}.png`);
    await download(url, tmp);
    toJpeg(tmp, jpg);
    n++;
  }
  if (iconUrl) {
    const iconJpg = join(OUT, "game-icon.jpg");
    if (!existsSync(iconJpg) || FORCE) {
      const tmp = join(OUT, ".tmp-icon.png");
      await download(iconUrl, tmp);
      toJpeg(tmp, iconJpg);
    }
    // favicon: keep it a PNG (browsers are fine with it)
    const fav = join(ROOT, "src", "app", "icon.png");
    if (!existsSync(fav) || FORCE) {
      const tmp = join(OUT, ".tmp-fav.png");
      writeFileSync(tmp, readFileSync(join(OUT, "game-icon.jpg")));
      execFileSync("sips", ["-s", "format", "png", tmp, "--out", fav], { stdio: "pipe" });
      rmSync(tmp);
      try {
        rmSync(join(ROOT, "src", "app", "icon.svg"));
      } catch {}
    }
  }
  ok(`${n} screenshot(s) + ${iconUrl ? "1 icon" : "no icon"} → public/media/ (${shots.length} found for ${platform})`);
  if (!shots.length) warn("game has no approved media yet — pages fall back to the themed layout. Re-run later.");
} catch (e) {
  warn(`failed: ${e.message}. Pages fall back to the themed layout; re-run scripts/fetch-media.mjs later.`);
  process.exit(0); // 素材拉不到不挡建站
}

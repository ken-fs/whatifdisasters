/**
 * Refresh src/data/badges.json from the Roblox badges API (runs in `prebuild`).
 *
 * Names, official descriptions and how many players have each badge come straight from
 * Roblox, so /badges/ shows live award counts. How-to text for the secret badges is not
 * here: it lives in src/data/badge-guides.json (researched, two sources each).
 * Never fails a build: on any error, or fewer badges than before, it keeps the committed file.
 * Locally the file is only rewritten when the badge list changed or the snapshot is a week old.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const file = join(root, "src", "data", "badges.json");
const site = JSON.parse(readFileSync(join(root, "src", "config", "site.json"), "utf8"));
const STALE_DAYS = 7;

async function json(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

let old = null;
try {
  old = JSON.parse(readFileSync(file, "utf8"));
} catch {}

try {
  const placeId = site.game.official.match(/roblox\.com\/games\/(\d+)/)?.[1];
  const { universeId } = await json(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
  const badges = [];
  let cursor = "";
  for (let i = 0; i < 10; i++) {
    const d = await json(`https://badges.roblox.com/v1/universes/${universeId}/badges?limit=100&sortOrder=Asc${cursor ? `&cursor=${cursor}` : ""}`);
    for (const b of d.data) {
      if (!b.enabled) continue;
      badges.push({ id: b.id, name: b.name, description: b.description ?? "", awarded: b.statistics.awardedCount, created: b.created.slice(0, 10) });
    }
    cursor = d.nextPageCursor;
    if (!cursor) break;
  }
  if (!badges.length || (old && badges.length < old.badges.length)) throw new Error(`got ${badges.length} badges`);

  const today = new Date().toISOString().slice(0, 10);
  const names = (d) => JSON.stringify(d.badges.map((b) => [b.id, b.name, b.description]));
  const data = { checkedAt: today, badges };
  const changed = !old || names(old) !== names(data);
  const stale = !old || (Date.parse(today) - Date.parse(old.checkedAt)) / 864e5 >= STALE_DAYS;
  if (changed || stale || process.env.CI) {
    writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
    console.log(`badges: ${badges.length}, checked ${today}${changed ? " (changed)" : ""}`);
  } else {
    console.log(`badges: unchanged since ${old.checkedAt}`);
  }
} catch (e) {
  if (!old) throw e;
  console.warn(`badges: refresh failed, keeping ${old.checkedAt} snapshot — ${e.message}`);
}

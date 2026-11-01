/**
 * Refresh src/data/shop.json from the Roblox store APIs (runs as part of `prebuild`).
 *
 * Every deploy re-reads the live gamepass and developer-product lists, so /gamepasses/
 * shows today's Robux prices without anyone editing the file. The store text (what each
 * item does) is the developer's own wording, which is why the page can quote it.
 *
 * Never fails a build: on any network / shape problem, or a list that suddenly shrinks
 * by more than half (an API hiccup, not a real delisting), it keeps the committed file.
 * The file is only rewritten when an item changed or the check date is a week old, so
 * a local build does not leave a one-line date diff behind every day.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const file = join(root, "src", "data", "shop.json");
const site = JSON.parse(readFileSync(join(root, "src", "config", "site.json"), "utf8"));
const STALE_DAYS = 7;

async function json(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function fetchShop() {
  const placeId = site.game.official.match(/roblox\.com\/games\/(\d+)/)?.[1];
  if (!placeId) throw new Error("game.official is not a roblox.com/games/<placeId> link");
  const { universeId } = await json(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);

  const passes = await json(`https://apis.roblox.com/game-passes/v1/universes/${universeId}/game-passes?passView=Full&pageSize=100`);
  const gamePasses = passes.gamePasses
    .filter((p) => p.isForSale)
    .map((p) => ({ id: p.id, name: p.displayName || p.name, price: p.price, description: p.displayDescription || "" }));

  const products = [];
  let cursor = "";
  for (let page = 0; page < 20; page++) {
    const d = await json(
      `https://apis.roblox.com/developer-products/v2/universes/${universeId}/developerproducts?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
    );
    for (const p of d.developerProducts) {
      if (!p.IsForSale) continue;
      products.push({
        id: p.ProductId,
        name: p.displayName || p.Name,
        price: p.PriceInRobux,
        description: p.displayDescription || p.Description || "",
        added: p.Created.slice(0, 10),
      });
    }
    cursor = d.nextPageCursor;
    if (!cursor) break;
  }
  products.sort((a, b) => a.added.localeCompare(b.added) || a.id - b.id);
  return { universeId, gamePasses, products };
}

let old = null;
try {
  old = JSON.parse(readFileSync(file, "utf8"));
} catch {}

try {
  const live = await fetchShop();
  if (!live.gamePasses.length && !live.products.length) throw new Error("store came back empty");
  if (old && live.products.length < old.products.length / 2) throw new Error(`products ${old.products.length} → ${live.products.length}, looks like an API hiccup`);

  const today = new Date().toISOString().slice(0, 10);
  const items = (d) => JSON.stringify([d.gamePasses, d.products]);
  const changed = !old || items(old) !== items(live);
  const stale = !old || (Date.parse(today) - Date.parse(old.checkedAt)) / 864e5 >= STALE_DAYS;
  if (changed || stale) {
    writeFileSync(file, JSON.stringify({ checkedAt: today, ...live }, null, 2) + "\n");
    console.log(`shop: ${live.gamePasses.length} gamepasses, ${live.products.length} products${changed ? " (changed)" : ""}, checked ${today}`);
  } else {
    console.log(`shop: unchanged since ${old.checkedAt}`);
  }
} catch (e) {
  if (!old) throw e;
  console.warn(`shop: refresh failed, keeping ${old.checkedAt} snapshot — ${e.message}`);
}

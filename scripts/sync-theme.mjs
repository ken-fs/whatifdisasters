#!/usr/bin/env node
// Re-copy this site's theme from Ship/game-themes, or switch to another one (zero dependencies).
//
//   node scripts/sync-theme.mjs                     # pick up later fixes to the current theme
//   node scripts/sync-theme.mjs --theme aqua        # switch theme
//   node scripts/sync-theme.mjs --themes-dir <path> # theme library somewhere else (default ../game-themes)
//
// The current theme id comes from .template.json (`theme`, written by Ship/scripts/new-site.mjs)
// or .theme.json (`id`). Afterwards .template.json gets the new `themesCommit` (and `theme`),
// which is what the daily patrol compares against game-themes to flag theme drift.
// Theme bugs are fixed in game-themes first and synced from there — never patch
// src/styles/theme/*.css in a site.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyTheme, findThemesDir, themesCommit, themesDirty } from "./theme-lib.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const opt = (k) => {
  const i = argv.indexOf(`--${k}`);
  if (i >= 0) return argv[i + 1];
  return argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
};

const readJson = (f) => (existsSync(join(ROOT, f)) ? JSON.parse(readFileSync(join(ROOT, f), "utf8")) : null);
const writeJson = (f, v) => writeFileSync(join(ROOT, f), JSON.stringify(v, null, 2) + "\n");
const stamp = readJson(".template.json");
const chosen = readJson(".theme.json");

const current = stamp?.theme ?? chosen?.id;
const next = opt("theme") ?? current;
if (!next) {
  console.error("✗ no theme recorded in .template.json / .theme.json — pass --theme <id>");
  process.exit(1);
}

let themesDir;
try {
  themesDir = findThemesDir(ROOT, opt("themes-dir") ?? (stamp?.themesDir ? resolve(ROOT, "..", stamp.themesDir) : undefined));
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exit(1);
}
const dirty = themesDirty(themesDir);
if (dirty) console.warn(`⚠ ${themesDir} has uncommitted changes — commit them there first, or the recorded themesCommit won't match what you copied:\n${dirty}`);

let result;
try {
  result = applyTheme(ROOT, themesDir, next);
} catch (e) {
  console.error(`✗ ${e.message}`);
  process.exit(1);
}
const commit = themesCommit(themesDir);
const switched = next !== current;

if (stamp) {
  stamp.theme = next;
  if (commit) stamp.themesCommit = commit;
  if (switched) stamp.themePickedBy = "--theme";
  writeJson(".template.json", stamp);
}
writeJson(".theme.json", switched || !chosen ? { id: next, pickedBy: "--theme", hits: [] } : { ...chosen, id: next });

console.log(`✓ theme ${switched ? `${current ?? "?"} → ${next}` : next} from ${themesDir}${commit ? ` @ ${commit.slice(0, 7)}` : ""}`);
console.log(`  fonts: ${result.fonts.join(", ")}${result.fontsChanged ? " (changed)" : ""}`);
if (result.fontsChanged) {
  const r = spawnSync("pnpm", ["install"], { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) console.warn("⚠ pnpm install failed — run it yourself and commit pnpm-lock.yaml");
}
spawnSync("git", ["-C", ROOT, "status", "--short"], { stdio: "inherit" });
console.log("\nNext: pnpm build, look at the pages, then commit (e.g. `chore(theme): sync " + next + "`) and push.");

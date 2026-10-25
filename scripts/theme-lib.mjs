// Shared by scripts/new-site.mjs and scripts/sync-theme.mjs (zero dependencies).
//
// A site's theme is two files copied verbatim from Ship/game-themes:
//   game-themes/base.css          → src/styles/theme/base.css
//   game-themes/tokens/<id>.css   → src/styles/theme/theme.css
// plus the @fontsource packages theme.css imports (self-hosted fonts, never Google).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

/** --themes-dir, else ../game-themes next to the repo, else the usual Ship checkout. */
export function findThemesDir(root, flag) {
  const candidates = flag ? [resolve(flag)] : [resolve(root, "..", "game-themes"), join(homedir(), "Desktop/david/Ship/game-themes")];
  const hit = candidates.find((d) => existsSync(join(d, "tokens")) && existsSync(join(d, "base.css")));
  if (!hit) throw new Error(`theme library not found (tried ${candidates.join(", ")}). Pass --themes-dir <path to Ship/game-themes>.`);
  return hit;
}

export const themeIds = (themesDir) =>
  readdirSync(join(themesDir, "tokens"))
    .filter((f) => f.endsWith(".css"))
    .map((f) => f.slice(0, -4))
    .sort();

/** Package names from `@import "@fontsource[-variable]/<font>[/<file>.css]";` lines. */
export function fontPackages(css) {
  const out = new Set();
  for (const m of css.matchAll(/@import\s+["'](@fontsource(?:-variable)?\/[^/"']+)/g)) out.add(m[1]);
  return [...out].sort();
}

export function themesCommit(themesDir) {
  try {
    return execFileSync("git", ["-C", themesDir, "rev-parse", "HEAD"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

export function themesDirty(themesDir) {
  try {
    return execFileSync("git", ["-C", themesDir, "status", "--porcelain"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

/**
 * Copy the theme files into <root> and make package.json depend on exactly the
 * fonts this theme imports (every @fontsource* dependency belongs to the theme).
 * Returns { fonts, fontsChanged }.
 */
export function applyTheme(root, themesDir, id) {
  const token = join(themesDir, "tokens", `${id}.css`);
  if (!existsSync(token)) throw new Error(`unknown theme "${id}". Available: ${themeIds(themesDir).join(", ")}`);
  copyFileSync(join(themesDir, "base.css"), join(root, "src/styles/theme/base.css"));
  copyFileSync(token, join(root, "src/styles/theme/theme.css"));

  const fonts = fontPackages(readFileSync(token, "utf8"));
  const pkgPath = join(root, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const deps = pkg.dependencies ?? {};
  const before = Object.keys(deps).filter((k) => k.startsWith("@fontsource")).sort();
  const version = before.length ? deps[before[0]] : "^5.3.0";
  for (const k of before) delete deps[k];
  for (const f of fonts) deps[f] = version;
  pkg.dependencies = Object.fromEntries(Object.entries(deps).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  return { fonts, fontsChanged: before.join() !== fonts.join() };
}

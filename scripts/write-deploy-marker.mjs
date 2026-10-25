/**
 * Write the deploy marker the fleet's daily patrol reads (runs as `prebuild`).
 *
 * Ship/scripts/site-hygiene.mjs fetches /.well-known/deploy.txt (and, for sites it
 * has not been told about yet, /.well-known/anvilwiki-deploy.txt) and compares it
 * with `git rev-parse HEAD`. A mismatch means the deploy pipeline broke or someone
 * ran a local `wrangler deploy`. The GitHub Actions workflow checks the same file
 * against GITHUB_SHA after every deploy.
 *
 * Both files are gitignored on purpose: a committed copy always lags one commit.
 * Always build with `pnpm build` (runs this) — a bare `next build` skips it.
 *
 * Commit source, in order: GITHUB_SHA / WORKERS_CI_COMMIT_SHA (only if it is a real
 * 40-char SHA — Cloudflare sets it to the branch name on a manual "Retry build"),
 * then `git rev-parse HEAD`, then "unknown" (never fail a build over a marker).
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public", ".well-known");
const SHA_RE = /^[0-9a-f]{40}$/i;

function sha() {
  for (const v of [process.env.GITHUB_SHA, process.env.WORKERS_CI_COMMIT_SHA]) {
    if (v && SHA_RE.test(v.trim())) return v.trim().toLowerCase();
  }
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "unknown";
  }
}

const commit = sha();
mkdirSync(dir, { recursive: true });
for (const name of ["deploy.txt", "anvilwiki-deploy.txt"]) writeFileSync(join(dir, name), commit + "\n", "utf8");
console.log(`[deploy-marker] ${commit}`);

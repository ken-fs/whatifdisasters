import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Official game art, detected at build time (static export — no server at runtime).
 * scripts/fetch-media.mjs drops developer-uploaded screenshots/icons into
 * public/media/. Pages render media blocks only when the files exist, so a game
 * with no published art yet simply shows the themed layout instead of a broken img.
 */

const MEDIA_DIR = join(process.cwd(), "public", "media");

function list(prefix: string): string[] {
  try {
    return readdirSync(MEDIA_DIR)
      .filter((f) => f.startsWith(prefix) && !f.startsWith("."))
      .sort()
      .map((f) => `/media/${f}`);
  } catch {
    return [];
  }
}

/** Game screenshots, hero first: shot-1.jpg … in fetch order (Roblox/Steam put the best first). */
export const SHOTS: string[] = list("shot-");
export const HERO_SHOT: string | null = SHOTS[0] ?? null;
export const EXTRA_SHOTS: string[] = SHOTS.slice(1, 3);
export const GAME_ICON: string | null = existsSync(join(MEDIA_DIR, "game-icon.jpg")) ? "/media/game-icon.jpg" : null;

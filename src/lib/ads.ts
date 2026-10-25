// Adsterra ad units — single source of truth. Empty key = the slot renders nothing,
// so the site is safe to ship before units are approved.
//
// Every site gets ITS OWN units. Never copy keys from another site (animezero
// shipped petsuniverse's keys for a day on 2026-10-10: revenue went to the wrong site).
// Paste the script URL from the dashboard's GET CODE snippet verbatim — the format
// changed (now https://bauval.org/22/<key>; old: //www.highperformanceformat.com/<key>/invoke.js)
// and guessing it from the key 404s. Banners don't need an ads.txt entry.

export type AdSlot = { key: string; width: number; height: number; src: string };

/** 728×90 leaderboard. Desktop only — it overflows phones. */
export const LEADERBOARD: AdSlot = { key: "", width: 728, height: 90, src: "" };

/** 300×250 rectangle. Fits every viewport. */
export const RECTANGLE: AdSlot = { key: "", width: 300, height: 250, src: "" };

/** Adsterra Social Bar script URL (site-wide sticky bar, their highest-CPM format). Empty string = off. */
export const SOCIAL_BAR_SRC = "";

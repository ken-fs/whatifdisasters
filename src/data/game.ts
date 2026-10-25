import raw from "./game.json";

/**
 * Typed view of src/data/game.json — every fact the pages print comes from there.
 *
 * Rules the pages follow:
 *  - null means "nobody has published this yet". Render it as a gap, never a guess.
 *  - `sources` = how many independent listings agree. Codes go live at 2+.
 *  - `verified: false` = the entity is real but its details are not confirmed.
 */
export type Code = { code: string; reward: string; added: string | null; sources: number };
export type ExpiredCode = { code: string; reward: string | null };
export type Entity = {
  slug: string;
  name: string;
  tier: string | null;
  rarity: string | null;
  role: string | null;
  summary: string;
  howToGet: string | null;
  banner?: string;
  stages?: string[];
  killSpots?: string;
  prep?: string[];
  ifCaught?: string;
  worstMaps?: string;
  sources: number;
  verified: boolean;
};
export type Video = { id: string; title: string; channel: string };
export type Announced = { name: string; note: string };
export type MapEntry = { slug: string; name: string; note: string; use?: string };

export const LAST_CHECKED: string = raw.lastChecked;
export const IS_PLACEHOLDER: boolean = raw._placeholder;
export const codes = raw.codes as Code[];
export const expiredCodes = raw.expiredCodes as ExpiredCode[];
export const redeemSteps: string[] = raw.redeemSteps;
export const codesFaq: { q: string; a: string }[] = raw.codesFaq;
export const entities = raw.entities as Entity[];
export const announced = raw.announced as Announced[];
export const maps = raw.maps as MapEntry[];
export const guide: { heading: string; body: string }[] = raw.guide;
export const videos = raw.videos as Video[];
export const gaps: string[] = raw.gaps;

/** Tier order, best first. Entities without a tier sit in "Not ranked yet". */
export const TIERS = ["S", "A", "B", "C", "D"] as const;
export const byTier = (tier: string | null) => entities.filter((e) => e.tier === tier);
export const getEntity = (slug: string) => entities.find((e) => e.slug === slug);
export const getMap = (slug: string) => maps.find((m) => m.slug === slug);

/** "October 2026" for titles — taken from lastChecked so the title never lies. */
export const MONTH_YEAR = new Date(`${LAST_CHECKED}T00:00:00Z`).toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

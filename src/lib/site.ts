import site from "@/config/site.json";

/**
 * Site identity, read from src/config/site.json (the single source).
 *
 * SITE_URL falls back to the real domain, never a placeholder: a wrong fallback
 * ships canonical tags and a sitemap pointing at someone else's domain, and the
 * build output looks perfectly fine. NEXT_PUBLIC_SITE_URL only exists for previews.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || `https://${site.domain}`).replace(/\/+$/, "");
export const SITE_NAME = site.siteName;
export const SHORT_NAME = site.shortName;
export const SITE_DESCRIPTION = site.description;
export const GAME = site.game;
export const CONTACT_EMAIL = site.contactEmail;
export const ENTITY = site.entity;
/** GA4 measurement id. Public by design, so it lives in config; env wins for previews. */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || site.gaId;

export const PLATFORM_CTA = site.game.platform === "steam" ? "View on Steam" : "Play on Roblox";
export const PLATFORM_NAME = site.game.platform === "steam" ? "Steam" : "Roblox";

/** "units" → "Units" */
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
export const entityHref = (slug?: string) => `/${ENTITY.path}/${slug ? `${slug}/` : ""}`;

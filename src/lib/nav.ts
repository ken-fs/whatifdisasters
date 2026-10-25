import { ENTITY, cap, entityHref } from "@/lib/site";

/** Main navigation, shared by the header (client) and footer (server). */
export const NAV_LINKS = [
  { href: "/codes/", label: "Codes" },
  { href: "/tier-list/", label: "Tier list" },
  { href: entityHref(), label: cap(ENTITY.plural) },
  { href: "/guide/", label: "Guide" },
];

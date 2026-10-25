import { ENTITY, cap, entityHref } from "@/lib/site";

/** Main navigation, shared by the header (client) and footer (server). */
export const NAV_LINKS = [
  { href: entityHref(), label: cap(ENTITY.plural) },
  { href: "/maps/", label: "Maps" },
  { href: "/guide/", label: "Guide" },
  { href: "/codes/", label: "Codes" },
];

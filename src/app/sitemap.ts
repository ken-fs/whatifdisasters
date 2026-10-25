import type { MetadataRoute } from "next";
import { entities, LAST_CHECKED } from "@/data/game";
import { SITE_URL, entityHref } from "@/lib/site";

export const dynamic = "force-static";

/** Every page must be listed here — add new routes when you add pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(`${LAST_CHECKED}T00:00:00Z`);
  const routes: [string, number][] = [
    ["/", 1],
    ["/codes/", 0.9],
    ["/tier-list/", 0.8],
    [entityHref(), 0.8],
    ["/guide/", 0.7],
    ["/about/", 0.3],
    ["/privacy/", 0.1],
    ["/terms/", 0.1],
    ...entities.map((e): [string, number] => [entityHref(e.slug), 0.6]),
  ];
  return routes.map(([path, priority]) => ({ url: SITE_URL + path, lastModified, priority }));
}

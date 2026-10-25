import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    // Next writes an RSC payload sidecar (__next.*.txt) next to every page. It is
    // not a page; crawled, it shows up as a soft 404 in GSC.
    rules: [{ userAgent: "*", allow: "/", disallow: ["/*__next", "/__next"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

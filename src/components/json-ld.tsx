import { existsSync } from "node:fs";
import { join } from "node:path";
import { LAST_CHECKED } from "@/data/game";
import { GAME_ICON } from "@/lib/media";
import { CONTACT_EMAIL, GAME, PLATFORM_NAME, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Structured data. Only shapes the page really supports: Organization / WebSite / VideoGame (homepage),
 * BreadcrumbList, FAQPage (where the page shows the same questions) and ItemList (entity lists).
 * No aggregateRating / reviewCount — there are no reviews to aggregate. No sameAs (no real social
 * accounts) and no SearchAction (see Ship/docs/CONVENTIONS.md「schema 别造假」).
 */
function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/** Site icon for Organization.logo: whichever icon file the app router actually serves at the root. */
const SITE_LOGO = ["apple-icon.png", "icon.png", "icon.svg"].find((f) => existsSync(join(process.cwd(), "src", "app", f)));
/** Only a real store link (roblox.com/games/<id>/… or store.steampowered.com/app/<id>/), never the scaffold placeholder. */
const OFFICIAL = /^https:\/\/[^<>]+$/.test(GAME.official) ? GAME.official : null;

/**
 * Homepage only (2026-11-07, GEO — Ship/docs/CONVENTIONS.md「AI 可见性 / GEO」): the fan site as Organization,
 * the WebSite (dateModified = lastChecked, the date shown as "Updated …" on the page), the game it covers as
 * VideoGame (url = the official store page; the site is not its publisher), and FAQPage from the same list the
 * page renders. Pages with their own FAQ (codes, gamepasses) keep their own FaqJsonLd.
 */
export function HomeJsonLd({ faq }: { faq: { q: string; a: string }[] }) {
  const org = `${SITE_URL}/#organization`;
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": org,
            name: SITE_NAME,
            url: `${SITE_URL}/`,
            ...(SITE_LOGO ? { logo: `${SITE_URL}/${SITE_LOGO}` } : {}),
            ...(CONTACT_EMAIL ? { email: CONTACT_EMAIL } : {}),
          },
          {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: SITE_NAME,
            url: `${SITE_URL}/`,
            description: SITE_DESCRIPTION,
            inLanguage: "en",
            dateModified: LAST_CHECKED,
            publisher: { "@id": org },
            about: { "@id": `${SITE_URL}/#game` },
          },
          {
            "@type": "VideoGame",
            "@id": `${SITE_URL}/#game`,
            name: GAME.name,
            ...(OFFICIAL ? { url: OFFICIAL } : {}),
            gamePlatform: PLATFORM_NAME,
            ...(GAME_ICON ? { image: `${SITE_URL}${GAME_ICON}` } : {}),
          },
          {
            "@type": "FAQPage",
            mainEntity: faq.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
          },
        ],
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; href: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: SITE_URL + it.href })),
      }}
    />
  );
}

export function FaqJsonLd({ items }: { items: { q: string; a: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
      }}
    />
  );
}

export function ItemListJsonLd({ name, items }: { name: string; items: { name: string; href: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        numberOfItems: items.length,
        itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, url: SITE_URL + it.href })),
      }}
    />
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { announced, codes, entities, maps, LAST_CHECKED } from "@/data/game";
import { AdsterraBanner } from "@/components/adsterra-banner";
import { RECTANGLE } from "@/lib/ads";
import { ENTITY, GAME, entityHref } from "@/lib/site";
import { HERO_SHOT } from "@/lib/media";

// The homepage owns the brand and "<game> wiki" queries; /codes/ owns "<game> codes". 2026-10-13 SERP study
// (Ship/research/GAME-WIKI-STRUCTURE-2026-10.md): every small-game hub ranking top 5 for "<game> wiki" opens its title and
// H1 with "<Game> Wiki". The codes page exists but the game has no codes yet, so the homepage links it as a card instead of
// leading with it (structure rule B8: the homepage must not compete with /codes/ for the codes cluster).
export const metadata: Metadata = {
  title: { absolute: `${GAME.name} Wiki: Every Disaster and How to Survive It` },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const withImages = entities.filter((e) => e.image).slice(0, 8);

  return (
    <>
      <section className="relative isolate overflow-x-clip">
        <div className="hero-glow" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className={`container-page pt-20 pb-14 ${HERO_SHOT ? "lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-10" : ""}`}>
          <div>
            <p className="tag">Updated {LAST_CHECKED}</p>
            <h1 className="mt-5 max-w-[18ch] text-5xl sm:text-6xl">
              {GAME.name} <span className="text-rust">Wiki</span>
            </h1>
            <p className="mt-6 max-w-[56ch] text-lg text-ink-soft">
              Every scenario the round banner can announce, what the hazard actually does to the map, and where to stand when it
              starts. One page per disaster, plus the maps they land on and the round loop they sit in.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href={entityHref()} className="btn-ember">
                All {entities.length} documented disasters
              </Link>
              <Link href="/maps/" className="arrow-link text-sm font-semibold text-ink">
                Maps <span className="arrow">→</span>
              </Link>
            </div>
          </div>
          {HERO_SHOT && (
            <figure className="mt-10 lg:mt-0">
              <img
                src={HERO_SHOT}
                alt={`${GAME.name} official screenshot`}
                width={768}
                height={432}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full rounded-2xl border border-line shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
              />
              <figcaption className="mt-2 text-xs text-ink-faint">Official {GAME.name} artwork.</figcaption>
            </figure>
          )}
        </div>
      </section>

      <section className="container-page grid gap-4 sm:grid-cols-3">
        <Stat value={entities.length} label="disasters documented" />
        <Stat value={announced.length} label="announced, not yet documented" />
        <Stat value={maps.length} label="maps named so far" />
      </section>

      <section className="container-page mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { href: entityHref(), title: "Disasters", body: "What each banner means and how the hazard plays out." },
          { href: "/maps/", title: "Maps", body: "The locations rounds are set in, and what cover each one offers." },
          { href: "/lobby/", title: "Lobby", body: "Shop, missions, crates and the pad that loads you into the next round." },
          { href: "/guide/", title: "Round guide", body: "The lobby countdown, the 30-second head start and the results banner." },
          { href: "/codes/", title: "Codes", body: codes.length > 0 ? `${codes.length} working codes.` : "The game has no code box yet — here is how we check." },
        ].map((s) => (
          <Link key={s.href} href={s.href} className="card block p-6">
            <h3 className="font-serif text-lg">{s.title}</h3>
            <p className="mt-2 text-sm text-ink-soft">{s.body}</p>
          </Link>
        ))}
      </section>

      {/* Every entity page, linked straight from the homepage. 2026-10-21: animezero's homepage linked only the
          /weapons/ list, and half the weapon pages sat at "Discovered – not indexed" (animemysterious: 0 of 33 unit
          pages linked from home, most "URL is unknown to Google"). One direct link each gets them crawled. */}
      {entities.length > 0 && (
        <section className="container-page mt-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl">Documented disasters</h2>
            <Link href={entityHref()} className="arrow-link text-sm font-semibold">
              All {entities.length} {ENTITY.plural} <span className="arrow">→</span>
            </Link>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2">
            {[...entities]
              .sort((a, b) => a.name.localeCompare(b.name, "en"))
              .map((e) => (
                <li key={e.slug}>
                  <Link href={entityHref(e.slug)} className="card inline-block px-3 py-1.5 text-sm font-medium">
                    {e.name}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      )}

      {withImages.length > 0 && (
        <section className="container-page mt-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl">What the rounds look like</h2>
            <span className="text-xs text-ink-faint">In-game screenshots from recorded sessions</span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {withImages.map((e) => (
              <Link key={e.slug} href={entityHref(e.slug)} className="card block overflow-hidden">
                <img
                  src={e.image}
                  alt={`${e.name} in ${GAME.name}`}
                  width={1280}
                  height={720}
                  loading="lazy"
                  decoding="async"
                  className="aspect-video w-full object-cover"
                />
                <p className="px-3 py-2 text-sm font-medium">{e.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page mt-16">
        <h2 className="text-2xl">Announced, not documented yet</h2>
        <p className="mt-3 max-w-[70ch] text-ink-soft">
          These banners have shown up in rounds, but the hazard itself has not been recorded clearly enough to write a page
          about. They stay listed here until we can describe what actually happens.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {announced.map((a) => (
            <li key={a.name} className="tile p-4">
              <p className="font-medium">{a.name}</p>
              <p className="mt-1 text-sm text-ink-soft">{a.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page mt-16">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl">Maps</h2>
          <Link href="/maps/" className="arrow-link text-sm font-semibold">
            All maps <span className="arrow">→</span>
          </Link>
        </div>
        <ul className="mt-5 flex flex-wrap gap-2">
          {maps.map((m) => (
            <li key={m.slug}>
              <Link href={`/maps/#${m.slug}`} className="card inline-block px-3 py-1.5 text-sm font-medium">
                {m.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <AdsterraBanner slot={RECTANGLE} className="mt-16" />
    </>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="tile p-6">
      <p className="num font-serif text-3xl">{value}</p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </div>
  );
}

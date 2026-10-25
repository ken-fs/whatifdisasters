import type { Metadata } from "next";
import Link from "next/link";
import { codes, entities, LAST_CHECKED, MONTH_YEAR } from "@/data/game";
import { CopyCode } from "@/components/copy-code";
import { AdsterraBanner } from "@/components/adsterra-banner";
import { RECTANGLE } from "@/lib/ads";
import { ENTITY, GAME, cap, entityHref } from "@/lib/site";
import { HERO_SHOT } from "@/lib/media";

// The homepage owns the brand and "<game> wiki" queries; /codes/ owns "<game> codes". 2026-10-13 SERP study
// (Ship/research/GAME-WIKI-STRUCTURE-2026-10.md): every small-game hub ranking top 5 for "<game> wiki" opens its title and
// H1 with "<Game> Wiki", while a codes-led homepage splits the codes cluster with /codes/ (petsuniverse: homepage stuck at
// #8, /codes/ never ranked). A short live-codes block stays here and links to /codes/ with the query as anchor text.
export const metadata: Metadata = {
  title: { absolute: `${GAME.name} Wiki: Codes, Tier List & Guides` },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const sections = [
    { href: "/codes/", title: "Codes", body: `All ${codes.length} working codes and what each one gives you.` },
    { href: "/tier-list/", title: "Tier list", body: `Which ${ENTITY.plural} are worth your time, ranked.` },
    { href: entityHref(), title: cap(ENTITY.plural), body: `One page per ${ENTITY.singular}: how to get it and what it does.` },
    { href: "/guide/", title: "Beginner guide", body: "What to do first, and what to skip." },
  ];

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
            <h1 className="mt-5 max-w-[16ch] text-5xl sm:text-6xl">
              {GAME.name} <span className="text-rust">Wiki</span>
            </h1>
            <p className="mt-6 max-w-[56ch] text-lg text-ink-soft">
              A page for every {ENTITY.singular}, a tier list, a beginner guide and the working codes for {MONTH_YEAR}. Every code is
              checked against at least two sources, so you don&apos;t waste time on dead ones.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/codes/" className="btn-ember">
                All {codes.length} {GAME.name} codes
              </Link>
              <Link href="/tier-list/" className="arrow-link text-sm font-semibold text-ink">
                Tier list <span className="arrow">→</span>
              </Link>
            </div>
          </div>
          {/* Official game art (developer-uploaded, pulled by scripts/fetch-media.mjs).
              LCP element → eager + high priority. Absent files → this block is not rendered. */}
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
        <Stat value={codes.length} label="working codes" />
        <Stat value={entities.length} label={`${ENTITY.plural} covered`} />
        <Stat value={LAST_CHECKED} label="last checked" />
      </section>

      <section className="container-page mt-16">
        <h2 className="text-2xl">Newest codes</h2>
        <div className="tile mt-5 overflow-x-auto p-5">
          <table className="data">
            <thead>
              <tr>
                <th>Code</th>
                <th>Reward</th>
                <th>
                  <span className="sr-only">Copy</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {codes.slice(0, 3).map((c) => (
                <tr key={c.code}>
                  <td>
                    <code className="font-semibold">{c.code}</code>
                  </td>
                  <td className="text-ink-soft">{c.reward}</td>
                  <td className="text-right">
                    <CopyCode code={c.code} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link href="/codes/" className="arrow-link mt-4 inline-block text-sm font-semibold">
          All {GAME.name} codes and how to redeem <span className="arrow">→</span>
        </Link>
      </section>

      <section className="container-page mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((s) => (
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
            <h2 className="text-2xl">
              Every {GAME.name} {ENTITY.singular}
            </h2>
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

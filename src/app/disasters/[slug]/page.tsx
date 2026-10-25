import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { entities, getEntity, LAST_CHECKED } from "@/data/game";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EntityCard } from "@/components/entity-card";
import { ENTITY, GAME, cap, entityHref } from "@/lib/site";

// One page per entity = one set of queries ("<name>", "<name> <game>", "how to get <name>").
// A single list page with every name on it ranks for almost nothing (AGENTS.md, 2026-09-21).
type RouteParams = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return entities.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const e = getEntity((await params).slug);
  if (!e) return {};
  return {
    title: { absolute: `${e.name} — ${GAME.name} wiki` },
    description: `${e.name} in ${GAME.name}: what the banner announces, what the hazard does to the map, and where to stand to survive it. Checked ${LAST_CHECKED}.`.slice(0, 160),
    alternates: { canonical: entityHref(e.slug) },
  };
}

export default async function EntityPage({ params }: RouteParams) {
  const e = getEntity((await params).slug);
  if (!e) notFound();
  const others = entities.filter((x) => x.slug !== e.slug).slice(0, 6);
  const facts: [string, string | null][] = [
    ["Hazard type", e.rarity],
    ["Where it hits", e.role],
    ["How to survive", e.howToGet],
  ];

  return (
    <article className="container-page">
      <Breadcrumbs items={[{ name: cap(ENTITY.plural), href: entityHref() }, { name: e.name, href: entityHref(e.slug) }]} />
      <header className="pt-6 pb-10">
        <div className="flex flex-wrap items-center gap-2">
          {e.rarity && <span className="tag">{e.rarity}</span>}
          <span className="text-xs text-ink-faint">
            Checked {LAST_CHECKED} · {e.sources} source{e.sources === 1 ? "" : "s"}
          </span>
        </div>
        <h1 className="mt-4 text-4xl sm:text-5xl">{e.name}</h1>
        <p className="mt-4 max-w-[60ch] text-lg text-ink-soft">{e.summary}</p>
      </header>

      <section className="tile max-w-2xl p-5">
        <table className="data">
          <tbody>
            {e.banner && (
              <tr>
                <th scope="row" className="w-40">
                  The banner says
                </th>
                <td>&ldquo;{e.banner}&rdquo;</td>
              </tr>
            )}
            {facts.map(([k, v]) => (
              <tr key={k}>
                <th scope="row" className="w-40">
                  {k}
                </th>
                <td className={v ? "" : "text-ink-faint"}>{v ?? "Not published yet"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!e.verified && (
          <p className="mt-4 text-sm text-ink-soft">
            This {ENTITY.singular} is in the game, but nobody reliable has published the details above yet. We fill them in once two
            sources agree.
          </p>
        )}
      </section>

      {e.stages && e.stages.length > 0 && (
        <section className="mt-14 max-w-3xl">
          <h2 className="text-2xl">How the round plays out</h2>
          <ol className="mt-4 grid gap-3">
            {e.stages.map((s, i) => (
              <li key={s} className="tile p-4">
                <span className="num mr-2 font-serif text-rust">{i + 1}.</span>
                <span className="text-ink-soft">{s}</span>
              </li>
            ))}
          </ol>
          {e.killSpots && (
            <p className="mt-5 text-ink-soft">
              <strong className="text-ink">Where it kills you:</strong> {e.killSpots}
            </p>
          )}
        </section>
      )}

      {e.prep && e.prep.length > 0 && (
        <section className="mt-14 max-w-3xl">
          <h2 className="text-2xl">What to do in the 30-second head start</h2>
          <ul className="mt-4 grid gap-3">
            {e.prep.map((p) => (
              <li key={p} className="flex gap-3 text-ink-soft">
                <span className="text-rust">›</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          {e.ifCaught && (
            <p className="mt-5 text-ink-soft">
              <strong className="text-ink">If you are already caught out:</strong> {e.ifCaught}
            </p>
          )}
          {e.worstMaps && (
            <p className="mt-3 text-ink-soft">
              <strong className="text-ink">Worst maps for it:</strong> {e.worstMaps}
            </p>
          )}
        </section>
      )}

      <p className="mt-10 text-sm text-ink-soft">
        Surviving is half preparation and half knowing the map — see the <Link href="/maps/" className="text-link">map list</Link> and the{" "}
        <Link href="/guide/" className="text-link">round guide</Link> for the 30-second head start.
      </p>

      {others.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl">Other {ENTITY.plural}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((x) => (
              <EntityCard key={x.slug} e={x} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

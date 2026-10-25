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
    description: `${e.name} in ${GAME.name}: ${e.rarity ? `${e.rarity} rarity, ` : ""}${e.howToGet ? `how to get it, ` : ""}what it's good at and where it ranks. Checked ${LAST_CHECKED}.`.slice(0, 160),
    alternates: { canonical: entityHref(e.slug) },
  };
}

export default async function EntityPage({ params }: RouteParams) {
  const e = getEntity((await params).slug);
  if (!e) notFound();
  const others = entities.filter((x) => x.slug !== e.slug).slice(0, 6);
  const facts: [string, string | null][] = [
    ["Tier", e.tier],
    ["Rarity", e.rarity],
    ["Role", e.role],
    ["How to get", e.howToGet],
  ];

  return (
    <article className="container-page">
      <Breadcrumbs items={[{ name: cap(ENTITY.plural), href: entityHref() }, { name: e.name, href: entityHref(e.slug) }]} />
      <header className="pt-6 pb-10">
        <div className="flex flex-wrap items-center gap-2">
          {e.tier && <span className="tag">Tier {e.tier}</span>}
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

      <p className="mt-10 text-sm text-ink-soft">
        Need more currency for it? Grab the <Link href="/codes/" className="text-link">working codes</Link> first, or check where it sits on
        the <Link href="/tier-list/" className="text-link">tier list</Link>.
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

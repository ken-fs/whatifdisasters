import type { Metadata } from "next";
import { byTier, LAST_CHECKED, MONTH_YEAR, TIERS } from "@/data/game";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EntityCard } from "@/components/entity-card";
import { ENTITY, GAME, cap } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${GAME.name} tier list: best ${ENTITY.plural} (${MONTH_YEAR})` },
  description: `Every ${GAME.name} ${ENTITY.singular} ranked from S to D, with a short reason for each and a page per ${ENTITY.singular}. Updated ${LAST_CHECKED}.`,
  alternates: { canonical: "/tier-list/" },
};

export default function TierListPage() {
  const unranked = byTier(null);
  return (
    <article className="container-page">
      <Breadcrumbs items={[{ name: "Tier list", href: "/tier-list/" }]} />
      <header className="pt-6 pb-10">
        <p className="tag">Updated {LAST_CHECKED}</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">{GAME.name} tier list</h1>
        <p className="mt-4 max-w-[60ch] text-ink-soft">
          S is worth building around, D is fine to skip. Where creators disagree on a rank, the {ENTITY.singular} page says so.
        </p>
      </header>

      {TIERS.map((tier) => {
        const list = byTier(tier);
        if (!list.length) return null;
        return (
          <section key={tier} className="mt-10 grid gap-4 md:grid-cols-[6rem_1fr]">
            <h2 className="font-serif text-5xl text-rust">{tier}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((e) => (
                <EntityCard key={e.slug} e={e} />
              ))}
            </div>
          </section>
        );
      })}

      {unranked.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl">Not ranked yet</h2>
          <p className="mt-2 text-sm text-ink-soft">
            {cap(ENTITY.plural)} without enough reliable info to rank. They move up as soon as there is.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unranked.map((e) => (
              <EntityCard key={e.slug} e={e} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

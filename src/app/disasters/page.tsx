import type { Metadata } from "next";
import { entities, LAST_CHECKED } from "@/data/game";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EntityCard } from "@/components/entity-card";
import { ItemListJsonLd } from "@/components/json-ld";
import { ENTITY, GAME, cap, entityHref } from "@/lib/site";

// Rename this folder (src/app/units) together with `entity.path` in src/config/site.json.
export const metadata: Metadata = {
  title: { absolute: `${GAME.name}: all ${entities.length} disasters and how to survive them` },
  description: `Every ${ENTITY.singular} in ${GAME.name} with its rarity, tier and how to get it. One page per ${ENTITY.singular}. Updated ${LAST_CHECKED}.`,
  alternates: { canonical: entityHref() },
};

export default function EntityListPage() {
  return (
    <article className="container-page">
      <ItemListJsonLd name={`${GAME.name} ${ENTITY.plural}`} items={entities.map((e) => ({ name: e.name, href: entityHref(e.slug) }))} />
      <Breadcrumbs items={[{ name: cap(ENTITY.plural), href: entityHref() }]} />
      <header className="pt-6 pb-10">
        <h1 className="text-4xl sm:text-5xl">
          {GAME.name}: every {ENTITY.singular}
        </h1>
        <p className="mt-4 max-w-[60ch] text-ink-soft">
          All {entities.length} {ENTITY.plural} recorded so far — what the banner says, what the hazard does to the map, and where to stand.
          Ones without a screenshot yet are still fully documented.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entities.map((e) => (
          <EntityCard key={e.slug} e={e} />
        ))}
      </div>
    </article>
  );
}

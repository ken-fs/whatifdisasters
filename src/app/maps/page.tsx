import type { Metadata } from "next";
import Link from "next/link";
import { maps, LAST_CHECKED } from "@/data/game";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GAME, entityHref } from "@/lib/site";

// One page for the map list rather than one page per map: only a handful of maps have enough recorded detail to
// stand alone, and a thin page per map is the failure mode animebreaker hit (166-word pages pulled from the index).
export const metadata: Metadata = {
  title: { absolute: `${GAME.name} maps: every location rounds are set in` },
  description: `The ${GAME.name} map list so far, what cover each one gives you, and how to read a map before the disaster banner fires. Checked ${LAST_CHECKED}.`,
  alternates: { canonical: "/maps/" },
};

export default function MapsPage() {
  return (
    <article className="container-page">
      <Breadcrumbs items={[{ name: "Maps", href: "/maps/" }]} />
      <header className="pt-6 pb-10">
        <p className="tag">Checked {LAST_CHECKED}</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">{GAME.name} maps</h1>
        <p className="mt-4 max-w-[62ch] text-lg text-ink-soft">
          The disaster and the map are picked separately, so the map does not tell you what is coming — the banner does. What the map
          decides is where you can stand when it hits, and that is what this page tracks.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {maps.map((m) => (
          <div key={m.slug} id={m.slug} className="tile p-5">
            <h2 className="font-serif text-xl">{m.name}</h2>
            <p className="mt-2 text-sm text-ink-soft">{m.note}</p>
            {"use" in m && <p className="mt-3 text-sm text-ink-soft"><strong className="text-ink">How to use it:</strong> {(m as { use?: string }).use}</p>}
          </div>
        ))}
      </section>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl">How to read a map in the 30-second head start</h2>
        <div className="mt-4 grid gap-4 text-ink-soft">
          <p>
            You spawn with <strong>DISASTER IN 00:30</strong> on screen and no idea what is coming. Use the time to answer one question:
            where is the highest covered ground I can reach, and where is the ground floor I would need to leave?
          </p>
          <p>
            Water scenarios — the mega tsunami, all the ice melting, the roll-back — want you up and inland. The solar flare and the sun
            disappearing want you indoors, which on most maps means leaving the roof you just climbed. The floor-to-lava round punishes
            standing still on any one surface.
          </p>
          <p>
            Cars on Suburban Neighborhood hold several players and make a fast reposition, but a ride is never guaranteed and the driver
            can leave you in the open. Treat a car as a bonus, not the plan.
          </p>
        </div>
        <p className="mt-6 text-sm text-ink-soft">
          What each scenario does to these maps is on the <Link href={entityHref()} className="text-link">disaster pages</Link>, and the
          full round loop is in the <Link href="/guide/" className="text-link">beginner guide</Link>.
        </p>
      </section>
    </article>
  );
}

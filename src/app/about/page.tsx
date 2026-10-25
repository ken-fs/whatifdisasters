import type { Metadata } from "next";
import { gaps, LAST_CHECKED, mediaCredits } from "@/data/game";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GAME, PLATFORM_NAME, SITE_NAME } from "@/lib/site";
import { GAME_ICON } from "@/lib/media";

export const metadata: Metadata = {
  title: { absolute: `About — ${SITE_NAME}` },
  description: `How ${SITE_NAME} checks ${GAME.name} facts: what counts as a source, when a disaster page goes live, and what is still unknown.`,
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  return (
    <article className="container-page max-w-3xl">
      <Breadcrumbs items={[{ name: "About", href: "/about/" }]} />
      <h1 className="mt-6 text-4xl">Where the info comes from</h1>
      <div className="mt-6 grid gap-5 text-ink-soft">
        <p>
          {SITE_NAME} is a fan-made reference for {GAME.name} on {PLATFORM_NAME}. It isn&apos;t run by {GAME.developer || "the developer"} or{" "}
          {PLATFORM_NAME}.
        </p>
        <p>
          A disaster page goes live once the &quot;What if...?&quot; banner text is recorded and the hazard itself can be described from
          footage - two independent recordings, or one recording plus the official game page. Survival notes are written from what the
          hazard does to the map, not from developer statements, and are labelled that way. If we can&apos;t confirm something, the page
          says so instead of guessing. The game currently has no codes, so the codes page says that plainly instead of inventing a list.
        </p>
        <p>Last full check: {LAST_CHECKED}.</p>
        {GAME_ICON && (
          <figure className="mt-2 flex items-center gap-4">
            <img src={GAME_ICON} alt={`${GAME.name} game icon`} width={72} height={72} className="rounded-xl border border-line" />
            <figcaption className="text-sm">
              Play the game:{" "}
              <a href={GAME.official} className="text-link" rel="nofollow noopener">
                {GAME.name} on {PLATFORM_NAME}
              </a>
              . The two screenshots and the icon are the developer&apos;s official artwork. Everything else on the disaster and map pages is an
              in-game screenshot taken from a recorded session, credited to the player who recorded it below.
            </figcaption>
          </figure>
        )}
      </div>
      {mediaCredits.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl">Screenshot credits</h2>
          <p className="mt-3 text-sm text-ink-soft">
            Hazard and map screenshots are stills from these recordings. They are used to show what a round actually looks like; the game
            and its art belong to the developer.
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-ink-soft">
            {mediaCredits.map((c) => (
              <li key={c.video}>
                <a href={c.video} className="text-link" rel="nofollow noopener">
                  {c.channel}
                </a>{" "}
                — {c.title}
              </li>
            ))}
          </ul>
        </section>
      )}

      {gaps.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl">What nobody has published yet</h2>
          <ul className="mt-4 grid gap-3">
            {gaps.map((g) => (
              <li key={g} className="tile p-4 text-sm text-ink-soft">
                {g}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

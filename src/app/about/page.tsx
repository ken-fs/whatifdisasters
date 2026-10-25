import type { Metadata } from "next";
import { gaps, LAST_CHECKED } from "@/data/game";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GAME, PLATFORM_NAME, SITE_NAME } from "@/lib/site";
import { GAME_ICON } from "@/lib/media";

export const metadata: Metadata = {
  title: { absolute: `About — ${SITE_NAME}` },
  description: `How ${SITE_NAME} checks ${GAME.name} codes and data: what counts as a source, when something goes live, and what is still unknown.`,
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
          A code goes on the codes page once at least two independent sources list it with the same reward. Game facts come from the game
          itself, the official {PLATFORM_NAME} page and creator videos. If we can&apos;t confirm something, the page says so instead of
          guessing.
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
              . Screenshots and the icon on this site are the developer&apos;s official artwork, used here to reference the game.
            </figcaption>
          </figure>
        )}
      </div>
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

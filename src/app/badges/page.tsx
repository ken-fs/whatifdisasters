import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AdsterraBanner } from "@/components/adsterra-banner";
import { FaqJsonLd } from "@/components/json-ld";
import { RECTANGLE } from "@/lib/ads";
import { GAME } from "@/lib/site";
import badgeData from "@/data/badges.json";
import guideData from "@/data/badge-guides.json";

/**
 * Every badge in the game. Names, official hints and award counts: src/data/badges.json,
 * refreshed from the Roblox badges API on each build. How to get the secret ones:
 * src/data/badge-guides.json (two independent creator videos per badge). A badge the
 * guides don't cover still shows, with its official hint only.
 */
const all = badgeData.badges;
const guides = guideData.guides;
const isMilestone = (name: string) => /^Survived [\d,]+ Disasters?$/.test(name);
const milestones = all.filter((b) => isMilestone(b.name)).sort((a, b) => b.awarded - a.awarded);
const secret = all
  .filter((b) => !isMilestone(b.name))
  .map((b) => ({ ...b, guide: guides.find((g) => g.name === b.name) }))
  .sort((a, b) => b.awarded - a.awarded);
const rarestSecret = [...secret].sort((a, b) => a.awarded - b.awarded)[0];
const easiestSecret = secret[0];
const hint = (d: string) => d.replace(/^A secret achievement\.\s*/, "");
const n = (x: number) => x.toLocaleString("en-US");
const titles = secret.filter((b) => b.guide?.title);

const faq = [
  {
    q: `How many badges are in ${GAME.name}?`,
    a: `${all.length}: ${milestones.length} survival milestones (from 1 to ${milestones[milestones.length - 1]?.name.replace(/^Survived | Disasters?$/g, "")} disasters) and ${secret.length} secret badges with riddle hints.`,
  },
  rarestSecret?.guide && {
    q: `What is the rarest secret badge in ${GAME.name}?`,
    a: `${rarestSecret.name}, with ${n(rarestSecret.awarded)} players. ${rarestSecret.guide.howTo}`,
  },
  easiestSecret?.guide && {
    q: `What is the easiest secret badge in ${GAME.name}?`,
    a: `${easiestSecret.name} (${n(easiestSecret.awarded)} players). ${easiestSecret.guide.howTo}`,
  },
].filter(Boolean) as { q: string; a: string }[];

export const metadata: Metadata = {
  title: { absolute: `${GAME.name} badges: all ${all.length}, and how to get every secret one` },
  description: `How to get all ${secret.length} secret ${GAME.name} badges (Crow's Nest, Tank Top, Lightkeeper, Castaway…), plus the survival milestones and the titles they give.`.slice(
    0,
    160,
  ),
  alternates: { canonical: "/badges/" },
};

export default function BadgesPage() {
  return (
    <article className="container-page">
      <FaqJsonLd items={faq} />
      <Breadcrumbs items={[{ name: "Badges", href: "/badges/" }]} />

      <header className="pt-6 pb-10">
        <h1 className="mt-4 text-4xl sm:text-5xl">{GAME.name} badges</h1>
        <p className="mt-4 max-w-[62ch] text-ink-soft">
          {GAME.name} has {all.length} badges. {milestones.length} are for surviving a set number of disasters. The other{" "}
          {secret.length} are secret: the game only gives you a riddle. Here&apos;s what each riddle means and exactly where to stand.
          Player counts are live from Roblox, checked {badgeData.checkedAt}.
        </p>
      </header>

      <nav aria-label="Secret badges" className="flex flex-wrap gap-2">
        {secret.map((b) => (
          <a key={b.id} href={`#${b.id}`} className="tag">
            {b.name}
          </a>
        ))}
      </nav>

      <section className="mt-10 grid gap-5">
        <h2 className="text-2xl">The {secret.length} secret badges, easiest first</h2>
        {secret.map((b) => (
          <div key={b.id} id={String(b.id)} className="tile scroll-mt-24 p-5 sm:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h3 className="font-serif text-xl">{b.name}</h3>
              <span className="num text-sm text-ink-soft">{n(b.awarded)} players have it</span>
            </div>
            <p className="mt-2 text-sm italic text-ink-soft">&ldquo;{hint(b.description)}&rdquo;</p>
            {b.guide ? (
              <>
                <p className="mt-4">{b.guide.howTo}</p>
                {b.guide.steps.length > 1 && (
                  <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink-soft">
                    {b.guide.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                )}
                <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <div>
                    <dt className="inline text-ink-faint">Map: </dt>
                    <dd className="inline">
                      {b.guide.map ? (
                        <Link href={`/maps/#${b.guide.map}`} className="text-link">
                          {b.guide.mapName}
                        </Link>
                      ) : (
                        b.name === "Sisyphus" ? "The lobby" : "Any map"
                      )}
                    </dd>
                  </div>
                  {b.guide.title && (
                    <div>
                      <dt className="inline text-ink-faint">Title: </dt>
                      <dd className="inline">
                        {b.guide.title}
                        {!b.guide.titleConfirmed && <span className="text-ink-faint"> (seen in one video)</span>}
                      </dd>
                    </div>
                  )}
                </dl>
                {b.guide.caveat && <p className="mt-3 text-sm text-ink-soft">Heads up: {b.guide.caveat}</p>}
                <p className="mt-3 text-xs text-ink-faint">
                  Sources:{" "}
                  {b.guide.sources.map((s, i) => (
                    <span key={s}>
                      {i > 0 && ", "}
                      <a href={s} target="_blank" rel="noopener nofollow" className="hover:underline">
                        video {i + 1}
                      </a>
                    </span>
                  ))}
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-ink-soft">New badge: nobody has shown how to get it yet. We add it once two sources agree.</p>
            )}
          </div>
        ))}
      </section>

      <AdsterraBanner slot={RECTANGLE} className="mt-10" />

      <section className="mt-14 tile overflow-x-auto p-5">
        <h2 className="mb-4 font-serif text-lg">Survival milestones</h2>
        <table className="data">
          <thead>
            <tr>
              <th>Badge</th>
              <th>What it asks</th>
              <th>Players</th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((b) => (
              <tr key={b.id}>
                <td className="font-semibold">{b.name}</td>
                <td className="text-sm text-ink-soft">{b.description}</td>
                <td className="num">{n(b.awarded)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-sm text-ink-soft">
          Survivals add up across rounds and maps. Rounds you only spectate don&apos;t count. The{" "}
          <Link href="/guide/" className="text-link">
            round guide
          </Link>{" "}
          and the{" "}
          <Link href="/disasters/" className="text-link">
            disaster pages
          </Link>{" "}
          show where to stand to make it through.
        </p>
      </section>

      {titles.length > 0 && (
        <section className="mt-14 max-w-3xl">
          <h2 className="text-2xl">Titles from secret badges</h2>
          <p className="mt-3 text-ink-soft">
            Each secret badge&apos;s pop-up says &ldquo;New title&rdquo;. These are the ones shown in creator videos:
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {titles.map((b) => (
              <li key={b.id} className="tag">
                {b.guide!.title} <span className="text-ink-faint">· {b.name}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-soft">
            VIP, the biggest credit pack and the Witching Hour crates give titles too: see{" "}
            <Link href="/shop/" className="text-link">
              the shop page
            </Link>
            .
          </p>
        </section>
      )}

      <section className="mt-14 max-w-3xl">
        <h2 className="text-2xl">Questions</h2>
        <dl className="mt-4 grid gap-6">
          {faq.map((f) => (
            <div key={f.q}>
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-1 text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-xs text-ink-faint">
          How-tos come from two separate creator guides recorded on 21 October 2026. A later update could change a badge; if one
          stops working, tell us on the <Link href="/about/" className="hover:underline">about page</Link>.
        </p>
      </section>
    </article>
  );
}

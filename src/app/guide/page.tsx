import type { Metadata } from "next";
import { guide, LAST_CHECKED, videos } from "@/data/game";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { VideoEmbed } from "@/components/video-embed";
import { GAME } from "@/lib/site";
import { EXTRA_SHOTS } from "@/lib/media";

export const metadata: Metadata = {
  title: { absolute: `${GAME.name} beginner guide: what to do first` },
  description: `A short ${GAME.name} beginner guide: what to do in your first session, what to spend currency on, and what to skip. Updated ${LAST_CHECKED}.`,
  alternates: { canonical: "/guide/" },
};

export default function GuidePage() {
  return (
    <article className="container-page">
      <Breadcrumbs items={[{ name: "Guide", href: "/guide/" }]} />
      <header className="pt-6 pb-10">
        <p className="tag">Updated {LAST_CHECKED}</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">{GAME.name} beginner guide</h1>
        <p className="mt-4 max-w-[60ch] text-ink-soft">
          The short version of a round, in the order it happens. There are no codes to redeem here - rewards come from the shop and
          crates you pay for with credits.
        </p>
      </header>
      <div className="grid max-w-3xl gap-10">
        {guide.map((s, i) => (
          <section key={s.heading} id={`step-${i + 1}`}>
            <h2 className="text-2xl">
              <span className="num text-rust">{i + 1}.</span> {s.heading}
            </h2>
            <p className="mt-3 text-ink-soft">{s.body}</p>
          </section>
        ))}
      </div>
      {EXTRA_SHOTS.length > 0 && (
        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          {EXTRA_SHOTS.map((src) => (
            <figure key={src}>
              <img
                src={src}
                alt={`${GAME.name} official screenshot`}
                width={768}
                height={432}
                loading="lazy"
                decoding="async"
                className="w-full rounded-xl border border-line"
              />
            </figure>
          ))}
          <p className="text-xs text-ink-faint sm:col-span-2">Official {GAME.name} artwork.</p>
        </section>
      )}
      {videos.length > 0 && (
        <section className="mt-14 grid gap-6 md:grid-cols-2">
          {videos.map((v) => (
            <VideoEmbed key={v.id} {...v} />
          ))}
        </section>
      )}
    </article>
  );
}

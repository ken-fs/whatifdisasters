import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CONTACT_EMAIL, GAME, PLATFORM_NAME, SITE_NAME } from "@/lib/site";
import { LAST_CHECKED } from "@/data/game";

export const metadata: Metadata = {
  title: "Terms",
  description: `The short terms for using ${SITE_NAME}: it's a free fan site, info can go out of date, and game names belong to their owners.`,
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return (
    <article className="container-page max-w-3xl">
      <Breadcrumbs items={[{ name: "Terms", href: "/terms/" }]} />
      <h1 className="mt-6 text-4xl">Terms</h1>
      <div className="mt-6 grid gap-5 text-ink-soft">
        <p>{SITE_NAME} is a free fan site. Use it as a guide, not a guarantee: the game changes between our checks, and a scenario can behave differently after an update.</p>
        <p>
          {GAME.name}, its art and its names belong to {GAME.developer || "the developer"}. {PLATFORM_NAME} is a trademark of its owner. We
          aren&apos;t affiliated with either. If you own something shown here and want it changed or removed, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">
            {CONTACT_EMAIL}
          </a>{" "}
          and we will.
        </p>
        <p>Links to other sites are there to help; we don&apos;t control what&apos;s on them.</p>
        <p className="text-sm text-ink-faint">Last updated {LAST_CHECKED}.</p>
      </div>
    </article>
  );
}

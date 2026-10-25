import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site";
import { LAST_CHECKED } from "@/data/game";

export const metadata: Metadata = {
  title: "Privacy",
  description: `What ${SITE_NAME} collects (very little), how analytics consent works, and how ads on this site handle data.`,
  alternates: { canonical: "/privacy/" },
};

export default function PrivacyPage() {
  return (
    <article className="container-page max-w-3xl">
      <Breadcrumbs items={[{ name: "Privacy", href: "/privacy/" }]} />
      <h1 className="mt-6 text-4xl">Privacy</h1>
      <div className="mt-6 grid gap-5 text-ink-soft">
        <p>
          {SITE_NAME} ({SITE_URL}) has no accounts, no forms and no newsletter. We don&apos;t collect your name, email or anything else you
          type. The only thing stored in your browser is your analytics choice.
        </p>
        <h2 className="mt-4 text-xl text-ink">Analytics</h2>
        <p>
          We use Google Analytics to see which pages get read. It only loads after you press &quot;Allow analytics&quot;. If you say no, or
          ignore the banner, nothing from Google loads. Your choice is saved in your browser&apos;s local storage so we don&apos;t ask again.
          Clear your site data to change it.
        </p>
        <h2 className="mt-4 text-xl text-ink">Ads</h2>
        <p>
          Some pages show ads from Adsterra. Each ad runs inside its own sandboxed frame, so it can&apos;t read this page. The ad network may
          use cookies or similar tech to pick ads; see Adsterra&apos;s own privacy policy for details.
        </p>
        <h2 className="mt-4 text-xl text-ink">Videos</h2>
        <p>YouTube videos only load when you press play, and use YouTube&apos;s privacy-enhanced (no-cookie) mode.</p>
        <p>
          Questions:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="text-sm text-ink-faint">Last updated {LAST_CHECKED}.</p>
      </div>
    </article>
  );
}

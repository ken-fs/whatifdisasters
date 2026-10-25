import type { Metadata } from "next";
import Link from "next/link";
import { codes, codesFaq, expiredCodes, LAST_CHECKED, MONTH_YEAR, redeemSteps } from "@/data/game";
import { CopyCode } from "@/components/copy-code";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FaqJsonLd } from "@/components/json-ld";
import { AdsterraBanner } from "@/components/adsterra-banner";
import { LEADERBOARD, RECTANGLE } from "@/lib/ads";
import { GAME, ENTITY } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: `${GAME.name} codes (${MONTH_YEAR}): ${codes.length} working codes` },
  description: `All ${codes.length} working ${GAME.name} codes with the exact reward for each, how to redeem them, and the ones that have expired. Checked ${LAST_CHECKED}.`,
  alternates: { canonical: "/codes/" },
};

export default function CodesPage() {
  return (
    <article className="container-page">
      <FaqJsonLd items={codesFaq} />
      <Breadcrumbs items={[{ name: "Codes", href: "/codes/" }]} />

      <header className="pt-6 pb-10">
        <p className="tag">Checked {LAST_CHECKED}</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">{GAME.name} codes</h1>
        <p className="mt-4 max-w-[60ch] text-ink-soft">
          {codes.length > 0
            ? `${codes.length} codes that work right now. Each one is listed by at least two independent sources before it goes on this page. Codes are case-sensitive, so use the Copy button.`
            : "No working codes right now. The developers have not released any - this page is re-checked whenever the game updates, and a code only appears here after two independent sources list it."}
        </p>
      </header>

      <AdsterraBanner slot={LEADERBOARD} className="mb-10 hidden md:flex" />

      <section className="tile overflow-x-auto p-5">
        <table className="data">
          <thead>
            <tr>
              <th>Code</th>
              <th>Reward</th>
              <th>Added</th>
              <th>
                  <span className="sr-only">Copy</span>
                </th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.code}>
                <td>
                  <code className="font-semibold">{c.code}</code>
                </td>
                <td className="text-ink-soft">{c.reward}</td>
                <td className="num text-ink-faint">{c.added ?? "—"}</td>
                <td className="text-right">
                  <CopyCode code={c.code} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl">How to redeem codes</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-2">
          {redeemSteps.map((step, i) => (
            <li key={step} className="tile flex gap-4 p-5">
              <span className="num font-serif text-xl text-rust">{i + 1}</span>
              <span className="text-sm text-ink-soft">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {expiredCodes.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl">Expired codes</h2>
          <p className="mt-2 text-sm text-ink-soft">These no longer work. They&apos;re here so you know not to bother.</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {expiredCodes.map((c) => (
              <li key={c.code} className="tag line-through">
                {c.code}
              </li>
            ))}
          </ul>
        </section>
      )}

      <AdsterraBanner slot={RECTANGLE} className="mt-14" />

      <section className="mt-14">
        <h2 className="text-2xl">Questions</h2>
        <dl className="mt-5 grid gap-4">
          {codesFaq.map((f) => (
            <div key={f.q} className="tile p-5">
              <dt className="font-semibold">{f.q}</dt>
              <dd className="mt-2 text-sm text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-12 text-sm text-ink-soft">
        Got your rewards? See <Link href="/tier-list/" className="text-link">the tier list</Link> before you spend them, or read the{" "}
        <Link href="/guide/" className="text-link">beginner guide</Link>. Every {ENTITY.singular} has its own page too.
      </p>
    </article>
  );
}

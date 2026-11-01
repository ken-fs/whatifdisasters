import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AdsterraBanner } from "@/components/adsterra-banner";
import { FaqJsonLd } from "@/components/json-ld";
import { RECTANGLE } from "@/lib/ads";
import { GAME } from "@/lib/site";
import shop from "@/data/shop.json";

/**
 * Gamepasses, Robux shop items and the titles they come with. Every price and "what it
 * does" line comes from src/data/shop.json, refreshed from the Roblox store on each build
 * (scripts/fetch-shop.mjs). Prose that compares items looks them up by name and drops out
 * if the item is gone, so a price change never leaves a wrong number on the page.
 */
type Item = { id: number; name: string; price: number; description: string };

const passes: Item[] = [...shop.gamePasses].sort((a, b) => a.price - b.price);
const gifts = shop.products.filter((p) => p.name.startsWith("Gift:"));
const products: Item[] = shop.products.filter((p) => !p.name.startsWith("Gift:") && p.name && p.name !== "None");

const GROUPS: { key: string; title: string; note: string; match: RegExp }[] = [
  { key: "credits", title: "Credit packs", note: "Credits are what you spend in The Vault. Bigger packs give more per Robux.", match: /Credits/ },
  { key: "xp", title: "Double XP", note: "Timed boosts that double the XP you get from rounds.", match: /^2x XP/ },
  { key: "crates", title: "Witching Hour crates", note: "Halloween crates: each one opens a random Halloween item or title.", match: /Crate/ },
  { key: "harvest", title: "Harvest Feast", note: "Corn feeds your Harvest Feast turkey. These are for the Harvest Feast event.", match: /corn|harvest/i },
];
const grouped = GROUPS.map((g) => ({ ...g, items: products.filter((p) => g.match.test(p.name)).sort((a, b) => a.price - b.price) })).filter(
  (g) => g.items.length,
);
const other = products.filter((p) => !GROUPS.some((g) => g.match.test(p.name)));
const sections = [...grouped, ...(other.length ? [{ key: "other", title: "Other", note: "Items that don't fit the groups above.", items: other }] : [])];

const robux = (n: number) => `${n.toLocaleString("en-US")} Robux`;
const pass = (name: string) => passes.find((p) => p.name === name);
const vip = pass("VIP");
const balloon = pass("Red Balloon");
const slots = passes.find((p) => /Cosmetic Slots/.test(p.name));
const creditPacks = (grouped.find((g) => g.key === "credits")?.items ?? [])
  .map((p) => ({ ...p, credits: Number(p.name.match(/^([\d,]+) Credits/)?.[1].replace(/,/g, "") ?? 0) }))
  .filter((p) => p.credits);
const perRobux = (p: { credits: number; price: number }) => (p.credits / p.price).toFixed(1);
const bestPack = creditPacks[creditPacks.length - 1];
// Multi-open crate bundles say the same thing as the single crate, so list the single one only.
const titles = [...passes, ...products].filter((p) => (/title/i.test(p.description) || /title/i.test(p.name)) && !/Crate x\d+$/.test(p.name));

const faq = [
  passes.length > 0 && {
    q: `What gamepasses does ${GAME.name} have?`,
    a: `${passes.length}: ${passes.map((p) => `${p.name} (${robux(p.price)})`).join(", ")}.`,
  },
  vip && {
    q: `Is VIP worth it in ${GAME.name}?`,
    a: `VIP costs ${robux(vip.price)} and, per the store, gives +100% credits every round, +50% XP and a VIP title. It's the only pass that speeds up progress; the rest are for movement, music or looks.`,
  },
  titles.length > 0 && {
    q: `How do you get titles in ${GAME.name}?`,
    a: `From the Robux shop: ${titles.map((t) => t.name).join(", ")} all come with or can roll a title. Other titles in the game aren't listed in the store.`,
  },
].filter(Boolean) as { q: string; a: string }[];

export const metadata: Metadata = {
  title: { absolute: `${GAME.name} gamepasses, shop prices and titles` },
  description: `Every ${GAME.name} gamepass and Robux shop item with its current price and what it does: VIP, credit packs, double XP, Witching Hour crates and titles. Checked ${shop.checkedAt}.`.slice(
    0,
    160,
  ),
  alternates: { canonical: "/shop/" },
};

function PriceTable({ items }: { items: Item[] }) {
  return (
    <table className="data">
      <thead>
        <tr>
          <th>Item</th>
          <th>Price</th>
          <th>What the store says</th>
        </tr>
      </thead>
      <tbody>
        {items.map((p) => (
          <tr key={p.id}>
            <td className="font-semibold">{p.name}</td>
            <td className="num whitespace-nowrap text-rust">{robux(p.price)}</td>
            <td className="text-sm text-ink-soft">{p.description || <span className="text-ink-faint">No description in the store</span>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ShopPage() {
  return (
    <article className="container-page">
      <FaqJsonLd items={faq} />
      <Breadcrumbs items={[{ name: "Shop", href: "/shop/" }]} />

      <header className="pt-6 pb-10">
        <h1 className="mt-4 text-4xl sm:text-5xl">{GAME.name} shop and gamepasses</h1>
        <p className="mt-4 max-w-[62ch] text-ink-soft">
          {GAME.name} has {passes.length} gamepasses and {products.length} other Robux items: credit packs, double XP, event crates and
          event currency. None of it is needed to survive. Prices and descriptions below come straight from the Roblox store, checked{" "}
          {shop.checkedAt}, and update when the developer changes them.
        </p>
      </header>

      <section className="tile overflow-x-auto p-5">
        <h2 className="mb-4 font-serif text-lg">Gamepasses</h2>
        <PriceTable items={passes} />
      </section>

      <section className="mt-14 grid max-w-3xl gap-8">
        <h2 className="text-2xl">Which pass does what</h2>
        {vip && (
          <div>
            <h3 className="font-serif text-lg">
              VIP ({robux(vip.price)})
            </h3>
            <p className="mt-2 text-ink-soft">
              The only pass that speeds up progress: double credits every round, +50% XP and a VIP title. If you play a lot and want to
              buy things in The Vault, this is the one.
              {bestPack &&
                ` For comparison, the biggest credit pack is ${bestPack.credits.toLocaleString("en-US")} credits for ${robux(bestPack.price)}, a one-off.`}
            </p>
          </div>
        )}
        {balloon && (
          <div>
            <h3 className="font-serif text-lg">
              Red Balloon ({robux(balloon.price)})
            </h3>
            <p className="mt-2 text-ink-soft">
              Jump higher and fall slower. It&apos;s the only pass that changes how you move, which can matter when a disaster has you
              climbing or dropping off something tall.
            </p>
          </div>
        )}
        {slots && (
          <div>
            <h3 className="font-serif text-lg">
              {slots.name} ({robux(slots.price)})
            </h3>
            <p className="mt-2 text-ink-soft">
              The store says it plainly: cosmetics aren&apos;t gear and don&apos;t help you survive. Buy it for looks only.
            </p>
          </div>
        )}
      </section>

      {titles.length > 0 && (
        <section className="mt-14 max-w-3xl">
          <h2 className="text-2xl">Titles you can get from the shop</h2>
          <p className="mt-3 text-ink-soft">These are the store items that mention a title:</p>
          <ul className="mt-4 grid gap-3">
            {titles.map((t) => (
              <li key={t.id} className="tile p-4">
                <p className="font-semibold">
                  {t.name} <span className="text-ink-faint">· {robux(t.price)}</span>
                </p>
                <p className="mt-1 text-sm text-ink-soft">{t.description}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-ink-soft">
            The game has other titles too, but the store doesn&apos;t list them, so we don&apos;t either until they&apos;re confirmed.
          </p>
        </section>
      )}

      <AdsterraBanner slot={RECTANGLE} className="mt-10" />

      <section className="mt-14">
        <h2 className="text-2xl">Everything else in the shop</h2>
        {gifts.length > 0 && (
          <p className="mt-3 max-w-[62ch] text-ink-soft">
            Most items also come as a &ldquo;Gift:&rdquo; version at the same price, for buying for another player ({gifts.length} in total).
          </p>
        )}
        {sections.map((s) => (
          <section key={s.key} id={s.key} className="mt-10 scroll-mt-24">
            <h3 className="font-serif text-xl">{s.title}</h3>
            <p className="mt-2 max-w-[62ch] text-sm text-ink-soft">{s.note}</p>
            {s.key === "credits" && creditPacks.length > 1 && (
              <p className="mt-2 max-w-[62ch] text-sm text-ink-soft">
                Credits per Robux: {creditPacks.map((p) => `${p.credits.toLocaleString("en-US")} pack ${perRobux(p)}`).join(", ")}.
              </p>
            )}
            <div className="tile mt-4 overflow-x-auto p-5">
              <PriceTable items={s.items} />
            </div>
          </section>
        ))}
      </section>

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
      </section>

      <p className="mt-12 text-sm text-ink-soft">
        What credits and XP are for is in the <Link href="/guide/" className="text-link">beginner guide</Link>. The lobby itself is on{" "}
        <Link href="/lobby/" className="text-link">the lobby page</Link>.
      </p>
    </article>
  );
}

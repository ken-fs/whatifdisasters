import type { Metadata } from "next";
import Link from "next/link";
import { LAST_CHECKED } from "@/data/game";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { GAME, entityHref } from "@/lib/site";

// The lobby is what players sit in between rounds, so this page answers the questions that come up there:
// what the buttons do, what crates cost, and why nothing on the screen gives you a code box.
export const metadata: Metadata = {
  title: { absolute: `${GAME.name} lobby: shop, crates, missions and the INDEX button` },
  description: `What every button in the ${GAME.name} lobby does — SHOP, MISSIONS, SPECTATE, INDEX and the AFK toggle — what crates cost, and where the seasonal Fright Night tab sits. Checked ${LAST_CHECKED}.`,
  alternates: { canonical: "/lobby/" },
};

const BUTTONS = [
  {
    name: "SHOP",
    body: "Spends the credits you earn by surviving. Equipment sits here on the credits side; the Robux game passes are the paid shortcut and are not required to finish rounds.",
  },
  {
    name: "MISSIONS",
    body: "The task list that pays out for round objectives. This is the game's replacement for the codes most Roblox games hand out — you earn instead of redeem.",
  },
  {
    name: "SPECTATE",
    body: "Cycles through players still alive while a round is running. Rounds you only watched are tagged YOU WATCHED THIS ONE on the results screen, so a spectator round never counts as a survival.",
  },
  {
    name: "INDEX",
    body: "The one button nobody has fully documented. It may be the game's own list of scenarios or maps — worth a look while the NEXT DISASTER countdown runs.",
  },
  {
    name: "AFK toggle",
    body: "Marks you as away instead of loading you into the next round. Useful when you want to watch a round rather than stand on the pad.",
  },
];

export default function LobbyPage() {
  return (
    <article className="container-page">
      <Breadcrumbs items={[{ name: "Lobby", href: "/lobby/" }]} />
      <header className="pt-6 pb-10">
        <p className="tag">Checked {LAST_CHECKED}</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">{GAME.name} lobby</h1>
        <p className="mt-4 max-w-[62ch] text-lg text-ink-soft">
          Everything in a round is decided by two things: whether you stood on the pad when the countdown hit zero, and what you did in
          the 30 seconds after. The lobby is where both are set up.
        </p>
      </header>

      <section className="max-w-3xl">
        <h2 className="text-2xl">The pad is the whole lobby</h2>
        <p className="mt-3 text-ink-soft">
          The carpeted area in the middle of the lobby is what loads you into the next disaster. When NEXT DISASTER reaches zero,
          everyone standing on it sees ENTERING SIMULATION and gets moved to the map together. If you are shopping, reading the
          leaderboard or in the crate menu at zero, you stay in the lobby and the round happens without you.
        </p>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl">What each button does</h2>
        <dl className="mt-4 grid gap-3">
          {BUTTONS.map((b) => (
            <div key={b.name} className="tile p-4">
              <dt className="font-semibold">{b.name}</dt>
              <dd className="mt-1 text-sm text-ink-soft">{b.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl">Crates and the seasonal tab</h2>
        <p className="mt-3 text-ink-soft">
          A Witching Hour Crate station sits next to the leaderboards with an OPEN THE CRATE prompt. It is tied to the shop&apos;s Fright
          Night tab, which is the Halloween-season rotation rather than a permanent part of the shop. During that window the crate is the
          thing to spend on; outside it, equipment from the credits side is what carries between rounds.
        </p>
        <p className="mt-3 text-ink-soft">
          There is no code box anywhere in this lobby. The buttons are SHOP, MISSIONS, SPECTATE and INDEX — so a codes page for this game
          can only tell you that no codes exist, which is exactly what ours does.
        </p>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="text-2xl">After the round</h2>
        <p className="mt-3 text-ink-soft">
          ROUND ENDS IN hits zero and the game posts a tally in the form <em>EARTH ENTERS A MEGA STORM: 4 OF 12 SURVIVED</em>, then splits
          the server into a SURVIVORS list and a DIDN&apos;T MAKE IT list. The leaderboards include a Most Survived board, which is the only
          persistent record of how a session went.
        </p>
        <p className="mt-6 text-sm text-ink-soft">
          What each scenario does once you are on the map is on the{" "}
          <Link href={entityHref()} className="text-link">
            disaster pages
          </Link>
          , and the order of a round is in the <Link href="/guide/" className="text-link">beginner guide</Link>.
        </p>
      </section>
    </article>
  );
}

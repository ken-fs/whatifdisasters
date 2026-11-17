import { codes, entities, expiredCodes, LAST_CHECKED, redeemSteps, maps } from "@/data/game";
import { ENTITY, GAME, PLATFORM_NAME } from "@/lib/site";

/**
 * Homepage FAQ (2026-11-17, GEO; ported from game-template-next 5840e8f + 683c582). Rendered on the page AND as
 * FAQPage JSON-LD from this one list, so the schema never says something the page doesn't. Every answer is built
 * from game.json / site.json: no hand-written facts here, so it stays true when the data changes.
 */

/** "2026-11-06" → "November 6, 2026" (UTC, same on server and client). */
export const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

const list = (parts: string[]) => (parts.length < 2 ? parts.join("") : `${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}`);

// The Roblox group is literally named "random named group i hvent named yet", so the last answer says "the game's developer".
export function homeFaq(): { q: string; a: string }[] {
  const date = fmtDate(LAST_CHECKED);
  const n = codes.length;
  const faq: { q: string; a: string }[] = [
    {
      q: `Are there any working ${GAME.name} codes right now?`,
      a: n
        ? `Yes. ${n === 1 ? "1 code works" : `${n} codes work`} as of ${date}. ${n === 1 ? "It's" : "They're"} on the codes page with what each one gives you. A code only goes up after two separate sources list it.`
        : `Not right now. As of ${date} there are no working codes${expiredCodes.length ? " (the older ones have expired)" : ""}. We check every day, and a new code goes up once two separate sources list it.`,
    },
  ];
  if (redeemSteps.length) faq.push({ q: `How do I redeem ${GAME.name} codes?`, a: redeemSteps.join(" ").replace(/from this page/g, "from the codes page") });

  const covers = [
    ...(entities.length ? [`${entities.length} ${ENTITY.singular} pages with what the hazard does and where to stand`] : []),
    ...(maps.length ? [`the ${maps.length} maps named so far`] : []),
    "the lobby",
    "every badge and where the secret ones are",
    "the shop and gamepasses with Robux prices",
    "a round guide",
    "the codes page",
  ];
  faq.push(
    { q: "What's on this site?", a: `${list(covers).replace(/^./, (c) => c.toUpperCase())}. If nobody has confirmed something yet, the page says so instead of guessing.` },
    {
      q: "How often is this page updated?",
      a: `The last check was on ${date}. Codes are checked every day. The other pages change when the game gets an update or a new fact is confirmed.`,
    },
    {
      q: `Is this the official ${GAME.name} site?`,
      a: `No. It's a fan site and isn't run by the game's developer or ${PLATFORM_NAME}. To play the game, use its official ${PLATFORM_NAME} page.`,
    },
  );
  return faq;
}

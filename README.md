# What If Disasters — what-if-disasters.wiki

Fan reference site for What If Disasters (Roblox): https://www.roblox.com/games/109440485612336/what-if-disasters

Built from `game-template-next` (Next.js static export → Cloudflare Workers). Rules for agents: `AGENTS.md`.

## Theme

`candy` from Ship/game-themes @ 6ce2b86, picked by pick.mjs.
Why this one / competitor colours: _fill in_.
Refresh or switch: `node scripts/sync-theme.mjs [--theme <id>]` — never edit `src/styles/theme/*.css` by hand.

## Where things live

| What | File |
|---|---|
| Site name, domain, official game link, GA id, entity naming | `src/config/site.json` |
| Codes, entities, guide, FAQ, gaps (all game facts) | `src/data/game.json` |
| Ad units (this site's own keys only) | `src/lib/ads.ts` |

## Commands

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # prebuild writes the deploy marker, postbuild checks out/
pnpm typecheck && pnpm lint
```

Deploy = commit + push to main (GitHub Actions → wrangler deploy).

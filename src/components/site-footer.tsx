import Link from "next/link";
import { LAST_CHECKED } from "@/data/game";
import { GAME, PLATFORM_NAME, SITE_NAME } from "@/lib/site";
import { NAV_LINKS } from "@/lib/nav";

export function SiteFooter() {
  const links = [...NAV_LINKS, { href: "/about/", label: "About" }, { href: "/privacy/", label: "Privacy" }, { href: "/terms/", label: "Terms" }];
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:justify-between">
        <div className="max-w-md">
          <p className="font-serif text-sm font-semibold">{SITE_NAME}</p>
          <p className="mt-2 text-sm text-ink-soft">
            A fan-made reference for {GAME.name}. Not affiliated with {GAME.developer || "the developer"} or {PLATFORM_NAME}. Game names
            and art belong to their owners.
          </p>
          <p className="mt-2 text-xs text-ink-faint">Last checked {LAST_CHECKED}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap content-start gap-x-6 gap-y-2 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-ink-soft hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

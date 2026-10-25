"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GAME, PLATFORM_CTA, SHORT_NAME } from "@/lib/site";
import { NAV_LINKS } from "@/lib/nav";

/** Sticky glass header. Mobile menu is a <details> disclosure: no JS library needed. */
export function SiteNav() {
  const pathname = usePathname() ?? "/";
  const current = (href: string) => (pathname.startsWith(href) ? "page" : undefined);
  const official = !GAME.official.includes("<");

  return (
    <header className="glass sticky top-0 z-40 border-b border-rule">
      <div className="container-page flex h-16 items-center gap-6">
        <Link href="/" className="font-serif text-base font-semibold text-ink">
          {SHORT_NAME}
        </Link>
        <nav className="hidden items-center gap-5 text-sm md:flex" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current(l.href)} className="nav-link text-ink-soft hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          {/* Wrapper carries the responsive hide: theme classes like .btn-ember are unlayered
              and would override a `hidden` utility on the button itself. */}
          {official && (
            <span className="hidden sm:block">
              <a href={GAME.official} target="_blank" rel="noopener" className="btn-ember">
                {PLATFORM_CTA}
              </a>
            </span>
          )}
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-md border border-rule-hard px-3 py-1.5 text-sm text-ink">Menu</summary>
            <nav className="tile absolute right-0 mt-2 flex w-48 flex-col p-2" aria-label="Mobile">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} aria-current={current(l.href)} className="rounded px-3 py-2 text-sm text-ink hover:bg-paper-edge">
                  {l.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

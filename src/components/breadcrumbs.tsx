import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/json-ld";

/** Visible breadcrumb + matching BreadcrumbList JSON-LD. Last item = current page. */
export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  const all = [{ name: "Home", href: "/" }, ...items];
  return (
    <>
      <BreadcrumbJsonLd items={all} />
      <nav aria-label="Breadcrumb" className="pt-8 text-sm text-ink-faint">
        {all.map((it, i) => (
          <span key={it.href}>
            {i > 0 && <span className="px-2" aria-hidden="true">/</span>}
            {i === all.length - 1 ? (
              <span className="text-ink-soft">{it.name}</span>
            ) : (
              <Link href={it.href} className="hover:text-ink">
                {it.name}
              </Link>
            )}
          </span>
        ))}
      </nav>
    </>
  );
}

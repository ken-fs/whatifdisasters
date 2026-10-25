import Link from "next/link";
import type { Entity } from "@/data/game";
import { entityHref } from "@/lib/site";

/** Clickable card for one entity. Used by the list page. */
export function EntityCard({ e }: { e: Entity }) {
  return (
    <Link href={entityHref(e.slug)} className="card block overflow-hidden">
      {e.image && (
        <img
          src={e.image}
          alt={`${e.name} in game`}
          width={1280}
          height={720}
          loading="lazy"
          decoding="async"
          className="aspect-video w-full object-cover"
        />
      )}
      <div className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        {e.rarity && <span className="tag">{e.rarity}</span>}
        {e.role && <span className="text-xs text-ink-faint">{e.role}</span>}
      </div>
      <h3 className="mt-3 font-serif text-lg">{e.name}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{e.summary}</p>
      </div>
    </Link>
  );
}

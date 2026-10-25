"use client";

import { useEffect } from "react";
import { SOCIAL_BAR_SRC } from "@/lib/ads";

/**
 * Adsterra Social Bar — one site-wide script (sticky bottom bar, Adsterra's
 * highest-CPM format). Loaded once from the root layout after hydration.
 * Empty SOCIAL_BAR_SRC = renders nothing (safe to ship before approval).
 */
export function AdsterraSocialBar() {
  useEffect(() => {
    if (!SOCIAL_BAR_SRC) return;
    if (document.querySelector(`script[src="${SOCIAL_BAR_SRC}"]`)) return;
    const s = document.createElement("script");
    s.src = SOCIAL_BAR_SRC;
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    document.body.appendChild(s);
  }, []);

  return null;
}

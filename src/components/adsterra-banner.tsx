"use client";

import { useEffect, useRef } from "react";
import type { AdSlot } from "@/lib/ads";

/**
 * Adsterra banner inside its own sandboxed srcdoc iframe.
 *  - Own document per unit: the snippet sets a global `atOptions`, so two units on
 *    one page would overwrite each other.
 *  - sandbox WITHOUT allow-same-origin: a plain srcdoc iframe inherits this page's
 *    origin and the ad script could read the page (seen 2026-10-09, aistatement).
 *  - Fixed width/height reserved up front → no layout shift (CLS stays 0).
 *  - Loads only when visible and near the viewport (IntersectionObserver), so a
 *    CSS-hidden unit never registers an impression.
 */
export function AdsterraBanner({ slot, className = "" }: { slot: AdSlot; className?: string }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe || !slot.key || !slot.src) return;
    const html = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style>
</head><body>
<script type="text/javascript">
atOptions={key:'${slot.key}',format:'iframe',height:${slot.height},width:${slot.width},params:{}};
</${""}script>
<script type="text/javascript" src="${slot.src}"></${""}script>
</body></html>`;
    // Fill srcdoc only once the slot is actually on screen (or close). srcdoc ignores loading="lazy",
    // and the CSS-hidden twin of a responsive pair (728x90 on phones, the phone-only 300x250 on desktop)
    // used to load anyway: impressions for ads nobody could see (found 2026-10-31). A display:none
    // element never intersects, so the hidden twin now never loads.
    if (!("IntersectionObserver" in window)) {
      if (iframe.offsetParent) iframe.srcdoc = html;
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          iframe.srcdoc = html;
          io.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(iframe);
    return () => io.disconnect();
  }, [slot.key, slot.width, slot.height, slot.src]);

  if (!slot.key || !slot.src) return null;

  return (
    <div className={"flex flex-col items-center " + className}>
      <span className="mb-1 text-[0.625rem] text-ink-faint">Ad</span>
      <iframe
        ref={ref}
        width={slot.width}
        height={slot.height}
        title="Advertisement"
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
        scrolling="no"
        loading="lazy"
        style={{ border: 0, display: "block", maxWidth: "100%", width: slot.width, height: slot.height }}
      />
    </div>
  );
}

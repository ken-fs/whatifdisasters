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
 */
export function AdsterraBanner({ slot, className = "" }: { slot: AdSlot; className?: string }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe || !slot.key || !slot.src) return;
    iframe.srcdoc = `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style>
</head><body>
<script type="text/javascript">
atOptions={key:'${slot.key}',format:'iframe',height:${slot.height},width:${slot.width},params:{}};
</${""}script>
<script type="text/javascript" src="${slot.src}"></${""}script>
</body></html>`;
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

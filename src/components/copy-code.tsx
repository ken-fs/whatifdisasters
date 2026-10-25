"use client";

import { useState } from "react";

/**
 * Copy button for a redeem code. Codes are case-sensitive, so a retyped code is
 * the most common reason "it doesn't work". Feedback stays on the button itself.
 */
export function CopyCode({ code }: { code: string }) {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setState("ok");
    } catch {
      setState("fail");
    }
    setTimeout(() => setState("idle"), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy code ${code}`}
      className="inline-flex h-8 shrink-0 items-center rounded-md border border-rule-hard bg-card px-3 text-xs font-semibold text-ink hover:border-rust"
    >
      {state === "ok" ? "Copied" : state === "fail" ? "Select and copy" : "Copy"}
    </button>
  );
}

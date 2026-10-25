"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GA_ID } from "@/lib/site";

/**
 * Consent-gated Google Analytics.
 *
 * Nothing from Google loads until the visitor says yes: gtag.js is injected at
 * runtime, so a declined (or undecided) visit makes zero third-party requests.
 * No GA id configured (src/config/site.json `gaId`) → no banner, no analytics.
 * Never copy another site's id in here: its traffic would land in that property.
 */
const KEY = "ga-consent";

export function AnalyticsConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {
      // private mode: treat as undecided → no tracking
    }
    if (stored === "accepted") {
      loadAnalytics();
      return;
    }
    if (stored === "declined") return;
    // Don't fight the first paint, and never bother a visitor who bounces at once.
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  function decide(choice: "accepted" | "declined") {
    try {
      localStorage.setItem(KEY, choice);
    } catch {
      /* still applies to this page view */
    }
    setShow(false);
    if (choice === "accepted") loadAnalytics();
  }

  if (!show) return null;

  return (
    <div role="dialog" aria-live="polite" aria-label="Analytics consent" className="fixed inset-x-0 bottom-0 z-50 border-t border-rule-hard bg-card p-4">
      <div className="container-page flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-ink-soft">
          We use Google Analytics to see which pages get read. It sets cookies, so it stays off until you say yes.{" "}
          <Link href="/privacy/" className="text-link">
            Privacy
          </Link>
        </p>
        <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
          <button type="button" onClick={() => decide("declined")} className="px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink">
            No thanks
          </button>
          <button type="button" onClick={() => decide("accepted")} className="btn-ember">
            Allow analytics
          </button>
        </div>
      </div>
    </div>
  );
}

/** Injects gtag.js once; repeated calls are no-ops. */
function loadAnalytics() {
  if (typeof window === "undefined" || !GA_ID) return;
  const w = window as unknown as { __gaLoaded?: boolean; dataLayer?: unknown[] };
  if (w.__gaLoaded) return;
  w.__gaLoaded = true;
  w.dataLayer = w.dataLayer || [];
  // Must push the `arguments` object exactly like Google's snippet. gtag.js ignores
  // plain arrays: the rest-args version `push(args)` loaded the library but sent
  // zero hits (found 2026-10-01 on animedice and 5 more sites). _args only types calls.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function gtag(..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", GA_ID);
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { WebsiteJsonLd } from "@/components/json-ld";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { AdsterraSocialBar } from "@/components/adsterra-social-bar";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

// Fonts come from the theme (@fontsource imports in src/styles/theme/theme.css):
// self-hosted woff2 from npm. Never next/font/google — it downloads at build time
// and a failed download broke a Cloudflare build on 2026-10-06 (threshingday).

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  // Add public/og.jpg (1200×630, from the game's official media) and list it here.
  openGraph: { type: "website", siteName: SITE_NAME, url: "/" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <WebsiteJsonLd />
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <AnalyticsConsent />
        <AdsterraSocialBar />
      </body>
    </html>
  );
}

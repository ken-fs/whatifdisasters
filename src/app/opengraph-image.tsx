// Share card (1200×630) for every page, drawn at build time from src/config/site.json and the
// installed game theme, so social shares, Discord embeds and directory listings show this site's
// own card. Next adds og:image and twitter:image to every page from this file.
//
// 2026-10-12: sites built from this template shipped no og:image at all (9 of them), so every
// share was a bare link. Colors come from src/styles/theme/theme.css; the heading uses the
// theme's display font when @fontsource ships a .woff for it (satori can't read woff2),
// otherwise the font bundled with next/og.
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import site from "@/config/site.json";

export const dynamic = "force-static";
export const alt = site.siteName;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ROOT = process.cwd();

function themeVar(css: string, name: string, fallback: string): string {
  const value = css.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]?.trim();
  return value && /^#[0-9a-f]{3,8}$/i.test(value) ? value : fallback;
}

const toArrayBuffer = (buf: Buffer) => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;

// Passing any font turns off next/og's built-in one, so the body font is loaded explicitly too.
function bodyFont(): ArrayBuffer | null {
  const file = join(ROOT, "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf");
  return existsSync(file) ? toArrayBuffer(readFileSync(file)) : null;
}

function headingFont(css: string): ArrayBuffer | null {
  const family = css.match(/--font-serif:\s*"([^"]+)"/)?.[1];
  if (!family) return null;
  const slug = family.toLowerCase().replace(/\s+/g, "-");
  for (const weight of [900, 800, 700, 400]) {
    const file = join(ROOT, "node_modules/@fontsource", slug, "files", `${slug}-latin-${weight}-normal.woff`);
    if (existsSync(file)) return toArrayBuffer(readFileSync(file));
  }
  return null;
}

export default function OpengraphImage() {
  const themeFile = join(ROOT, "src/styles/theme/theme.css");
  const css = existsSync(themeFile) ? readFileSync(themeFile, "utf8") : "";
  const paper = themeVar(css, "color-paper", "#f6f3ec");
  const card = themeVar(css, "color-card", "#ffffff");
  const ink = themeVar(css, "color-ink", "#111111");
  const soft = themeVar(css, "color-ink-soft", "#333333");
  const accent = themeVar(css, "color-rust", "#d91f26");
  const display = headingFont(css);
  const body = bodyFont();
  const platform = site.game.platform === "steam" ? "Steam" : site.game.platform === "roblox" ? "Roblox" : "";

  return new ImageResponse(
    (
      <div style={{ background: paper, display: "flex", ...(body ? { fontFamily: "Body" } : {}), height: "100%", padding: 56, width: "100%" }}>
        <div
          style={{
            background: card,
            border: `4px solid ${ink}`,
            borderRadius: 28,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            padding: "52px 60px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ alignItems: "center", color: soft, display: "flex", fontSize: 28, gap: 14 }}>
              <div style={{ background: accent, borderRadius: 999, height: 16, width: 16 }} />
              {[site.game.name, platform, "fan guide"].filter(Boolean).join(" · ")}
            </div>
            <div
              style={{
                color: ink,
                ...(display ? { fontFamily: "Display" } : {}),
                fontSize: site.siteName.length > 28 ? 72 : 86,
                fontWeight: 800,
                letterSpacing: -1.5,
                lineHeight: 1.04,
                marginTop: 28,
              }}
            >
              {site.siteName}
            </div>
            <div style={{ color: soft, display: "flex", fontSize: 30, lineHeight: 1.35, marginTop: 26, maxWidth: 960 }}>
              {site.description.length > 118 ? `${site.description.slice(0, 115).replace(/\s+\S*$/, "")}…` : site.description}
            </div>
          </div>
          <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
            <div style={{ background: accent, borderRadius: 999, height: 10, width: 120 }} />
            <div style={{ color: ink, fontSize: 30, fontWeight: 700 }}>{site.domain}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(body ? [{ data: body, name: "Body", style: "normal" as const, weight: 400 as const }] : []),
        ...(display ? [{ data: display, name: "Display", style: "normal" as const, weight: 800 as const }] : []),
      ],
    },
  );
}

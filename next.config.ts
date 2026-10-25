import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: the Worker serves ./out as plain assets (see wrangler.jsonc).
  // `headers` / `redirects` / middleware do NOT run under `output: "export"` —
  // put anything like that in robots.ts or Cloudflare rules instead.
  output: "export",
  // The image optimizer needs a server; there is none in an assets-only Worker.
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;

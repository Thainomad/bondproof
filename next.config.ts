import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // playwright-core and @sparticuz/chromium reference non-JS asset files
  // (browsers.json, the bundled Chromium binary) that Next.js's output file
  // tracing doesn't pick up via static analysis, so it's forced in explicitly
  // for every route that might launch a browser (report/letter generation).
  outputFileTracingIncludes: {
    "/*": [
      "node_modules/playwright-core/**/*",
      "node_modules/@sparticuz/chromium/**/*",
    ],
  },
};

export default nextConfig;

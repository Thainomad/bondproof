import { chromium, type Browser } from 'playwright-core'

// Vercel's serverless functions don't have Playwright's bundled Chromium
// binary available. @sparticuz/chromium ships a Vercel/Lambda-compatible
// build for that case; locally, playwright-core reuses the browser already
// downloaded into ~/Library/Caches/ms-playwright by `playwright install`
// (run once via the `playwright` devDependency), so no separate download
// path is needed for dev.
export async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const sparticuzChromium = (await import('@sparticuz/chromium')).default
    return chromium.launch({
      args: sparticuzChromium.args,
      executablePath: await sparticuzChromium.executablePath(),
      headless: true,
    })
  }

  return chromium.launch()
}

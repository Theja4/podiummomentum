import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:4713/', { waitUntil: 'networkidle0', timeout: 45000 })
await new Promise(r => setTimeout(r, 1500))
const out = await page.evaluate(() => {
  const pick = sel => {
    const el = document.querySelector(sel)
    if (!el) return null
    const s = getComputedStyle(el)
    return { bg: s.backgroundColor, color: s.color, bgImage: s.backgroundImage.slice(0, 60) }
  }
  return {
    action: pick('footer .subscribe-action'),
    toTop: pick('footer .to-top'),
    wordmark: pick('footer .logo-wordmark'),
    wordmarkB: pick('footer .logo-wordmark b'),
    wordmarkEm: pick('footer .logo-wordmark em'),
    bodyClass: document.body.className,
  }
})
console.log(JSON.stringify(out, null, 1))
await browser.close()

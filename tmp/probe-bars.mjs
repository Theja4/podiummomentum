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
  const iw = window.innerWidth
  const info = sel => {
    const el = document.querySelector(sel)
    if (!el) return null
    const r = el.getBoundingClientRect()
    const s = getComputedStyle(el)
    return {
      left: Math.round(r.left), width: Math.round(r.width),
      marginL: s.marginLeft, marginR: s.marginRight,
      padL: s.paddingLeft, padR: s.paddingRight,
      bg: s.backgroundColor, radius: s.borderRadius,
      transform: s.transform.slice(0, 50),
    }
  }
  return {
    iw,
    work: info('.pm2-work'),
    gallery: info('.pm2-gallery'),
    beyond: info('.pm2-beyond'),
    footer: info('footer'),
    root: info('#root'),
    pm2: info('main.pm2'),
  }
})
console.log(JSON.stringify(out, null, 1))
await browser.close()

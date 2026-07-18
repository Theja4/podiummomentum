// What paints the gray corners during entry? Walk the hit stack.
import puppeteer from 'puppeteer-core'

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars', '--force-device-scale-factor=1', '--use-angle=metal'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:4713/', { waitUntil: 'networkidle0', timeout: 45000 })
await new Promise(r => setTimeout(r, 2000))

const top = await page.evaluate(() => {
  const el = document.querySelector('.pm2-beyond')
  return el.getBoundingClientRect().top + window.scrollY
})
await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(top - 900 + 0.55 * 900))
await new Promise(r => setTimeout(r, 1200))

const stack = await page.evaluate(() => {
  const pts = [[80, 860], [1360, 860]]
  return pts.map(([x, y]) => ({
    point: [x, y],
    stack: document.elementsFromPoint(x, y).slice(0, 8).map(el => {
      const s = getComputedStyle(el)
      return `${el.tagName}.${String(el.className).slice(0, 38)} bg=${s.backgroundColor} z=${s.zIndex}`
    }),
  }))
})
console.log(JSON.stringify(stack, null, 1))
await browser.close()

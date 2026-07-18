// QA screenshot harness: loads the landing in headless Chrome, captures
// screenshots at a series of scroll depths + console/page errors.
// Usage: node /tmp/pm_qa/shoot.mjs [outdir] [width] [height] [url]
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const out = process.argv[2] || '/tmp/pm_qa/shots'
const W = Number(process.argv[3] || 1440)
const H = Number(process.argv[4] || 900)
const url = process.argv[5] || 'http://localhost:4713/'
fs.mkdirSync(out, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars', '--force-device-scale-factor=1', '--use-angle=metal'],
})
const page = await browser.newPage()
await page.setViewport({ width: W, height: H })
const errors = []
page.on('console', m => {
  if (['error', 'warning'].includes(m.type())) errors.push(`[${m.type()}] ${m.text()}`)
})
page.on('pageerror', e => errors.push(`[pageerror] ${e.message}`))

await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 })
await new Promise(r => setTimeout(r, 2200))

const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
const stops = [0, 0.06, 0.12, 0.2, 0.28, 0.36, 0.44, 0.52, 0.6, 0.68, 0.76, 0.84, 0.92, 1]
for (const s of stops) {
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(max * s))
  await new Promise(r => setTimeout(r, 1400)) // let lerps settle
  await page.screenshot({ path: `${out}/s${String(Math.round(s * 100)).padStart(3, '0')}.jpg`, quality: 82, type: 'jpeg' })
}
console.log('scrollHeight:', max + H)
console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'NO CONSOLE ERRORS')
await browser.close()

// Beyond transition QA: captures the carousel→beyond star-wipe choreography.
// Screenshots at enterP stops (star blooming over the carousel) and sticky
// progress stops (pops + dispersal). Usage: node tmp/shoot-beyond.mjs
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const out = process.argv[2] || 'tmp/shots-beyond'
const url = process.argv[3] || 'http://localhost:4713/'
fs.mkdirSync(out, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars', '--force-device-scale-factor=1', '--use-angle=metal'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errors = []
page.on('console', m => {
  if (['error', 'warning'].includes(m.type())) errors.push(`[${m.type()}] ${m.text()}`)
})
page.on('pageerror', e => errors.push(`[pageerror] ${e.message}`))

await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 })
await new Promise(r => setTimeout(r, 2200))

const geo = await page.evaluate(() => {
  const el = document.querySelector('.pm2-beyond')
  const top = el.getBoundingClientRect().top + window.scrollY
  return { top, height: el.offsetHeight, vh: window.innerHeight }
})

const stops = []
// enterP: 0 = section top at viewport bottom (violet card centred), 1 = pinned
for (const e of [0, 0.15, 0.35, 0.55, 0.75, 0.9, 1]) {
  stops.push([`enter${String(Math.round(e * 100)).padStart(3, '0')}`, Math.round(geo.top - geo.vh + e * geo.vh)])
}
// sticky progress: pops + dispersal
for (const p of [0.04, 0.1, 0.2, 0.45, 0.7]) {
  stops.push([`prog${String(Math.round(p * 100)).padStart(3, '0')}`, Math.round(geo.top + p * (geo.height - geo.vh))])
}

for (const [name, y] of stops) {
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y)
  await new Promise(r => setTimeout(r, 1500))
  await page.screenshot({ path: `${out}/${name}.jpg`, quality: 85, type: 'jpeg' })
}
console.log('beyond top:', geo.top, 'height:', geo.height, 'vh:', geo.vh)
console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'NO CONSOLE ERRORS')
await browser.close()

import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const out = 'tmp/shots-footer'
fs.mkdirSync(out, { recursive: true })
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars', '--force-device-scale-factor=1', '--use-angle=metal'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:4713/', { waitUntil: 'networkidle0', timeout: 45000 })
await new Promise(r => setTimeout(r, 2000))
const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
const stops = [['hero', 0], ['carousel', Math.round(max * 0.24)], ['bottom', max]]
for (const [name, y] of stops) {
  await page.evaluate(top => window.scrollTo({ top, behavior: 'instant' }), y)
  await new Promise(r => setTimeout(r, 1500))
  await page.screenshot({ path: `${out}/${name}.jpg`, quality: 85, type: 'jpeg' })
}
console.log('done')
await browser.close()

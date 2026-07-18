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
  const main = document.querySelector('main.pm2')
  const car = document.querySelector('.pm2-carousel')
  const r = el => {
    const s = getComputedStyle(el)
    return { bg: s.backgroundColor, paperVar: s.getPropertyValue('--v-paper') }
  }
  return { main: r(main), carousel: r(car), mainInline: main.getAttribute('style') }
})
console.log(JSON.stringify(out, null, 1))
await browser.close()

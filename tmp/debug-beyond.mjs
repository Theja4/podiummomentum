// Debug: dump bloom/wipe/stage geometry at enterP stops.
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

for (const e of [0.15, 0.35, 0.55]) {
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), Math.round(top - 900 + e * 900))
  await new Promise(r => setTimeout(r, 1200))
  const d = await page.evaluate(() => {
    const stage = document.querySelector('.pm2-beyond-stage')
    const bloom = document.querySelector('.pm2-beyond-bloom')
    const wipe = document.querySelector('.pm2-beyond-wipe')
    const cs = getComputedStyle(bloom)
    // walk ancestors of bloom checking for fixed-containing-block creators
    const chain = []
    let n = bloom.parentElement
    while (n) {
      const s = getComputedStyle(n)
      const flags = []
      if (s.transform !== 'none') flags.push('transform:' + s.transform.slice(0, 40))
      if (s.filter !== 'none') flags.push('filter')
      if (s.backdropFilter !== 'none') flags.push('backdrop-filter')
      if (s.willChange !== 'auto') flags.push('willChange:' + s.willChange)
      if (s.contain !== 'none') flags.push('contain:' + s.contain)
      if (s.perspective !== 'none') flags.push('perspective')
      chain.push(`${n.tagName}.${String(n.className).slice(0, 40)}${flags.length ? ' <<' + flags.join(',') : ''}`)
      n = n.parentElement
    }
    return {
      stageTop: stage.getBoundingClientRect().top.toFixed(0),
      bloomPos: cs.position,
      bloomVis: cs.visibility,
      bloomRect: JSON.parse(JSON.stringify(bloom.getBoundingClientRect())),
      bloomOpacity: cs.opacity,
      wipeRect: JSON.parse(JSON.stringify(wipe.getBoundingClientRect())),
      wipeTransform: getComputedStyle(wipe).transform.slice(0, 60),
      wipeOpacity: getComputedStyle(wipe).opacity,
      atCenter: document.elementFromPoint(720, 450)?.className?.toString().slice(0, 50),
      atCorner: document.elementFromPoint(80, 860)?.className?.toString().slice(0, 50),
      chain,
    }
  })
  console.log(`\n=== enterP ${e} ===`)
  console.log(JSON.stringify(d, null, 1))
}
await browser.close()

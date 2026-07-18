import puppeteer from 'puppeteer-core'
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars'],
})
const page = await browser.newPage()
await page.goto('http://localhost:4713/', { waitUntil: 'networkidle0', timeout: 45000 })
await new Promise(r => setTimeout(r, 1200))
const out = await page.evaluate(() => {
  const targets = { totop: document.querySelector('footer .to-top'), action: document.querySelector('footer .subscribe-action'), wm: document.querySelector('footer .logo-wordmark') }
  const res = {}
  for (const [key, el] of Object.entries(targets)) {
    if (!el) { res[key] = 'missing'; continue }
    const hits = []
    let idx = 0
    for (const sheet of document.styleSheets) {
      let rules
      try { rules = sheet.cssRules } catch { continue }
      const walk = list => {
        for (const rule of list) {
          if (rule.cssRules) walk(rule.cssRules)
          if (!rule.selectorText || !rule.style) continue
          const bg = rule.style.getPropertyValue('background') || rule.style.getPropertyValue('background-color')
          const color = rule.style.getPropertyValue('color')
          if (!bg && !color) continue
          let m = false
          try { m = el.matches(rule.selectorText) } catch {}
          if (m) hits.push(`[sheet${idx}] ${rule.selectorText} => ${bg || ''} ${color || ''} imp=${rule.style.getPropertyPriority('background') || rule.style.getPropertyPriority('color')}`)
        }
      }
      walk(rules)
      idx++
    }
    res[key] = hits
  }
  return res
})
console.log(JSON.stringify(out, null, 1))
await browser.close()

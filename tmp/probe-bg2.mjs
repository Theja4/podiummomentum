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
  const main = document.querySelector('main.pm2')
  const hits = []
  for (const sheet of document.styleSheets) {
    let rules
    try { rules = sheet.cssRules } catch { continue }
    const walk = list => {
      for (const rule of list) {
        if (rule.cssRules) walk(rule.cssRules)
        if (!rule.selectorText || !rule.style) continue
        if (!rule.style.background && !rule.style.backgroundColor && !rule.style.backgroundImage) continue
        let matches = false
        try { matches = main.matches(rule.selectorText) } catch {}
        if (matches) hits.push(`${rule.selectorText} -> ${rule.style.cssText.slice(0, 120)} [${sheet.href?.split('/').pop()}]`)
      }
    }
    walk(rules)
  }
  return { bgImage: getComputedStyle(main).backgroundImage, bgColor: getComputedStyle(main).backgroundColor, hits }
})
console.log(JSON.stringify(out, null, 1))
await browser.close()

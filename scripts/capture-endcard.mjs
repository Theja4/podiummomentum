// Frame-capture the showreel end-card animation (scripts/endcard.html):
// seeks the paused-CSS timeline and screenshots each frame at 1920x1080@30fps.
// Assemble with:
//   ffmpeg -framerate 30 -i frames/f%03d.png -i tone.wav -c:v libx264 \
//     -pix_fmt yuv420p -crf 18 -c:a aac -shortest endcard.mp4
// Usage: node scripts/capture-endcard.mjs [framesDir] [--probe t1,t2,...]
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const outDir = process.argv[2] || '/tmp/pm_vid/frames'
fs.mkdirSync(outDir, { recursive: true })
const htmlUrl = new URL('./endcard.html', import.meta.url).href

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--hide-scrollbars', '--force-device-scale-factor=1', '--allow-file-access-from-files'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 })
await page.goto(htmlUrl, { waitUntil: 'networkidle0' })
await page.evaluate(() => document.fonts.ready)

const probeIdx = process.argv.indexOf('--probe')
if (probeIdx !== -1) {
  // probe mode: a handful of stills for design review
  const times = process.argv[probeIdx + 1].split(',').map(Number)
  for (const t of times) {
    await page.evaluate(tt => window.seek(tt), t)
    await new Promise(r => setTimeout(r, 60))
    await page.screenshot({ path: `${outDir}/probe_${String(t).replace('.', '_')}.png` })
  }
  console.log('probed:', times.join(', '))
} else {
  const FPS = 30, DUR = 4.0, N = Math.round(FPS * DUR) // 120 frames
  for (let i = 0; i < N; i++) {
    const t = i / FPS
    await page.evaluate(tt => window.seek(tt), t)
    await page.screenshot({ path: `${outDir}/f${String(i).padStart(3, '0')}.png` })
    if (i % 30 === 0) console.log('frame', i)
  }
  console.log('captured', N, 'frames')
}
await browser.close()

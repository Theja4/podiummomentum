/**
 * Structural + motion parity checks for Eloqwnt-aligned pages.
 * Drives shipped pure helpers and source inventory (no fake DOM).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  validateServiceCatalog,
  matchServicesRoute,
  hubFeatured,
  hubNumbers,
  hubFaqs,
  serviceCatalog,
} from '../src/servicesData.js'
import { industryList, getIndustry, matchIndustryRoute } from '../src/industries.js'
import { expectedLandmarks } from '../src/usePageMotion.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const src = name => fs.readFileSync(path.join(root, 'src', name), 'utf8')

const failures = []
const ok = msg => console.log('OK', msg)
const fail = msg => {
  failures.push(msg)
  console.error('FAIL', msg)
}

// —— Services content ——
const cat = validateServiceCatalog()
if (!cat.ok) fail(`catalog: ${cat.errors.join('; ')}`)
else ok(`catalog ${cat.count} services`)

if (!hubFeatured?.length || hubFeatured.length < 3) fail('hubFeatured too small')
else ok(`hubFeatured ${hubFeatured.length}`)
if (!hubNumbers?.length || hubNumbers.length < 4) fail('hubNumbers incomplete')
else ok(`hubNumbers ${hubNumbers.length}`)
if (!hubFaqs?.length || hubFaqs.length < 3) fail('hubFaqs incomplete')
else ok(`hubFaqs ${hubFaqs.length}`)

if (matchServicesRoute('/services')?.type !== 'hub') fail('match hub')
if (matchServicesRoute('/services/website-design')?.slug !== 'website-design') fail('match detail')
ok('matchServicesRoute')

// —— Industries ——
if (industryList.length !== 10) fail(`industryList ${industryList.length}`)
for (const item of industryList) {
  const d = getIndustry(item.slug)
  if (!d) fail(`missing industry ${item.slug}`)
  else if (!d.steps?.length || !d.expertise?.length || !d.projects?.length) fail(`thin industry ${item.slug}`)
}
if (matchIndustryRoute('/industry/healthcare')?.slug !== 'healthcare') fail('matchIndustryRoute')
if (matchIndustryRoute('/services') !== null) fail('industry matcher false positive')
ok(`industries ${industryList.length}`)

// —— Landmarks pure helper ——
for (const t of ['home', 'servicesHub', 'serviceDetail', 'industry', 'contact']) {
  const marks = expectedLandmarks(t)
  if (!marks.length) fail(`landmarks empty ${t}`)
  else ok(`landmarks ${t}: ${marks.join(', ')}`)
}

// —— Source structure inventory ——
const main = src('main.jsx')
const svc = src('ServicesPages.jsx')
const ind = src('IndustryPage.jsx')
const cu = src('ContactUs.jsx')
const motion = src('usePageMotion.js')

const requireIn = (file, label, needles) => {
  for (const n of needles) {
    if (!file.includes(n)) fail(`${label} missing ${n}`)
  }
}

requireIn(main, 'main', [
  'matchServicesRoute(path)',
  'matchIndustryRoute(path)',
  '<ServicesHub',
  '<ServiceDetail',
  '<IndustryPage',
  'data-reveal',
  'motion-ready',
  'page-loaded',
  'nav-dropdown',
  'Industries',
])
ok('main route + motion wiring')

requireIn(svc, 'ServicesPages', [
  'svc-hub-hero',
  'svc-hub-list',
  'svc-featured',
  'svc-numbers',
  'svc-hub-faq',
  'svc-close',
  'svc-detail-hero',
  'svc-stats',
  'svc-caps',
  'svc-process',
  'svc-work-strip',
  'usePageMotion',
  'data-reveal',
])
ok('services landmarks')

requireIn(ind, 'IndustryPage', [
  'ind-hero-fs',
  'ind-approach-grid',
  'ind-exp-list',
  'ind-work-list',
  'ind-cta-band',
  'usePageMotion',
  'data-reveal',
])
ok('industry landmarks')

requireIn(cu, 'ContactUs', [
  'cu-page',
  'cu-hero',
  'id="form"',
  'data-reveal',
  'motion-ready',
  'page-loaded',
])
ok('contact landmarks + motion')

requireIn(motion, 'usePageMotion', [
  'IntersectionObserver',
  'is-inview',
  'expectedLandmarks',
  'footer[data-reveal]',
])
ok('shared motion helper')

// CSS motion classes present for non-home pages
const svcCss = src('services-pages.css')
const indCss = src('industry.css')
if (!svcCss.includes('[data-reveal') || !svcCss.includes('is-inview')) fail('services css motion')
else ok('services css motion')
if (!indCss.includes('[data-reveal') || !indCss.includes('is-inview')) fail('industry css motion')
else ok('industry css motion')

// Featured image assets exist
for (const f of hubFeatured) {
  const rel = f.image.replace(/^\//, '')
  if (!fs.existsSync(path.join(root, 'public', rel.replace(/^assets\//, 'assets/'))) &&
      !fs.existsSync(path.join(root, 'public', rel))) {
    // path is /assets/...
    const p = path.join(root, 'public', f.image.replace(/^\//, ''))
    if (!fs.existsSync(p)) fail(`missing asset ${f.image}`)
  }
}
for (const f of hubFeatured) {
  const p = path.join(root, 'public', f.image.replace(/^\//, ''))
  if (!fs.existsSync(p)) fail(`missing asset ${f.image}`)
  else ok(`asset ${path.basename(f.image)}`)
}

// Industry cover assets
for (const item of industryList) {
  const p = path.join(root, 'public', 'assets', 'industries', `${item.slug}.avif`)
  if (!fs.existsSync(p)) fail(`missing cover ${item.slug}`)
}
ok('industry covers present')

console.log(failures.length ? `DONE with ${failures.length} failures` : 'CONTENT_CHECK_OK')
if (failures.length) process.exit(1)

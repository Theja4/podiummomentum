import {
  serviceCatalog,
  validateServiceCatalog,
  listServicePaths,
  getServiceBySlug,
  SERVICES_PATH,
} from '../src/servicesData.js'

const result = validateServiceCatalog()
const paths = listServicePaths()

console.log('SERVICES_PATH', SERVICES_PATH)
console.log('count', result.count)
console.log('slugs', result.slugs.join(', '))
for (const p of paths) {
  console.log(`${p.path}\t${p.title}`)
}
if (!result.ok) {
  console.error('VALIDATION FAILED')
  for (const e of result.errors) console.error(' -', e)
  process.exit(1)
}

// Spot-check detail content shape
for (const slug of ['website-design', 'branding', 'webflow-development']) {
  const s = getServiceBySlug(slug)
  if (!s) {
    console.error('missing', slug)
    process.exit(1)
  }
  console.log(`ok ${slug}: stats=${s.stats.length} caps=${s.capabilities.length} process=${s.process.length} faqs=${s.faqs.length}`)
}

console.log('CONTENT_CHECK_OK')

// Content map for the landing revamp — every section reads copy from here.
// Services come straight from the live catalog; works mirror the current site.
import { serviceCatalog } from '../servicesData.js'

export const HERO = {
  line1: 'Turn ambition',
  line2: 'into momentum',
  lead: 'Let’s 10× your brand’s digital presence.',
  caption:
    'From scroll-stopping content to engineered growth — we help your brand break through the noise and go viral.',
  primaryCta: { label: 'Book a strategy call', href: '/contact-us' },
  secondaryCta: { label: 'See the work', href: '#work' },
  trust: 'Trusted by 40+ ambitious brands',
  stats: [
    { value: '4.9', label: 'Average client rating' },
    { value: '40+', label: 'Brands moved' },
    { value: '$10M', label: 'Raised by clients' },
  ],
  cardArt: '/assets/pm2/art-hero.jpg',
  avatars: [
    '/assets/eloqwnt/avatar-juan.avif',
    '/assets/eloqwnt/avatar-ganjina.avif',
    '/assets/eloqwnt/avatar-serhan.avif',
    '/assets/eloqwnt/avatar-steven.avif',
  ],
}

export const MARQUEE_ITEMS = [
  'Design that sells',
  'Strategy that scales',
  'Speed without compromise',
  'Brands that break through',
]

// Face themes cycle across the 7 service cards, mirroring the reference film's
// coverflow: it opens on the lime card (which the hero's ghost card hands off
// to) and closes on the violet sparkle card whose black orb blooms into the
// Beyond section's star wipe + particle field. Middle cards alternate
// onyx / dark-with-violet-glow.
const FACE_THEMES = ['lime', 'glow', 'onyx', 'glow', 'lime', 'glow', 'violet']

export const SERVICE_CARDS = serviceCatalog.map((s, i) => ({
  slug: s.slug,
  index: i + 1,
  title: s.title,
  line: s.cardLine,
  href: `/services/${s.slug}`,
  theme: FACE_THEMES[i % FACE_THEMES.length],
  domain: 'podium.momentum',
  // Optional full-bleed cover image for the card face — drop in any image path
  // (e.g. '/assets/service-carousel-pastel/website-design.jpg'); the 3D
  // coverflow motion is container-driven and works with any image.
  image: null,
}))

export const CAROUSEL = {
  kicker: 'Our services',
  cta: { label: 'Explore all services', href: '/services' },
}

export const BEYOND = {
  wordA: 'Beyond',
  wordB: 'all limits',
  para1:
    'Podium Momentum is a brand and digital growth partner for ambitious companies. We expand their digital presence, increase conversions, and bring them more clients.',
  para2:
    'One partner, every surface: strategy, brand, web, and growth. No ceilings, no limits — just momentum that keeps pace with your ambition.',
}

export const WORKS = [
  {
    name: 'JobPosted',
    meta: 'career tech · 2024 · Web Design · Development',
    result: '3.3× conversion increase',
    href: '/industry/technology',
    image: '/assets/jobposted-thumb.png',
  },
  {
    name: 'Rezoomed',
    meta: 'ai product · 2024 · Brand · Motion · Web',
    result: '1M+ resumes optimized',
    href: '/industry/ai',
    image: '/assets/rezoomed-thumb.png',
  },
  {
    name: 'LikeOn',
    meta: 'creator economy · 2023 · Social · Content',
    result: '50% order value growth',
    href: '/industry/technology',
    image: '/assets/selected-work/likeon-thumbnail-v2.png',
  },
  {
    name: 'Northstar Ledger',
    meta: 'fintech · 2024 · Brand Identity · Website',
    result: 'Institutional grade rebrand',
    href: '/industry/fintech',
    image: '/assets/selected-work/northstar-ledger-thumbnail-v2.png',
  },
  {
    name: 'OrbitNine',
    meta: 'fintech · 2023 · Product UX · Development',
    result: 'Product UX rebuilt end to end',
    href: '/industry/fintech',
    image: '/assets/industry-projects/ft-planet9-4.avif',
  },
]

export const WORK_RAIL = {
  kicker: 'Recent works',
  cta: 'View project',
}

export const GALLERY = {
  quote: {
    text: 'Podium Momentum turned a complex AI resume product into a story people understand in seconds. The new experience feels sharper, more credible, and gives users confidence to get started.',
    name: 'Elias Marchetti',
    role: 'Founder, Rezoomed',
    avatar: '/assets/eloqwnt/avatar-juan.avif',
  },
  core: { badge: 'Momentum Core', line: 'Intelligence, beyond limits', domain: 'podium.momentum' },
  // The tile the fly-through camera dives into; it ends fullscreen, so it gets
  // the largest source image (1536px).
  target: { image: '/assets/pm2gallery/target.jpg', alt: 'Momentum Core — the podium, lit' },
  tiles: [
    { image: '/assets/pm2gallery/01.jpg', label: 'Signal', sub: 'See the signal in the noise' },
    { image: '/assets/pm2gallery/02.jpg', label: 'Interface', sub: 'Built to convert' },
    { image: '/assets/pm2gallery/03.jpg', label: 'Identity', sub: 'Brands people remember' },
    { image: '/assets/pm2gallery/04.jpg', label: 'Spark', sub: 'Ideas that ignite' },
    { image: '/assets/pm2gallery/05.jpg', label: 'Studio', sub: 'Content that carries' },
    { image: '/assets/pm2gallery/06.jpg', label: 'Growth', sub: 'Momentum you can measure' },
    { image: '/assets/pm2gallery/07.jpg', label: 'Flow', sub: 'Motion with intent' },
    { image: '/assets/pm2gallery/08.jpg', label: 'Horizon', sub: 'Built for the long game' },
  ],
}

export const FINALE = {
  line1: 'Build beyond',
  line2: 'all limits',
  copy: 'Strategy, brand, and web that think ahead — start shipping momentum today.',
  cta: { label: 'Book a strategy call', href: '/contact-us' },
}

// Content map for the landing revamp — every section reads copy from here.
// Services come straight from the live catalog; works mirror the current site.
import { serviceCatalog, SERVICES_PATH } from '../servicesData.js'

export const HERO = {
  line1: 'Build a better',
  line2: 'digital presence,',
  line3: 'win more customers.',
  eyebrow: 'Branding and digital growth partner',
  lead: 'We build strong brands and websites that turn more visitors into customers.',
  caption:
    'Then we help you reach more people and keep growing with focused marketing and practical AI.',
  primaryCta: { label: 'Book a call', href: '/contact-us' },
  secondaryCta: { label: 'View selected work', href: '#work' },
  trust: 'Trusted by 40+ ambitious teams in technology, healthcare, and B2B',
  stats: [
    { value: '4.9', label: 'Average client rating' },
    { value: '40+', label: 'Brands moved' },
    { value: '$10M', label: 'Raised by clients' },
  ],
  // trust strip: real client marks + wordmark PNGs with dark-surface variants
  // (white text, brand colors kept — the old monochrome invert flattened them)
  logos: [
    { mark: '/assets/brand-logos/jobposted-mark.png', name: 'JobPosted' },
    { mark: '/assets/brand-logos/rezoomed-mark.jpg', name: 'Rezoomed', chip: true },
    { word: '/assets/brand-logos/fictional/likeon-dark.png', name: 'LikeOn' },
    { word: '/assets/brand-logos/fictional/nively-os-dark.png', name: 'Nively OS' },
  ],
}

// The coverflow shows four headline services plus a closing brand card,
// mirroring the reference film: it opens on the mint 'ice' card (which the
// hero's ghost card hands off to) and closes on the brand-gradient sparkle
// card whose dark orb blooms into the Beyond section's star wipe + particle
// field. Middle cards carry their own animated scenes (CardArt.jsx).
const FACE_THEMES = ['ice', 'onyx', 'deep', 'glow', 'brand']

// Order is the pitch order. 'digital-marketing' has no dedicated page yet, so
// it points at the services hub; the closing brand card acts as a CTA to the
// contact page.
const CARD_DEFS = [
  {
    slug: 'website-design',
    eyebrow: 'Digital experience',
    line: 'A website that turns more visitors into customers.',
    image: '/assets/service-card-art/website-airside.webp',
    mobileImage: '/assets/service-card-art/website-airside.webp',
  },
  {
    slug: 'ai-agents',
    eyebrow: 'Intelligent automation',
    line: 'Inbound service. Outbound growth.',
    video: '/assets/service-card-art/ai-agent-call.mp4',
    poster: '/assets/service-card-art/ai-agent-call-poster.jpg',
  },
  {
    slug: 'digital-marketing',
    eyebrow: 'Demand & growth',
    title: 'Digital Marketing',
    line: 'Turn attention into qualified leads and revenue.',
    href: SERVICES_PATH,
    heroVideo: '/assets/service-card-art/digital-marketing-hero.mp4',
    heroPoster: '/assets/service-card-art/digital-marketing-hero-poster.png',
  },
  {
    slug: 'branding',
    eyebrow: 'Brand identity',
    framedVideo: '/assets/service-card-art/branding-hero-960.mp4',
    mobileVideo: '/assets/service-card-art/branding-hero-640.mp4',
    framedPoster: '/assets/service-card-art/branding-hero-poster.jpg',
  },
  {
    slug: 'podium-momentum',
    eyebrow: 'Integrated partner',
    title: 'Podium Momentum',
    line: 'One partner for strategy, brand, web and growth.',
    href: '/contact-us',
    image: '/assets/service-card-art/podium-momentum-wide-v4.jpg',
    mobileImage: '/assets/service-card-art/podium-momentum-mobile-v4.jpg',
  },
]

export const SERVICE_CARDS = CARD_DEFS.map((def, i) => {
  const s = serviceCatalog.find(x => x.slug === def.slug)
  return {
    slug: def.slug,
    title: def.title ?? s.title,
    line: def.line ?? s.cardLine,
    href: def.href ?? `${SERVICES_PATH}/${def.slug}`,
    eyebrow: def.eyebrow ?? 'Creative service',
    number: String(i + 1).padStart(2, '0'),
    theme: FACE_THEMES[i],
    image: def.image,
    mobileImage: def.mobileImage,
    video: def.video,
    poster: def.poster,
    heroVideo: def.heroVideo,
    heroPoster: def.heroPoster,
    framedVideo: def.framedVideo,
    mobileVideo: def.mobileVideo,
    framedPoster: def.framedPoster,
  }
})

export const CAROUSEL = {
  heading: 'Our services',
  cta: { label: 'Explore all services', href: '/services' },
}

export const BEYOND = {
  wordA: 'Let’s break',
  wordB: 'all limits together',
  para1:
    'Podium Momentum is a brand and digital growth partner for ambitious companies. We expand their digital presence, increase conversions, and bring them more clients.',
  para2:
    'One partner, every surface: strategy, brand, web, and growth. No ceilings, no limits, just momentum that keeps pace with your ambition.',
}

// Each work renders as a light structured card: sector eyebrow + index, big
// title, the artwork inside a rounded frame on a bold solid ground, then tag
// pills. Two art treatments:
//   inset: false — the image is a finished composition (mockup on its own
//                  colored ground) and fills the frame edge to edge.
//   inset: true  — the image is a clean site screenshot; it floats as a
//                  rounded, shadowed shot on the frame's ground color, like
//                  a device photo art-directed for the card.
export const WORKS = [
  {
    name: 'JobPosted',
    sector: 'Career Tech',
    meta: 'career tech · 2024 · Web Design · Development',
    tags: ['Website', 'Development', 'UX Strategy'],
    result: '3.3× conversion increase',
    href: '/industry/technology',
    image: '/assets/pm2/recent-jobposted-hd.jpg',
    inset: false,
    frame: '#2c43cf',
  },
  {
    name: 'Rezoomed',
    sector: 'AI Product',
    meta: 'ai product · 2024 · Brand · Motion · Web',
    tags: ['Branding', 'Motion', 'Website'],
    result: '1M+ resumes optimized',
    href: '/industry/ai',
    image: '/assets/pm2/recent-rezoomed-hd.jpg',
    inset: true,
    frame: '#2fbf7f',
  },
  {
    name: 'LikeOn',
    sector: 'Creator Economy',
    meta: 'creator economy · 2023 · Social · Content',
    tags: ['Social', 'Content', 'Marketing'],
    result: '50% order value growth',
    href: '/industry/technology',
    image: '/assets/pm2/recent-likeon-hd.jpg',
    inset: true,
    frame: '#f2aecf',
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
  core: {
    badge: 'Momentum Core',
    line: 'Intelligence, beyond limits',
    description:
      'Creative systems, digital experiences, and intelligent growth built to move ambitious brands further.',
    domain: 'podium.momentum',
  },
  // The tile the fly-through camera dives into; it ends fullscreen, so it gets
  // the largest source image (1536px).
  target: {
    // First frame of the Kling loop (1560×1040 — sharper than the original
    // render), so the zoomed still and the video are pixel-identical.
    image: '/assets/pm2gallery/target-frame.jpg',
    // Ambient loop generated from the still (Kling); plays once the zoom lands.
    video: '/assets/pm2gallery/target-loop.mp4',
    alt: 'Momentum Core — the podium, lit',
  },
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

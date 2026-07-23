/** Pure service catalog — Podium Momentum services hub + detail content. */

import { aliasProjectName } from './projectBrands.js'

export const SERVICES_PATH = '/services'
export const BRAND = 'Podium Momentum'
const IP = '/assets/industry-projects/'

const rawServiceCatalog = [
  {
    slug: 'website-design',
    title: 'Website Creation',
    shortTitle: 'Website Creation',
    cardLine: 'Designed and built to convert.',
    hubBlurb:
      'From strategy and design through implementation and launch, we create complete websites built to perform, captivate, and convert.',
    heroEyebrow: 'Website Creation',
    heroLead:
      'We take websites from strategy and design through implementation and launch. One team, one coherent vision, ready to perform.',
    heroHeadline: 'Your Website Should Work as Hard as Your Product',
    heroBody:
      'We create complete digital experiences, not static design files. Strategy, storytelling, interface design, development, CMS setup, performance, and launch all work together to turn attention into action.',
    heroImage: `${IP}technology-modern-vivo-3.avif`,
    stats: [
      { value: '500+', label: 'Websites Created', note: 'We’ve taken more than 500 websites from early thinking through polished, production ready experiences.' },
      { value: '98%', label: 'Client Satisfaction Rate', note: 'Nearly all of our clients walk away with a website that exceeds their expectations.' },
      { value: '90%', label: 'Clients Return for More', note: 'Our clients trust us, with 90% returning for new projects and ongoing collaborations.' },
      { value: '70%', label: 'Increase in Engagement', note: 'Our designs enhance user experience, leading to a 70% boost in visitor interaction and retention.' },
    ],
    capabilities: [
      { title: 'Content strategy & copy', body: 'Shaping a clear story and writing content tailored to your brand, audience, and goals.' },
      { title: 'UX & visual design', body: 'Creating intuitive journeys and a distinctive interface that makes the product easy to understand.' },
      { title: 'Front end implementation', body: 'Turning approved designs into responsive, accessible, production ready experiences.' },
      { title: 'CMS & integrations', body: 'Connecting a flexible content system and the tools your marketing and sales workflows rely on.' },
      { title: 'Technical SEO', body: 'Building search friendly structure, metadata, performance, and discoverability into the site.' },
      { title: 'Conversion optimization', body: 'Improving messaging, journeys, and calls to action so the finished website drives measurable results.' },
    ],
    process: [
      { title: 'Discovery & Strategy', body: 'We align on goals, audiences, content, technical needs, and the outcomes the website must deliver.' },
      { title: 'UX & Visual Direction', body: 'We shape the story, page architecture, wireframes, and visual system into one clear experience.' },
      { title: 'Implementation', body: 'We build the responsive website, connect the CMS and integrations, and optimize accessibility and performance.' },
      { title: 'QA, Launch & Growth', body: 'We test across devices, launch with confidence, and support measurement and ongoing improvement.' },
    ],
    faqs: [
      { q: 'How long does it take to create a website?', a: 'Most full marketing websites take between 6 and 12 weeks from discovery through launch, depending on scope, content readiness, integrations, and stakeholder cycles.' },
      { q: 'Can you align the design with my brand?', a: 'Yes. We either extend your system or rebuild the parts that no longer match your product and market position.' },
      { q: 'Do you handle implementation as well as design?', a: 'Yes. We own the website from strategy and design through responsive development, CMS setup, quality assurance, and launch.' },
      { q: 'What industries do you specialize in?', a: 'We work across industries, including fintech, healthcare, hospitality, consumer, technology, and other ambitious companies.' },
      { q: 'What do you need from me to start the project?', a: 'Business goals, audience notes, brand assets if any, competitor set, and access to product or leadership for a working session.' },
      { q: 'How many design revisions do you offer?', a: 'Structured review rounds are built into the plan so feedback stays focused, without endless open loops.' },
    ],
    related: ['branding', 'ux-ui', 'seo'],
    works: [
      { name: 'Vanquish', year: '2026', image: '/assets/industry-projects/pattech-7.avif', link: '/mcp-2099' },
      { name: 'ContinuOS', year: '2026', image: '/assets/industry-projects/ai-continuos-0.avif' },
      { name: 'Alpha Ledger', year: '2026', image: '/assets/industry-projects/alpha-ledger-0.avif' },
      { name: 'Incipet', year: '2026', image: `${IP}incipet-2.avif` },
    ],
  },
  {
    slug: 'branding',
    title: 'Branding',
    shortTitle: 'Branding',
    cardLine: 'An identity people remember and trust.',
    hubBlurb: 'We craft unique visual identities, logos, and messaging to build recognition, trust, and lasting success.',
    heroEyebrow: 'Branding',
    heroLead: 'We craft unique visual identities, logos, and messaging to build recognition, trust, and lasting success.',
    heroHeadline: 'Build a brand the market remembers',
    heroBody:
      'A strong brand is more than a logo. It is how people recognize, trust, and choose you. We craft visual identities and messaging systems that create lasting equity.',
    heroImage: `${IP}taraxa-0.avif`,
    stats: [
      { value: '40+', label: 'Brands shaped', note: 'From early stage companies to established category leaders.' },
      { value: '4.9', label: 'Average client rating', note: 'Founders rate clarity of process as highly as craft.' },
      { value: '3×', label: 'Faster brand adoption', note: 'Systems that sales, product, and marketing actually use.' },
      { value: '8/10', label: 'Return for more', note: 'Identity work often continues into site and product UI.' },
    ],
    capabilities: [
      { title: 'Positioning', body: 'Category, audience, and proof language that holds under diligence.' },
      { title: 'Logo & mark systems', body: 'Marks and lockups that scale from app icon to stage screen.' },
      { title: 'Visual language', body: 'Color, type, imagery, and motion rules that feel intentional.' },
      { title: 'Voice & messaging', body: 'Narrative pillars, taglines, and copy frameworks for every page.' },
      { title: 'Brand guidelines', body: 'Practical docs and templates teams can ship against.' },
      { title: 'Launch kits', body: 'Social, deck, and website assets ready for the first 90 days.' },
    ],
    process: [
      { title: 'Audit & insight', body: 'Current perception, competitive set, and internal ambition mapped side by side.' },
      { title: 'Strategy & narrative', body: 'Position, pillars, and proof model before pixels.' },
      { title: 'Identity exploration', body: 'Directioning, then refinement of mark, type, and palette.' },
      { title: 'System & rollout', body: 'Guidelines, templates, and application across key surfaces.' },
    ],
    faqs: [
      { q: 'How long does branding take?', a: 'Focused identity systems usually take 4–8 weeks. Full repositioning with messaging and launch assets can run longer.' },
      { q: 'Do you rebrand or refine?', a: 'Both. We recommend the lightest intervention that closes the perception gap without discarding equity that works.' },
      { q: 'Will this work for fundraising?', a: 'Yes. We design for investor ready clarity through story, proof, and a visual system that feels ready for the next stage.' },
      { q: 'What industries do you specialize in?', a: 'We work across industries, including fintech, healthcare, hospitality, consumer, technology, and other ambitious companies.' },
    ],
    related: ['website-design', 'content-creation', 'ux-ui'],
    works: [
      { name: 'Taraxa', year: '2026', image: `${IP}taraxa-0.avif` },
      { name: 'Vertus', year: '2026', image: `${IP}vertus-ai-6.avif` },
      { name: 'InnrevAI', year: '2026', image: `${IP}innrevai-1.avif` },
    ],
  },
  {
    slug: 'ux-ui',
    title: 'UX/UI',
    shortTitle: 'UX/UI',
    cardLine: 'Interfaces that feel obvious to use.',
    hubBlurb:
      'We design intuitive, engaging interfaces that enhance usability, boost conversions, and create seamless digital experiences for your audience.',
    heroEyebrow: 'UX/UI',
    heroLead:
      'We design intuitive, engaging interfaces that enhance usability, boost conversions, and create seamless digital experiences for your audience.',
    heroHeadline: 'Design that puts the user first',
    heroBody:
      'Great design is not just about aesthetics. It shapes how users interact, navigate, and connect with your product. Thoughtful UX and UI improve usability, build trust, and keep users engaged.',
    heroImage: `${IP}fintech-planet9-ui-ux-4.avif`,
    stats: [
      { value: '3M+', label: 'Impacted Users', note: 'Our designs have reached over 3 million people, enhancing digital experiences across multiple platforms.' },
      { value: '40%', label: 'Increasing Conversion Rates', note: 'Optimized UX / UI that turns visitors into loyal customers.' },
      { value: '4.9/5', label: 'Customer Satisfaction Rating', note: 'Our clients consistently rate us highly for delivering impactful UX / UI solutions.' },
      { value: '15+', label: 'Industries Served', note: 'From fintech to SaaS, our expertise spans multiple sectors.' },
    ],
    capabilities: [
      { title: 'Web & Mobile App Design', body: 'Seamless, engaging experiences tailored for every device.' },
      { title: 'Product Design', body: 'Design informed by research and aligned with business and user goals.' },
      { title: 'Wireframing und Prototyping', body: 'Interactive blueprints to test and refine the user journey.' },
      { title: 'Dashboard und SaaS UX/UI', body: 'Interfaces shaped by data and optimized for usability and insight.' },
      { title: 'Design Systems & UI Kits', body: 'Scalable design frameworks for brand consistency.' },
      { title: 'Accessibility & Usability Optimization', body: 'Ensuring inclusive, frictionless digital experiences.' },
    ],
    process: [
      { title: 'Research & User Insights', body: 'We begin by understanding user behavior, business goals, and industry trends to build a solid foundation for design.' },
      { title: 'Wireframing & UX Strategy', body: 'Next, we structure intuitive user journeys to ensure seamless flow and an optimal experience.' },
      { title: 'Visual Design & Prototyping', body: 'We then bring ideas to life with polished visuals and interactive prototypes aligned with your brand.' },
      { title: 'Testing & Refinement', body: 'Finally, we validate usability, gather feedback, and refine the design to deliver a flawless user experience before handoff.' },
    ],
    faqs: [
      { q: 'How long does a UX/UI design project take?', a: 'Typical UX/UI engagements run 4–8 weeks depending on surface count, research depth, and engineering collaboration.' },
      { q: 'Do you design for both web and mobile?', a: 'Yes. We design responsive web, natural mobile, and hybrid product experiences.' },
      { q: 'Can you improve an existing product’s UX/UI?', a: 'Absolutely. We often start with activation, pricing, or onboarding where impact is fastest.' },
      { q: 'How many design revisions do you offer?', a: 'Structured review rounds are included so feedback stays focused and shippable.' },
      { q: 'What do you need from me to start the project?', a: 'Goals, current product access, analytics if available, brand assets, and stakeholders for working sessions.' },
      { q: 'What industries do you specialize in?', a: 'We work across industries, including fintech, healthcare, hospitality, consumer, technology, and other ambitious companies.' },
    ],
    related: ['website-design', 'branding', 'landing-page'],
    works: [
      { name: 'Planet9 UI/UX', year: '2026', image: '/assets/industry-projects/fintech-planet9-ui-ux-4.avif' },
      { name: 'Frado UI/UX', year: '2025', image: '/assets/industry-projects/frado-1.avif' },
      { name: 'ContinuOS', year: '2026', image: '/assets/industry-projects/ai-continuos-0.avif' },
    ],
  },
  {
    slug: 'seo',
    title: 'SEO',
    shortTitle: 'SEO',
    cardLine: 'Found first, chosen faster.',
    hubBlurb:
      'Boost rankings, increase organic traffic, and grow your business with expert SEO strategy, technical optimization, and content that delivers results.',
    heroEyebrow: 'SEO',
    heroLead:
      'Boost rankings, increase organic traffic, and grow your business with expert SEO strategy, technical optimization, and content that delivers results.',
    heroHeadline: 'Organic growth built on structure and story',
    heroBody:
      'We pair technical excellence with content that compounds, so your site earns attention for the queries that matter to revenue, not vanity volume.',
    heroImage: `${IP}vertus-ai-6.avif`,
    stats: [
      { value: '65%', label: 'Organic traffic lifts', note: 'Typical gains after technical + content systems.' },
      { value: '3.3×', label: 'Conversion gains', note: 'When SEO pages are designed for action, not just rank.' },
      { value: '42+', label: 'Articles in system', note: 'Editorial engines that scale without brand drift.' },
      { value: 'Core', label: 'Web Vitals focus', note: 'Performance is part of the SEO brief, not an afterthought.' },
    ],
    capabilities: [
      { title: 'Technical audits', body: 'Crawl, indexation, speed, and structured data fixes.' },
      { title: 'IA for search', body: 'Topic clusters that build authority.' },
      { title: 'Onsite systems', body: 'Templates that keep titles, media, and CTAs consistent.' },
      { title: 'Content strategy', body: 'Priority topics mapped to funnel stages and ICP pain.' },
      { title: 'Backlinks', body: 'Domain authority signals from trusted sites that boost search credibility and rankings.' },
      { title: 'Ongoing ops', body: 'Cadence for publishing, refreshing, and technical health.' },
    ],
    process: [
      { title: 'Baseline & opportunity', body: 'Audit, keyword map, and competitive gaps.' },
      { title: 'Fix foundations', body: 'Technical and structural work that unblocks growth.' },
      { title: 'Content engine', body: 'Briefs, templates, and production rhythm.' },
      { title: 'Iterate & compound', body: 'Refresh winners, prune waste, expand clusters.' },
    ],
    faqs: [
      { q: 'Is SEO only content?', a: 'No. Technical health, structure, and page experience matter as much as words.' },
      { q: 'How soon do we see results?', a: 'Technical wins can show in weeks; content authority compounds over months.' },
      { q: 'Do you write content?', a: 'We can own strategy and briefs, partner with your writers, or produce critical pages with our internal team.' },
      { q: 'How does this connect to design?', a: 'Pages must convert. We design SEO templates with the same craft as marketing pages.' },
    ],
    related: ['content-creation', 'website-design', 'landing-page'],
    works: [
      { name: 'InnrevAI', year: '2026', image: `${IP}innrevai-1.avif` },
      { name: 'Taraxa', year: '2026', image: `${IP}taraxa-0.avif` },
      { name: 'Incipet', year: '2026', image: `${IP}incipet-2.avif` },
    ],
  },
  {
    slug: 'content-creation',
    title: 'Content Creation',
    shortTitle: 'Content Creation',
    cardLine: 'Words that turn readers into customers.',
    hubBlurb: 'Content That Turns Visitors into Loyal Customers',
    heroEyebrow: 'Content Creation',
    heroLead: 'Content That Turns Visitors into Loyal Customers',
    heroHeadline: 'Content with a commercial backbone',
    heroBody:
      'We build content that carries your positioning: site pages, thought leadership, and assets sales can use without diluting the brand.',
    heroImage: `${IP}innrevai-1.avif`,
    stats: [
      { value: '42+', label: 'Articles in engines', note: 'Structured publishing that compounds SEO and trust.' },
      { value: '3×', label: 'Qualified engagement', note: 'When narrative and CTA design work together.' },
      { value: '100%', label: 'Aligned with your brand system', note: 'Voice and visuals locked to your identity.' },
      { value: 'Weekly', label: 'Ops cadence options', note: 'From launch packs to ongoing content engines.' },
    ],
    capabilities: [
      { title: 'Narrative frameworks', body: 'Pillars, proof, and story arcs for every channel.' },
      { title: 'Site & product copy', body: 'Pages that sell clarity, not filler.' },
      { title: 'Thought leadership', body: 'Articles and posts that signal category depth.' },
      { title: 'Sales enablement', body: 'One page summaries, decks, and case narratives.' },
      { title: 'Visual content', body: 'Graphics and layouts that match the brand system.' },
      { title: 'Editorial ops', body: 'Calendars, workflows, and QA that keep quality high.' },
    ],
    process: [
      { title: 'Voice & pillars', body: 'Define what only you can say and how to say it.' },
      { title: 'Channel map', body: 'Where content must work hardest first.' },
      { title: 'Produce & design', body: 'Writing and visual craft in parallel.' },
      { title: 'Publish & refine', body: 'Performance review and iteration loops.' },
    ],
    faqs: [
      { q: 'Do you only write longer content?', a: 'No. We cover site copy, campaigns, social systems, and longer content when it earns its place.' },
      { q: 'Can you match our voice?', a: 'We extract and document voice so every piece sounds like you at your best.' },
      { q: 'How do you measure content success?', a: 'We look at rankings, engagement, assisted conversions, and sales usage rather than vanity metrics alone.' },
      { q: 'Do you need domain experts?', a: 'We interview your experts and turn depth into clear narratives without jargon overload.' },
    ],
    related: ['seo', 'branding', 'ux-ui'],
    works: [
      { name: 'Vertus', year: '2026', image: `${IP}vertus-ai-6.avif` },
      { name: 'Taraxa', year: '2026', image: `${IP}taraxa-0.avif` },
      { name: 'InnrevAI', year: '2026', image: `${IP}innrevai-1.avif` },
    ],
  },
  {
    slug: 'landing-page',
    title: 'Landing Page',
    shortTitle: 'Landing Page',
    cardLine: 'One page, built to convert.',
    hubBlurb: 'Strategic, visually compelling landing pages that tell stories, capture leads, and maximize conversions.',
    heroEyebrow: 'Landing Page',
    heroLead: 'Strategic, visually compelling landing pages that tell stories, capture leads, and maximize conversions.',
    heroHeadline: 'One page. One job. Maximum conversion.',
    heroBody:
      'We design landing experiences for campaigns, launches, and product moments with a focused narrative, clear proof, and frictionless next steps.',
    heroImage: `${IP}incipet-2.avif`,
    stats: [
      { value: '3.3×', label: 'Conversion lifts', note: 'When message alignment and proof hierarchy are rebuilt.' },
      { value: '2 wks', label: 'Faster builds', note: 'Scoped pages can move quickly when assets are ready.' },
      { value: 'A/B', label: 'Ready variants', note: 'Structured experiments without redesigning from zero.' },
      { value: '100%', label: 'Designed for mobile', note: 'Performance and layout engineered for real devices.' },
    ],
    capabilities: [
      { title: 'Message alignment', body: 'Consistency from ad to page that protects paid spend.' },
      { title: 'Offer architecture', body: 'Hero, proof, objection handling, and CTA sequencing.' },
      { title: 'Visual storytelling', body: 'Layouts that feel premium and move fast.' },
      { title: 'Form & funnel UX', body: 'Lead capture that balances quality and completion.' },
      { title: 'Speed & tracking', body: 'Lightweight builds with clean event instrumentation.' },
      { title: 'Iterate kits', body: 'Variant systems for ongoing optimization.' },
    ],
    process: [
      { title: 'Brief & offer', body: 'Audience, promise, and success metric locked.' },
      { title: 'Structure & wire', body: 'Section order that sells without scroll fatigue.' },
      { title: 'Design & copy', body: 'Craft the page as a single conversion system.' },
      { title: 'Launch & learn', body: 'Ship, measure, and improve with intent.' },
    ],
    faqs: [
      { q: 'How fast can a landing page ship?', a: 'Focused pages often ship in 1–3 weeks depending on content, legal review, and integrations.' },
      { q: 'Do you handle copy?', a: 'Yes. Offer narrative and CTAs are part of the design system, not an afterthought.' },
      { q: 'Can you integrate with our stack?', a: 'We design for your CRM, forms, and analytics tools or partner with your team on implementation.' },
      { q: 'What about testing multiple variants?', a: 'We can design modular sections so testing does not require a full rebuild.' },
    ],
    related: ['website-design', 'seo', 'content-creation'],
    works: [
      { name: 'InnrevAI', year: '2026', image: `${IP}innrevai-1.avif` },
      { name: 'Alpha Ledger', year: '2026', image: '/assets/industry-projects/alpha-ledger-0.avif' },
      { name: 'Incipet', year: '2026', image: `${IP}incipet-2.avif` },
    ],
  },
  {
    slug: 'ai-agents',
    title: 'AI Agents',
    shortTitle: 'AI Agents',
    cardLine: 'Always on, answering and booking.',
    hubBlurb:
      'Deploy voice agents and chatbots that answer, qualify, book, and follow up around the clock, tuned to how your business actually operates.',
    heroEyebrow: 'AI Agent Deployments',
    heroLead:
      'Deploy AI agents that turn every call, chat, and continued conversation into a better customer experience and a stronger pipeline.',
    heroHeadline: 'Your best operator is always on',
    heroBody:
      'We design and deploy inbound and outbound AI voice agents and chatbots for service businesses with serious customer demand. From a clinic booking the next appointment to a real estate team qualifying a new enquiry, your agent handles the first conversation with speed, context, and a distinctly human point of view.',
    heroImage: `${IP}ai-hybrid-mind-7.avif`,
    stats: [
      { value: '24/7', label: 'Continuous coverage', note: 'Capture intent after hours, on weekends, and across every time zone.' },
      { value: '3×', label: 'More conversations', note: 'Handle more qualified inbound and outbound conversations without adding headcount.' },
      { value: '< 1 min', label: 'Lead response time', note: 'Move from missed enquiry to useful first response while intent is still warm.' },
      { value: '1 system', label: 'Voice + chat', note: 'One operating layer across phone, web chat, CRM, calendar, and continued outreach.' },
    ],
    capabilities: [
      { title: 'Inbound voice agents', body: 'Answer FAQs, triage intent, route calls, take messages, and book appointments with a natural voice that fits your brand.' },
      { title: 'Outbound qualification', body: 'Follow up with leads, reconnect with dormant enquiries, confirm details, and hand warm conversations to your team.' },
      { title: 'Website & WhatsApp chatbots', body: 'Guide visitors to the right service, capture context, and keep conversations moving beyond the first click.' },
      { title: 'CRM & calendar orchestration', body: 'Connect your agent to the tools your team already uses so every call creates a clean next action.' },
      { title: 'Conversation design', body: 'Scripts, guardrails, escalation paths, and knowledge bases shaped around real customer questions.' },
      { title: 'Agent performance layer', body: 'Review outcomes, missed intents, bookings, and handoffs so the system improves every week.' },
    ],
    process: [
      { title: 'Map the moments', body: 'We identify the conversations worth automating, from missed calls and appointment requests to lead qualification.' },
      { title: 'Design the voice', body: 'Tone, prompts, knowledge, guardrails, and escalation rules are crafted around your brand and operating reality.' },
      { title: 'Connect the system', body: 'We wire voice, chat, CRM, calendars, forms, and notifications into one dependable customer journey.' },
      { title: 'Launch & tune', body: 'Your agent goes live with human oversight, analytics, and a steady optimisation rhythm after launch.' },
    ],
    faqs: [
      { q: 'What kind of businesses are AI agents best for?', a: 'Any business with repeatable conversations from serious prospects, especially clinics, real estate agencies, education, home services, and professional services.' },
      { q: 'Can an agent transfer to a human?', a: 'Yes. We define clear escalation rules and pass the conversation context along so your team can pick up without making the customer repeat themselves.' },
      { q: 'Can the agent book appointments?', a: 'Yes. We can connect the experience to your calendar, booking flow, CRM, or internal routing rules.' },
      { q: 'Will it sound like a robot?', a: 'The experience is designed around natural conversation rhythm, concise answers, and a voice that fits your brand. We test real scenarios before launch.' },
      { q: 'Do you build the chatbot and voice agent together?', a: 'That is often the strongest setup. Customers can move between web chat, phone, and human support without losing context.' },
      { q: 'How do we measure whether it is working?', a: 'We track response time, qualified conversations, bookings, handoffs, resolution, and the reasons people still need a human.' },
    ],
    related: ['website-design', 'landing-page', 'seo'],
    works: [
      { name: 'InnrevAI', year: '2026', image: `${IP}ai-innrevai-1.avif` },
      { name: 'The Virtual Slimming Clinic', year: '2026', image: `${IP}healthcare-sofia-therapy-3.avif` },
      { name: 'Dubai Realty', year: '2026', image: `${IP}real-estate-dubai-realty-1.avif` },
    ],
  },
]

export const serviceCatalog = rawServiceCatalog.map(service => ({
  ...service,
  works: (service.works || []).map(work => ({
    ...work,
    name: aliasProjectName(work.name),
  })),
}))

export const hubIntro = {
  heroLine: 'Solutions to help your brand stand out and grow',
  title: 'Our Core Creative Offerings',
  lead: 'Everything your brand needs to grow, under one roof.',
  body: 'We combine years of expertise in UX/UI, branding, content, and web design to build digital experiences that look great, perform well, and drive results.',
  offeringsLabel: 'Our Services',
}

/** Featured work strip — Podium Momentum projects. */
export const hubFeatured = [
  {
    name: 'JobPosted',
    year: '2025',
    sector: 'Career Tech',
    blurb: '',
    image: '/assets/jobposted-thumb.png',
    tags: ['Website Design', 'Brand System', 'Content & SEO'],
  },
  {
    name: 'Rezoomed',
    year: '2025',
    sector: 'Career Tech',
    blurb: '',
    image: '/assets/rezoomed-thumb.png',
    tags: ['Product UX', 'Website Redesign', 'Motion'],
  },
  {
    name: 'LikeOn',
    year: '2025',
    sector: 'Technology',
    blurb: '',
    image: '/assets/selected-work/likeon-thumbnail-v2.png',
    tags: ['Branding', 'Website Design', 'Growth'],
  },
  {
    name: 'OrbitNine',
    year: '2026',
    sector: 'Fintech',
    blurb: '',
    image: `${IP}fintech-planet9-ui-ux-4.avif`,
    tags: ['UX/UI', 'Web Design'],
  },
]

/** Partner logos — Podium Momentum clients (local /assets mirrors). */
export const hubPartners = [
  '/assets/a9cc6fba12268e37.avif',
  '/assets/43201ae504d0ad9f.avif',
  '/assets/cfecff048b60daa1.avif',
  '/assets/baa053d3454375d0.avif',
  '/assets/d2c8ca3a50aba890.avif',
  '/assets/ab3a9a6cf9778c11.avif',
  '/assets/9a6b3e2b11136ee0.avif',
  '/assets/c90888271d904160.avif',
]

export const hubExpertise = {
  label: 'Expertise',
  title: 'We solve real problems',
  body: 'We combine strategy, branding, UX and UI, and web design to build digital experiences that look great, perform well, and move the metrics that matter for ambitious brands.',
  image: '/assets/selected-work/likeon-thumbnail-v2.png',
  imageAlt: 'Podium Momentum brand and web design work',
}

export const hubNumbers = [
  { index: '01', value: '40+', label: 'Brands' },
  { index: '02', value: '4.9', label: 'Average Client Rating' },
  { index: '03', value: '2.3×', label: 'Conversion Lift After Rebrand' },
  { index: '04', value: '$10M+', label: 'Raised By Clients' },
]

export const hubNumbersHead = {
  label: 'What makes us different?',
  title: 'Momentum\nin numbers',
  titleLines: ['Momentum', 'in numbers'],
  body: 'Design is more than aesthetics. It is about measurable impact. Here is how we make a difference.',
}

export const hubClose = {
  label: 'Interested?',
  title: 'Let’s work together!',
  body: 'Let’s bring your vision to life and transform your ideas into a powerful, unforgettable brand that drives growth and success!',
  primary: 'Schedule a call',
  secondary: 'Get pricing info',
}

export const hubFaqs = [
  { q: 'Do you offer revisions?', a: 'Yes. Structured review rounds are built into every engagement so feedback stays focused and the work keeps moving.' },
  { q: 'How long does branding take?', a: 'Focused identity systems usually take 4–8 weeks. Full repositioning with messaging and launch assets can run longer.' },
  { q: 'What do you need from me to start the project?', a: 'Business goals, audience notes, brand assets if any, competitor set, and access to product or leadership for a working session.' },
  { q: 'What industries do you specialize in?', a: 'We work across industries, including fintech, healthcare, hospitality, consumer, technology, and other ambitious companies.' },
  { q: 'How long does it take to design a website?', a: 'Most full marketing sites run 4–10 weeks depending on scope, content readiness, and stakeholder cycles.' },
  { q: 'How can my website enhance my branding?', a: 'Your site is the operating system of the brand online. When identity, messaging, and UX align, visitors feel the same quality as your product.' },
  { q: 'What is user experience (UX) design?', a: 'It is the structure, flow, and interaction design that makes products understandable and usable, not just visually attractive.' },
  { q: 'What is a content management system (CMS)?', a: 'It lets marketing update pages and content without breaking the design. We plan the content model so your team can run it.' },
  { q: "How can I optimize my website's speed?", a: 'Asset discipline, clean structure, interaction budgets, and Core Web Vitals checks before and after launch.' },
  { q: 'Why is website design important?', a: 'It’s often the first impression of your brand. Strong design builds trust, captures attention, and turns visitors into customers.' },
]

/** Hub testimonials — Podium Momentum clients. */
export const hubTestimonials = [
  {
    quote:
      'Podium Momentum rebuilt our brand into one that finally matches the operation behind it. They gave us strategic pillars and a defined voice that the whole team now uses.',
    name: 'Marcus Hale',
    role: 'CEO, VivaWell Clinic',
    image: '/assets/236e08442c17c9f5.avif',
  },
  {
    quote:
      'Our previous website failed to reflect our standard of high end storytelling and technology. After the redesign, it shifted the caliber of partners reaching out.',
    name: 'Oliver Grant',
    role: 'Executive Producer',
    image: '/assets/c0bb9a494de2f7b0.png',
  },
  {
    quote:
      'The new website builds immediate trust. Influencers and brand clients feel ready to work with us just by looking at the site.',
    name: 'Claire Bennett',
    role: 'Associate Founder, LikeOn',
    image: '/assets/ef42fa7cfd41a7e6.avif',
  },
  {
    quote:
      'We needed users to understand what we do just by looking at our website. As a result, we saw stronger interest and an increase in conversion.',
    name: 'Daniel Brooks',
    role: 'CEO',
    image: '/assets/b6bb0636a8e5a963.avif',
  },
]

export const serviceHeroImages = Object.fromEntries(
  serviceCatalog.map(s => [s.slug, s.heroImage]),
)

export function getServiceBySlug(slug) {
  if (!slug) return null
  const normalized = String(slug).replace(/^\/+|\/+$/g, '').toLowerCase()
  return serviceCatalog.find(s => s.slug === normalized) || null
}

export function getServicePath(slug) {
  return `${SERVICES_PATH}/${slug}`
}

export function listServicePaths() {
  return serviceCatalog.map(s => ({
    slug: s.slug,
    path: getServicePath(s.slug),
    title: s.title,
  }))
}

export function getRelatedServices(slug, limit = 3) {
  const current = getServiceBySlug(slug)
  if (!current) return serviceCatalog.slice(0, limit)
  const related = (current.related || []).map(getServiceBySlug).filter(Boolean)
  if (related.length >= limit) return related.slice(0, limit)
  const extras = serviceCatalog.filter(s => s.slug !== slug && !related.some(r => r.slug === s.slug))
  return [...related, ...extras].slice(0, limit)
}

/** Path matching used by the SPA router (pure, testable without JSX). */
export function matchServicesRoute(path) {
  const clean = (path || '/').replace(/\/+$/, '') || '/'
  if (clean === SERVICES_PATH) return { type: 'hub' }
  if (clean.startsWith(`${SERVICES_PATH}/`)) {
    const slug = clean.slice(SERVICES_PATH.length + 1).split('/')[0]
    return { type: 'detail', slug }
  }
  return null
}

/** Content shape checks for automated verification (no DOM). */
export function validateServiceCatalog() {
  const errors = []
  if (serviceCatalog.length !== 7) errors.push(`expected 7 services, got ${serviceCatalog.length}`)
  const slugs = new Set()
  for (const s of serviceCatalog) {
    if (!s.slug) errors.push('missing slug')
    if (slugs.has(s.slug)) errors.push(`duplicate slug ${s.slug}`)
    slugs.add(s.slug)
    if (!s.title) errors.push(`bad title for ${s.slug}`)
    if (!s.heroLead || !s.heroHeadline || !s.heroBody) errors.push(`incomplete hero for ${s.slug}`)
    if (!Array.isArray(s.stats) || s.stats.length < 1) errors.push(`stats missing for ${s.slug}`)
    if (!Array.isArray(s.capabilities) || s.capabilities.length < 3) errors.push(`capabilities <3 for ${s.slug}`)
    if (!Array.isArray(s.process) || s.process.length < 3) errors.push(`process <3 for ${s.slug}`)
    if (!Array.isArray(s.faqs) || s.faqs.length < 2) errors.push(`faqs <2 for ${s.slug}`)
  }
  // Hub surfaces must not leak competitor (Eloqwnt) brand or assets.
  const hubText = [hubNumbersHead.title, ...hubTestimonials.map(t => t.quote), hubExpertise.body].join(' ')
  if (/Eloqwnt/i.test(hubText)) errors.push('hub copy still references Eloqwnt')
  const hubImages = [
    ...hubFeatured.map(f => f.image),
    ...hubPartners,
    hubExpertise.image,
    ...hubTestimonials.map(t => t.image),
    ...serviceCatalog.flatMap(s => [s.heroImage, ...(s.works || []).map(w => w.image)]),
  ]
  if (hubImages.some(src => /\/assets\/eloqwnt\//.test(src || ''))) errors.push('assets still point to /assets/eloqwnt')
  if (hubFeatured.length < 3) errors.push('hubFeatured too small')
  if (hubPartners.length < 6) errors.push('hubPartners too small')
  if (hubFaqs.length < 6) errors.push('hubFaqs incomplete')
  return { ok: errors.length === 0, errors, count: serviceCatalog.length, slugs: [...slugs] }
}

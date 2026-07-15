/** Pure service catalog — Podium Momentum services hub + detail content. */

import { aliasProjectName } from './projectBrands.js'

export const SERVICES_PATH = '/services'
export const BRAND = 'Podium Momentum'
const IP = '/assets/industry-projects/'

const rawServiceCatalog = [
  {
    slug: 'website-design',
    title: 'Website Design',
    shortTitle: 'Web Design',
    hubBlurb:
      'Get a high-performing website that captivates and converts. Our web design blends creativity and strategy for seamless digital experiences.',
    heroEyebrow: 'Web Design',
    heroLead:
      'Get a high-performing website that captivates and converts. Our web design blends creativity and strategy for seamless digital experiences.',
    heroHeadline: 'Your Website Is More Than Just a Digital Presence',
    heroBody:
      'Your website is your digital storefront, and often the first impression your audience has of your brand. A well-designed site goes beyond mere aesthetics—it builds trust, captures attention, and turns casual visitors into loyal customers.',
    heroImage: `${IP}technology-modern-vivo-3.avif`,
    stats: [
      { value: '500+', label: 'Websites Designed', note: 'We’ve crafted over 500 websites, blending aesthetics with strategy to create seamless digital experiences.' },
      { value: '98%', label: 'Client Satisfaction Rate', note: 'Nearly all of our clients walk away with a website that exceeds their expectations.' },
      { value: '90%', label: 'Clients Return for More', note: 'Our clients trust us, with 90% returning for new projects and ongoing collaborations.' },
      { value: '70%', label: 'Increase in Engagement', note: 'Our designs enhance user experience, leading to a 70% boost in visitor interaction and retention.' },
    ],
    capabilities: [
      { title: 'Content writing', body: 'Crafting engaging and impactful content tailored to your brand and audience.' },
      { title: 'Website Design', body: 'Creating visually stunning and user-friendly designs.' },
      { title: 'Website Development', body: 'Building responsive and high-performance websites.' },
      { title: 'CMS Setup', body: 'Implementing a flexible content management system to streamline updates and workflows.' },
      { title: 'SEO', body: 'Optimizing your website to rank higher on search engines and drive organic traffic.' },
      { title: 'CRO', body: 'Enhancing your website’s user experience to maximize conversions and achieve business goals.' },
    ],
    process: [
      { title: 'Discovery & Strategy', body: 'Understanding your goals and defining the vision.' },
      { title: 'Wireframing & UX Design', body: 'Structuring intuitive layouts for seamless navigation.' },
      { title: 'Web Design & Style Guide', body: 'Crafting pixel-perfect designs that tell your story.' },
      { title: 'Handover & Support', body: 'Delivering assets and guiding the transition to development.' },
    ],
    faqs: [
      { q: 'How long does it take to design a website?', a: 'Most full marketing sites run 4–10 weeks depending on scope, content readiness, and stakeholder cycles. We lock a timeline in discovery.' },
      { q: 'Can you align the design with my brand?', a: 'Yes. We either extend your system or rebuild the parts that no longer match your product and market position.' },
      { q: 'Do you also handle development?', a: 'We design for production and can partner on Webflow or hand off to your engineering team with clear specs and components.' },
      { q: 'What industries do you specialize in?', a: 'Technology, SaaS, AI, fintech, health, and other ambition-led B2B and product companies.' },
      { q: 'What do you need from me to start the project?', a: 'Business goals, audience notes, brand assets if any, competitor set, and access to product or leadership for a working session.' },
      { q: 'How many design revisions do you offer?', a: 'Structured review rounds are built into the plan so feedback stays focused — not endless open loops.' },
    ],
    related: ['branding', 'webflow-development', 'seo'],
    works: [
      { name: 'Vanquish', year: '2024', image: '/assets/industry-projects/pattech-7.avif' },
      { name: 'ContinuOS', year: '2024', image: '/assets/industry-projects/ai-continuos-0.avif' },
      { name: 'Alpha Ledger', year: '2024', image: '/assets/industry-projects/alpha-ledger-0.avif' },
      { name: 'Incipet', year: '2024', image: `${IP}incipet-2.avif` },
    ],
  },
  {
    slug: 'branding',
    title: 'Branding',
    shortTitle: 'Branding',
    hubBlurb: 'We craft unique visual identities, logos, and messaging to build recognition, trust, and long-term success.',
    heroEyebrow: 'Branding',
    heroLead: 'We craft unique visual identities, logos, and messaging to build recognition, trust, and long-term success.',
    heroHeadline: 'Build a brand the market remembers',
    heroBody:
      'A strong brand is more than a logo — it’s how people recognize, trust, and choose you. We craft visual identities and messaging systems that create lasting equity.',
    heroImage: `${IP}taraxa-0.avif`,
    stats: [
      { value: '40+', label: 'Tech brands shaped', note: 'From seed-stage to scale-up category leaders.' },
      { value: '4.9', label: 'Average client rating', note: 'Founders rate clarity of process as highly as craft.' },
      { value: '3×', label: 'Faster brand adoption', note: 'Systems that sales, product, and marketing actually use.' },
      { value: '8/10', label: 'Return for more', note: 'Identity work often continues into site and product UI.' },
    ],
    capabilities: [
      { title: 'Positioning', body: 'Category, audience, and proof language that holds under diligence.' },
      { title: 'Logo & mark systems', body: 'Marks and lockups that scale from app icon to stage screen.' },
      { title: 'Visual language', body: 'Color, type, imagery, and motion rules that feel intentional.' },
      { title: 'Voice & messaging', body: 'Narrative pillars, taglines, and page-level copy frameworks.' },
      { title: 'Brand guidelines', body: 'Practical docs and templates teams can ship against.' },
      { title: 'Launch kits', body: 'Social, deck, and site-ready assets for the first 90 days.' },
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
      { q: 'Will this work for fundraising?', a: 'Yes — we design for investor-grade clarity: story, proof, and a visual system that feels ready for the next stage.' },
      { q: 'What industries do you specialize in?', a: 'Technology, SaaS, AI, fintech, health, and other ambition-led B2B and product companies.' },
    ],
    related: ['website-design', 'content-creation', 'ux-ui'],
    works: [
      { name: 'Taraxa', year: '2024', image: `${IP}taraxa-0.avif` },
      { name: 'Vertus', year: '2024', image: `${IP}vertus-ai-6.avif` },
      { name: 'InnrevAI', year: '2024', image: `${IP}innrevai-1.avif` },
    ],
  },
  {
    slug: 'ux-ui',
    title: 'UX/UI',
    shortTitle: 'UX/UI',
    hubBlurb:
      'We design intuitive, engaging interfaces that enhance usability, boost conversions, and create seamless digital experiences for your audience.',
    heroEyebrow: 'UX/UI',
    heroLead:
      'We design intuitive, engaging interfaces that enhance usability, boost conversions, and create seamless digital experiences for your audience.',
    heroHeadline: 'Design that puts the user first',
    heroBody:
      'Great design isn’t just about aesthetics — it’s about how users interact, navigate, and connect with your product. A well-crafted UX / UI enhances usability, builds trust, and keeps users engaged.',
    heroImage: `${IP}fintech-planet9-ui-ux-4.avif`,
    stats: [
      { value: '3M+', label: 'Impacted Users', note: 'Our designs have reached over 3 million people, enhancing digital experiences across multiple platforms.' },
      { value: '40%', label: 'Increasing Conversion Rates', note: 'Optimized UX / UI that turns visitors into loyal customers.' },
      { value: '4.9/5', label: 'Customer Satisfaction Rating', note: 'Our clients consistently rate us highly for delivering impactful UX / UI solutions.' },
      { value: '15+', label: 'Industries Served', note: 'From fintech to SaaS, our expertise spans multiple sectors.' },
    ],
    capabilities: [
      { title: 'Web & Mobile App Design', body: 'Seamless, engaging experiences tailored for every device.' },
      { title: 'Product Design', body: 'Research-driven design aligned with business and user goals.' },
      { title: 'Wireframing und Prototyping', body: 'Interactive blueprints to test and refine the user journey.' },
      { title: 'Dashboard und SaaS UX/UI', body: 'Data-driven interfaces optimized for usability and insights.' },
      { title: 'Design Systems & UI Kits', body: 'Scalable design frameworks for brand consistency.' },
      { title: 'Accessibility & Usability Optimization', body: 'Ensuring inclusive, frictionless digital experiences.' },
    ],
    process: [
      { title: 'Research & User Insights', body: 'We begin by understanding user behavior, business goals, and industry trends to build a solid foundation for design.' },
      { title: 'Wireframing & UX Strategy', body: 'Next, we structure intuitive user journeys to ensure seamless flow and an optimal experience.' },
      { title: 'Visual Design & Prototyping', body: 'We then bring ideas to life with high-fidelity visuals and interactive prototypes aligned with your brand.' },
      { title: 'Testing & Refinement', body: 'Finally, we validate usability, gather feedback, and refine the design to deliver a flawless user experience before handoff.' },
    ],
    faqs: [
      { q: 'How long does a UX/UI design project take?', a: 'Typical UX/UI engagements run 4–8 weeks depending on surface count, research depth, and engineering collaboration.' },
      { q: 'Do you design for both web and mobile?', a: 'Yes — we design responsive web, native-feeling mobile, and hybrid product experiences.' },
      { q: 'Can you improve an existing product’s UX/UI?', a: 'Absolutely. We often start with activation, pricing, or onboarding where impact is fastest.' },
      { q: 'How many design revisions do you offer?', a: 'Structured review rounds are included so feedback stays focused and shippable.' },
      { q: 'What do you need from me to start the project?', a: 'Goals, current product access, analytics if available, brand assets, and stakeholders for working sessions.' },
      { q: 'What industries do you specialize in?', a: 'Fintech, SaaS, AI, health, and other product-led companies.' },
    ],
    related: ['website-design', 'motion-design', 'landing-page'],
    works: [
      { name: 'Planet9 UI/UX', year: '2024', image: '/assets/industry-projects/fintech-planet9-ui-ux-4.avif' },
      { name: 'Frado UI/UX', year: '2025', image: '/assets/industry-projects/frado-1.avif' },
      { name: 'ContinuOS', year: '2024', image: '/assets/industry-projects/ai-continuos-0.avif' },
    ],
  },
  {
    slug: 'motion-design',
    title: 'Motion Design',
    shortTitle: 'Motion',
    hubBlurb:
      'Bring your brand to life with stunning motion graphics and UI animations that enhance storytelling, engagement, and user experience.',
    heroEyebrow: 'Motion',
    heroLead:
      'Bring your brand to life with stunning motion graphics and UI animations that enhance storytelling, engagement, and user experience.',
    heroHeadline: 'Why Is Motion Design Important',
    heroBody:
      'Motion design brings visuals to life, making content more engaging, memorable, and impactful. It enhances storytelling, improves user experience, and increases audience retention.',
    heroImage: `${IP}ai-innrevai-1.avif`,
    stats: [
      { value: '90%', label: 'Of Our Clients Come Back', note: 'Once brands experience the power of well-crafted motion, they want more.' },
      { value: '4.9/5', label: 'Average Motion Project Approval Rating', note: 'High standards, seamless execution—our motion work speaks for itself.' },
      { value: '10K+', label: 'Hours Dedicated to Motion', note: 'Thousands of hours spent refining movement, pacing, and visual storytelling.' },
      { value: '100+', label: 'Motion Projects Completed', note: 'Helping brands, products, and interfaces come to life through seamless animation.' },
    ],
    capabilities: [
      { title: 'Brand Animation', body: 'Animated logos and visual identities that enhance brand recognition.' },
      { title: 'Website & UI Motion', body: 'Seamless micro-interactions and transitions for intuitive user experiences.' },
      { title: 'Product Explainer Videos', body: 'Engaging motion graphics that simplify complex ideas.' },
      { title: 'Social Media Motion Content', body: 'Eye-catching animations optimized for social engagement.' },
      { title: 'Ad & Promo Videos', body: 'High-converting animated content for marketing campaigns.' },
      { title: '3D Motion & Experimental Design', body: 'Advanced motion techniques to push creative boundaries.' },
    ],
    process: [
      { title: 'Concept & Storyboarding', body: 'We first define the vision, narrative, and animation style.' },
      { title: 'Design & Asset Creation', body: 'Then, we craft the visual elements and refine motion details.' },
      { title: 'Animation & Refinement', body: 'After that, we bring everything to life with smooth, dynamic movement.' },
      { title: 'Final Delivery & Optimization', body: 'Finally, we optimize for different platforms and ensure seamless integration.' },
    ],
    faqs: [
      { q: 'What are the benefits of motion design?', a: 'Motion increases engagement, clarifies complex ideas, and makes brand moments memorable across product and marketing.' },
      { q: 'What makes your motion design different?', a: 'Purpose over decoration — timing, easing, and narrative aligned to brand and product goals.' },
      { q: 'How does your motion design process work?', a: 'Storyboards → design assets → animation craft → platform-optimized delivery with structured feedback.' },
      { q: 'Who typically uses your motion design services?', a: 'Product, brand, and growth teams who need UI motion, explainers, launch films, and social systems.' },
      { q: 'What do you need from me to start the project?', a: 'Brand assets, reference motion, audience goals, and any existing product UI or campaign brief.' },
    ],
    related: ['ux-ui', 'branding', 'content-creation'],
    works: [
      { name: 'Alpha Ledger', year: '2024', image: '/assets/industry-projects/alpha-ledger-0.avif' },
      { name: 'Vertus', year: '2024', image: `${IP}vertus-ai-6.avif` },
      { name: 'ContinuOS', year: '2024', image: '/assets/industry-projects/ai-continuos-0.avif' },
      { name: 'InnrevAI', year: '2024', image: `${IP}innrevai-1.avif` },
    ],
  },
  {
    slug: 'seo',
    title: 'SEO',
    shortTitle: 'SEO',
    hubBlurb:
      'Boost rankings, increase organic traffic, and grow your business with expert SEO strategies, technical optimization, and content-driven results.',
    heroEyebrow: 'SEO',
    heroLead:
      'Boost rankings, increase organic traffic, and grow your business with expert SEO strategies, technical optimization, and content-driven results.',
    heroHeadline: 'Organic growth built on structure and story',
    heroBody:
      'We pair technical excellence with content that compounds — so your site earns attention for the queries that matter to revenue, not vanity volume.',
    heroImage: `${IP}vertus-ai-6.avif`,
    stats: [
      { value: '65%', label: 'Organic traffic lifts', note: 'Typical gains after technical + content systems.' },
      { value: '3.3×', label: 'Conversion gains', note: 'When SEO pages are designed for action, not just rank.' },
      { value: '42+', label: 'Articles in system', note: 'Editorial engines that scale without brand drift.' },
      { value: 'Core', label: 'Web Vitals focus', note: 'Performance is part of the SEO brief, not an afterthought.' },
    ],
    capabilities: [
      { title: 'Technical audits', body: 'Crawl, indexation, speed, and structured data fixes.' },
      { title: 'IA for search', body: 'Hub-and-spoke architectures that win topic ownership.' },
      { title: 'On-page systems', body: 'Templates that keep titles, media, and CTAs consistent.' },
      { title: 'Content strategy', body: 'Priority topics mapped to funnel stages and ICP pain.' },
      { title: 'Measurement', body: 'Dashboards for queries, pages, and conversion paths.' },
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
      { q: 'Do you write content?', a: 'We can own strategy and briefs, partner with your writers, or produce high-stakes pages in-house.' },
      { q: 'How does this connect to design?', a: 'Pages must convert. We design SEO templates with the same craft as marketing pages.' },
    ],
    related: ['content-creation', 'website-design', 'landing-page'],
    works: [
      { name: 'InnrevAI', year: '2024', image: `${IP}innrevai-1.avif` },
      { name: 'Taraxa', year: '2024', image: `${IP}taraxa-0.avif` },
      { name: 'Incipet', year: '2024', image: `${IP}incipet-2.avif` },
    ],
  },
  {
    slug: 'content-creation',
    title: 'Content Creation',
    shortTitle: 'Content Creation',
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
      { value: '100%', label: 'Brand-system aligned', note: 'Voice and visuals locked to your identity.' },
      { value: 'Weekly', label: 'Ops cadence options', note: 'From launch packs to ongoing content engines.' },
    ],
    capabilities: [
      { title: 'Narrative frameworks', body: 'Pillars, proof, and story arcs for every channel.' },
      { title: 'Site & product copy', body: 'Pages that sell clarity, not filler.' },
      { title: 'Thought leadership', body: 'Articles and posts that signal category depth.' },
      { title: 'Sales enablement', body: 'One-pagers, decks, and case narratives.' },
      { title: 'Visual content', body: 'Graphics and layouts that match the brand system.' },
      { title: 'Editorial ops', body: 'Calendars, workflows, and QA that keep quality high.' },
    ],
    process: [
      { title: 'Voice & pillars', body: 'Define what only you can say — and how.' },
      { title: 'Channel map', body: 'Where content must work hardest first.' },
      { title: 'Produce & design', body: 'Writing and visual craft in parallel.' },
      { title: 'Publish & refine', body: 'Performance review and iteration loops.' },
    ],
    faqs: [
      { q: 'Do you only write long-form?', a: 'No — we cover site copy, campaigns, social systems, and long-form when it earns its place.' },
      { q: 'Can you match our voice?', a: 'We extract and document voice so every piece sounds like you at your best.' },
      { q: 'How do you measure content success?', a: 'Rankings, engagement, assisted conversions, and sales usage — not vanity metrics alone.' },
      { q: 'Do you need subject-matter experts?', a: 'We interview your experts and turn depth into clear narratives without jargon overload.' },
    ],
    related: ['seo', 'branding', 'motion-design'],
    works: [
      { name: 'Vertus', year: '2024', image: `${IP}vertus-ai-6.avif` },
      { name: 'Taraxa', year: '2024', image: `${IP}taraxa-0.avif` },
      { name: 'InnrevAI', year: '2024', image: `${IP}innrevai-1.avif` },
    ],
  },
  {
    slug: 'landing-page',
    title: 'Landing Page',
    shortTitle: 'Landing Page',
    hubBlurb: 'Strategic, visually compelling landing pages that tell stories, capture leads, and maximize conversions.',
    heroEyebrow: 'Landing Page',
    heroLead: 'Strategic, visually compelling landing pages that tell stories, capture leads, and maximize conversions.',
    heroHeadline: 'One page. One job. Maximum conversion.',
    heroBody:
      'We design landing experiences for campaigns, launches, and product moments — focused narrative, proof, and frictionless next steps.',
    heroImage: `${IP}incipet-2.avif`,
    stats: [
      { value: '3.3×', label: 'Conversion lifts', note: 'When message-match and proof hierarchy are rebuilt.' },
      { value: '2 wks', label: 'Fast-track builds', note: 'Scoped pages can move quickly when assets are ready.' },
      { value: 'A/B', label: 'Ready variants', note: 'Structured experiments without redesigning from zero.' },
      { value: '100%', label: 'Mobile-first', note: 'Performance and layout engineered for real devices.' },
    ],
    capabilities: [
      { title: 'Message-match design', body: 'Ad-to-page continuity that protects paid spend.' },
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
      { q: 'Do you handle copy?', a: 'Yes — offer narrative and CTAs are part of the design system, not an afterthought.' },
      { q: 'Can you integrate with our stack?', a: 'We design for your CRM, forms, and analytics tools or partner with your team on implementation.' },
      { q: 'What about multi-variant tests?', a: 'We can design modular sections so testing does not require a full rebuild.' },
    ],
    related: ['website-design', 'seo', 'webflow-development'],
    works: [
      { name: 'InnrevAI', year: '2024', image: `${IP}innrevai-1.avif` },
      { name: 'Alpha Ledger', year: '2024', image: '/assets/industry-projects/alpha-ledger-0.avif' },
      { name: 'Incipet', year: '2024', image: `${IP}incipet-2.avif` },
    ],
  },
  {
    slug: 'webflow-development',
    title: 'Webflow Development',
    shortTitle: 'Webflow Dev',
    hubBlurb:
      'We create fast, visually impressive Webflow websites that are easy to manage, fully responsive, and optimized for performance and growth.',
    heroEyebrow: 'Webflow Development',
    heroLead:
      'We create fast, visually impressive Webflow websites that are easy to manage, fully responsive, and optimized for performance and growth.',
    heroHeadline: 'Design systems that marketing can run',
    heroBody:
      'We build Webflow sites that protect craft in production — clean structure, CMS power, and performance so your team ships updates without breaking the brand.',
    heroImage: `${IP}incipet-2.avif`,
    stats: [
      { value: '100+', label: 'Webflow launches', note: 'Marketing sites and multi-template systems.' },
      { value: 'Core', label: 'Web Vitals focus', note: 'Speed and stability treated as product requirements.' },
      { value: 'CMS', label: 'Editor-ready', note: 'Content models marketers actually understand.' },
      { value: '90%', label: 'Client return rate', note: 'Teams come back for new templates and campaigns.' },
    ],
    capabilities: [
      { title: 'Pixel-true builds', body: 'Faithful implementation of design systems and edge states.' },
      { title: 'CMS architecture', body: 'Collections and fields that scale with content ops.' },
      { title: 'Interactions', body: 'Motion that feels premium without killing performance.' },
      { title: 'SEO & schema', body: 'Technical foundations baked into the build.' },
      { title: 'Integrations', body: 'Forms, analytics, and marketing tools wired cleanly.' },
      { title: 'Training & docs', body: 'So your team can update with confidence.' },
    ],
    process: [
      { title: 'Structure plan', body: 'Pages, CMS, and component inventory before build.' },
      { title: 'Build system', body: 'Styles, symbols, and responsive behavior locked.' },
      { title: 'Content & QA', body: 'Populate, test, and harden across devices.' },
      { title: 'Launch & handoff', body: 'Domain, docs, training, and post-launch support.' },
    ],
    faqs: [
      { q: 'Why Webflow?', a: 'It gives teams design-quality sites with marketing independence — when structured well.' },
      { q: 'Can you migrate an existing site?', a: 'Yes. We plan content models and redirects so SEO equity is protected.' },
      { q: 'Do you only build, not design?', a: 'We can build from your Figma or deliver design + Webflow as one engagement.' },
      { q: 'How do you handle performance?', a: 'Asset discipline, interaction budgets, and Core Web Vitals checks before launch.' },
    ],
    related: ['website-design', 'landing-page', 'seo'],
    works: [
      { name: 'InnrevAI', year: '2024', image: `${IP}innrevai-1.avif` },
      { name: 'Incipet', year: '2024', image: `${IP}incipet-2.avif` },
      { name: 'Vertus', year: '2024', image: `${IP}vertus-ai-6.avif` },
    ],
  },
  {
    slug: 'ai-agents',
    title: 'AI Agents',
    shortTitle: 'AI Agents',
    hubBlurb:
      'Deploy voice agents and chatbots that answer, qualify, book, and follow up around the clock — tuned to how your business actually operates.',
    heroEyebrow: 'AI Agent Deployments',
    heroLead:
      'Deploy AI agents that turn every call, chat, and follow-up into a better customer experience and a stronger pipeline.',
    heroHeadline: 'Your best operator is always on',
    heroBody:
      'We design and deploy inbound and outbound AI voice agents and chatbots for high-intent service businesses. From a clinic booking the next appointment to a real-estate team qualifying a new enquiry, your agent handles the first conversation with speed, context, and a distinctly human point of view.',
    heroImage: `${IP}ai-hybrid-mind-7.avif`,
    stats: [
      { value: '24/7', label: 'Always-on coverage', note: 'Capture intent after hours, on weekends, and across every time zone.' },
      { value: '3×', label: 'More conversations', note: 'Handle more qualified inbound and outbound conversations without adding headcount.' },
      { value: '< 1 min', label: 'Lead response time', note: 'Move from missed enquiry to useful first response while intent is still warm.' },
      { value: '1 system', label: 'Voice + chat', note: 'One operating layer across phone, web chat, CRM, calendar, and follow-up.' },
    ],
    capabilities: [
      { title: 'Inbound voice agents', body: 'Answer FAQs, triage intent, route calls, take messages, and book appointments with a natural, on-brand voice.' },
      { title: 'Outbound qualification', body: 'Follow up with leads, re-engage dormant enquiries, confirm details, and hand warm conversations to your team.' },
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
      { q: 'What kind of businesses are AI agents best for?', a: 'Any business with repeatable, high-intent conversations — especially clinics, real-estate agencies, education, home services, and professional services.' },
      { q: 'Can an agent transfer to a human?', a: 'Yes. We define clear escalation rules and pass the conversation context along so your team can pick up without making the customer repeat themselves.' },
      { q: 'Can the agent book appointments?', a: 'Yes. We can connect the experience to your calendar, booking flow, CRM, or internal routing rules.' },
      { q: 'Will it sound like a robot?', a: 'The experience is designed around natural turn-taking, concise answers, and a voice that fits your brand. We test real scenarios before launch.' },
      { q: 'Do you build the chatbot and voice agent together?', a: 'That is often the strongest setup. Customers can move between web chat, phone, and human support without losing context.' },
      { q: 'How do we measure whether it is working?', a: 'We track response time, qualified conversations, bookings, handoffs, resolution, and the reasons people still need a human.' },
    ],
    related: ['website-design', 'landing-page', 'seo'],
    works: [
      { name: 'InnrevAI', year: '2024', image: `${IP}ai-innrevai-1.avif` },
      { name: 'The Virtual Slimming Clinic', year: '2024', image: `${IP}healthcare-sofia-therapy-3.avif` },
      { name: 'Dubai Realty', year: '2024', image: `${IP}real-estate-dubai-realty-1.avif` },
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
  lead: 'Everything your brand needs to grow — under one roof.',
  body: 'We combine years of expertise in UX/UI, motion design, Webflow development, and web design to build high-performance digital experiences that look great and drive results.',
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
    image: '/assets/972304820e19d175.avif',
    tags: ['Branding', 'Website Design', 'Growth'],
  },
  {
    name: 'OrbitNine',
    year: '2024',
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
  body: 'We combine strategy, branding, UX and UI, and web design to build high-performance digital experiences that not only look great but move the metrics that matter for scaling technology companies.',
  image: '/assets/972304820e19d175.avif',
  imageAlt: 'Podium Momentum brand and web design work',
}

export const hubNumbers = [
  { index: '01', value: '40+', label: 'Technology Companies' },
  { index: '02', value: '4.9', label: 'Average Client Rating' },
  { index: '03', value: '2.3×', label: 'Conversion Lift Post-Rebrand' },
  { index: '04', value: '$10M+', label: 'Raised By Clients' },
]

export const hubNumbersHead = {
  label: 'What makes us different?',
  title: 'Momentum\nin numbers',
  titleLines: ['Momentum', 'in numbers'],
  body: 'Design is more than aesthetics — it’s about measurable impact. Here’s how we make a difference.',
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
  { q: 'What industries do you specialize in?', a: 'Technology, SaaS, AI, fintech, health, hospitality, and other ambition-led product companies.' },
  { q: 'How long does it take to design a website?', a: 'Most full marketing sites run 4–10 weeks depending on scope, content readiness, and stakeholder cycles.' },
  { q: 'How can my website enhance my branding?', a: 'Your site is the operating system of the brand online. When identity, messaging, and UX align, visitors feel the same quality as your product.' },
  { q: 'What is user experience (UX) design?', a: 'Structure, flow, and interaction design that makes products understandable and usable — not just pretty screens.' },
  { q: 'What is a content management system (CMS)?', a: 'A system that lets marketing update pages and content without breaking the design — we set these up for Webflow and similar platforms.' },
  { q: "How can I optimize my website's speed?", a: 'Asset discipline, clean structure, interaction budgets, and Core Web Vitals checks before and after launch.' },
  { q: 'Why is website design important?', a: 'It’s often the first impression of your brand. Strong design builds trust, captures attention, and turns visitors into customers.' },
]

/** Hub testimonials — Podium Momentum clients. */
export const hubTestimonials = [
  {
    quote:
      'Podium Momentum rebuilt our brand into one that finally matches the operation behind it. They gave us a system — strategic pillars and a defined voice that the whole team now uses.',
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
      'The new website gets lots of trust — influencers and brand clients get convinced to work with us just by looking at the site.',
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
  if (serviceCatalog.length !== 9) errors.push(`expected 9 services, got ${serviceCatalog.length}`)
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

import React from 'react'
import './privacy-policy.css'

const BRAND = 'Podium Momentum'
const LAST_UPDATED = 'July 2026'

const sections = [
  {
    title: '1. Who we are',
    body: `${BRAND} is a brand and web design agency. This policy explains how we collect, use, and protect your information when you visit our website or interact with our services.`,
  },
  {
    title: '2. Information we collect',
    list: [
      'Contact details you provide (name, email, company, phone) when you submit a form or subscribe to updates.',
      'Usage data collected automatically via analytics tools (pages visited, time on site, device type, referral source).',
      'Session recordings and interaction heatmaps captured by PostHog to help us improve the site experience.',
      'Communication content when you reach out via email, phone, or our contact form.',
    ],
  },
  {
    title: '3. How we use your information',
    list: [
      'Respond to enquiries and deliver the services you request.',
      'Send project updates, proposals, and invoices.',
      'Improve our website, content, and user experience through analytics.',
      'Send occasional newsletters or updates (only if you opt in).',
      'Comply with legal obligations.',
    ],
  },
  {
    title: '4. Analytics and tracking',
    body: `We use Google Analytics 4 and PostHog to understand how visitors use our site. These tools collect anonymised usage data including page views, clicks, scroll depth, and session recordings. You can opt out of Google Analytics through its browser extension. PostHog respects the Do Not Track browser setting.`,
  },
  {
    title: '5. Data sharing',
    body: `We do not sell your personal data. We may share limited information with trusted service providers (such as Formspree for form handling, Vercel for hosting, and analytics providers listed above) solely to operate our business and website. All providers are bound by their own privacy policies.`,
  },
  {
    title: '6. Data retention',
    body: `We retain contact and project information for as long as needed to fulfil our services and comply with legal requirements. Analytics data is retained in accordance with each provider's retention policies. You may request deletion of your data at any time.`,
  },
  {
    title: '7. Your rights',
    list: [
      'Access the personal data we hold about you.',
      'Request correction of inaccurate data.',
      'Request deletion of your data.',
      'Withdraw consent for marketing communications at any time.',
      'Object to or restrict certain processing activities.',
      'Lodge a complaint with your local data protection authority.',
    ],
  },
  {
    title: '8. Cookies',
    body: `Our website uses essential cookies for functionality and analytics cookies for tracking. We do not use advertising cookies. You can manage cookie preferences through your browser settings.`,
  },
  {
    title: '9. Security',
    body: `We implement appropriate technical and organisational measures to protect your data, including encrypted connections (HTTPS), protected API keys, and access controls. No method of transmission over the internet is 100% secure, but we take reasonable steps to safeguard your information.`,
  },
  {
    title: '10. Changes to this policy',
    body: `We may update this policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of the site after changes constitutes acceptance of the revised policy.`,
  },
  {
    title: '11. Contact us',
    body: `If you have questions about this policy or wish to exercise your rights, contact us at hello@podiummomentum.com or through our contact form.`,
  },
]

export default function PrivacyPolicy() {
  return (
    <main className="pp-page">
      <div className="pp-container">
        <header className="pp-header">
          <h1>Privacy Policy</h1>
          <p className="pp-meta">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="pp-body">
          {sections.map(section => (
            <section className="pp-section" key={section.title}>
              <h2>{section.title}</h2>
              {section.body && <p>{section.body}</p>}
              {section.list && (
                <ul>
                  {section.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}

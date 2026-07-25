/**
 * analytics.js — Unified tracking layer for GA4 + PostHog.
 *
 * Usage:
 *   import { initAnalytics, trackPageView, trackEvent } from './analytics.js'
 *   initAnalytics()           // call once at app boot
 *   trackPageView('/path')    // call on every SPA route change
 *   trackEvent('cta_click', { location: 'hero', label: 'Book a call' })
 */
import posthog from 'posthog-js'

// ─── Config ────────────────────────────────────────────────────────────────────
const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID || ''
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || ''

// PostHog is proxied through our own origin (see the /ingest rewrites in
// vercel.json). Calling us.i.posthog.com directly gets blocked by the standard
// tracker blocklists, which is why PostHog kept undercounting against GA4.
// VITE_POSTHOG_HOST is no longer read — the proxy path is fixed.
const POSTHOG_PROXY = '/ingest'
const POSTHOG_UI_HOST = 'https://us.posthog.com'

// ─── Environment gate ──────────────────────────────────────────────────────────
// Only the real production site should report. Without this, every `npm run dev`
// session lands in PostHog as a localhost pageview and pollutes the session list.
const PRODUCTION_HOSTS = ['podiummomentum.com', 'www.podiummomentum.com']

function isProductionHost() {
  if (typeof window === 'undefined') return false
  return PRODUCTION_HOSTS.includes(window.location.hostname)
}

const TRACKING_ENABLED = isProductionHost()
const PH_ON = TRACKING_ENABLED && !!POSTHOG_KEY && !POSTHOG_KEY.includes('XXXX')
const GA_ON = TRACKING_ENABLED && !!GA4_ID && !GA4_ID.includes('XXXX')

let initialized = false

// ─── Initialization ────────────────────────────────────────────────────────────
export function initAnalytics() {
  if (initialized) return
  initialized = true

  // PostHog
  if (PH_ON) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_PROXY,
      ui_host: POSTHOG_UI_HOST,
      // SPA mode — we fire pageviews manually
      capture_pageview: false,
      capture_pageleave: true,
      // Anonymous marketing traffic never calls identify(), and the SDK default
      // of 'identified_only' means those visitors get no person profile at all.
      person_profiles: 'always',
      // Session replay & heatmaps enabled by default on PostHog free tier
      session_recording: {
        recordCrossOriginIframes: false,
      },
    })
  }

  // GA4 — dynamically inject gtag.js
  if (GA_ON) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', GA4_ID, {
      // Disable automatic page_view — we send manually for SPA
      send_page_view: false,
    })

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`
    document.head.appendChild(script)
  }
}

// ─── Page View Tracking (SPA) ──────────────────────────────────────────────────
export function trackPageView(path) {
  if (!path) return

  // origin + path drops the query string, which is where utm_* and gclid live.
  // PostHog parses campaign attribution out of $current_url, so sending the
  // trimmed URL left every visit looking like direct traffic.
  const url = window.location.href

  // GA4
  if (GA_ON && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: url,
      page_title: document.title,
    })
  }

  // PostHog
  if (PH_ON) {
    posthog.capture('$pageview', {
      $current_url: url,
      path,
    })
  }
}

// ─── Generic Event Tracking ────────────────────────────────────────────────────
export function trackEvent(eventName, properties = {}) {
  // GA4
  if (GA_ON && typeof window.gtag === 'function') {
    window.gtag('event', eventName, properties)
  }

  // PostHog
  if (PH_ON) {
    posthog.capture(eventName, properties)
  }
}

// ─── Named Conversion Events ───────────────────────────────────────────────────

/** Contact form successfully submitted */
export function trackContactSubmit(formData = {}) {
  trackEvent('contact_form_submit', {
    submission_type: formData.submission_type || 'Contact brief',
    budget: formData.budget || 'Not specified',
  })
}

/** Newsletter subscription */
export function trackNewsletterSubscribe() {
  trackEvent('newsletter_subscribe', { location: 'footer' })
}

/** CTA button clicked */
export function trackCtaClick(label, location) {
  trackEvent('cta_click', { label, location })
}

/** Voice agent call started */
export function trackVoiceCallStart(agentTitle) {
  trackEvent('voice_call_start', { agent: agentTitle })
}

/** Voice agent call ended */
export function trackVoiceCallEnd(agentTitle, durationSeconds) {
  trackEvent('voice_call_end', {
    agent: agentTitle,
    duration_seconds: durationSeconds,
  })
}

/** Service page viewed */
export function trackServiceView(slug) {
  trackEvent('service_page_view', { service: slug })
}

/** Industry page viewed */
export function trackIndustryView(slug) {
  trackEvent('industry_page_view', { industry: slug })
}

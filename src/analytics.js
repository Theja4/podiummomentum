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
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'

let initialized = false

// ─── Initialization ────────────────────────────────────────────────────────────
export function initAnalytics() {
  if (initialized) return
  initialized = true

  // PostHog
  if (POSTHOG_KEY && !POSTHOG_KEY.includes('XXXX')) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // SPA mode — we fire pageviews manually
      capture_pageview: false,
      capture_pageleave: true,
      // Session replay & heatmaps enabled by default on PostHog free tier
      session_recording: {
        recordCrossOriginIframes: false,
      },
      // Respect Do Not Track
      respect_dnt: true,
    })
  }

  // GA4 — dynamically inject gtag.js
  if (GA4_ID && !GA4_ID.includes('XXXX')) {
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

  // GA4
  if (GA4_ID && !GA4_ID.includes('XXXX') && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_location: window.location.origin + path,
      page_title: document.title,
    })
  }

  // PostHog
  if (POSTHOG_KEY && !POSTHOG_KEY.includes('XXXX')) {
    posthog.capture('$pageview', {
      $current_url: window.location.origin + path,
      path,
    })
  }
}

// ─── Generic Event Tracking ────────────────────────────────────────────────────
export function trackEvent(eventName, properties = {}) {
  // GA4
  if (GA4_ID && !GA4_ID.includes('XXXX') && typeof window.gtag === 'function') {
    window.gtag('event', eventName, properties)
  }

  // PostHog
  if (POSTHOG_KEY && !POSTHOG_KEY.includes('XXXX')) {
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

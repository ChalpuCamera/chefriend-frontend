// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Environment checks
const isDevelopment = process.env.NODE_ENV === 'development';

Sentry.init({
  // Disable Sentry in development
  dsn: isDevelopment
    ? undefined
    : process.env.NEXT_PUBLIC_SENTRY_DSN || "https://1e251985eac7a7e0d3ff50bc293927c5@o4509717350383616.ingest.us.sentry.io/4509992760967168",

  // Environment tag
  environment: process.env.NODE_ENV,

  // Sampling: 0% in development, 10% in production
  tracesSampleRate: isDevelopment ? 0 : 0.1,

  // Session replay sampling (only in production)
  replaysSessionSampleRate: isDevelopment ? 0 : 0.1,
  replaysOnErrorSampleRate: isDevelopment ? 0 : 1.0,

  // Debug mode only in development (but Sentry is disabled anyway)
  debug: isDevelopment,

  // Filter out development events
  beforeSend(event, hint) {
    // Don't send events in development
    if (isDevelopment) {
      console.log('[Sentry Client Dev Mode] Event captured but not sent:', {
        message: event.message,
        level: event.level,
        error: hint.originalException,
      });
      return null;
    }
    return event;
  },

  // Ignore common browser errors
  ignoreErrors: [
    // Browser extensions
    'chrome-extension://',
    'moz-extension://',
    // Facebook related
    'fb_xd_fragment',
    // Common non-error messages
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Network errors
    'Network request failed',
    'NetworkError',
    'Failed to fetch',
  ],

  // Disable automatic error capture in development
  integrations: (integrations) => {
    if (isDevelopment) {
      // Remove integrations that automatically capture errors
      return integrations.filter(
        (integration) =>
          integration.name !== 'GlobalHandlers' &&
          integration.name !== 'TryCatch'
      );
    }
    return integrations;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
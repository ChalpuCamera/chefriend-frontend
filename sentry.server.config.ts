// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Environment checks
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

Sentry.init({
  // Disable Sentry in development
  dsn: isDevelopment
    ? undefined
    : process.env.NEXT_PUBLIC_SENTRY_DSN || "https://1e251985eac7a7e0d3ff50bc293927c5@o4509717350383616.ingest.us.sentry.io/4509992760967168",

  // Environment tag
  environment: process.env.NODE_ENV,

  // Sampling: 0% in development, 10% in production
  tracesSampleRate: isDevelopment ? 0 : 0.1,

  // Enable logs only in production
  enableLogs: isProduction,

  // Debug mode only in development (but Sentry is disabled anyway)
  debug: isDevelopment,

  // Filter out development events
  beforeSend(event, hint) {
    // Don't send events in development
    if (isDevelopment) {
      console.log('[Sentry Dev Mode] Event captured but not sent:', {
        message: event.message,
        level: event.level,
        error: hint.originalException,
      });
      return null;
    }
    return event;
  },

  // Disable performance monitoring in development
  integrations: (integrations) => {
    if (isDevelopment) {
      return integrations.filter(
        (integration) => integration.name !== 'Http' && integration.name !== 'Express'
      );
    }
    return integrations;
  },
});

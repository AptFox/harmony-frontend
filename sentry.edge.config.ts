// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { isProdEnv } from '@/lib/utils';

const isProd = isProdEnv()
const dsn = isProd
  ? process.env.SENTRY_DSN
  : undefined;

const sampleRate = isProd ? 0.25 : 0.01

Sentry.init({
  dsn: dsn,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: sampleRate,

  // Enable logs to be sent to Sentry
  enableLogs: isProd,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});

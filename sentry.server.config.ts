// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
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

  beforeSend: (event) => {
    if (event.contexts?.AxiosError && !event.contexts.AxiosError.status) {
      return null;
    }
    return event;
  },

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: sampleRate,

  // Enable logs to be sent to Sentry
  enableLogs: isProd,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});

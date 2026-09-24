import { createHubTrackHandler } from '@/lib/hub-tracker/handler';

/**
 * Collects this site's analytics and forwards it to the group's hub, with the
 * key added here, on the server: it must never reach the browser. Everything
 * it does lives in the shared tracker (corpsc-hub/tracker).
 *
 * Next 14 has no `after()`, so the route waits for the hub before answering —
 * never longer than 1.5 s. Once the site is on Next ≥ 15.1, pass it:
 * `createHubTrackHandler({ after })` from 'next/server', and the response goes
 * out before the hub is called.
 *
 * Environment: HUB_URL, HUB_API_KEY. Without them nothing is forwarded, which
 * is what local and preview deployments want.
 */
export const POST = createHubTrackHandler();

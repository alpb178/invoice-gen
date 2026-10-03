import { HubAnalytics } from '@/lib/hub-tracker/HubAnalytics';
import { locales } from '@/i18n/config';
import { PATH_PATTERNS, PRIVATE_SEGMENTS } from '@/lib/hub-settings';

/** Sends the group hub this site's page views and clicks. */
export function SiteAnalytics() {
  return <HubAnalytics locales={locales} privateSegments={PRIVATE_SEGMENTS} pathPatterns={PATH_PATTERNS} />;
}

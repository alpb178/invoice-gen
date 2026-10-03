/** This site's settings for the group hub tracker. */

/**
 * Areas whose screen text must not reach the hub: what is shown there can be a
 * client's name, an amount or an email. Clicks there are still counted, with a
 * generic label.
 */
export const PRIVATE_SEGMENTS = ['app', 'invoices', 'teams', 'reports', 'settings', 'invitations'] as const;

/**
 * Routes with ids, counted as one page each. An invitation's token is a
 * secret: in the path it would reach the hub as is. An invoice id says
 * nothing about the site and would crowd the hub's top-100.
 */
export const PATH_PATTERNS = ['/invoices/:id', '/invitations/:token'] as const;

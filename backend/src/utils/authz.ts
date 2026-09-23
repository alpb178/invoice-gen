// src/utils/authz.ts
// Pure authorization logic. No Strapi dependencies, so it can be tested in
// isolation.

export interface AuthzUser {
  id: number;
}

export interface AuthzTeam {
  id?: number;
  owner?: { id: number } | null;
  members?: Array<{ id: number }> | null;
}

export interface AuthzInvoice {
  id?: number;
  team?: AuthzTeam | null;
  author?: { id: number } | null;
  status?: string | null;
}

export interface AuthzSection {
  id?: number;
  author?: { id: number } | null;
  invoice?: AuthzInvoice | null;
}

export function isTeamOwner(team: AuthzTeam | null | undefined, userId: number): boolean {
  return !!team?.owner && team.owner.id === userId;
}

export function isTeamMember(team: AuthzTeam | null | undefined, userId: number): boolean {
  if (!team) return false;
  if (isTeamOwner(team, userId)) return true;
  return (team.members || []).some((m) => m.id === userId);
}

/**
 * Create an invoice: ONLY the team owner.
 */
export function canCreateInvoice(team: AuthzTeam | null | undefined, userId: number): boolean {
  return isTeamOwner(team, userId);
}

/**
 * Delete an invoice: ONLY the team owner.
 */
export function canDeleteInvoice(invoice: AuthzInvoice | null | undefined, userId: number): boolean {
  return isTeamOwner(invoice?.team, userId);
}

/**
 * Edit the invoice header (number, dates, client, notes, etc.):
 * ONLY the team owner.
 */
export function canEditInvoiceHeader(invoice: AuthzInvoice | null | undefined, userId: number): boolean {
  return isTeamOwner(invoice?.team, userId);
}

/**
 * A paid invoice is frozen: sections, tasks, amounts and the rest of the
 * header cannot be changed.
 */
export function isInvoiceFrozen(invoice: AuthzInvoice | null | undefined): boolean {
  return invoice?.status === 'paid';
}

/**
 * Edit issuer and client: ONLY the team owner, but in ANY invoice status,
 * including paid. These are identity details (name, tax ID, address, IBAN,
 * bank), not amounts: fixing a mistyped IBAN does not change what was billed,
 * and it must still be possible after the invoice has been paid.
 */
export function canEditInvoiceParties(
  invoice: AuthzInvoice | null | undefined,
  userId: number,
): boolean {
  return isTeamOwner(invoice?.team, userId);
}

/**
 * Export the PDF / mark as exported: ONLY the team owner.
 */
export function canExportInvoice(invoice: AuthzInvoice | null | undefined, userId: number): boolean {
  return isTeamOwner(invoice?.team, userId);
}

/**
 * View an invoice: any member of the team (owner included).
 */
export function canViewInvoice(invoice: AuthzInvoice | null | undefined, userId: number): boolean {
  return isTeamMember(invoice?.team, userId);
}

/**
 * Create a section inside an invoice: any member of the team the invoice
 * belongs to. The creator becomes the section's author.
 */
export function canCreateSection(
  team: AuthzTeam | null | undefined,
  userId: number,
): boolean {
  return isTeamMember(team, userId);
}

/**
 * Edit / delete a section (and its tasks):
 *  - the team owner, always
 *  - the member who created the section (author)
 */
export function canEditSection(
  section: AuthzSection | null | undefined,
  userId: number,
): boolean {
  if (!section) return false;
  if (isTeamOwner(section.invoice?.team, userId)) return true;
  return section.author?.id === userId;
}

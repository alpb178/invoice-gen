// src/utils/authz.ts
// Lógica pura de autorización. Sin dependencias de Strapi para poder testearse
// de forma aislada.

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
  createdBy?: { id: number } | null;
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
 * Quién puede editar una factura:
 *  - dueño del equipo siempre
 *  - el creador de la factura
 *  - si la factura no tiene equipo (legacy), solo el creador
 */
export function canEditInvoice(invoice: AuthzInvoice | null | undefined, userId: number): boolean {
  if (!invoice) return false;
  if (isTeamOwner(invoice.team, userId)) return true;
  return invoice.createdBy?.id === userId;
}

/**
 * Quién puede exportar un PDF / marcar una factura como exportada:
 *  - SOLO el dueño del equipo
 */
export function canExportInvoice(invoice: AuthzInvoice | null | undefined, userId: number): boolean {
  return isTeamOwner(invoice?.team, userId);
}

/**
 * Quién puede ver una factura:
 *  - cualquier miembro (incluyendo dueño) del equipo al que pertenece
 */
export function canViewInvoice(invoice: AuthzInvoice | null | undefined, userId: number): boolean {
  return isTeamMember(invoice?.team, userId);
}

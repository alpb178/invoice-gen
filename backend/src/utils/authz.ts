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
 * Crear factura: SOLO el dueño del equipo.
 */
export function canCreateInvoice(team: AuthzTeam | null | undefined, userId: number): boolean {
  return isTeamOwner(team, userId);
}

/**
 * Borrar factura: SOLO el dueño del equipo.
 */
export function canDeleteInvoice(invoice: AuthzInvoice | null | undefined, userId: number): boolean {
  return isTeamOwner(invoice?.team, userId);
}

/**
 * Editar la cabecera de la factura (nº, fechas, cliente, notas, etc.):
 * SOLO el dueño del equipo.
 */
export function canEditInvoiceHeader(invoice: AuthzInvoice | null | undefined, userId: number): boolean {
  return isTeamOwner(invoice?.team, userId);
}

/**
 * Una factura pagada queda congelada: no se tocan secciones, tareas, importes
 * ni el resto de la cabecera.
 */
export function isInvoiceFrozen(invoice: AuthzInvoice | null | undefined): boolean {
  return invoice?.status === 'paid';
}

/**
 * Editar emisor y cliente: SOLO el dueño del equipo, pero en CUALQUIER estado
 * de la factura, incluida una pagada. Son datos de identidad (nombre, CIF,
 * dirección, IBAN, banco), no importes: corregir un IBAN mal escrito no cambia
 * lo facturado, y hay que poder hacerlo también después de cobrar.
 */
export function canEditInvoiceParties(
  invoice: AuthzInvoice | null | undefined,
  userId: number,
): boolean {
  return isTeamOwner(invoice?.team, userId);
}

/**
 * Exportar PDF / marcar como exportada: SOLO el dueño del equipo.
 */
export function canExportInvoice(invoice: AuthzInvoice | null | undefined, userId: number): boolean {
  return isTeamOwner(invoice?.team, userId);
}

/**
 * Ver una factura: cualquier miembro (incluido dueño) del equipo.
 */
export function canViewInvoice(invoice: AuthzInvoice | null | undefined, userId: number): boolean {
  return isTeamMember(invoice?.team, userId);
}

/**
 * Crear una sección dentro de una factura: cualquier miembro del equipo
 * al que pertenece la factura. El creador queda como author de la sección.
 */
export function canCreateSection(
  team: AuthzTeam | null | undefined,
  userId: number,
): boolean {
  return isTeamMember(team, userId);
}

/**
 * Editar / borrar una sección (y sus tareas):
 *  - dueño del equipo siempre
 *  - el miembro que creó la sección (author)
 */
export function canEditSection(
  section: AuthzSection | null | undefined,
  userId: number,
): boolean {
  if (!section) return false;
  if (isTeamOwner(section.invoice?.team, userId)) return true;
  return section.author?.id === userId;
}

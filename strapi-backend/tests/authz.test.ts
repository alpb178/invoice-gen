import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isTeamOwner,
  isTeamMember,
  canCreateInvoice,
  canDeleteInvoice,
  canEditInvoiceHeader,
  canExportInvoice,
  canViewInvoice,
  canCreateSection,
  canEditSection,
  AuthzInvoice,
  AuthzSection,
  AuthzTeam,
} from '../src/utils/authz';

// ids ficticios
const OWNER = 1;
const MEMBER = 2;
const OTHER_MEMBER = 3;
const OUTSIDER = 99;

const team: AuthzTeam = {
  id: 10,
  owner: { id: OWNER },
  members: [{ id: MEMBER }, { id: OTHER_MEMBER }],
};

const invoiceByMember: AuthzInvoice = {
  id: 100,
  team,
  author: { id: MEMBER },
};

const invoiceByOwner: AuthzInvoice = {
  id: 101,
  team,
  author: { id: OWNER },
};

const invoiceWithoutTeam: AuthzInvoice = {
  id: 102,
  team: null,
  author: { id: MEMBER },
};

const sectionByMember: AuthzSection = {
  id: 200,
  author: { id: MEMBER },
  invoice: invoiceByOwner,
};

const sectionByOtherMember: AuthzSection = {
  id: 201,
  author: { id: OTHER_MEMBER },
  invoice: invoiceByOwner,
};

const sectionByOwner: AuthzSection = {
  id: 202,
  author: { id: OWNER },
  invoice: invoiceByOwner,
};

describe('isTeamOwner', () => {
  it('es true solo para el owner', () => {
    assert.equal(isTeamOwner(team, OWNER), true);
    assert.equal(isTeamOwner(team, MEMBER), false);
    assert.equal(isTeamOwner(team, OUTSIDER), false);
  });

  it('es false si el team es null/undefined', () => {
    assert.equal(isTeamOwner(null, OWNER), false);
    assert.equal(isTeamOwner(undefined, OWNER), false);
  });

  it('es false si el team no tiene owner', () => {
    assert.equal(isTeamOwner({ id: 1, owner: null, members: [] }, OWNER), false);
  });
});

describe('isTeamMember', () => {
  it('el owner cuenta como miembro', () => {
    assert.equal(isTeamMember(team, OWNER), true);
  });

  it('los miembros listados son miembros', () => {
    assert.equal(isTeamMember(team, MEMBER), true);
    assert.equal(isTeamMember(team, OTHER_MEMBER), true);
  });

  it('un usuario externo no es miembro', () => {
    assert.equal(isTeamMember(team, OUTSIDER), false);
  });

  it('tolera members null/undefined', () => {
    const teamNoMembers: AuthzTeam = { id: 1, owner: { id: OWNER }, members: null };
    assert.equal(isTeamMember(teamNoMembers, OWNER), true);
    assert.equal(isTeamMember(teamNoMembers, OUTSIDER), false);
  });
});

describe('canCreateInvoice', () => {
  it('SOLO el dueño del equipo puede crear facturas', () => {
    assert.equal(canCreateInvoice(team, OWNER), true);
    assert.equal(canCreateInvoice(team, MEMBER), false);
    assert.equal(canCreateInvoice(team, OTHER_MEMBER), false);
    assert.equal(canCreateInvoice(team, OUTSIDER), false);
  });
});

describe('canDeleteInvoice', () => {
  it('SOLO el dueño del equipo puede borrar facturas (incluso si la creó un miembro)', () => {
    assert.equal(canDeleteInvoice(invoiceByMember, OWNER), true);
    assert.equal(canDeleteInvoice(invoiceByMember, MEMBER), false);
    assert.equal(canDeleteInvoice(invoiceByOwner, OTHER_MEMBER), false);
    assert.equal(canDeleteInvoice(invoiceByMember, OUTSIDER), false);
  });

  it('sin equipo, nadie puede borrar con este helper', () => {
    assert.equal(canDeleteInvoice(invoiceWithoutTeam, MEMBER), false);
    assert.equal(canDeleteInvoice(invoiceWithoutTeam, OWNER), false);
  });
});

describe('canEditInvoiceHeader', () => {
  it('SOLO el dueño del equipo puede editar la cabecera', () => {
    assert.equal(canEditInvoiceHeader(invoiceByMember, OWNER), true);
    assert.equal(canEditInvoiceHeader(invoiceByOwner, OWNER), true);
    assert.equal(canEditInvoiceHeader(invoiceByMember, MEMBER), false);
    assert.equal(canEditInvoiceHeader(invoiceByOwner, MEMBER), false);
    assert.equal(canEditInvoiceHeader(invoiceByMember, OUTSIDER), false);
  });
});

describe('canExportInvoice', () => {
  it('SOLO el owner puede exportar', () => {
    assert.equal(canExportInvoice(invoiceByMember, OWNER), true);
    assert.equal(canExportInvoice(invoiceByOwner, OWNER), true);
    assert.equal(canExportInvoice(invoiceByMember, MEMBER), false);
    assert.equal(canExportInvoice(invoiceByOwner, MEMBER), false);
    assert.equal(canExportInvoice(invoiceByMember, OUTSIDER), false);
  });

  it('una factura sin equipo no puede exportarla nadie con este helper', () => {
    assert.equal(canExportInvoice(invoiceWithoutTeam, MEMBER), false);
    assert.equal(canExportInvoice(invoiceWithoutTeam, OWNER), false);
  });
});

describe('canViewInvoice', () => {
  it('cualquier miembro (incluyendo owner) puede ver', () => {
    assert.equal(canViewInvoice(invoiceByMember, OWNER), true);
    assert.equal(canViewInvoice(invoiceByMember, MEMBER), true);
    assert.equal(canViewInvoice(invoiceByMember, OTHER_MEMBER), true);
  });

  it('un usuario externo no puede ver', () => {
    assert.equal(canViewInvoice(invoiceByMember, OUTSIDER), false);
  });
});

describe('canCreateSection', () => {
  it('cualquier miembro del equipo (incluido owner) puede crear secciones', () => {
    assert.equal(canCreateSection(team, OWNER), true);
    assert.equal(canCreateSection(team, MEMBER), true);
    assert.equal(canCreateSection(team, OTHER_MEMBER), true);
  });

  it('un externo no puede crear secciones', () => {
    assert.equal(canCreateSection(team, OUTSIDER), false);
  });
});

describe('canEditSection', () => {
  it('el owner del equipo puede editar cualquier sección', () => {
    assert.equal(canEditSection(sectionByMember, OWNER), true);
    assert.equal(canEditSection(sectionByOtherMember, OWNER), true);
    assert.equal(canEditSection(sectionByOwner, OWNER), true);
  });

  it('un miembro SOLO puede editar secciones que creó', () => {
    assert.equal(canEditSection(sectionByMember, MEMBER), true);
    assert.equal(canEditSection(sectionByOtherMember, MEMBER), false);
    assert.equal(canEditSection(sectionByOwner, MEMBER), false);
  });

  it('un externo no puede editar ninguna sección', () => {
    assert.equal(canEditSection(sectionByMember, OUTSIDER), false);
    assert.equal(canEditSection(sectionByOwner, OUTSIDER), false);
  });

  it('sección sin author o null → no se puede editar', () => {
    assert.equal(canEditSection(null, OWNER), false);
    assert.equal(canEditSection(undefined, OWNER), false);
    assert.equal(canEditSection({ id: 1, author: null, invoice: invoiceByOwner }, MEMBER), false);
  });
});

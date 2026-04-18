import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isTeamOwner,
  isTeamMember,
  canEditInvoice,
  canExportInvoice,
  canViewInvoice,
  AuthzInvoice,
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
  createdBy: { id: MEMBER },
};

const invoiceByOwner: AuthzInvoice = {
  id: 101,
  team,
  createdBy: { id: OWNER },
};

const invoiceWithoutTeam: AuthzInvoice = {
  id: 102,
  team: null,
  createdBy: { id: MEMBER },
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

describe('canEditInvoice', () => {
  it('el owner puede editar cualquier factura del equipo (incluyendo las de miembros)', () => {
    assert.equal(canEditInvoice(invoiceByMember, OWNER), true);
    assert.equal(canEditInvoice(invoiceByOwner, OWNER), true);
  });

  it('un miembro solo puede editar SUS facturas, no las del owner ni las de otros', () => {
    assert.equal(canEditInvoice(invoiceByMember, MEMBER), true);
    assert.equal(canEditInvoice(invoiceByOwner, MEMBER), false);
    assert.equal(canEditInvoice(invoiceByMember, OTHER_MEMBER), false);
  });

  it('un usuario externo no puede editar nada', () => {
    assert.equal(canEditInvoice(invoiceByMember, OUTSIDER), false);
    assert.equal(canEditInvoice(invoiceByOwner, OUTSIDER), false);
  });

  it('si la factura no tiene equipo, solo el creador puede editar', () => {
    assert.equal(canEditInvoice(invoiceWithoutTeam, MEMBER), true);
    assert.equal(canEditInvoice(invoiceWithoutTeam, OWNER), false);
    assert.equal(canEditInvoice(invoiceWithoutTeam, OUTSIDER), false);
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

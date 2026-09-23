import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isTeamOwner,
  isTeamMember,
  canCreateInvoice,
  canDeleteInvoice,
  canEditInvoiceHeader,
  canEditInvoiceParties,
  canExportInvoice,
  isInvoiceFrozen,
  canViewInvoice,
  canCreateSection,
  canEditSection,
  AuthzInvoice,
  AuthzSection,
  AuthzTeam,
} from '../src/utils/authz';

// fake ids
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
  it('is true only for the owner', () => {
    assert.equal(isTeamOwner(team, OWNER), true);
    assert.equal(isTeamOwner(team, MEMBER), false);
    assert.equal(isTeamOwner(team, OUTSIDER), false);
  });

  it('is false when the team is null/undefined', () => {
    assert.equal(isTeamOwner(null, OWNER), false);
    assert.equal(isTeamOwner(undefined, OWNER), false);
  });

  it('is false when the team has no owner', () => {
    assert.equal(isTeamOwner({ id: 1, owner: null, members: [] }, OWNER), false);
  });
});

describe('isTeamMember', () => {
  it('the owner counts as a member', () => {
    assert.equal(isTeamMember(team, OWNER), true);
  });

  it('listed members are members', () => {
    assert.equal(isTeamMember(team, MEMBER), true);
    assert.equal(isTeamMember(team, OTHER_MEMBER), true);
  });

  it('an outside user is not a member', () => {
    assert.equal(isTeamMember(team, OUTSIDER), false);
  });

  it('tolerates null/undefined members', () => {
    const teamNoMembers: AuthzTeam = { id: 1, owner: { id: OWNER }, members: null };
    assert.equal(isTeamMember(teamNoMembers, OWNER), true);
    assert.equal(isTeamMember(teamNoMembers, OUTSIDER), false);
  });
});

describe('canCreateInvoice', () => {
  it('ONLY the team owner can create invoices', () => {
    assert.equal(canCreateInvoice(team, OWNER), true);
    assert.equal(canCreateInvoice(team, MEMBER), false);
    assert.equal(canCreateInvoice(team, OTHER_MEMBER), false);
    assert.equal(canCreateInvoice(team, OUTSIDER), false);
  });
});

describe('canDeleteInvoice', () => {
  it('ONLY the team owner can delete invoices (even if a member created it)', () => {
    assert.equal(canDeleteInvoice(invoiceByMember, OWNER), true);
    assert.equal(canDeleteInvoice(invoiceByMember, MEMBER), false);
    assert.equal(canDeleteInvoice(invoiceByOwner, OTHER_MEMBER), false);
    assert.equal(canDeleteInvoice(invoiceByMember, OUTSIDER), false);
  });

  it('without a team, nobody can delete with this helper', () => {
    assert.equal(canDeleteInvoice(invoiceWithoutTeam, MEMBER), false);
    assert.equal(canDeleteInvoice(invoiceWithoutTeam, OWNER), false);
  });
});

describe('canEditInvoiceHeader', () => {
  it('ONLY the team owner can edit the header', () => {
    assert.equal(canEditInvoiceHeader(invoiceByMember, OWNER), true);
    assert.equal(canEditInvoiceHeader(invoiceByOwner, OWNER), true);
    assert.equal(canEditInvoiceHeader(invoiceByMember, MEMBER), false);
    assert.equal(canEditInvoiceHeader(invoiceByOwner, MEMBER), false);
    assert.equal(canEditInvoiceHeader(invoiceByMember, OUTSIDER), false);
  });
});

describe('canExportInvoice', () => {
  it('ONLY the owner can export', () => {
    assert.equal(canExportInvoice(invoiceByMember, OWNER), true);
    assert.equal(canExportInvoice(invoiceByOwner, OWNER), true);
    assert.equal(canExportInvoice(invoiceByMember, MEMBER), false);
    assert.equal(canExportInvoice(invoiceByOwner, MEMBER), false);
    assert.equal(canExportInvoice(invoiceByMember, OUTSIDER), false);
  });

  it('nobody can export an invoice without a team with this helper', () => {
    assert.equal(canExportInvoice(invoiceWithoutTeam, MEMBER), false);
    assert.equal(canExportInvoice(invoiceWithoutTeam, OWNER), false);
  });
});

describe('canViewInvoice', () => {
  it('any member (owner included) can view', () => {
    assert.equal(canViewInvoice(invoiceByMember, OWNER), true);
    assert.equal(canViewInvoice(invoiceByMember, MEMBER), true);
    assert.equal(canViewInvoice(invoiceByMember, OTHER_MEMBER), true);
  });

  it('an outside user cannot view', () => {
    assert.equal(canViewInvoice(invoiceByMember, OUTSIDER), false);
  });
});

describe('canCreateSection', () => {
  it('any team member (owner included) can create sections', () => {
    assert.equal(canCreateSection(team, OWNER), true);
    assert.equal(canCreateSection(team, MEMBER), true);
    assert.equal(canCreateSection(team, OTHER_MEMBER), true);
  });

  it('an outsider cannot create sections', () => {
    assert.equal(canCreateSection(team, OUTSIDER), false);
  });
});

describe('canEditSection', () => {
  it('the team owner can edit any section', () => {
    assert.equal(canEditSection(sectionByMember, OWNER), true);
    assert.equal(canEditSection(sectionByOtherMember, OWNER), true);
    assert.equal(canEditSection(sectionByOwner, OWNER), true);
  });

  it('a member can ONLY edit sections they created', () => {
    assert.equal(canEditSection(sectionByMember, MEMBER), true);
    assert.equal(canEditSection(sectionByOtherMember, MEMBER), false);
    assert.equal(canEditSection(sectionByOwner, MEMBER), false);
  });

  it('an outsider cannot edit any section', () => {
    assert.equal(canEditSection(sectionByMember, OUTSIDER), false);
    assert.equal(canEditSection(sectionByOwner, OUTSIDER), false);
  });

  it('section without author, or null → cannot be edited', () => {
    assert.equal(canEditSection(null, OWNER), false);
    assert.equal(canEditSection(undefined, OWNER), false);
    assert.equal(canEditSection({ id: 1, author: null, invoice: invoiceByOwner }, MEMBER), false);
  });
});

describe('issuer and client on a paid invoice', () => {
  const paidInvoice: AuthzInvoice = { id: 200, team, author: { id: OWNER }, status: 'paid' };
  const draftInvoice: AuthzInvoice = { id: 201, team, author: { id: OWNER }, status: 'draft' };

  it('a paid invoice is frozen; a draft is not', () => {
    assert.equal(isInvoiceFrozen(paidInvoice), true);
    assert.equal(isInvoiceFrozen(draftInvoice), false);
    assert.equal(isInvoiceFrozen(undefined), false);
  });

  it('the owner edits issuer and client in any status, paid included', () => {
    assert.equal(canEditInvoiceParties(draftInvoice, OWNER), true);
    assert.equal(canEditInvoiceParties(paidInvoice, OWNER), true);
  });

  it('a member cannot edit issuer and client, not even on a draft', () => {
    assert.equal(canEditInvoiceParties(draftInvoice, MEMBER), false);
    assert.equal(canEditInvoiceParties(paidInvoice, MEMBER), false);
  });

  it('someone outside the team, never', () => {
    assert.equal(canEditInvoiceParties(paidInvoice, OUTSIDER), false);
    assert.equal(canEditInvoiceParties(null, OWNER), false);
  });
});

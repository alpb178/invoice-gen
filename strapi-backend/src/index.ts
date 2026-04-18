import type { Core } from '@strapi/strapi';

const AUTH_ACTIONS = [
  'api::invoice.invoice.find',
  'api::invoice.invoice.findOne',
  'api::invoice.invoice.create',
  'api::invoice.invoice.update',
  'api::invoice.invoice.delete',
  'api::invoice.invoice.export',
  'api::invoice.invoice.parseTasks',
  'api::section.section.find',
  'api::section.section.findOne',
  'api::section.section.create',
  'api::section.section.update',
  'api::section.section.delete',
  'api::task.task.find',
  'api::task.task.findOne',
  'api::task.task.create',
  'api::task.task.update',
  'api::task.task.delete',
  'api::team.team.find',
  'api::team.team.findOne',
  'api::team.team.create',
  'api::team.team.update',
  'api::team.team.delete',
  'api::team.team.mine',
  'api::team.team.removeMember',
  'api::invitation.invitation.mine',
  'api::invitation.invitation.listForTeam',
  'api::invitation.invitation.create',
  'api::invitation.invitation.cancel',
  'api::invitation.invitation.accept',
  'api::invitation.invitation.reject',
];

const PUBLIC_ACTIONS = [
  'plugin::users-permissions.auth.register',
  'plugin::users-permissions.auth.callback',
  'api::invitation.invitation.findByToken',
];

async function grantPermissions(
  strapi: Core.Strapi,
  roleType: 'authenticated' | 'public',
  actions: string[],
) {
  const role = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: roleType } });
  if (!role) return;

  for (const action of actions) {
    const existing = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: role.id } });
    if (!existing) {
      await strapi.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: role.id } });
    }
  }
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPermissions(strapi, 'authenticated', AUTH_ACTIONS);
    await grantPermissions(strapi, 'public', PUBLIC_ACTIONS);
  },
};

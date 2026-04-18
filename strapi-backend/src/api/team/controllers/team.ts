import { factories } from '@strapi/strapi';

const TEAM = 'api::team.team' as any;

const TEAM_FIELDS = [
  'name',
  'companyName',
  'companyCIF',
  'companyAddress',
  'defaultClientName',
  'defaultClientIBAN',
  'defaultClientSwift',
  'defaultClientBank',
  'defaultCurrency',
  'defaultNotes',
];

async function resolveTeamWithRoles(teamId: number) {
  return strapi.db.query(TEAM).findOne({
    where: { id: teamId },
    populate: { owner: true, members: true },
  });
}

function isOwner(team: any, userId: number) {
  return team?.owner?.id === userId;
}

function isMember(team: any, userId: number) {
  if (isOwner(team, userId)) return true;
  return (team?.members || []).some((m: any) => m.id === userId);
}

function pickTeamFields(body: any) {
  const data: any = {};
  for (const k of TEAM_FIELDS) if (k in body) data[k] = body[k];
  return data;
}

export default factories.createCoreController(TEAM, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const teams = await strapi.db.query(TEAM).findMany({
      where: {
        $or: [{ owner: { id: user.id } }, { members: { id: user.id } }],
      },
      populate: { owner: true, members: true },
      orderBy: { createdAt: 'desc' },
    });

    ctx.body = { data: teams };
  },

  async mine(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const owned = await strapi.db.query(TEAM).findMany({
      where: { owner: { id: user.id } },
      populate: { owner: true, members: true },
    });
    const memberOf = await strapi.db.query(TEAM).findMany({
      where: { members: { id: user.id } },
      populate: { owner: true, members: true },
    });

    ctx.body = { data: { owned, memberOf } };
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const team = await resolveTeamWithRoles(Number(ctx.params.id));
    if (!team) return ctx.notFound();
    if (!isMember(team, user.id)) return ctx.forbidden();

    ctx.body = { data: team };
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const body = ctx.request.body?.data || {};
    const data = pickTeamFields(body);
    if (!data.name) return ctx.badRequest('Falta el nombre del equipo');

    const team = await strapi.db.query(TEAM).create({
      data: { ...data, owner: user.id },
      populate: { owner: true, members: true },
    });

    ctx.body = { data: team };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const team = await resolveTeamWithRoles(Number(ctx.params.id));
    if (!team) return ctx.notFound();
    if (!isOwner(team, user.id)) return ctx.forbidden('Solo el dueño puede editar el equipo');

    const body = ctx.request.body?.data || {};
    const data = pickTeamFields(body);

    const updated = await strapi.db.query(TEAM).update({
      where: { id: team.id },
      data,
      populate: { owner: true, members: true },
    });

    ctx.body = { data: updated };
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const team = await resolveTeamWithRoles(Number(ctx.params.id));
    if (!team) return ctx.notFound();
    if (!isOwner(team, user.id)) return ctx.forbidden('Solo el dueño puede eliminar el equipo');

    await strapi.db.query(TEAM).delete({ where: { id: team.id } });
    ctx.body = { data: { id: team.id } };
  },

  async removeMember(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const team = await resolveTeamWithRoles(Number(ctx.params.id));
    if (!team) return ctx.notFound();
    if (!isOwner(team, user.id)) return ctx.forbidden('Solo el dueño puede quitar miembros');

    const targetId = Number(ctx.params.userId);
    const remaining = (team.members || []).filter((m: any) => m.id !== targetId).map((m: any) => m.id);

    const updated = await strapi.db.query(TEAM).update({
      where: { id: team.id },
      data: { members: remaining },
      populate: { owner: true, members: true },
    });

    ctx.body = { data: updated };
  },
}));

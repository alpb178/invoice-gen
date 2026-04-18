import { factories } from '@strapi/strapi';
import crypto from 'crypto';

const INVITATION = 'api::invitation.invitation' as any;
const TEAM = 'api::team.team' as any;
const USER = 'plugin::users-permissions.user';

const INVITE_TTL_DAYS = 7;

function randomToken() {
  return crypto.randomBytes(24).toString('hex');
}

function buildAcceptUrl(token: string) {
  const base =
    process.env.APP_PUBLIC_URL ||
    process.env.FRONTEND_URL ||
    'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/invitations/${token}`;
}

async function loadTeam(id: number) {
  return strapi.db.query(TEAM).findOne({
    where: { id },
    populate: { owner: true, members: true },
  });
}

function isOwner(team: any, userId: number) {
  return team?.owner?.id === userId;
}

export default factories.createCoreController(INVITATION, () => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const teamId = Number(ctx.params.teamId);
    const team = await loadTeam(teamId);
    if (!team) return ctx.notFound();
    if (!isOwner(team, user.id)) return ctx.forbidden('Solo el dueño puede invitar');

    const email = (ctx.request.body?.email || '').trim().toLowerCase();
    if (!email) return ctx.badRequest('Falta email');

    if (team.owner?.email?.toLowerCase() === email) {
      return ctx.badRequest('Ya eres dueño del equipo con ese correo');
    }
    if ((team.members || []).some((m: any) => m.email?.toLowerCase() === email)) {
      return ctx.badRequest('Ese usuario ya es miembro');
    }

    const existing = await strapi.db.query(INVITATION).findOne({
      where: { email, team: { id: teamId }, status: 'pending' },
    });
    if (existing) {
      const url = buildAcceptUrl(existing.token);
      return (ctx.body = { data: { ...existing, acceptUrl: url } });
    }

    const token = randomToken();
    const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86400_000);

    const invitation = await strapi.db.query(INVITATION).create({
      data: {
        email,
        token,
        status: 'pending',
        expiresAt,
        team: teamId,
        invitedBy: user.id,
      },
    });

    const acceptUrl = buildAcceptUrl(token);
    ctx.body = { data: { ...invitation, acceptUrl } };
  },

  async listForTeam(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const teamId = Number(ctx.params.teamId);
    const team = await loadTeam(teamId);
    if (!team) return ctx.notFound();
    if (!isOwner(team, user.id)) return ctx.forbidden();

    const invitations = await strapi.db.query(INVITATION).findMany({
      where: { team: { id: teamId } },
      populate: { invitedBy: true },
      orderBy: { createdAt: 'desc' },
    });
    const withUrl = invitations.map((inv: any) => ({ ...inv, acceptUrl: buildAcceptUrl(inv.token) }));
    ctx.body = { data: withUrl };
  },

  async cancel(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const invitation = await strapi.db.query(INVITATION).findOne({
      where: { id: Number(ctx.params.id) },
      populate: { team: { populate: { owner: true } } },
    });
    if (!invitation) return ctx.notFound();
    if (!isOwner(invitation.team, user.id)) return ctx.forbidden();

    await strapi.db.query(INVITATION).update({
      where: { id: invitation.id },
      data: { status: 'cancelled' },
    });
    ctx.body = { data: { id: invitation.id, status: 'cancelled' } };
  },

  async findByToken(ctx) {
    const invitation = await strapi.db.query(INVITATION).findOne({
      where: { token: ctx.params.token },
      populate: { team: { populate: { owner: true } }, invitedBy: true },
    });
    if (!invitation) return ctx.notFound();

    const expired = invitation.expiresAt && new Date(invitation.expiresAt).getTime() < Date.now();
    ctx.body = {
      data: {
        id: invitation.id,
        email: invitation.email,
        status: invitation.status,
        expired,
        team: { id: invitation.team?.id, name: invitation.team?.name },
        invitedBy: invitation.invitedBy ? { username: invitation.invitedBy.username } : null,
      },
    };
  },

  async accept(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const invitation = await strapi.db.query(INVITATION).findOne({
      where: { token: ctx.params.token },
      populate: { team: { populate: { owner: true, members: true } } },
    });
    if (!invitation) return ctx.notFound();
    if (invitation.status !== 'pending') return ctx.badRequest('La invitación ya no está disponible');
    if (invitation.expiresAt && new Date(invitation.expiresAt).getTime() < Date.now()) {
      await strapi.db.query(INVITATION).update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      });
      return ctx.badRequest('La invitación expiró');
    }
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return ctx.forbidden('La invitación es para otro correo');
    }

    const team = invitation.team;
    const memberIds = (team.members || []).map((m: any) => m.id);
    if (!memberIds.includes(user.id) && team.owner?.id !== user.id) {
      await strapi.db.query(TEAM).update({
        where: { id: team.id },
        data: { members: [...memberIds, user.id] },
      });
    }

    const updated = await strapi.db.query(INVITATION).update({
      where: { id: invitation.id },
      data: { status: 'accepted' },
    });

    ctx.body = { data: { ...updated, team: { id: team.id, name: team.name } } };
  },

  async reject(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const invitation = await strapi.db.query(INVITATION).findOne({
      where: { token: ctx.params.token },
    });
    if (!invitation) return ctx.notFound();
    if (invitation.status !== 'pending') return ctx.badRequest();
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) return ctx.forbidden();

    const updated = await strapi.db.query(INVITATION).update({
      where: { id: invitation.id },
      data: { status: 'rejected' },
    });
    ctx.body = { data: updated };
  },

  async mine(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const invitations = await strapi.db.query(INVITATION).findMany({
      where: {
        email: user.email.toLowerCase(),
        status: 'pending',
      },
      populate: { team: { populate: { owner: true } }, invitedBy: true },
      orderBy: { createdAt: 'desc' },
    });
    const withUrl = invitations.map((inv: any) => ({ ...inv, acceptUrl: buildAcceptUrl(inv.token) }));
    ctx.body = { data: withUrl };
  },
}));

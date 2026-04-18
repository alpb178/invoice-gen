import { factories } from '@strapi/strapi';
import fs from 'fs';
import { parseTasksFromText, ParsedTask } from '../services/task-parser';
import {
  canEditInvoice,
  canExportInvoice,
  canViewInvoice,
  isTeamMember,
  isTeamOwner,
} from '../../../utils/authz';

const INVOICE = 'api::invoice.invoice' as const;
const TEAM = 'api::team.team' as any;

const INVOICE_POPULATE = {
  sections: { populate: { tasks: true } },
  team: { populate: { owner: true, members: true } },
  createdBy: true,
} as const;

async function teamsForUser(userId: number) {
  const teams = await strapi.db.query(TEAM).findMany({
    where: { $or: [{ owner: { id: userId } }, { members: { id: userId } }] },
    populate: { owner: true, members: true },
  });
  return teams;
}

async function loadInvoice(id: number) {
  return strapi.db.query(INVOICE).findOne({
    where: { id },
    populate: INVOICE_POPULATE,
  });
}

export default factories.createCoreController(INVOICE, ({ strapi }) => ({
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const teams = await teamsForUser(user.id);
    const teamIds = teams.map((t: any) => t.id);
    if (teamIds.length === 0) {
      ctx.body = { data: [] };
      return;
    }

    const requestedTeam = ctx.query?.team ? Number(ctx.query.team) : null;
    const filterTeamIds = requestedTeam && teamIds.includes(requestedTeam) ? [requestedTeam] : teamIds;

    const invoices = await strapi.db.query(INVOICE).findMany({
      where: { team: { id: { $in: filterTeamIds } } },
      populate: INVOICE_POPULATE,
      orderBy: { createdAt: 'desc' },
    });

    ctx.body = { data: invoices };
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const invoice = await loadInvoice(Number(ctx.params.id));
    if (!invoice) return ctx.notFound();
    if (!isTeamMember(invoice.team, user.id)) return ctx.forbidden();

    ctx.body = { data: invoice };
  },

  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const body = ctx.request.body?.data || {};
    const teamId = body.team;
    if (!teamId) return ctx.badRequest('Falta el equipo');

    const team = await strapi.db.query(TEAM).findOne({
      where: { id: teamId },
      populate: { owner: true, members: true },
    });
    if (!team) return ctx.notFound('Equipo no encontrado');
    if (!isTeamMember(team, user.id)) return ctx.forbidden('No perteneces a este equipo');

    const { team: _t, createdBy: _c, sections: _s, ...rest } = body;
    const invoice = await strapi.db.query(INVOICE).create({
      data: { ...rest, team: team.id, createdBy: user.id },
      populate: INVOICE_POPULATE,
    });

    ctx.body = { data: invoice };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const invoice = await loadInvoice(Number(ctx.params.id));
    if (!invoice) return ctx.notFound();
    if (!canEditInvoice(invoice, user.id)) {
      return ctx.forbidden('No puedes modificar esta factura');
    }

    const body = ctx.request.body?.data || {};
    const { team: _t, createdBy: _c, sections: _s, ...rest } = body;

    const updated = await strapi.db.query(INVOICE).update({
      where: { id: invoice.id },
      data: rest,
      populate: INVOICE_POPULATE,
    });

    ctx.body = { data: updated };
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const invoice = await loadInvoice(Number(ctx.params.id));
    if (!invoice) return ctx.notFound();
    if (!canEditInvoice(invoice, user.id)) return ctx.forbidden();

    await strapi.db.query(INVOICE).delete({ where: { id: invoice.id } });
    ctx.body = { data: { id: invoice.id } };
  },

  async export(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const invoice = await loadInvoice(Number(ctx.params.id));
    if (!invoice) return ctx.notFound();
    if (!isTeamOwner(invoice.team, user.id)) {
      return ctx.forbidden('Solo el dueño del equipo puede exportar facturas');
    }

    const updated = await strapi.db.query(INVOICE).update({
      where: { id: invoice.id },
      data: { exportedAt: new Date() },
      populate: INVOICE_POPULATE,
    });

    ctx.body = { data: updated };
  },

  async parseTasks(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const teams = await teamsForUser(user.id);
    if (teams.length === 0) return ctx.forbidden('Necesitas pertenecer a un equipo');

    let sourceText: string | null = null;
    let source: 'text' | 'pdf' | null = null;

    const bodyText = (ctx.request.body as any)?.text;
    if (typeof bodyText === 'string' && bodyText.trim()) {
      sourceText = bodyText;
      source = 'text';
    }

    const files = (ctx.request as any).files;
    const file = files?.file || (Array.isArray(files) ? files[0] : null);
    if (!sourceText && file) {
      const mime = file.type || file.mimetype || '';
      const path = file.path || file.filepath;
      if (!path) return ctx.badRequest('Archivo inválido');
      if (!mime.includes('pdf')) {
        return ctx.badRequest('Por ahora solo se acepta PDF o texto plano');
      }
      try {
        const buffer = await fs.promises.readFile(path);
        const { PDFParse } = await import('pdf-parse');
        const parser = new PDFParse({ data: new Uint8Array(buffer) });
        const result = await parser.getText();
        await parser.destroy();
        sourceText = (result as any).text || '';
        source = 'pdf';
      } catch (e: any) {
        strapi.log.warn(`pdf parse failed: ${e.message}`);
        return ctx.badRequest('No se pudo leer el PDF');
      }
    }

    if (!sourceText) {
      return ctx.badRequest('Envía texto o un archivo PDF');
    }

    const tasks: ParsedTask[] = parseTasksFromText(sourceText);
    ctx.body = {
      data: {
        source,
        tasks,
        raw: source === 'pdf' ? sourceText.slice(0, 8000) : undefined,
      },
    };
  },
}));

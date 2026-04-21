import { factories } from '@strapi/strapi';
import fs from 'fs';
import { parseTasksFromText, ParsedTask } from '../services/task-parser';
import {
  canCreateInvoice,
  canCreateSection,
  canDeleteInvoice,
  canEditInvoiceHeader,
  canEditSection,
  isTeamMember,
  isTeamOwner,
} from '../../../utils/authz';
import { recomputeInvoiceTotal } from '../../../utils/totals';

const INVOICE = 'api::invoice.invoice' as const;
const SECTION = 'api::section.section' as const;
const TASK = 'api::task.task' as const;
const TEAM = 'api::team.team' as any;

const INVOICE_POPULATE = {
  sections: { populate: { tasks: true, author: true } },
  team: { populate: { owner: true, members: true } },
  author: true,
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

/**
 * Un miembro (no dueño) solo ve las secciones que él mismo creó.
 * El dueño del equipo ve todas.
 */
function filterSectionsForViewer<T extends { team?: any; sections?: any[] }>(
  invoice: T,
  userId: number,
): T {
  if (!invoice || !Array.isArray(invoice.sections)) return invoice;
  if (isTeamOwner(invoice.team, userId)) return invoice;
  const sections = invoice.sections.filter((s: any) => s?.author?.id === userId);
  return { ...invoice, sections };
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

    const visible = invoices.map((inv: any) => filterSectionsForViewer(inv, user.id));
    ctx.body = { data: visible };
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const invoice = await loadInvoice(Number(ctx.params.id));
    if (!invoice) return ctx.notFound();
    if (!isTeamMember(invoice.team, user.id)) return ctx.forbidden();

    ctx.body = { data: filterSectionsForViewer(invoice, user.id) };
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
    if (!canCreateInvoice(team, user.id)) {
      return ctx.forbidden('Solo el dueño del equipo puede crear facturas');
    }

    const { team: _t, author: _a, sections: _s, ...rest } = body;
    const invoice = await strapi.db.query(INVOICE).create({
      data: { ...rest, team: team.id, author: user.id },
      populate: INVOICE_POPULATE,
    });

    ctx.body = { data: invoice };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const invoice = await loadInvoice(Number(ctx.params.id));
    if (!invoice) return ctx.notFound();
    if (!canEditInvoiceHeader(invoice, user.id)) {
      return ctx.forbidden('Solo el dueño del equipo puede modificar la factura');
    }

    const body = ctx.request.body?.data || {};
    const { team: _t, author: _a, sections: _s, ...rest } = body;

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
    if (!canDeleteInvoice(invoice, user.id)) {
      return ctx.forbidden('Solo el dueño del equipo puede borrar facturas');
    }

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

  async saveFull(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const body = ctx.request.body?.data || {};
    const incomingSections: any[] = Array.isArray(body.sections) ? body.sections : [];

    // --- 1. Resolver factura existente o equipo para crear ---
    let existing: any = null;
    let team: any = null;

    if (body.id) {
      existing = await loadInvoice(Number(body.id));
      if (!existing) return ctx.notFound();
      if (!isTeamMember(existing.team, user.id)) return ctx.forbidden();
      team = existing.team;
    } else {
      const teamId = body.team;
      if (!teamId) return ctx.badRequest('Falta el equipo');
      team = await strapi.db.query(TEAM).findOne({
        where: { id: Number(teamId) },
        populate: { owner: true, members: true },
      });
      if (!team) return ctx.notFound('Equipo no encontrado');
      if (!canCreateInvoice(team, user.id)) {
        return ctx.forbidden('Solo el dueño del equipo puede crear facturas');
      }
    }

    const isOwner = isTeamOwner(team, user.id);

    // Campos de cabecera que acepta la factura. Cualquier otro se ignora.
    const headerFields = [
      'number', 'date', 'status', 'currency',
      'companyName', 'companyCIF', 'companyAddress',
      'clientName', 'clientIBAN', 'clientSwift', 'clientBank',
      'notes',
    ] as const;
    const headerData: Record<string, any> = {};
    for (const k of headerFields) if (k in body) headerData[k] = body[k];

    // --- 2. Transacción: todo o nada ---
    let invoiceId: number;
    await strapi.db.transaction(async () => {
      // 2a. Cabecera
      if (existing) {
        invoiceId = existing.id;
        if (isOwner && Object.keys(headerData).length > 0) {
          await strapi.db.query(INVOICE).update({
            where: { id: invoiceId },
            data: headerData,
          });
        }
      } else {
        const created = await strapi.db.query(INVOICE).create({
          data: { ...headerData, team: team.id, author: user.id },
        });
        invoiceId = created.id;
      }

      const existingSections: any[] = existing?.sections || [];
      const incomingIds = new Set(
        incomingSections.filter((s) => s?.id).map((s) => Number(s.id)),
      );

      // 2b. Borrar secciones que el usuario puede editar y no están en el payload
      for (const sec of existingSections) {
        if (incomingIds.has(sec.id)) continue;
        const secWithInvoice = { ...sec, invoice: { team } };
        if (!canEditSection(secWithInvoice, user.id)) continue;
        await strapi.db.query(SECTION).delete({ where: { id: sec.id } });
      }

      // 2c. Upsert de secciones y sus tareas
      for (let i = 0; i < incomingSections.length; i++) {
        const inSec = incomingSections[i];
        const sectionData = {
          title: inSec.title || '',
          subtitle: inSec.subtitle || '',
          sortOrder: typeof inSec.sortOrder === 'number' ? inSec.sortOrder : i,
        };

        let sectionId: number;
        let existingSec: any = null;

        if (inSec.id) {
          existingSec = existingSections.find((s) => s.id === Number(inSec.id));
          if (!existingSec) continue; // id desconocido: ignorar
          const secWithInvoice = { ...existingSec, invoice: { team } };
          if (!canEditSection(secWithInvoice, user.id)) continue; // permiso denegado: silencio
          await strapi.db.query(SECTION).update({
            where: { id: existingSec.id },
            data: sectionData,
          });
          sectionId = existingSec.id;
        } else {
          if (!canCreateSection(team, user.id)) continue;
          const created = await strapi.db.query(SECTION).create({
            data: { ...sectionData, invoice: invoiceId, author: user.id },
          });
          sectionId = created.id;
        }

        // Reconciliar tareas de esta sección
        const existingTasks: any[] = existingSec?.tasks || [];
        const existingTaskIds = new Set(existingTasks.map((t) => t.id));
        const incomingTasks: any[] = Array.isArray(inSec.tasks) ? inSec.tasks : [];
        const keepIds = new Set(
          incomingTasks.filter((t) => t?.id).map((t) => Number(t.id)),
        );

        for (const task of existingTasks) {
          if (keepIds.has(task.id)) continue;
          await strapi.db.query(TASK).delete({ where: { id: task.id } });
        }

        let subtotal = 0;
        for (let j = 0; j < incomingTasks.length; j++) {
          const inTask = incomingTasks[j];
          const taskData = {
            number: typeof inTask.number === 'number' ? inTask.number : j + 1,
            code: inTask.code || '',
            description: inTask.description || '',
            amount: Number(inTask.amount) || 0,
            hours: inTask.hours != null ? Number(inTask.hours) : null,
            sortOrder: typeof inTask.sortOrder === 'number' ? inTask.sortOrder : j,
            section: sectionId,
          };
          subtotal += taskData.amount;

          if (inTask.id && existingTaskIds.has(Number(inTask.id))) {
            await strapi.db.query(TASK).update({
              where: { id: Number(inTask.id) },
              data: taskData,
            });
          } else {
            await strapi.db.query(TASK).create({ data: taskData });
          }
        }

        await strapi.db.query(SECTION).update({
          where: { id: sectionId },
          data: { subtotal },
        });
      }
    });

    // --- 3. Recalcular total y devolver el árbol completo ---
    await recomputeInvoiceTotal(invoiceId!);
    const fresh = await loadInvoice(invoiceId!);
    ctx.body = { data: filterSectionsForViewer(fresh, user.id) };
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

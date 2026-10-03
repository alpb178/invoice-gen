import { factories } from '@strapi/strapi';
import { canEditSection } from '../../../utils/authz';
import { recomputeInvoiceTotal } from '../../../utils/totals';

const TASK = 'api::task.task' as const;
const SECTION = 'api::section.section' as const;

const SECTION_AUTHZ_POPULATE = {
  author: true,
  invoice: { populate: { team: { populate: { owner: true, members: true } }, author: true } },
} as const;

async function loadSectionWithInvoice(id: number) {
  return strapi.db.query(SECTION).findOne({
    where: { id },
    populate: SECTION_AUTHZ_POPULATE,
  });
}

async function loadTask(id: number) {
  return strapi.db.query(TASK).findOne({
    where: { id },
    populate: { section: { populate: SECTION_AUTHZ_POPULATE } },
  });
}

export default factories.createCoreController(TASK, ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const body = ctx.request.body?.data || {};
    if (!body.section) return ctx.badRequest('Falta la sección');
    const section = await loadSectionWithInvoice(Number(body.section));
    if (!section) return ctx.notFound();
    if (!canEditSection(section, user.id)) {
      return ctx.forbidden('Solo puedes añadir tareas a tus propias secciones');
    }

    const task = await strapi.db.query(TASK).create({ data: body });
    if (section.invoice?.id) await recomputeInvoiceTotal(section.invoice.id);
    ctx.body = { data: task };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const task = await loadTask(Number(ctx.params.id));
    if (!task) return ctx.notFound();
    if (!canEditSection(task.section, user.id)) {
      return ctx.forbidden('Solo puedes editar tareas de tus propias secciones');
    }

    const body = ctx.request.body?.data || {};
    const updated = await strapi.db.query(TASK).update({ where: { id: task.id }, data: body });
    const invoiceId = task.section?.invoice?.id;
    if (invoiceId) await recomputeInvoiceTotal(invoiceId);
    ctx.body = { data: updated };
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const task = await loadTask(Number(ctx.params.id));
    if (!task) return ctx.notFound();
    if (!canEditSection(task.section, user.id)) {
      return ctx.forbidden('Solo puedes borrar tareas de tus propias secciones');
    }

    const invoiceId = task.section?.invoice?.id;
    await strapi.db.query(TASK).delete({ where: { id: task.id } });
    if (invoiceId) await recomputeInvoiceTotal(invoiceId);
    ctx.body = { data: { id: task.id } };
  },
}));

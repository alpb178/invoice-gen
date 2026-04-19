import { factories } from '@strapi/strapi';
import { canEditInvoice } from '../../../utils/authz';

const TASK = 'api::task.task' as const;
const SECTION = 'api::section.section' as const;

async function loadSectionWithInvoice(id: number) {
  return strapi.db.query(SECTION).findOne({
    where: { id },
    populate: { invoice: { populate: { team: { populate: { owner: true, members: true } }, author: true } } },
  });
}

async function loadTask(id: number) {
  return strapi.db.query(TASK).findOne({
    where: { id },
    populate: { section: { populate: { invoice: { populate: { team: { populate: { owner: true, members: true } }, author: true } } } } },
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
    if (!canEditInvoice(section.invoice, user.id)) return ctx.forbidden();

    const task = await strapi.db.query(TASK).create({ data: body });
    ctx.body = { data: task };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const task = await loadTask(Number(ctx.params.id));
    if (!task) return ctx.notFound();
    if (!canEditInvoice(task.section?.invoice, user.id)) return ctx.forbidden();

    const body = ctx.request.body?.data || {};
    const updated = await strapi.db.query(TASK).update({ where: { id: task.id }, data: body });
    ctx.body = { data: updated };
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const task = await loadTask(Number(ctx.params.id));
    if (!task) return ctx.notFound();
    if (!canEditInvoice(task.section?.invoice, user.id)) return ctx.forbidden();

    await strapi.db.query(TASK).delete({ where: { id: task.id } });
    ctx.body = { data: { id: task.id } };
  },
}));

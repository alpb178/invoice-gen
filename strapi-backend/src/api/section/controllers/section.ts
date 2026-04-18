import { factories } from '@strapi/strapi';
import { canEditInvoice } from '../../../utils/authz';

const SECTION = 'api::section.section' as const;
const INVOICE = 'api::invoice.invoice' as const;

async function loadInvoice(id: number) {
  return strapi.db.query(INVOICE).findOne({
    where: { id },
    populate: { team: { populate: { owner: true, members: true } }, createdBy: true },
  });
}

async function loadSection(id: number) {
  return strapi.db.query(SECTION).findOne({
    where: { id },
    populate: { invoice: { populate: { team: { populate: { owner: true, members: true } }, createdBy: true } } },
  });
}

export default factories.createCoreController(SECTION, ({ strapi }) => ({
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const body = ctx.request.body?.data || {};
    if (!body.invoice) return ctx.badRequest('Falta la factura');
    const invoice = await loadInvoice(Number(body.invoice));
    if (!invoice) return ctx.notFound();
    if (!canEditInvoice(invoice, user.id)) return ctx.forbidden('No puedes modificar esta factura');

    const section = await strapi.db.query(SECTION).create({
      data: body,
      populate: { tasks: true },
    });
    ctx.body = { data: section };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const section = await loadSection(Number(ctx.params.id));
    if (!section) return ctx.notFound();
    if (!canEditInvoice(section.invoice, user.id)) return ctx.forbidden();

    const body = ctx.request.body?.data || {};
    const updated = await strapi.db.query(SECTION).update({
      where: { id: section.id },
      data: body,
      populate: { tasks: true },
    });
    ctx.body = { data: updated };
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const section = await loadSection(Number(ctx.params.id));
    if (!section) return ctx.notFound();
    if (!canEditInvoice(section.invoice, user.id)) return ctx.forbidden();

    await strapi.db.query(SECTION).delete({ where: { id: section.id } });
    ctx.body = { data: { id: section.id } };
  },
}));

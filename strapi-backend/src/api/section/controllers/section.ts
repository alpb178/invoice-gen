import { factories } from '@strapi/strapi';
import { canCreateSection, canEditSection } from '../../../utils/authz';
import { recomputeInvoiceTotal } from '../../../utils/totals';

const SECTION = 'api::section.section' as const;
const INVOICE = 'api::invoice.invoice' as const;

async function loadInvoice(id: number) {
  return strapi.db.query(INVOICE).findOne({
    where: { id },
    populate: { team: { populate: { owner: true, members: true } }, author: true },
  });
}

async function loadSection(id: number) {
  return strapi.db.query(SECTION).findOne({
    where: { id },
    populate: {
      author: true,
      invoice: { populate: { team: { populate: { owner: true, members: true } }, author: true } },
    },
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
    if (!canCreateSection(invoice.team, user.id)) {
      return ctx.forbidden('No perteneces a este equipo');
    }

    const { author: _a, ...rest } = body;
    const section = await strapi.db.query(SECTION).create({
      data: { ...rest, author: user.id },
      populate: { tasks: true, author: true },
    });
    await recomputeInvoiceTotal(invoice.id);
    ctx.body = { data: section };
  },

  async update(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const section = await loadSection(Number(ctx.params.id));
    if (!section) return ctx.notFound();
    if (!canEditSection(section, user.id)) {
      return ctx.forbidden('Solo puedes editar tus propias secciones');
    }

    const body = ctx.request.body?.data || {};
    const { author: _a, invoice: _i, ...rest } = body;
    const updated = await strapi.db.query(SECTION).update({
      where: { id: section.id },
      data: rest,
      populate: { tasks: true, author: true },
    });
    if (section.invoice?.id) await recomputeInvoiceTotal(section.invoice.id);
    ctx.body = { data: updated };
  },

  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized();

    const section = await loadSection(Number(ctx.params.id));
    if (!section) return ctx.notFound();
    if (!canEditSection(section, user.id)) {
      return ctx.forbidden('Solo puedes borrar tus propias secciones');
    }

    const invoiceId = section.invoice?.id;
    await strapi.db.query(SECTION).delete({ where: { id: section.id } });
    if (invoiceId) await recomputeInvoiceTotal(invoiceId);
    ctx.body = { data: { id: section.id } };
  },
}));

export default {
  ping(ctx) {
    ctx.status = 200;
    ctx.body = { status: 'ok' };
  },
};

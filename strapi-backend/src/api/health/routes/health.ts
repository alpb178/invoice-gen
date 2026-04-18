export default {
  routes: [
    {
      method: 'GET',
      path: '/health',
      handler: 'health.ping',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};

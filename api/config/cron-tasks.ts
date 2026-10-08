import type { Core } from '@strapi/strapi';

const tasks = {
  hubPush: {
    task: async ({ strapi }: { strapi: Core.Strapi }) => {
      await strapi.service('api::hub.hub').push();
    },
    options: { rule: '0 30 4 * * *', tz: 'Europe/Madrid' },
  },
};

export default tasks;

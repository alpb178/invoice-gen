export default {
  routes: [
    { method: 'GET', path: '/invitations/mine', handler: 'invitation.mine', config: { policies: [] } },
    { method: 'GET', path: '/invitations/by-token/:token', handler: 'invitation.findByToken', config: { auth: false } },
    { method: 'POST', path: '/invitations/:token/accept', handler: 'invitation.accept', config: { policies: [] } },
    { method: 'POST', path: '/invitations/:token/reject', handler: 'invitation.reject', config: { policies: [] } },
    { method: 'GET', path: '/teams/:teamId/invitations', handler: 'invitation.listForTeam', config: { policies: [] } },
    { method: 'POST', path: '/teams/:teamId/invitations', handler: 'invitation.create', config: { policies: [] } },
    { method: 'DELETE', path: '/invitations/:id', handler: 'invitation.cancel', config: { policies: [] } },
  ],
};

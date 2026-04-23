import api from './api';

export const workspaceService = {
  // CRUD
  getAll:  ()          => api.get('/workspaces'),
  getById: (id)        => api.get(`/workspaces/${id}`),
  create:  (data)      => api.post('/workspaces', data),
  update:  (id, data)  => api.patch(`/workspaces/${id}`, data),
  delete:  (id)        => api.delete(`/workspaces/${id}`),

  // Members
  getMembers:       (id)              => api.get(`/workspaces/${id}/members`),
  updateMemberRole: (id, userId, role) => api.patch(`/workspaces/${id}/members/${userId}`, { role }),
  removeMember:     (id, userId)      => api.delete(`/workspaces/${id}/members/${userId}`),

  // Invites
  getInvites:    (id)          => api.get(`/workspaces/${id}/invites`),
  createInvite:  (id, data)    => api.post(`/workspaces/${id}/invites`, data),
  revokeInvite:  (id, invId)   => api.delete(`/workspaces/${id}/invites/${invId}`),

  // Join
  previewJoin: (token) => api.get(`/workspaces/join/${token}`),
  joinByToken: (token) => api.post(`/workspaces/join/${token}`),
};

export default workspaceService;

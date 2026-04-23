import api from './api';

export const projectService = {
  getAll:      (params)       => api.get('/projects', { params }),
  getAllMine:   (params)       => api.get('/projects/all', { params }),
  getTags:     (workspaceId)  => api.get('/projects/tags', { params: { workspaceId } }),
  getById:     (id)           => api.get(`/projects/${id}`),
  create:      (data)         => api.post('/projects', data),
  update:      (id, data)     => api.patch(`/projects/${id}`, data),
  delete:      (id)           => api.delete(`/projects/${id}`),
  toggleFav:   (id)           => api.post(`/projects/${id}/favorite`),
  reorder:     (data)         => api.patch('/projects/reorder', data),
};

export default projectService;

import api from './api';

export const authService = {
  // ── OAuth ─────────────────────────────────────────
  loginWithGoogle: () => {
    window.location.href = '/api/auth/google';
  },

  loginWithApple: () => {
    window.location.href = '/api/auth/apple';
  },

  // ── Email / Password ──────────────────────────────
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),

  // ── Token ─────────────────────────────────────────
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout:  ()             => api.post('/auth/logout'),

  // ── Profile ───────────────────────────────────────
  getMe:          ()     => api.get('/auth/me'),
  updateMe:       (data) => api.patch('/auth/me', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export default authService;

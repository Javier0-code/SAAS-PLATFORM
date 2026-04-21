import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Instancia principal de axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ========================
// REQUEST INTERCEPTOR
// ========================
api.interceptors.request.use(
  (config) => {
    // Agregar el JWT token del localStorage
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ========================
// RESPONSE INTERCEPTOR
// ========================
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Si el token expiró (401), intentar refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          localStorage.setItem('access_token', data.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh falló, limpiar y redirigir al login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Formatear el error para que sea consistente
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    const formattedError = new Error(errorMessage);
    formattedError.status = error.response?.status;
    formattedError.data = error.response?.data;

    return Promise.reject(formattedError);
  }
);

// ========================
// API METHODS
// ========================
export const apiService = {
  get:    (url, config = {}) => api.get(url, config),
  post:   (url, data, config = {}) => api.post(url, data, config),
  put:    (url, data, config = {}) => api.put(url, data, config),
  patch:  (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

export default api;

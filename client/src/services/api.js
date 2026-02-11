import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API methods
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  getCurrentUser: () => api.get('/users/me/'),
};

export const quizAPI = {
  list: () => api.get('/quizzes/'),
  get: (id) => api.get(`/quizzes/${id}/`),
  getByCode: (code) => api.get(`/quizzes/${code}/by_code/`),
  create: (data) => api.post('/quizzes/', data),
  update: (id, data) => api.patch(`/quizzes/${id}/`, data),
  delete: (id) => api.delete(`/quizzes/${id}/`),
  myQuizzes: () => api.get('/quizzes/my_quizzes/'),
  publish: (id) => api.post(`/quizzes/${id}/publish/`),
  getResults: (id) => api.get(`/quizzes/${id}/results/`),
};

export const questionAPI = {
  list: (quizId) => api.get('/questions/', { params: { quiz_id: quizId } }),
  create: (data) => api.post('/questions/', data),
  update: (id, data) => api.patch(`/questions/${id}/`, data),
  delete: (id) => api.delete(`/questions/${id}/`),
};

export const resultAPI = {
  list: () => api.get('/results/'),
  submit: (data) => api.post('/results/submit/', data),
};

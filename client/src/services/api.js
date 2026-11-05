import axios from 'axios'

const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
export const API_BASE_URL = rawBase.replace(/\/+$/, '')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

let refreshPromise = null

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) throw new Error('No refresh token')

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_BASE_URL}/auth/refresh/`, { refresh: refreshToken })
      .then((response) => {
        const { access, refresh } = response.data
        localStorage.setItem('access_token', access)
        if (refresh) localStorage.setItem('refresh_token', refresh)
        return access
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {}
    const status = error.response?.status
    const isAuthCall =
      originalRequest.url?.includes('/auth/login/') ||
      originalRequest.url?.includes('/auth/refresh/') ||
      originalRequest.url?.includes('/auth/register/')

    if (status === 401 && !originalRequest._retry && !isAuthCall) {
      originalRequest._retry = true
      try {
        const access = await refreshAccessToken()
        originalRequest.headers = originalRequest.headers || {}
        originalRequest.headers.Authorization = `Bearer ${access}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.dispatchEvent(new Event('quizmania:logout'))
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data
  if (!data) return error?.message || fallback
  if (typeof data === 'string') return data
  if (data.detail) return data.detail
  if (data.error) return data.error
  if (Array.isArray(data)) return data.join(' ')
  if (typeof data === 'object') {
    const first = Object.values(data)[0]
    if (Array.isArray(first)) return first.join(' ')
    if (typeof first === 'string') return first
  }
  return fallback
}

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  getCurrentUser: () => api.get('/users/me/'),
}

export const quizAPI = {
  list: (params) => api.get('/quizzes/', { params }),
  get: (id) => api.get(`/quizzes/${id}/`),
  getByCode: (code) => api.get(`/quizzes/${encodeURIComponent(code)}/by_code/`),
  create: (data) => api.post('/quizzes/', data),
  update: (id, data) => api.patch(`/quizzes/${id}/`, data),
  delete: (id) => api.delete(`/quizzes/${id}/`),
  myQuizzes: () => api.get('/quizzes/my_quizzes/'),
  publish: (id) => api.post(`/quizzes/${id}/publish/`),
  getResults: (id) => api.get(`/quizzes/${id}/results/`),
}

export const questionAPI = {
  list: (quizId) => api.get('/questions/', { params: { quiz_id: quizId } }),
  create: (data) => api.post('/questions/', data),
  update: (id, data) => api.patch(`/questions/${id}/`, data),
  delete: (id) => api.delete(`/questions/${id}/`),
}

export const resultAPI = {
  list: (params) => api.get('/results/', { params }),
  submit: (data) => api.post('/results/submit/', data),
}

export default api

import { create } from 'zustand'
import { authAPI, getErrorMessage } from '../services/api'

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { access, refresh } = response.data
      localStorage.setItem('access_token', access)
      if (refresh) localStorage.setItem('refresh_token', refresh)

      const userResponse = await authAPI.getCurrentUser()
      set({ user: userResponse.data, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (error) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({ user: null, isAuthenticated: false, isLoading: false })
      return { success: false, error: getErrorMessage(error, 'Login failed. Check your username and password.') }
    }
  },

  register: async (userData) => {
    try {
      const response = await authAPI.register(userData)
      const { tokens, user, access, refresh } = response.data
      const accessToken = tokens?.access || access
      const refreshToken = tokens?.refresh || refresh

      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)

      set({ user, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data || getErrorMessage(error) }
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) await authAPI.logout(refreshToken)
    } catch {
      // The local session still ends even if the token was already invalid.
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  clearAuth: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, isAuthenticated: false, isLoading: false })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null })
      return
    }

    try {
      const response = await authAPI.getCurrentUser()
      set({ user: response.data, isAuthenticated: true, isLoading: false })
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },
}))

export default useAuthStore

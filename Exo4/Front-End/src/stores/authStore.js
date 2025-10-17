import { defineStore } from 'pinia'
import api from '@/api/client'

const STORAGE_KEY = 'auth'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { token: null, refreshToken: null, user: null }
  } catch {
    return { token: null, refreshToken: null, user: null }
  }
}

function save(state) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ token: state.token, refreshToken: state.refreshToken, user: state.user })
  )
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: load().token,
    refreshToken: load().refreshToken,
    user: load().user,
    loading: false,
    error: null,
  }),
  actions: {
    setTokens(token, refreshToken) {
      this.token = token
      this.refreshToken = refreshToken
      save(this)
    },
    setUser(user) {
      this.user = user
      save(this)
    },
    clearError() {
      this.error = null
    },
    logout() {
      this.token = null
      this.refreshToken = null
      this.user = null
      this.loading = false
      this.error = null
      save(this)
    },
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const data = await api.post('/auth/login', credentials, { auth: false })
        this.setTokens(data.token, data.refreshToken)
        // Optionally store minimal user info from login response
        if (data.user) this.setUser(data.user)
        // ensure we have fresh profile
        await this.fetchMe().catch(() => {})
        return true
      } catch (e) {
        this.error = e.message || 'Erreur de connexion'
        return false
      } finally {
        this.loading = false
      }
    },
    async register(payload) {
      this.loading = true
      this.error = null
      try {
        // Backend returns { user } on register
        const res = await api.post('/auth/register', payload, { auth: false })
        // After register, auto login
        await this.login({ email: payload.email, password: payload.password })
        return res
      } catch (e) {
        this.error = e.message || "Erreur d'inscription"
        throw e
      } finally {
        this.loading = false
      }
    },
    async fetchMe() {
      if (!this.token) return null
      try {
        const data = await api.get('/me')
        if (data?.user) this.setUser(data.user)
        return data?.user || null
      } catch (e) {
        // token invalid; stay logged out
        this.error = e.message || 'Erreur profil'
        return null
      }
    },
  },
})

export default useAuthStore

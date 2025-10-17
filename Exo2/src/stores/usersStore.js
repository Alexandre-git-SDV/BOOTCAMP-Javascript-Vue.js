import { defineStore } from 'pinia'

const STORAGE_KEY = 'users'

function readUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
}

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: readUsers(), // Lis tous les utilisateurs depuis le localStorage
    currentUserId: 1, // Mon ID d'utilisateur connecté
  }),

  getters: {
    currentUser: (state) => state.users.find((user) => user.id === state.currentUserId) || null,

    loggedUser() {
      return this.currentUser
    },
  },
  actions: {
    refresh() {
      this.users = readUsers()
    },
    getById(id) {
      return this.users.find((user) => user.id === Number(id))
    },
    upsert(user) {
      const IdPresent = this.users.findIndex((user) => user.id === user.id)

      if (IdPresent >= 0) this.users.splice(IdPresent, 1, user)
      else this.users.push(user)
      writeUsers(this.users)
    },
    remove(id) {
      this.users = this.users.filter((user) => user.id !== id)
      writeUsers(this.users)
    },
  },
})

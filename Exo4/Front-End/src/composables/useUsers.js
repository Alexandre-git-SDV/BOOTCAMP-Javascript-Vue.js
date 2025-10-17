import { ref } from 'vue'

const STORAGE_KEY = 'users'

const DEFAULT_USERS = [
  { id: 1, name: 'Alexandre GOURAUD', email: 'alex@mail.fr' },
  { id: 2, name: 'Mathis HUARD', email: 'mathis@mail.fr' },
  { id: 3, name: 'Kenan DUFRESNE', email: 'kenan@mail.fr' },
]

function initLocalStorage() {
  const donneeuser = localStorage.getItem(STORAGE_KEY)
  if (!donneeuser) localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
}

function readLocalStorage() {
  try {
    const donneeuser = localStorage.getItem(STORAGE_KEY)
    return donneeuser ? JSON.parse(donneeuser) : []
  } catch (error) {
    console.error('Erreur lors de la lecture du localstorage:', error)
    return []
  }
}

// composable simple et lisible
export function useUsers() {
  initLocalStorage()

  const users = ref(readLocalStorage())

  function refresh() {
    users.value = readLocalStorage()
  }

  function getUserById(id) {
    return users.value.find((user) => user.id === Number(id)) || null
  }

  return { users, refresh, getUserById }
}

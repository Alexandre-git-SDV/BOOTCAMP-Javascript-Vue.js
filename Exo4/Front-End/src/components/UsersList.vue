<template>
  <div class="users-list">
    <h1>Tous les utilisateurs</h1>

    <div class="toolbar">
      <router-link to="/login">Se déconnecter / changer d'utilisateur</router-link>
      <span class="spacer"></span>
      <button @click="load" :disabled="loading">Rafraîchir</button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div class="grid" v-if="!loading">
      <div v-for="u in users" :key="u.id" class="user-item">
        <h3>
          <router-link :to="{ name: 'user', params: { id: u.id } }">{{ u.name || u.email }}</router-link>
        </h3>
        <p>Email : {{ u.email }}</p>
        <div class="actions">
          <button @click="edit(u)">Modifier</button>
          <button class="danger" @click="removeUser(u)">Supprimer</button>
        </div>
      </div>
    </div>
    <dialog ref="editDialog">
    <form @submit.prevent="saveEdit">
      <label>Nom
        <input v-model="editForm.name" type="text" />
      </label>
      <label>Email
        <input v-model="editForm.email" type="email" required />
      </label>
      <div class="error" v-if="formError">{{ formError }}</div>
      <menu>
        <button type="submit">Enregistrer</button>
        <button type="button" @click="closeDialog">Annuler</button>
      </menu>
    </form>
    </dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import api from '@/api/client'

const users = ref([])
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await api.get('/users')
    users.value = Array.isArray(data) ? data.map(mapUser) : Array.isArray(data?.users) ? data.users.map(mapUser) : []
  } catch (e) {
    error.value = e.message || 'Erreur chargement des utilisateurs'
  } finally {
    loading.value = false
  }
}

function mapUser(u) {
  // normalize fields coming from backend controller
  return { id: u.id || u._id || u._id?.toString?.() || u?.user?.id, email: u.email, name: u.name }
}

onMounted(load)

// Edit / Delete flow
const editDialog = ref(null)
const editForm = reactive({ id: null, name: '', email: '' })
const formError = ref('')

function edit(u) {
  formError.value = ''
  editForm.id = u.id
  editForm.name = u.name || ''
  editForm.email = u.email || ''
  editDialog.value?.showModal?.()
}
function closeDialog() {
  editDialog.value?.close?.()
}

async function saveEdit() {
  formError.value = ''
  try {
    await api.put(`/users/${editForm.id}`, { name: editForm.name, email: editForm.email })
    // refresh list
    await load()
    closeDialog()
  } catch (e) {
    formError.value = e.message || 'Erreur lors de la sauvegarde'
  }
}

async function removeUser(u) {
  if (!confirm(`Supprimer ${u.name || u.email} ?`)) return
  try {
    await api.del(`/users/${u.id}`)
    users.value = users.value.filter((x) => x.id !== u.id)
  } catch (e) {
    alert(e.message || 'Erreur lors de la suppression')
  }
}
</script>

<style scoped>
.users-list {
  padding: 1.5rem;
  border: 1px solid #003cb4;
  border-radius: 8px;
  background: #f7fbff;
}

.toolbar { display: flex; align-items: center; gap: .75rem; margin-bottom: 1rem; }
.toolbar .spacer { flex: 1; }
.error { color: #c00; margin: .5rem 0; }

.users-list h1 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  color: #003cb4;
}

.grid {
  border: #003cb4;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  align-items: start;
}

.grid > * {
  border: 1px solid #003cb4;
  border-radius: 8px;
  padding: 1rem;
  background: white;
}

.grid > *:hover {
  box-shadow: 0 0 15px rgba(0, 60, 180, 0.2);
  transform: scale(1.02);
  transition: 0.1s;
}

.user-item .actions { display: flex; gap: .5rem; margin-top: .5rem; }
.danger { background: #c52828; color: #fff; border: 1px solid #a11; }
</style>

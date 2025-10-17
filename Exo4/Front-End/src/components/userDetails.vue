<template>
  <div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else-if="user">
      <h2>{{ user.name || user.email }}</h2>
      <p>Email : {{ user.email }}</p>

      <div v-if="isLoggedUser" class="badge">C'est moi</div>
      <div v-else>
        <button @click="contactUser">Contacter</button>
      </div>

      <button v-if="isLoggedUser" @click="editProfile">Modifier mon profil</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import api from '@/api/client'

const props = defineProps({
  userId: { type: [Number, String], required: false },
})

const route = useRoute()
const auth = useAuthStore()

const id = ref(props.userId ?? route.params.id)
watch(
  () => props.userId,
  (v) => {
    if (v != null) id.value = v
  }
)

const user = ref(null)
const error = ref('')

const isLoggedUser = computed(() => String(user.value?.id) === String(auth.user?.id))

async function load() {
  error.value = ''
  try {
    const data = await api.get(`/users/${id.value}`)
    user.value = data?.user || data
  } catch (error) {
    error.value = error.message || 'Utilisateur introuvable'
  }
}

onMounted(load)

function contactUser() {
  alert(`Contacter ${user.value.name || user.value.email}`)
}

function editProfile() {
  alert('Ouverture du formulaire de modification du profil !')
}
</script>

<style scoped>
.error { color: #c00 }
.badge { display: inline-block; padding: .25rem .5rem; background: #eef; border: 1px solid #99f; border-radius: 6px; }
</style>

<template>
  <div v-if="error" class="error">{{ error }}</div>

  <div v-else-if="user">
    <h2>{{ user.name }}</h2>
    <p>Email : {{ user.email }}</p>

    <div v-if="isLoggedUser" class="badge">C'est moi</div>
    <div v-else>
      <button @click="contactUser">Contacter</button>
    </div>

    <button v-if="isLoggedUser" @click="editProfile">Modifier mon profil</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUsersStore } from '@/stores/usersStore'
import { useUsers } from '@/composables/useUsers'

const props = defineProps({
  // Props pour l'ID du User
  userId: {
    type: Number,
    required: false,
  },
})

const route = useRoute()
const id = props.userId ?? Number(route.params.id) // Prends l'ID depuis les props ou la route

const store = useUsersStore()
const { getUserById } = useUsers()

const user = ref(null)
const error = ref(null)

const isLoggedUser = computed(() => user.value?.id === store.loggedUser?.id)

onMounted(() => {
  store.refresh()

  if (store.loggedUser && store.loggedUser.id === id) {
    user.value = store.loggedUser
  } else {
    const foundUser = getUserById(id)

    if (foundUser) {
      user.value = foundUser
    } else {
      error.value = 'Utilisateur introuvable'
    }
  }
})

function contactUser() {
  alert(`Contacter ${user.value.name}`)
}

function editProfile() {
  alert('Ouverture du formulaire de modification du profil !')
}
</script>

<style scoped></style>

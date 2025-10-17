<script setup>
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth = useAuthStore()

function logout() {
  auth.logout()
}
</script>

<template>
  <div id="app">
    <header class="topbar">
      <RouterLink to="/">Accueil</RouterLink>
      <span class="spacer" />
      <template v-if="auth.user">
        <span class="me">Connecté : {{ auth.user.name || auth.user.email }}</span>
        <button @click="logout">Se déconnecter</button>
      </template>
      <template v-else>
        <RouterLink to="/login">Se connecter</RouterLink>
      </template>
    </header>
    <main>
      <RouterView />
    </main>
  </div>
  
</template>

<style scoped>
.topbar { display: flex; align-items: center; gap: .75rem; padding: .75rem 1rem; border-bottom: 1px solid #eee; }
.spacer { flex: 1; }
.me { opacity: .8; }
main { padding: 1rem; }
</style>

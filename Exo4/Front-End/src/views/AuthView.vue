<template>
  <section class="auth">
    <h1>Connexion / Inscription</h1>

    <div class="tabs">
      <button :class="{ active: mode === 'login' }" @click="mode = 'login'">Connexion</button>
      <button :class="{ active: mode === 'register' }" @click="mode = 'register'">Inscription</button>
    </div>

    <form v-if="mode === 'login'" @submit.prevent="submitLogin">
      <label>Email
        <input v-model.trim="loginForm.email" type="email" required />
      </label>
      <label>Mot de passe
        <input v-model.trim="loginForm.password" type="password" required />
      </label>
      <div class="error" v-if="auth.error">{{ auth.error }}</div>
      <button :disabled="auth.loading" type="submit">Se connecter</button>
    </form>

    <form v-else @submit.prevent="submitRegister">
      <label>Nom
        <input v-model.trim="registerForm.name" type="text" />
      </label>
      <label>Email
        <input v-model.trim="registerForm.email" type="email" required />
      </label>
      <label>Mot de passe
        <input v-model.trim="registerForm.password" type="password" required />
      </label>
      <div class="error" v-if="auth.error">{{ auth.error }}</div>
      <button :disabled="auth.loading" type="submit">Créer le compte</button>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const auth = useAuthStore()

const mode = ref('login')
const loginForm = reactive({ email: '', password: '' })
const registerForm = reactive({ name: '', email: '', password: '' })

async function submitLogin() {
  auth.clearError()
  const ok = await auth.login({ email: loginForm.email, password: loginForm.password })
  if (ok) router.push('/')
}

async function submitRegister() {
  auth.clearError()
  try {
    await auth.register({ name: registerForm.name, email: registerForm.email, password: registerForm.password })
    router.push('/')
  } catch {
    // error already in store
  }
}
</script>

<style scoped>
.auth { max-width: 420px; margin: 2rem auto; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; }
.tabs { display: flex; gap: .5rem; margin-bottom: 1rem; }
.tabs button { padding: .5rem .75rem; border: 1px solid #ccc; background: #f7f7f7; cursor: pointer; }
.tabs button.active { background: #003cb4; color: white; border-color: #003cb4; }
form { display: grid; gap: .75rem; }
label { display: grid; gap: .25rem; font-size: .9rem; }
input { padding: .5rem; border-radius: 6px; border: 1px solid #ccc; }
.error { color: #c00; }
button[type="submit"] { padding: .5rem .75rem; }
</style>

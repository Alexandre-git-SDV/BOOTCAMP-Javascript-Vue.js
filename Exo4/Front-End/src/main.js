import { createApp } from 'vue'
import pinia from './pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)

app.use(pinia)
app.use(router)

// Restore session and preload /me
const auth = useAuthStore()
if (auth.token) {
	auth.fetchMe().catch(() => {})
}

app.mount('#app')

import { createRouter, createWebHistory } from 'vue-router'
import UsersList from '@/components/UsersList.vue'
import UserView from '@/views/userView.vue'
import AuthView from '@/views/AuthView.vue'
import { useAuthStore } from '@/stores/authStore'
import pinia from '@/pinia'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: AuthView },
    { path: '/', name: 'home', component: UsersList, meta: { requiresAuth: true } },
    { path: '/user/:id', name: 'user', component: UserView, meta: { requiresAuth: true } },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore(pinia)
  if (to.meta.requiresAuth && !auth.token) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  return true
})

export default router

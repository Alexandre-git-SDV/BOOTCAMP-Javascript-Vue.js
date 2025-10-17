import { createRouter, createWebHistory } from 'vue-router'
import UserView from '@/views/userView.vue'
import UsersList from '@/components/UsersList.vue'

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: UsersList },
    { path: '/user/:id', name: 'user', component: UserView },
  ],
})

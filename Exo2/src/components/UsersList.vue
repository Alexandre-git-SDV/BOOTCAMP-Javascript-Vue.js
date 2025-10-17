<template>
  <div class="users-list">
    <h1>Tous les utilisateurs</h1>
    <div class="grid">
      <UserDetails v-for="user in users" :key="user.id" :user-id="user.id" />
    </div>
  </div>
</template>

<script setup>
import { useUsers } from '@/composables/useUsers'
import UserDetails from './userDetails.vue'

const { users } = useUsers()
</script>

<style scoped>
.users-list {
  padding: 1.5rem;
  border: 1px solid #003cb4;
  border-radius: 8px;
  background: #f7fbff;
}

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
</style>

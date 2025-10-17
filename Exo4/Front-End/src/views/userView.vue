<script setup>
import UserDetails from '@/components/userDetails.vue'
</script>

<template>
  <section>
    <UserDetails :user-id="$route.params.id" />
  </section>
</template>

<style scoped></style>

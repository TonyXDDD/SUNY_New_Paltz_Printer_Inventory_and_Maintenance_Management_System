<script setup>
import Navbar from './components/Navbar.vue'
import { RouterView } from 'vue-router'
import { ref, onMounted } from 'vue'

const user = ref(null)

//load user info from local storage
onMounted(() => {
  const user_id = localStorage.getItem('user_id')
  const username = localStorage.getItem('username')
  if (user_id && username) {
    user.value = { user_id: parseInt(user_id), username }
  }
})
</script>

<template>
  <div>
    <Navbar />
    <RouterView :user="user" />
  </div>
</template>
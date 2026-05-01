<template>
  <div class="auth-container">
    <!-- dual page between login and register -->
    <h1>{{ isLogin ? "Login" : "Register" }}</h1>
    <!-- form formatting, same for login and register -->
    <div class="form">

      <input v-model="username" type="text" placeholder="Username" />

      <input v-model="password" type="password" placeholder="Password" />

      <!-- handles submit differently based on type of submission-->
      <button @click="handleSubmit">
        {{ isLogin ? "Login" : "Register" }}
      </button>

      <!-- switch logic between login and register -->
      <p class="switch">
        <span v-if="isLogin">
          Don't have an account?
          <a @click="isLogin = false">Register</a>
        </span>

        <span v-else>
          Already have an account?
          <a @click="isLogin = true">Login</a>
        </span>
      </p>

      <!-- login status message -->
      <p v-if="message" class="message">{{ message }}</p>

    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'

const isLogin = ref(true)

const username = ref('')
const password = ref('')
const message = ref('')

//handles login/registration information
async function handleSubmit() {
  if (!username.value || !password.value) {
    message.value = "Fill in all fields"
    return
  }

  try {
    const endpoint = isLogin.value ? 'login' : 'register'

    const res = await fetch(`http://localhost:3000/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    const data = await res.json()

    message.value = data.message

    if (isLogin.value && res.ok) {
      localStorage.setItem("user_id", data.user_id)
      localStorage.setItem("username", data.username)

      window.location.href = "/"
    }

  } catch (err) {
    message.value = "Server error"
  }
}
</script>

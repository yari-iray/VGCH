<script setup lang="ts">
import { ref } from 'vue'

const userNameOrEmail = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
    throw new Error("Method not implemented");

}
</script>

<template>
  <div class="login-container">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin" style="margin-bottom: 5%">
      <div class="form-group">
        <label>Username or Email</label>
        <input v-model="userNameOrEmail" type="text" placeholder="" required />
      </div>
      <div class="form-group">
        <label>Password</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit">Login</button>
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </form>

    <div>
      <a href="/login/forgot">Forgot your password</a>
    </div>
    <div>
      <a href="/sign-up">Create an account</a>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 800px;
  margin: 1rem auto;
  padding: 5rem;
  border: 2px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: inline-flex;
  margin-bottom: 0.5rem;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  background-color: #2d302d;
  border-radius: 4px;
}

button {
  background: #113608;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
}
</style>

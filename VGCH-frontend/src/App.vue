<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { ref } from 'vue'

const isLoggedIn = ref(false)
const router = useRouter()
const username = ref('JohnDoe')

const handleLogoClick = () => {
  router.push('/')
}

const handleSignOut = () => {
  isLoggedIn.value = false
  username.value = ''
  router.push('/')
}

const enableLogin = false
</script>

<template>
  <header class="main-header">
    <div class="header-content">
      <img
        alt="Vue logo"
        class="logo"
        src="@/assets/VGCH logo.svg"
        width="40"
        height="40"
        v-on:click="handleLogoClick"
      />
      <nav class="main-nav">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/visualizer" class="blue-background">Search</RouterLink>
        <RouterLink to="/submission">Submissions</RouterLink>
        <RouterLink to="/download">Downloads</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>

      <div v-if="enableLogin">
        <div class="auth-links">
          <div v-if="isLoggedIn" class="user-menu">
            <span class="username">{{ username }}</span>
            <button @click="handleSignOut" class="sign-out-button">Sign Out</button>
          </div>
          <div v-else class="guest-menu">
            <RouterLink to="/login">Login</RouterLink>
            <RouterLink to="/signup">Sign Up</RouterLink>
          </div>
        </div>
      </div>
    </div>
  </header>

  <div class="content-wrapper">
    <RouterView />
  </div>
</template>


<style>
:root {
  --color-background: #2C3239;
  --color-background-soft: #23272a;
  --color-background-mute: #222325;
  --color-border: #33383b;
  --color-border-hover: #444950;
  --color-heading: #fff;
  --color-text: #e0e0e0;
}

.blue-background {
    background-color: rgb(51, 51, 70);
    fill-opacity: 40%;
}

:deep(a.router-link-active) {
    color: blue;
}

a {
    color: #007bff;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

.background-box {
    background: #23272a;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    color: var(--color-text);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

a:visited,
.router-link-exact-active:visited,
.router-link-active:visited {
    color: #a259d9;
}



.form-group {
  width: 100%;
  margin-bottom: 1.5rem;
}

input.form-control,
textarea.form-control,
select.form-control {
  width: 100%;
  box-sizing: border-box;
  display: block;
  margin-top: 0.2rem;
  margin-bottom: 0.5rem;
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.5rem;
  transition: border-color 0.2s, background 0.2s;
}

input.form-control:focus,
textarea.form-control:focus,
select.form-control:focus {
  border-color: var(--color-border-hover);
  background: var(--color-background-mute);
  outline: none;
}
</style>

<style scoped>

.main-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  z-index: 1000;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  font-weight: 500;
  color: var(--color-heading);
}

.sign-out-button {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.sign-out-button:hover {
  background-color: var(--color-background-soft);
  border-color: var(--color-border-hover);
}

.guest-menu {
  display: flex;
  gap: 1.5rem;
}

.header-content {
  display: flex;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.auth-links {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.auth-links {
  display: flex;
  gap: 1.5rem;
  margin-left: auto; /* Pushes links to the right */
}

.logo {
  margin-right: 2rem;
}

.logo:hover {
  background-color: var(--color-background-soft);
  border-color: var(--color-border-hover);
}

nav {
  display: flex;
  gap: 1.5rem;
}

nav a {
  text-decoration: none;
  color: var(--color-text);
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

nav a:hover {
  background-color: var(--color-background-soft);
}

nav a.router-link-exact-active {
  color: var(--color-heading);
  background-color: var(--color-background-mute);
}

.content-wrapper {
  margin-top: 80px; /* Adjust based on header height */
  padding: 2rem;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    padding: 0.5rem;
  }

  .logo {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  nav {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }

  .content-wrapper {
    margin-top: 120px;
  }

  .main-nav,
  .auth-links {
    margin-left: 0;
    gap: 1rem;
  }

  .auth-links {
    margin-left: auto;
  }
}

@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .main-nav,
  .auth-links {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

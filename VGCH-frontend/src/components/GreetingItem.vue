<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div class="greetings">
    <h1 class="blue">{{ msg }}</h1>
    <h3>
      We aim to help you find your documentation in a quicker fashion from one central spot.
      There are several features available on the website.
    </h3>
  </div>
</template>

<style scoped>

:root {
  --color-background: #181a1b;
  --color-background-soft: #23272a;
  --color-background-mute: #222325;
  --color-border: #33383b;
  --color-border-hover: #444950;
  --color-heading: #fff;
  --color-text: #e0e0e0;
}

h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>

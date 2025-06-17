<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import GreetingItem from '../components/GreetingItem.vue'
</script>

<template>
  <main>
    <GreetingItem msg="Welcome to the VGCH ontology website!" />
    <TheWelcome />
  </main>
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
</style>

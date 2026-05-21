<script setup>
import { RouterView } from 'vue-router'
import { SpeedInsights } from '@vercel/speed-insights/vue'
</script>

<template>
  <div id="app">
    <RouterView />
    <SpeedInsights />
  </div>
</template>

<style scoped></style>

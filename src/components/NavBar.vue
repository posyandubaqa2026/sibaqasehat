<template>
  <div class="navbar-wrap">
    <header class="NavBar">
      <div class="NavBar-left">
        <button type="button" class="hamburger-btn" @click="emit('toggle-mobile-nav')" aria-label="Buka menu navigasi">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 5h14M3 10h14M3 15h14"
              stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>

        <div class="title-wrap">
          <h1 class="page-title">{{ currentPageTitle }}</h1>
          <span class="breadcrumb">Kelurahan Baqa &rsaquo; {{ currentPageTitle }}</span>
        </div>
      </div>

      <div class="NavBar-right">
        <div class="date-badge">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" stroke-width="1.2"/>
            <path d="M1 5.5h12M4.5 1v2M9.5 1v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          <span class="date-text">{{ today }}</span>
        </div>
      </div>
    </header>

    <nav class="nav-tabs" ref="tabsRef" aria-label="Filter posyandu">
      <button
        type="button"
        class="nav-tab"
        :class="{ active: activePosyandu === null }"
        :aria-current="activePosyandu === null ? 'page' : undefined"
        @click="navigateTo(null)"
      >
        Dashboard
      </button>

      <button
        v-for="p in posyanduList"
        :key="p.id"
        type="button"
        class="nav-tab"
        :class="{ active: activePosyandu === p.id }"
        :aria-current="activePosyandu === p.id ? 'page' : undefined"
        @click="navigateTo(p.id)"
      >
        {{ p.nama }}
      </button>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import '../assets/NavBar.css'

const props = defineProps({
  currentPageTitle: { type: String, required: true },
  today: { type: String, required: true },
  posyanduList: { type: Array, default: () => [] },
  activeTab: { type: [String, Number], default: null },
})

const emit = defineEmits(['navigate', 'toggle-mobile-nav'])

const activePosyandu = computed({
  get() {
    return props.activeTab
  },
  set(value) {
    emit('navigate', value)
  },
})

function navigateTo(posyanduId) {
  activePosyandu.value = posyanduId
}
</script>

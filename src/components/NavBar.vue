<template>
  <div class="navbar-wrap">
    <!-- Top Bar -->
    <header class="NavBar">
      <div class="NavBar-left">
        <!-- Hamburger: hanya muncul di tablet/mobile -->
        <button class="hamburger-btn" @click="emit('toggle-mobile-nav')" aria-label="Buka menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" stroke-width="1.2"/>
            <path d="M1 5.5h12M4.5 1v2M9.5 1v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          </svg>
          <span class="date-text">{{ today }}</span>
        </div>

        <div class="notif-btn" @click="showNotif = !showNotif" aria-label="Notifikasi">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2a5.5 5.5 0 00-5.5 5.5v3L2 12v1h14v-1l-1.5-1.5v-3A5.5 5.5 0 009 2z"
              stroke="currentColor" stroke-width="1.4"/>
            <path d="M7 13a2 2 0 004 0" stroke="currentColor" stroke-width="1.4"/>
          </svg>
          <span class="notif-dot" v-if="notifications.length"></span>
        </div>

        <!-- Notif Dropdown -->
        <div class="notif-dropdown" v-if="showNotif">
          <div class="notif-header">
            <span>Notifikasi</span>
            <button @click="showNotif = false">✕</button>
          </div>
          <div class="notif-item" v-for="n in notifications" :key="n.id">
            <span class="notif-dot-sm"></span>
            {{ n.msg }}
          </div>
          <div class="notif-empty" v-if="!notifications.length">Tidak ada notifikasi</div>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <nav class="nav-tabs" ref="tabsRef">
      <button
        class="nav-tab"
        :class="{ active: activePosyandu === null }"
        @click="navigateTo(null)"
      >
        Dashboard
      </button>
      <button
        v-for="p in posyanduList"
        :key="p.id"
        class="nav-tab"
        :class="{ active: activePosyandu === p.id }"
        @click="navigateTo(p.id)"
      >
        {{ p.nama }}
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue'
import '../assets/NavBar.CSS'

const props = defineProps({
  currentPageTitle: { type: String,           required: true },
  today:            { type: String,           required: true },
  notifications:    { type: Array,            default: () => [] },
  posyanduList:     { type: Array,            default: () => [] },
  activeTab:        { type: [String, null],   default: null },
})

const emit = defineEmits(['navigate', 'toggle-mobile-nav'])

const showNotif = ref(false)
const tabsRef   = ref(null)

const activePosyandu = computed({
  get() { return props.activeTab },
  set(value) { emit('navigate', value) },
})

function navigateTo(posyanduId) {
  activePosyandu.value = posyanduId
}
</script>

<template>
  <header class="NavBar">
    <div class="NavBar-left">
      <h1 class="page-title">{{ currentPageTitle }}</h1>
      <span class="breadcrumb">Kelurahan Baqa &rsaquo; {{ currentPageTitle }}</span>
    </div>
    <div class="NavBar-right">
      <div class="date-badge">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="2" width="12" height="11" rx="2" stroke="currentColor" stroke-width="1.2"/>
          <path d="M1 5.5h12M4.5 1v2M9.5 1v2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        {{ today }}
      </div>
      <div class="notif-btn" @click="showNotif = !showNotif">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M9 2a5.5 5.5 0 00-5.5 5.5v3L2 12v1h14v-1l-1.5-1.5v-3A5.5 5.5 0 009 2z"
            stroke="currentColor" stroke-width="1.4"/>
          <path d="M7 13a2 2 0 004 0" stroke="currentColor" stroke-width="1.4"/>
        </svg>
        <span class="notif-dot" v-if="notifications.length"></span>
      </div>
    </div>
  </header>

  <!-- Navigation Tabs -->
  <nav class="nav-tabs">
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
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  currentPageTitle: {
    type: String,
    required: true
  },
  today: {
    type: String,
    required: true
  },
  notifications: {
    type: Array,
    default: () => []
  },
  posyanduList: {
    type: Array,
    default: () => []
  },
  activeTab: {
    type: [String, null],
    default: null
  }
})

const emit = defineEmits(['navigate'])

const showNotif = ref(false)

const activePosyandu = computed({
  get() {
    return props.activeTab
  },
  set(value) {
    emit('navigate', value)
  }
})

const navigateTo = (posyanduId) => {
  activePosyandu.value = posyanduId
}
</script>

<style scoped>
/* NavBar */
.NavBar {
  height: 64px;
  background: #2F9D94;
  border-bottom: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  gap: 16px;
  flex-shrink: 0;
}
.NavBar-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.page-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}
.breadcrumb {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}
.NavBar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.date-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.notif-btn {
  position: relative;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: background 0.15s;
}
.notif-btn:hover { background: rgba(255, 255, 255, 0.2); }
.notif-dot {
  position: absolute;
  top: 6px; right: 6px;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #E55353;
  border: 2px solid #2F9D94;
}

/* Navigation Tabs */
.nav-tabs {
  background: #2F9D94;
  border-bottom: 1px solid #E2E8ED;
  display: flex;
  gap: 0;
  overflow-x: auto;
  padding: 0 24px;
  flex-wrap: nowrap;
}

.nav-tab {
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  border: none;
  background: none;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
  transition: all 0.15s;
  position: relative;
}

.nav-tab:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

.nav-tab.active {
  color: #ffffff;
  border-bottom-color: #ffffff;
}
</style>

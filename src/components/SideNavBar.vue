<template>
  <aside class="sidebar" :class="{ collapsed: collapsed }">
    <div class="sidebar-header">
      <div class="logo-wrap">
        <div class="logo-icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#2F9D94"/>
            <path d="M14 6v16M6 14h16" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="14" cy="14" r="4" fill="#063154" opacity="0.5"/>
          </svg>
        </div>
        <div v-if="!collapsed" class="logo-text">
          <span class="logo-name">SiBaqaSehat</span>
          <span class="logo-sub">Kel. Baqa, Samarinda</span>
        </div>
      </div>
      <button class="collapse-btn" @click="emit('toggle-collapse')">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path :d="collapsed ? 'M6 3l5 5-5 5' : 'M10 3L5 8l5 5'"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <nav class="sidebar-nav">
      <div class="nav-group">
        <span v-if="!collapsed" class="nav-label">Menu Utama</span>
        <a
          v-for="item in navItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: activeNav === item.id }"
          @click="emit('navigate', item.id)"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span v-if="!collapsed" class="nav-text">{{ item.label }}</span>
          <span v-if="!collapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
        </a>
      </div>

      <div class="nav-group">
        <span v-if="!collapsed" class="nav-label">Laporan</span>
        <a
          v-for="item in reportItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: activeNav === item.id }"
          @click="emit('navigate', item.id)"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span v-if="!collapsed" class="nav-text">{{ item.label }}</span>
        </a>
      </div>
    </nav>

    <div class="sidebar-footer" v-if="!collapsed">
      <div class="user-card">
        <div class="user-avatar">{{ userInitials }}</div>
        <div class="user-info">
          <span class="user-name">{{ currentUser.nama }}</span>
          <span class="user-role">{{ roleLabel }}</span>
        </div>
        <button class="logout-btn" @click="emit('logout')" title="Keluar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  },
  activeNav: {
    type: String,
    default: 'dashboard'
  },
  currentUser: {
    type: Object,
    required: true
  },
  userInitials: {
    type: String,
    required: true
  },
  roleLabel: {
    type: String,
    required: true
  },
  navItems: {
    type: Array,
    required: true
  },
  reportItems: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['toggle-collapse', 'navigate', 'logout'])
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-width: 240px;
  background: #063154;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease, min-width 0.25s ease;
  overflow: hidden;
  position: relative;
  z-index: 10;
}
.sidebar.collapsed {
  width: 68px;
  min-width: 68px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}
.logo-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.logo-name {
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
}
.logo-sub {
  font-size: 10px;
  color: #BCC5CC;
  white-space: nowrap;
}
.collapse-btn {
  background: none;
  border: none;
  color: #BCC5CC;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  flex-shrink: 0;
  transition: background 0.15s;
}
.collapse-btn:hover { background: rgba(255,255,255,0.1); }

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  overflow-y: auto;
  overflow-x: hidden;
}
.nav-group { margin-bottom: 24px; }
.nav-label {
  display: block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: #BCC5CC;
  opacity: 0.6;
  padding: 0 8px 6px;
  white-space: nowrap;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  cursor: pointer;
  color: rgba(255,255,255,0.65);
  font-size: 13px;
  transition: all 0.15s;
  white-space: nowrap;
  text-decoration: none;
  position: relative;
}
.nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
.nav-item.active {
  background: #2F9D94;
  color: #fff;
}
.nav-icon { flex-shrink: 0; display: flex; align-items: center; }
.nav-text { flex: 1; overflow: hidden; text-overflow: ellipsis; }
.nav-badge {
  background: #2F9D94;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: 20px;
  flex-shrink: 0;
}
.nav-item.active .nav-badge { background: rgba(255,255,255,0.25); }

.sidebar-footer {
  padding: 12px 10px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  background: rgba(255,255,255,0.06);
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #2F9D94;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.user-name {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-role {
  font-size: 10px;
  color: #BCC5CC;
}
.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #BCC5CC;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.15s;
}
.logout-btn:hover { color: #fff; }
</style>

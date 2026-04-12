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
      <!-- Collapse button: hanya tampil di desktop -->
      <button class="collapse-btn" @click="emit('toggle-collapse')" aria-label="Toggle sidebar">
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
          :title="collapsed ? item.label : ''"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span v-if="!collapsed" class="nav-text">{{ item.label }}</span>
          <span v-if="!collapsed && item.badge" class="nav-badge">{{ item.badge }}</span>
          <!-- Tooltip saat collapsed -->
          <span v-if="collapsed" class="nav-tooltip">{{ item.label }}</span>
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
          :title="collapsed ? item.label : ''"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span v-if="!collapsed" class="nav-text">{{ item.label }}</span>
          <span v-if="collapsed" class="nav-tooltip">{{ item.label }}</span>
        </a>
      </div>
    </nav>

    <div class="sidebar-footer">
      <!-- Expanded: full user card -->
      <div class="user-card" v-if="!collapsed">
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
      <!-- Collapsed: hanya avatar + logout -->
      <div class="user-card-collapsed" v-else>
        <div class="user-avatar" :title="currentUser.nama">{{ userInitials }}</div>
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
import '../assets/SideNavBar.css'

defineProps({
  collapsed:    { type: Boolean, default: false },
  activeNav:    { type: String,  default: 'dashboard' },
  currentUser:  { type: Object,  required: true },
  userInitials: { type: String,  required: true },
  roleLabel:    { type: String,  required: true },
  navItems:     { type: Array,   required: true },
  reportItems:  { type: Array,   required: true },
})

const emit = defineEmits(['toggle-collapse', 'navigate', 'logout'])
</script>

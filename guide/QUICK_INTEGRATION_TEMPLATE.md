# Quick Integration Template - How to Add Session Management to Other Pages

## For: HasilPenimbangan.vue, KlasifikasiBalita.vue, LaporanBulanan.vue

### STEP 1: Import Required Modules

Add these imports at the top of `<script setup>`:

```javascript
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useSessionStore } from '@/stores/sessionStore'
import { supabase } from '@/lib/supabase'
```

### STEP 2: Initialize Session Store

```javascript
// ── Stores ─────────────────────────────────────
const sessionStore = useSessionStore()
```

### STEP 3: Add Password Gate State Variables

Copy-paste this section into your component:

```javascript
// ─────────────────────────────────────────────────────
// PASSWORD GATE STATE
// Menggunakan session store untuk unlock state
// ─────────────────────────────────────────────────────
const pwInput     = ref('')
const showPw      = ref(false)
const pwError     = ref('')
const pwLoading   = ref(false)
const pwInputRef  = ref(null)
const showSessionExpiredModal = ref(false)

const isUnlocked = computed(() => {
  return sessionStore.isSessionUnlocked(props.activePosyanduId)
})

// Watch session expired dari store
watch(() => sessionStore.sessionExpiredPosyanduId, (expiredId) => {
  if (expiredId === props.activePosyanduId) {
    showSessionExpiredModal.value = true
    // ❗ CLEAR YOUR PAGE DATA HERE (replace dengan nama variable data Anda)
    // Contoh:
    // hasilList.value = []
    // grafikData.value = null
  }
})

// Reset password input setiap ganti posyandu
watch(() => props.activePosyanduId, () => {
  pwInput.value = ''
  pwError.value = ''
  showPw.value  = false
  
  if (!isUnlocked.value) {
    nextTick(() => pwInputRef.value?.focus())
  } else {
    // ❗ FETCH DATA HERE (ganti dengan nama function Anda)
    // fetchHasilPenimbangan()
  }
})
```

### STEP 4: Add Password Submission Function

```javascript
async function submitPassword() {
  if (!pwInput.value.trim()) {
    pwError.value = 'Password tidak boleh kosong'
    return
  }
  
  pwLoading.value = true
  pwError.value   = ''
  
  try {
    const posyanduKey = props.posyanduKeyMap[props.activePosyanduId]
    if (!posyanduKey) throw new Error('Posyandu tidak dikenali')

    const isValid = await sessionStore.unlockSession(
      props.activePosyanduId,
      posyanduKey,
      pwInput.value
    )

    if (isValid) {
      pwInput.value = ''
      // ❗ FETCH DATA HERE
      // fetchHasilPenimbangan()
      showToast('Akses diberikan selama 30 menit', 'success')
    } else {
      pwError.value = 'Password salah. Silakan coba lagi.'
      pwInput.value = ''
      nextTick(() => pwInputRef.value?.focus())
    }
  } catch (err) {
    console.error('[submitPassword] Error:', err.message)
    pwError.value = err.message || 'Gagal memverifikasi password. Coba lagi.'
  } finally {
    pwLoading.value = false
  }
}
```

### STEP 5: Add Lock & Modal Functions

```javascript
function lockPage() {
  if (props.activePosyanduId) {
    sessionStore.lockSession(props.activePosyanduId)
    // ❗ CLEAR DATA HERE
    // hasilList.value = []
  }
}

function closeSessionExpiredModal() {
  showSessionExpiredModal.value = false
  sessionStore.resetSessionExpired()
}
```

### STEP 6: Add Lifecycle Hooks

```javascript
onMounted(() => {
  // Component mounted
})

onBeforeUnmount(() => {
  // Cleanup - jangan lock session, biarkan tetap aktif
})
```

### STEP 7: Copy Password Gate Template

Copy dari [DataBalita.vue](DataBalita.vue) line 26-74 (PASSWORD GATE section) ke template Anda.

Paste sebelum main content section.

### STEP 8: Copy Session Expired Modal Template

Copy dari [DataBalita.vue](DataBalita.vue) line 360-390 (MODAL SESSION EXPIRED section).

Paste di bagian teleport Anda.

### STEP 9: Update Main Content Conditional

Wrap content Anda dengan:

```vue
<div v-if="activePosyanduId !== null && isUnlocked" class="page-content">
  <!-- Your existing content here -->
</div>
```

### STEP 10: Update Toolbar Lock Button

Make sure ada button untuk lock page:

```vue
<button class="btn-lock" @click="lockPage" title="Kunci halaman">
  <!-- lock icon -->
</button>
```

---

## Complete Example: HasilPenimbangan.vue

```vue
<template>
  <div class="hasil-penimbangan-wrap">
    
    <!-- Dashboard tab (pilih posyandu) -->
    <div v-if="activePosyanduId === null" class="no-posyandu-selected">
      <!-- ... pilih posyandu UI ... -->
    </div>

    <!-- PASSWORD GATE (copy dari DataBalita) -->
    <transition name="fade" mode="out-in">
      <div v-if="activePosyanduId !== null && !isUnlocked" class="password-gate" key="gate">
        <!-- ... copy password gate HTML dari DataBalita ... -->
      </div>
    </transition>

    <!-- HASIL PENIMBANGAN PAGE -->
    <transition name="fade" mode="out-in">
      <div v-if="activePosyanduId !== null && isUnlocked" class="hasil-page" key="page">
        
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="toolbar-left">
            <span class="toolbar-posyandu">{{ activePosyanduNama }}</span>
            <span class="toolbar-count">{{ hasilList.length }} hasil penimbangan</span>
          </div>
          <div class="toolbar-right">
            <!-- buttons -->
            <button class="btn-lock" @click="lockPage">Lock</button>
          </div>
        </div>

        <!-- Content -->
        <div v-if="hasilList.length > 0" class="content">
          <!-- Your existing content -->
        </div>

        <div v-else class="empty-state">
          Tidak ada data
        </div>
      </div>
    </transition>

    <!-- SESSION EXPIRED MODAL (copy dari DataBalita) -->
    <teleport to="body">
      <transition name="modal-fade">
        <div class="modal-overlay" v-if="showSessionExpiredModal" @click.self="closeSessionExpiredModal">
          <!-- ... copy modal HTML dari DataBalita ... -->
        </div>
      </transition>
    </teleport>

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useSessionStore } from '@/stores/sessionStore'
import { supabase } from '@/lib/supabase'

const sessionStore = useSessionStore()

const props = defineProps({
  activePosyanduId: { type: [String, null], default: null },
  activePosyanduNama: { type: String, default: '' },
  posyanduKeyMap: { type: Object, default: () => ({}) },
  posyanduTableMap: { type: Object, default: () => ({}) }
})

// Password gate states
const pwInput = ref('')
const showPw = ref(false)
const pwError = ref('')
const pwLoading = ref(false)
const pwInputRef = ref(null)
const showSessionExpiredModal = ref(false)

// Page data
const hasilList = ref([])
const loading = ref(false)

// Computed & watchers (from STEP 3)
const isUnlocked = computed(() => {
  return sessionStore.isSessionUnlocked(props.activePosyanduId)
})

watch(() => sessionStore.sessionExpiredPosyanduId, (expiredId) => {
  if (expiredId === props.activePosyanduId) {
    showSessionExpiredModal.value = true
    hasilList.value = []
  }
})

watch(() => props.activePosyanduId, () => {
  pwInput.value = ''
  pwError.value = ''
  showPw.value = false
  
  if (!isUnlocked.value) {
    nextTick(() => pwInputRef.value?.focus())
  } else {
    fetchHasil()
  }
})

// Functions (from STEP 4-5)
async function submitPassword() {
  // ... copy from STEP 4 ...
}

function lockPage() {
  // ... copy from STEP 5 ...
}

function closeSessionExpiredModal() {
  // ... copy from STEP 5 ...
}

// Your page specific functions
async function fetchHasil() {
  loading.value = true
  try {
    // Fetch your data
  } finally {
    loading.value = false
  }
}

// Toast helper
function showToast(msg, type = 'success') {
  // Your existing toast function
}
</script>
```

---

## Checklist Implementasi

- [ ] Import modules (sessionStore, supabase)
- [ ] Initialize sessionStore
- [ ] Add password gate state variables
- [ ] Add password submission function
- [ ] Add lock & modal close functions
- [ ] Add lifecycle hooks
- [ ] Copy password gate template
- [ ] Copy session expired modal template
- [ ] Wrap content dengan `v-if="isUnlocked"`
- [ ] Test password gate
- [ ] Test session timeout (ubah SESSION_DURATION untuk test cepat)
- [ ] Test cross-page navigation

---

## Common Mistakes & Solutions

### ❌ "isUnlocked is not defined"
**Cause:** Forgot to add computed in script
**Solution:** Copy the `const isUnlocked = computed(...)` from STEP 3

### ❌ "sessionStore is not defined"
**Cause:** Forgot to import useSessionStore
**Solution:** Add `import { useSessionStore } from '@/stores/sessionStore'`

### ❌ "Session not persisting when switching pages"
**Cause:** Component clearing data on mount
**Solution:** Don't clear data when `isUnlocked` is already true

### ❌ "Timeout not triggering"
**Cause:** Session duration too short or activity keeps resetting
**Solution:** Check sessionManager.js SESSION_DURATION constant

### ❌ "Modal not showing when session expires"
**Cause:** Modal conditional wrong or watch not triggered
**Solution:** Check `showSessionExpiredModal.value = true` in watch

---

## Testing Session Timeout Locally

To test 30-minute timeout quickly during development:

1. Edit `src/lib/sessionManager.js`
2. Change this line:
   ```javascript
   const SESSION_DURATION = 30 * 60 * 1000 // 30 menit
   ```
   To:
   ```javascript
   const SESSION_DURATION = 2 * 60 * 1000 // 2 menit untuk testing
   ```
3. Test the flow
4. Change back to 30 menit for production

---

## Need Help?

Refer to these files for complete working examples:
- [DataBalita.vue](DataBalita.vue) - Complete implementation
- [SESSION_ARCHITECTURE.md](SESSION_ARCHITECTURE.md) - System diagram & flowchart
- [SESSION_INTEGRATION_GUIDE.md](SESSION_INTEGRATION_GUIDE.md) - Detailed documentation

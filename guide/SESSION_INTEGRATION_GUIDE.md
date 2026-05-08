# Session Management Integration Guide

## Overview
Sistem session management ini memungkinkan user untuk tetap login di posyandu tanpa perlu memasukkan password lagi saat berpindah halaman, dengan automatic timeout 30 menit idle.

## File-file yang dibuat/diubah

### 1. **sessionManager.js** (`src/lib/sessionManager.js`)
Utility untuk mengelola session logic:
- `verifyPassword()` - Verify password via Supabase RPC
- `sessionState` - Singleton untuk tracking session per posyandu
- `formatTimeLeft()` - Format waktu untuk ditampilkan
- `isSessionExpiringSoon()` - Check apakah session segera habis

### 2. **sessionStore.js** (`src/stores/sessionStore.js`)
Pinia store yang manage global session state:
- `unlockSession()` - Unlock session dengan password
- `lockSession()` - Manual lock session
- `handleSessionExpired()` - Handle automatic session expiration
- `isSessionUnlocked()` - Check apakah session active

### 3. **useSessionManagement.js** (`src/composables/useSessionManagement.js`)
Composable untuk memudahkan penggunaan di component:
- `isCurrentSessionUnlocked()` - Check session status
- `unlockCurrentSession()` - Unlock session
- `lockCurrentSession()` - Lock session
- `getTimeLeftInSeconds()` - Get sisa waktu

## Cara Menggunakan di Halaman Lain

### Langkah 1: Import yang diperlukan
```javascript
import { useSessionStore } from '@/stores/sessionStore'
import { useSessionManagement } from '@/composables/useSessionManagement'
```

### Langkah 2: Setup di script
```javascript
const sessionStore = useSessionStore()
const { isCurrentSessionUnlocked, unlockCurrentSession, lockCurrentSession } 
  = useSessionManagement()

// State untuk password gate
const pwInput = ref('')
const showPw = ref(false)
const pwError = ref('')
const pwLoading = ref(false)
const pwInputRef = ref(null)
const showSessionExpiredModal = ref(false)

// Computed untuk check unlock status
const isUnlocked = computed(() => {
  return isCurrentSessionUnlocked(props.activePosyanduId)
})

// Watch untuk session expired
watch(() => sessionStore.sessionExpiredPosyanduId, (expiredId) => {
  if (expiredId === props.activePosyanduId) {
    showSessionExpiredModal.value = true
    // Clear data halaman
  }
})

// Function untuk submit password
async function submitPassword() {
  if (!pwInput.value.trim()) {
    pwError.value = 'Password tidak boleh kosong'
    return
  }
  
  pwLoading.value = true
  pwError.value = ''
  
  try {
    const posyanduKey = props.posyanduKeyMap[props.activePosyanduId]
    if (!posyanduKey) throw new Error('Posyandu tidak dikenali')

    const isValid = await unlockCurrentSession(
      props.activePosyanduId,
      posyanduKey,
      pwInput.value
    )

    if (isValid) {
      pwInput.value = ''
      // Fetch data halaman
      showToast('Akses diberikan selama 30 menit', 'success')
    } else {
      pwError.value = 'Password salah. Silakan coba lagi.'
      pwInput.value = ''
      nextTick(() => pwInputRef.value?.focus())
    }
  } catch (err) {
    pwError.value = err.message || 'Gagal memverifikasi password'
  } finally {
    pwLoading.value = false
  }
}

// Function untuk lock page
function lockPage() {
  if (props.activePosyanduId) {
    lockCurrentSession(props.activePosyanduId)
    // Clear data
  }
}

// Function untuk close modal expired
function closeSessionExpiredModal() {
  showSessionExpiredModal.value = false
  sessionStore.resetSessionExpired()
}
```

### Langkah 3: Template
Gunakan template yang sama dengan DataBalita.vue, atau copy structure-nya:

```vue
<!-- Password Gate -->
<div v-if="activePosyanduId !== null && !isUnlocked" class="password-gate">
  <!-- ... password form ... -->
</div>

<!-- Content setelah unlock -->
<div v-if="activePosyanduId !== null && isUnlocked" class="page-content">
  <!-- ... content halaman ... -->
</div>

<!-- Modal Session Expired -->
<teleport to="body">
  <transition name="modal-fade">
    <div class="modal-overlay" v-if="showSessionExpiredModal" @click.self="closeSessionExpiredModal">
      <!-- ... modal content ... -->
    </div>
  </transition>
</teleport>
```

## Fitur-fitur

### Session Timeout
- Duration: 30 menit
- Automatic lock saat timeout
- Modal notification saat session expired

### Activity Detection
Timeout akan direset otomatis saat user melakukan:
- Click (klik apapun di halaman)
- Keydown (tekan tombol keyboard)
- Mousemove (gerak mouse)
- Scroll (scroll halaman)
- Touchstart (tap di mobile)

Perhatian: Activity detection di-debounce setiap 5 detik untuk menghindari overhead.

### Session Persistence
- Session hanya valid di component yang sama
- Saat user pindah ke halaman lain (misal: Data Balita → Hasil Penimbangan), session tetap aktif
- Saat user ganti posyandu, password gate akan muncul lagi

### Warning Before Expiry (Optional)
Jika ingin tambah warning saat session akan habis (< 5 menit):

```javascript
const showExpiryWarning = computed(() => {
  return isUnlocked.value && isSessionExpiringSoon(props.activePosyanduId)
})
```

## Contoh Integrasi Lengkap

Lihat file `DataBalita.vue` untuk contoh implementasi yang sudah complete.

## Tips & Best Practices

1. **Jangan lock session saat component unmount**
   - Biarkan session tetap aktif saat user berpindah halaman
   - Session akan otomatis expire setelah 30 menit idle

2. **Clear data saat session expired**
   - Pastikan data halaman di-clear saat `sessionExpiredPosyanduId` berubah
   - Contoh: `balitaList.value = []`

3. **Show loading indicator**
   - Saat unlock sedang proses, bisa show loading spinner
   - User jangan bisa submit password berkali-kali

4. **Handle error dengan baik**
   - Show error message di UI, tidak hanya di console
   - Fokus kembali ke password input field

5. **Test timeout**
   - Untuk development, bisa ubah `SESSION_DURATION` di `sessionManager.js`
   - Misal: `const SESSION_DURATION = 2 * 60 * 1000` untuk 2 menit

## Troubleshooting

### Session tidak auto-lock
- Check apakah activity listener sudah setup
- Verify di browser console: `sessionState.sessions`

### Password tidak diverifikasi
- Check Supabase RPC function `verify_posyandu_password` sudah ada
- Verify `posyanduKeyMap` dan `posyanduTableMap` sudah benar

### Session expired tidak ter-trigger
- Check watch function di component
- Verify toast notification muncul

## File Referensi
- `DataBalita.vue` - Complete example
- `sessionManager.js` - Core logic
- `sessionStore.js` - Pinia store
- `useSessionManagement.js` - Composable helper

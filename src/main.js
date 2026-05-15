import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.config.devtools = false

// Inisialisasi session sebelum mount
const authStore = useAuthStore()

authStore.listenAuthChanges() // listen perubahan auth realtime
authStore.initSession() // cek sesi aktif

app.mount('#app')

// Fix back/forward cache: Cleanup listeners before unload
window.addEventListener('beforeunload', () => {
  authStore.stopListening?.()
})

// Enable faster reconnection on back/forward navigation
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Page was restored from bfcache, reinitialize auth
    authStore.initSession()
  }
})

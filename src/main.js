import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Inisialisasi session sebelum mount
const authStore = useAuthStore()

authStore.listenAuthChanges() // listen perubahan auth realtime
authStore.initSession() // cek sesi aktif

app.mount('#app')

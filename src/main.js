import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

app.config.devtools = false

app.mount('#app')

function runAfterFirstPaint(callback) {
  if (typeof window === 'undefined') return

  window.requestAnimationFrame(() => {
    window.setTimeout(callback, 0)
  })
}

runAfterFirstPaint(async () => {
  const { useAuthStore } = await import('./stores/authStore')
  const authStore = useAuthStore()

  authStore.listenAuthChanges()
  authStore.initSession()

  window.addEventListener('pagehide', () => {
    authStore.stopListening?.()
  })

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      authStore.initSession()
    }
  })
})

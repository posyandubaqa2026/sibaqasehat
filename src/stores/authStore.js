import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  // ─── State ───
  const user = ref(null)
  const profile = ref(null)
  const isLoading = ref(false)
  const errorMessage = ref('')

  // ─── Getters ───
  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isKader = computed(() => profile.value?.role === 'kader')
  const posyanduId = computed(() => profile.value?.posyandu_id ?? null)

  // ─── Actions ───

  const login = async (email, password) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      user.value = data.user
      // await fetchProfile(data.user.id)

      return { success: true }
    } catch (error) {
      errorMessage.value = mapErrorMessage(error.message)
      return { success: false, message: errorMessage.value }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    isLoading.value = true

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Logout error:', error.message)
    } finally {
      user.value = null
      profile.value = null
      isLoading.value = false
    }
  }

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, posyandu_id, posyandu:posyandu_id(nama)')
        .eq('id', userId)
        .single()

      if (error) throw error

      profile.value = data
    } catch (error) {
      console.error('Fetch profile error:', error.message)
    }
  }

  const initSession = async () => {
    isLoading.value = true

    try {
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        user.value = data.session.user
        // await fetchProfile(data.session.user.id)
      }
    } catch (error) {
      console.error('Init session error:', error.message)
    } finally {
      isLoading.value = false
    }
  }

  const listenAuthChanges = () => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        user.value = session.user
        // await fetchProfile(session.user.id)
      }

      if (event === 'SIGNED_OUT') {
        user.value = null
        profile.value = null
      }

      if (event === 'TOKEN_REFRESHED' && session) {
        user.value = session.user
      }
    })
  }

  const mapErrorMessage = (message) => {
    const map = {
      'Invalid login credentials': 'Email atau password salah.',
      'Email not confirmed': 'Email belum dikonfirmasi. Cek inbox kamu.',
      'User not found': 'Akun tidak ditemukan.',
      'Too many requests': 'Terlalu banyak percobaan. Coba lagi beberapa saat.',
    }
    return map[message] ?? 'Terjadi kesalahan. Silakan coba lagi.'
  }

  return {
    user,
    profile,
    isLoading,
    errorMessage,
    isLoggedIn,
    isAdmin,
    isKader,
    posyanduId,
    login,
    logout,
    fetchProfile,
    initSession,
    listenAuthChanges,
  }
})

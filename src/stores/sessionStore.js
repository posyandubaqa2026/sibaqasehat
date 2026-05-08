/**
 * Session Store - Pinia store untuk mengelola session state posyandu
 * Dapat digunakan di semua halaman (DataBalita, HasilPenimbangan, dll)
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  verifyPassword,
  sessionState,
  formatTimeLeft,
} from '../lib/sessionManager'

export const useSessionStore = defineStore('session', () => {
  // ── State ──
  const unlockedPosyanduIds = ref(new Set()) // Set of unlocked posyandu IDs
  const sessionExpiredPosyanduId = ref(null) // ID posyandu yang session-nya expired
  const timeLeftDisplay = ref('') // Untuk menampilkan countdown timer

  let countdownInterval = null

  // ── Getters ──
  const isSessionUnlocked = (posyanduId) => {
    return unlockedPosyanduIds.value.has(posyanduId)
  }

  const getSessionTimeLeft = (posyanduId) => {
    return sessionState.getSessionTimeLeft(posyanduId)
  }

  // ── Actions ──

  /**
   * Verify password dan buka session posyandu
   */
async function unlockSession(posyanduId, posyanduKey, password) {
  try {
    const isValid = await verifyPassword(posyanduKey, password)

    if (isValid) {
      // Lock semua posyandu lain dulu sebelum unlock yang baru
      unlockedPosyanduIds.value.forEach(id => {
        if (id !== posyanduId) {
          sessionState.clearSession(id)
          unlockedPosyanduIds.value.delete(id)
        }
      })

      unlockedPosyanduIds.value.add(posyanduId)
      sessionState.startSession(posyanduId, () => {
        handleSessionExpired(posyanduId)
      })
      startCountdownTimer(posyanduId)

      return true
    }

    return false
  } catch (error) {
    console.error('[unlockSession] Error:', error)
    throw error
  }
}

  /**
   * Lock session (manual lock oleh user)
   */
  function lockSession(posyanduId) {
    unlockedPosyanduIds.value.delete(posyanduId)
    sessionState.clearSession(posyanduId)
    sessionExpiredPosyanduId.value = null
    stopCountdownTimer()
  }

  /**
   * Handle session expired (automatic)
   */
  function handleSessionExpired(posyanduId) {
    unlockedPosyanduIds.value.delete(posyanduId)
    sessionExpiredPosyanduId.value = posyanduId
    stopCountdownTimer()
  }

  /**
   * Reset session expired state (setelah user lihat notif)
  */
 function resetSessionExpired() {
   sessionExpiredPosyanduId.value = null
  }

  /**
   * Start countdown timer untuk menampilkan sisa waktu
   */
  function startCountdownTimer(posyanduId) {
    stopCountdownTimer()

    countdownInterval = setInterval(() => {
      const timeLeft = sessionState.getSessionTimeLeft(posyanduId)

      if (timeLeft <= 0) {
        stopCountdownTimer()
        return
      }

      timeLeftDisplay.value = formatTimeLeft(timeLeft)
    }, 1000)
  }

  /**
   * Stop countdown timer
   */
  function stopCountdownTimer() {
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
    timeLeftDisplay.value = ''
  }

  /**
   * Cleanup semua session saat logout
   */
  function clearAllSessions() {
    unlockedPosyanduIds.value.clear()
    sessionState.clearAllSessions()
    stopCountdownTimer()
    sessionExpiredPosyanduId.value = null
  }

  return {
    // State
    unlockedPosyanduIds,
    sessionExpiredPosyanduId,
    timeLeftDisplay,

    // Getters
    isSessionUnlocked,
    getSessionTimeLeft,

    // Actions
    unlockSession,
    lockSession,
    handleSessionExpired,
    resetSessionExpired,
    startCountdownTimer,
    stopCountdownTimer,
    clearAllSessions,
  }
})

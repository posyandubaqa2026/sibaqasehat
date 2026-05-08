import { useSessionStore } from '../stores/sessionStore'
import { isSessionExpiringSoon } from '../lib/sessionManager'

export function useSessionManagement() {
  const sessionStore = useSessionStore()

  /**
   * Check apakah current posyandu session unlocked
   */
  function isCurrentSessionUnlocked(posyanduId) {
    return sessionStore.isSessionUnlocked(posyanduId)
  }

  /**
   * Unlock session dengan password
   */
  async function unlockCurrentSession(posyanduId, posyanduKey, password) {
    try {
      const success = await sessionStore.unlockSession(
        posyanduId,
        posyanduKey,
        password
      )
      return success
    } catch (error) {
      console.error('[useSessionManagement] Unlock error:', error)
      throw error
    }
  }

  /**
   * Lock session secara manual
   */
  function lockCurrentSession(posyanduId) {
    sessionStore.lockSession(posyanduId)
  }

  /**
   * Get sisa waktu session (dalam millisecond)
   */
  function getTimeLeftInSeconds(posyanduId) {
    const ms = sessionStore.getSessionTimeLeft(posyanduId)
    return Math.floor(ms / 1000)
  }

  /**
   * Check apakah session akan segera habis (< 5 menit)
   */
  function isExpiringWarning(posyanduId) {
    return isSessionExpiringSoon(posyanduId)
  }

  return {
    isCurrentSessionUnlocked,
    unlockCurrentSession,
    lockCurrentSession,
    getTimeLeftInSeconds,
    isExpiringWarning,
    sessionStore,
  }
}

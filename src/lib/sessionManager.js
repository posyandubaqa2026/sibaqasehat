import { supabase } from './supabase'

const SESSION_DURATION = 30 * 60 * 1000 // 30 menit dalam millisecond
const ACTIVITY_EVENTS = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart']

/**
 * Verify posyandu password via Supabase RPC
 * @param {string} posyanduKey - Kunci posyandu (dari posyanduKeyMap)
 * @param {string} password - Password yang diinput user
 * @returns {Promise<boolean>} true jika password benar
 */
export async function verifyPassword(posyanduKey, password) {
  if (!posyanduKey) throw new Error('Posyandu key tidak ditemukan')
  if (!password?.trim()) throw new Error('Password tidak boleh kosong')

  const { data, error } = await supabase.rpc('verify_posyandu_password', {
    p_posyandu_key: posyanduKey,
    p_password: password,
  })

  if (error) {
    console.error('[verifyPassword] RPC Error:', error)
    throw new Error(`Gagal verifikasi: ${error.message}`)
  }

  return data === true
}

/**
 * Session State - menyimpan state session per posyandu
 * Format: { [posyanduId]: { unlockedAt, lastActivityAt, timeoutId } }
 */
class SessionState {
  constructor() {
    this.sessions = {}
    this.activityListener = null
  }

  /**
   * Mulai session baru untuk posyandu
   */
  startSession(posyanduId, onExpire) {
    if (this.sessions[posyanduId]) {
      this.clearTimeout(posyanduId)
    }

    const now = Date.now()
    this.sessions[posyanduId] = {
      posyanduId,
      unlockedAt: now,
      lastActivityAt: now,
      onExpire,
      timeoutId: null,
    }

    // Set timeout untuk session ini
    this._setSessionTimeout(posyanduId)

    // Mulai listen activity events
    this._setupActivityListener()
  }

  /**
   * Update last activity time dan reset timeout
   */
  updateActivity(posyanduId) {
    if (this.sessions[posyanduId]) {
      this.sessions[posyanduId].lastActivityAt = Date.now()
      this._setSessionTimeout(posyanduId)
    }
  }

  /**
   * Check apakah session masih valid
   */
  isSessionValid(posyanduId) {
    const session = this.sessions[posyanduId]
    if (!session) return false

    const elapsed = Date.now() - session.lastActivityAt
    return elapsed < SESSION_DURATION
  }

  /**
   * Get sisa waktu session (dalam millisecond)
   */
  getSessionTimeLeft(posyanduId) {
    const session = this.sessions[posyanduId]
    if (!session) return 0

    const elapsed = Date.now() - session.lastActivityAt
    const remaining = Math.max(0, SESSION_DURATION - elapsed)
    return remaining
  }

  /**
   * Lock / expire session
   */
  expireSession(posyanduId) {
    const session = this.sessions[posyanduId]
    if (session) {
      this.clearTimeout(posyanduId)
      if (session.onExpire) {
        session.onExpire()
      }
      delete this.sessions[posyanduId]
    }
  }

  /**
   * Clear session
   */
  clearSession(posyanduId) {
    if (this.sessions[posyanduId]) {
      this.clearTimeout(posyanduId)
      delete this.sessions[posyanduId]
    }
  }

  /**
   * Clear semua session
   */
  clearAllSessions() {
    Object.keys(this.sessions).forEach(id => {
      this.clearTimeout(id)
    })
    this.sessions = {}
    this._removeActivityListener()
  }

  /**
   * Set timeout untuk session
   */
  _setSessionTimeout(posyanduId) {
    const session = this.sessions[posyanduId]
    if (!session) return

    // Clear timeout lama
    if (session.timeoutId) {
      clearTimeout(session.timeoutId)
    }

    // Set timeout baru
    session.timeoutId = setTimeout(() => {
      this.expireSession(posyanduId)
    }, SESSION_DURATION)
  }

  /**
   * Setup activity listener untuk update last activity
   */
  _setupActivityListener() {
    if (this.activityListener) return

    this.activityListener = () => {
      // Cari posyandu yang sedang aktif di session
      const activePosyanduId = Object.keys(this.sessions).find(id => this.sessions[id])
      if (activePosyanduId) {
        this.updateActivity(activePosyanduId)
      }
    }

    // Debounce activity listener
    let lastActivityTime = 0
    const debouncedListener = () => {
      const now = Date.now()
      if (now - lastActivityTime > 5000) { // Update max setiap 5 detik
        lastActivityTime = now
        this.activityListener()
      }
    }

    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, debouncedListener, true)
    })
  }

  /**
   * Remove activity listener
   */
  _removeActivityListener() {
    if (!this.activityListener) return
    ACTIVITY_EVENTS.forEach(event => {
      window.removeEventListener(event, this.activityListener, true)
    })
    this.activityListener = null
  }

  /**
   * Clear timeout untuk session
   */
  clearTimeout(posyanduId) {
    const session = this.sessions[posyanduId]
    if (session && session.timeoutId) {
      clearTimeout(session.timeoutId)
      session.timeoutId = null
    }
  }
}

// Export singleton instance
export const sessionState = new SessionState()

/**
 * Format waktu sisa session untuk ditampilkan
 * @param {number} ms - Millisecond
 * @returns {string} Format: "25m 30d" atau "1m 5d"
 */
export function formatTimeLeft(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds}d`
}

/**
 * Check apakah session sudah hampir habis (kurang dari 5 menit)
 */
export function isSessionExpiringSoon(posyanduId) {
  const timeLeft = sessionState.getSessionTimeLeft(posyanduId)
  return timeLeft < 5 * 60 * 1000 // 5 menit
}

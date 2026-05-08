# Session Management - System Architecture & Flowchart

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE (Vue)                          │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  DataBalita  │  │HasilPenimb.  │  │Klasifikasi   │   ...         │
│  │    .vue      │  │    .vue      │  │   Balita     │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                 │                 │                        │
│         └─────────────────┼─────────────────┘                        │
│                           │                                          │
│                  ┌────────▼────────┐                                │
│                  │  useSessionStore │ (Pinia Global State)          │
│                  └────────┬────────┘                                │
└─────────────────────────┼──────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────────┐
        │   SESSION MANAGER (sessionManager.js)│
        │                                     │
        │  • verifyPassword()                 │
        │  • sessionState (singleton)         │
        │  • Activity tracking                │
        │  • Timeout management               │
        └─────────┬───────────────────────────┘
                  │
                  ▼
        ┌─────────────────────────────────────┐
        │       SUPABASE                      │
        │                                     │
        │  RPC: verify_posyandu_password      │
        │  Tables: balita_[posyandu]          │
        └─────────────────────────────────────┘
```

## Session Lifecycle Flowchart

```
START
  │
  ├──► User selects posyandu
  │      │
  │      ├──► Is session unlocked?
  │      │      │
  │      │      ├─ YES ──► Show page content
  │      │      │            │
  │      │      │            └──► Activity detected?
  │      │      │                   │
  │      │      │                   ├─ YES ──► Reset timeout
  │      │      │                   │
  │      │      │                   └─ NO ──► Continue...
  │      │      │
  │      │      └─ NO ──► Show password gate
  │      │                 │
  │      │                 └──► User enters password
  │      │                      │
  │      │                      ├──► Submit password
  │      │                      │      │
  │      │                      │      ├─ Verify via RPC
  │      │                      │      │   │
  │      │                      │      │   ├─ Valid ──► Start session (30 min)
  │      │                      │      │   │             │
  │      │                      │      │   │             └──► Set timeout
  │      │                      │      │   │                   │
  │      │                      │      │   │                   └──► Setup activity listener
  │      │                      │      │   │                         │
  │      │                      │      │   │                         └──► Show page content
  │      │                      │      │   │
  │      │                      │      │   └─ Invalid ──► Show error
  │      │                      │      │                   │
  │      │                      │      │                   └──► Clear password input
  │      │                      │      │
  │      │                      │      └──► [WAIT FOR USER INPUT]
  │      │                      │
  │      │                      └──► [USER INTERACTS WITH PAGE]
  │      │
  │      └──► User switches to another page (same session)
  │             │
  │             └──► isSessionUnlocked() still returns true
  │                  │
  │                  └──► Page content shown without password
  │
  └──► TIMEOUT TRIGGERED (30 minutes idle)
        │
        ├──► Activity detected within 30 min?
        │     │
        │     ├─ YES ──► Reset timeout, continue session
        │     │
        │     └─ NO ──► Session expires
        │              │
        │              ├──► expireSession() called
        │              │
        │              ├──► unlockedMap.delete(posyanduId)
        │              │
        │              ├──► sessionExpiredPosyanduId = posyanduId
        │              │
        │              ├──► Show modal: "Waktu habis..."
        │              │
        │              └──► Clear page data
        │
        └──► User clicks "OK" on modal
               │
               └──► resetSessionExpired()
                    │
                    └──► Show password gate again
                         │
                         └──► [BACK TO PASSWORD INPUT]
```

## Activity Detection & Reset Timeout

```
┌─────────────────────────────────────────────────────────┐
│ User Action (click, keydown, mousemove, scroll, touch)  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌──────────────────────┐
         │ Activity Listener    │ (debounced every 5s)
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Update lastActivityAt│
         │ = Date.now()         │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Clear old timeout    │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Set new timeout      │
         │ (30 min from now)    │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ Session reset ✓      │
         └──────────────────────┘
```

## Session State Structure

```javascript
// In sessionState (singleton instance)
{
  sessions: {
    'posyandu_123': {
      posyanduId: 'posyandu_123',
      unlockedAt: 1704960000000,        // When session started
      lastActivityAt: 1704962000000,    // When last activity detected
      onExpire: [Function],              // Callback when expires
      timeoutId: 12345                  // setTimeout ID
    },
    'posyandu_456': {
      // ... same structure
    }
  },
  activityListener: [Function]          // Global activity listener
}
```

## Session Duration & Idle Detection

```
Session Starts (T=0)
  │
  ├─ 5 min: User clicks button
  │          └─ Activity detected ──► Timer reset to 30 min
  │
  ├─ 12 min: User types in search
  │           └─ Activity detected ──► Timer reset to 30 min
  │
  ├─ 35 min: No activity for 23 minutes
  │           └─ Timeout triggered! ──► Session expired
  │                                     Modal shown
  │                                     Data cleared
  │
  └─ [USER RE-ENTERS PASSWORD]

COMPARISON:
  Without session management (old system):
    - Password gate on every page switch
    - User must re-enter password each time
    - No timeout protection

  With session management (new system):
    - Password gate only for first access
    - Auto logout after 30 min idle
    - Seamless navigation between pages
```

## Error Handling Flow

```
submitPassword()
  │
  ├──► Password empty?
  │     └─ YES ──► Show error: "Password tidak boleh kosong"
  │
  ├──► Call verifyPassword()
  │     │
  │     ├──► Supabase RPC Error?
  │     │     └─ YES ──► Show error: "Gagal verifikasi..."
  │     │
  │     ├──► Password incorrect?
  │     │     └─ YES ──► Show error: "Password salah"
  │     │                └─ Clear input field
  │     │                └─ Focus on password input
  │     │
  │     └──► Password correct!
  │           └─ Start session
  │           └─ Fetch page data
  │           └─ Show success toast
```

## Multi-Posyandu Session Management

```
User at DataBalita (Posyandu A) - Session unlocked ✓
  │
  │ Switch posyandu selector to Posyandu B
  │ │
  │ └─ Check: Is Posyandu B unlocked?
  │    │
  │    └─ NO ──► Show password gate for Posyandu B
  │             │
  │             └─ Password submitted ──► Session B starts
  │                                       │
  │                                       └─ Session A still active
  │
  │ Switch back to Posyandu A
  │ │
  │ └─ Check: Is Posyandu A unlocked?
  │    │
  │    └─ YES ──► Show page content (Session A still valid)
  │
  └─ Benefits:
     - User can quickly switch between posyandu
     - Each has independent session
     - Each has independent timeout
```

## Key Points

1. **Per-Posyandu Sessions** - Each posyandu has independent session timeout
2. **Activity Debouncing** - Activity check max every 5 seconds (prevents overhead)
3. **Automatic Timeout** - No manual action needed, timeout happens automatically
4. **Cross-Page Persistence** - Session survives page switches
5. **Secure Password Verification** - Uses Supabase RPC with SECURITY DEFINER
6. **User-Friendly** - Clear modal notifications when session expires

## Files Reference

| File | Purpose |
|------|---------|
| `sessionManager.js` | Core session logic & activity detection |
| `sessionStore.js` | Pinia global state management |
| `useSessionManagement.js` | Vue composable for components |
| `DataBalita.vue` | Complete example implementation |

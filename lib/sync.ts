import type { Session } from './types'

let syncTimeout: ReturnType<typeof setTimeout> | null = null

/**
 * Sync session to cloud (NeonDB via API)
 * Debounced to avoid too many requests
 */
export async function syncSessionToCloud(session: Session | null) {
  // Clear any pending sync
  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }

  // Don't sync if no session
  if (!session) return

  // Debounce sync by 500ms
  syncTimeout = setTimeout(async () => {
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session }),
      })

      if (!res.ok) {
        console.error('Failed to sync session to cloud')
      }
    } catch (error) {
      console.error('Error syncing session:', error)
    }
  }, 500)
}

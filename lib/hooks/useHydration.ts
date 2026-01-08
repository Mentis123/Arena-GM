'use client'

import { useSessionStore } from '../stores/sessionStore'

/**
 * Hook to check if the store has been hydrated from IndexedDB
 * Use this to prevent flash of empty content on initial load
 */
export function useHydration(): boolean {
  return useSessionStore(state => state.isHydrated)
}

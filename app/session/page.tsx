'use client'

import { useState } from 'react'
import { useSessionStore } from '@/lib/stores/sessionStore'
import { useHydration } from '@/lib/hooks/useHydration'
import { TabLayout } from '@/components/layout/TabLayout'
import { Header } from '@/components/layout/Header'
import { LoadingScreen } from '@/components/layout/LoadingSpinner'
import { QuickDice } from '@/components/dice/QuickDice'
import { Scoreboard } from '@/components/session/Scoreboard'
import { NewSessionSheet } from '@/components/session/NewSessionSheet'
import { CurrentEventCard } from '@/components/session/CurrentEventCard'
import { cn } from '@/lib/utils/cn'
import { Plus, Upload } from 'lucide-react'

export default function SessionPage() {
  const isHydrated = useHydration()
  const session = useSessionStore((state) => state.session)
  const [showNewSession, setShowNewSession] = useState(false)

  if (!isHydrated) {
    return <LoadingScreen />
  }

  return (
    <TabLayout>
      <Header
        title={session?.name ?? 'Arena GM'}
        subtitle={session ? `${session.players.length} players` : undefined}
      />

      <div className="p-4 space-y-4">
        {session ? (
          <>
            {/* Current Event */}
            <CurrentEventCard />

            {/* Scoreboard */}
            <Scoreboard />

            {/* Quick Dice */}
            <QuickDice />

            {/* Start Event Button */}
            {!session.currentEventId && (
              <button
                onClick={() => {
                  // Navigate to events to start one
                  window.location.href = '/events'
                }}
                className={cn(
                  'w-full h-14 rounded-lg',
                  'bg-primary text-primary-foreground',
                  'font-semibold text-lg',
                  'tap-target touch-manipulation',
                  'hover:bg-primary/90 active:bg-primary/80',
                  'transition-colors'
                )}
              >
                + Start Event
              </button>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-4xl">🎭</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">No active session</h2>
            <p className="text-muted-foreground mb-8 max-w-xs">
              Tap below to start a new tournament night or import an existing session.
            </p>

            <div className="w-full space-y-3 max-w-xs">
              <button
                onClick={() => setShowNewSession(true)}
                className={cn(
                  'w-full h-14 rounded-lg flex items-center justify-center gap-2',
                  'bg-primary text-primary-foreground',
                  'font-semibold text-lg',
                  'tap-target touch-manipulation',
                  'hover:bg-primary/90 active:bg-primary/80',
                  'transition-colors'
                )}
              >
                <Plus className="w-5 h-5" />
                New Session
              </button>

              <button
                onClick={() => {
                  // TODO: Implement import
                  window.location.href = '/settings'
                }}
                className={cn(
                  'w-full h-14 rounded-lg flex items-center justify-center gap-2',
                  'bg-secondary text-secondary-foreground',
                  'font-medium',
                  'tap-target touch-manipulation',
                  'hover:bg-secondary/80 active:bg-secondary/70',
                  'transition-colors'
                )}
              >
                <Upload className="w-5 h-5" />
                Import Session
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Session Sheet */}
      {showNewSession && (
        <NewSessionSheet onClose={() => setShowNewSession(false)} />
      )}
    </TabLayout>
  )
}

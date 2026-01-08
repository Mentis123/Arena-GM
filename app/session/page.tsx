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
import { Plus, Upload, BookOpen, HelpCircle } from 'lucide-react'

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
        rightAction={session ? (
          <button
            onClick={() => window.location.href = '/wizard'}
            className="tap-target flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        ) : undefined}
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
              New to Tournament of Pigs? Start with the guided setup!
            </p>

            <div className="w-full space-y-3 max-w-xs">
              {/* Campaign Guide - Primary CTA for new users */}
              <button
                onClick={() => {
                  window.location.href = '/wizard'
                }}
                className={cn(
                  'w-full h-16 rounded-lg flex items-center justify-center gap-3',
                  'bg-gradient-to-r from-primary to-primary/80',
                  'text-primary-foreground',
                  'font-semibold text-lg',
                  'tap-target touch-manipulation',
                  'hover:opacity-90 active:opacity-80',
                  'transition-opacity',
                  'border border-primary/50'
                )}
              >
                <BookOpen className="w-6 h-6" />
                <div className="text-left">
                  <div>Campaign Guide</div>
                  <div className="text-xs font-normal opacity-80">Step-by-step setup & rules</div>
                </div>
              </button>

              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <div className="flex-1 h-px bg-border" />
                <span>or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                onClick={() => setShowNewSession(true)}
                className={cn(
                  'w-full h-14 rounded-lg flex items-center justify-center gap-2',
                  'bg-secondary text-secondary-foreground',
                  'font-semibold text-lg',
                  'tap-target touch-manipulation',
                  'hover:bg-secondary/80 active:bg-secondary/70',
                  'transition-colors'
                )}
              >
                <Plus className="w-5 h-5" />
                Quick Start
              </button>

              <button
                onClick={() => {
                  window.location.href = '/settings'
                }}
                className={cn(
                  'w-full h-12 rounded-lg flex items-center justify-center gap-2',
                  'bg-transparent text-muted-foreground',
                  'font-medium text-sm',
                  'tap-target touch-manipulation',
                  'hover:bg-secondary/50 active:bg-secondary/40',
                  'transition-colors'
                )}
              >
                <Upload className="w-4 h-4" />
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

'use client'

import { useSessionStore } from '@/lib/stores/sessionStore'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { Play, ChevronRight } from 'lucide-react'

const PHASE_LABELS: Record<string, string> = {
  briefing: 'Briefing',
  setup: 'Setup',
  rounds: 'Rounds',
  resolution: 'Resolution',
  scoring: 'Scoring',
  prizes: 'Prizes',
}

export function CurrentEventCard() {
  const router = useRouter()
  const session = useSessionStore((state) => state.session)

  if (!session || !session.currentEventId) {
    return (
      <div className="bg-card rounded-xl p-4 border border-border">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Play className="w-5 h-5" />
          <span className="text-sm">No event running</span>
        </div>
      </div>
    )
  }

  const currentEvent = session.eventsRun.find(
    (e) => e.id === session.currentEventId
  )

  if (!currentEvent) return null

  return (
    <button
      onClick={() => router.push('/events')}
      className={cn(
        'w-full bg-card rounded-xl p-4 border border-primary/50',
        'tap-target touch-manipulation',
        'hover:bg-card/80 active:bg-card/70',
        'transition-colors text-left'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">Live</span>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>

      <h3 className="font-semibold text-lg mb-1">{currentEvent.title}</h3>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{PHASE_LABELS[currentEvent.phase]}</span>
        {currentEvent.phase === 'rounds' && (
          <span>Round {currentEvent.roundNumber}</span>
        )}
      </div>

      {/* Phase Progress */}
      <div className="flex items-center gap-1 mt-3">
        {Object.keys(PHASE_LABELS).map((phase, index) => {
          const phases = Object.keys(PHASE_LABELS)
          const currentIndex = phases.indexOf(currentEvent.phase)
          const isComplete = index < currentIndex
          const isCurrent = phase === currentEvent.phase

          return (
            <div
              key={phase}
              className={cn(
                'flex-1 h-1 rounded-full',
                isComplete
                  ? 'bg-primary'
                  : isCurrent
                    ? 'bg-primary/50'
                    : 'bg-muted'
              )}
            />
          )
        })}
      </div>
    </button>
  )
}

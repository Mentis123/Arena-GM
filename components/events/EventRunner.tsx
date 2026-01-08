'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/lib/stores/sessionStore'
import { SEED_TEMPLATES } from '@/lib/constants/templates'
import type { EventPhase, EventResult } from '@/lib/types'
import { cn } from '@/lib/utils/cn'
import { Header } from '@/components/layout/Header'
import { QuickDice } from '@/components/dice/QuickDice'
import { X, ChevronRight, Plus, Minus } from 'lucide-react'

const PHASES: EventPhase[] = [
  'briefing',
  'setup',
  'rounds',
  'resolution',
  'scoring',
  'prizes',
]

const PHASE_LABELS: Record<EventPhase, string> = {
  briefing: 'Briefing',
  setup: 'Setup',
  rounds: 'Rounds',
  resolution: 'Resolution',
  scoring: 'Scoring',
  prizes: 'Prizes',
}

interface EventRunnerProps {
  onClose: () => void
}

export function EventRunner({ onClose }: EventRunnerProps) {
  const router = useRouter()
  const session = useSessionStore((state) => state.session)
  const setEventPhase = useSessionStore((state) => state.setEventPhase)
  const incrementRound = useSessionStore((state) => state.incrementRound)
  const decrementRound = useSessionStore((state) => state.decrementRound)
  const updateCurrentEvent = useSessionStore((state) => state.updateCurrentEvent)
  const endEvent = useSessionStore((state) => state.endEvent)

  const [scores, setScores] = useState<Record<string, number>>({})

  if (!session || !session.currentEventId) {
    return null
  }

  const currentEvent = session.eventsRun.find(
    (e) => e.id === session.currentEventId
  )

  if (!currentEvent) return null

  const template = currentEvent.templateId
    ? SEED_TEMPLATES.find((t) => t.id === currentEvent.templateId)
    : null

  const currentPhaseIndex = PHASES.indexOf(currentEvent.phase)

  const handleNext = () => {
    if (currentPhaseIndex < PHASES.length - 1) {
      setEventPhase(PHASES[currentPhaseIndex + 1])
    }
  }

  const handleFinish = () => {
    const results: EventResult[] = session.players.map((player) => ({
      playerId: player.id,
      pointsAwarded: scores[player.id] ?? 0,
      survivors: player.commoners
        .filter((c) => c.status === 'alive')
        .map((c) => c.id),
      casualties: player.commoners
        .filter((c) => c.status !== 'alive')
        .map((c) => c.id),
    }))

    endEvent(results)
    router.push('/session')
  }

  const handleEndEarly = () => {
    if (confirm('End this event early? Scores will not be recorded.')) {
      // Just clear the current event without recording
      const results: EventResult[] = session.players.map((player) => ({
        playerId: player.id,
        pointsAwarded: 0,
        survivors: [],
        casualties: [],
      }))
      endEvent(results)
      onClose()
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border safe-area-inset-top">
        <div className="flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-semibold">{currentEvent.title}</h1>
          <button
            onClick={handleEndEarly}
            className="tap-target flex items-center justify-center text-muted-foreground"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase Progress */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1">
            {PHASES.map((phase, index) => {
              const isComplete = index < currentPhaseIndex
              const isCurrent = phase === currentEvent.phase

              return (
                <div key={phase} className="flex-1 flex flex-col items-center">
                  <div
                    className={cn(
                      'w-full h-1 rounded-full mb-1',
                      isComplete
                        ? 'bg-primary'
                        : isCurrent
                          ? 'bg-primary/50'
                          : 'bg-muted'
                    )}
                  />
                  <span
                    className={cn(
                      'text-[10px]',
                      isCurrent
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground'
                    )}
                  >
                    {PHASE_LABELS[phase].slice(0, 3).toUpperCase()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-nav space-y-4">
        {/* Phase Content */}
        {currentEvent.phase === 'briefing' && (
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-semibold mb-2">Briefing</h3>
            <p className="text-muted-foreground">
              {template?.briefing ?? 'Read the briefing to your players.'}
            </p>
          </div>
        )}

        {currentEvent.phase === 'setup' && (
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-semibold mb-2">Setup</h3>
            {template?.setupSteps ? (
              <ul className="space-y-2">
                {template.setupSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary">•</span>
                    {step}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Set up the encounter area.</p>
            )}
          </div>
        )}

        {currentEvent.phase === 'rounds' && (
          <>
            {/* Round Counter */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Round</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={decrementRound}
                    disabled={currentEvent.roundNumber <= 1}
                    className={cn(
                      'w-10 h-10 rounded-lg',
                      'bg-secondary text-secondary-foreground',
                      'tap-target touch-manipulation',
                      'disabled:opacity-50'
                    )}
                  >
                    <Minus className="w-4 h-4 mx-auto" />
                  </button>
                  <span className="text-2xl font-bold tabular-nums w-8 text-center">
                    {currentEvent.roundNumber}
                  </span>
                  <button
                    onClick={incrementRound}
                    className={cn(
                      'w-10 h-10 rounded-lg',
                      'bg-secondary text-secondary-foreground',
                      'tap-target touch-manipulation'
                    )}
                  >
                    <Plus className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>

            {/* Suggested Checks */}
            {template?.suggestedChecks && (
              <div className="bg-card rounded-xl p-4 border border-border">
                <h3 className="font-semibold mb-2 text-sm text-muted-foreground">
                  Suggested Checks
                </h3>
                <div className="space-y-1">
                  {template.suggestedChecks.map((check, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm">{check.label}</span>
                      <span className="text-sm text-muted-foreground capitalize">
                        {check.trait} DC {check.dc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Dice */}
            <QuickDice />
          </>
        )}

        {currentEvent.phase === 'resolution' && (
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-semibold mb-2">Resolution</h3>
            <p className="text-muted-foreground mb-4">
              Record the outcomes before moving to scoring.
            </p>
            <textarea
              placeholder="Notes..."
              value={currentEvent.notes}
              onChange={(e) =>
                updateCurrentEvent({ notes: e.target.value })
              }
              className={cn(
                'w-full h-24 px-3 py-2 rounded-lg',
                'bg-input border border-border',
                'text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'resize-none'
              )}
            />
          </div>
        )}

        {currentEvent.phase === 'scoring' && (
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-semibold mb-2">Scoring</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {template?.scoringGuidance ??
                '3=win, 2=strong, 1=ok, 0=fail'}
            </p>

            <div className="space-y-4">
              {session.players.map((player) => (
                <div key={player.id}>
                  <span className="text-sm font-medium block mb-2">
                    {player.name}
                  </span>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((score) => (
                      <button
                        key={score}
                        onClick={() =>
                          setScores((s) => ({ ...s, [player.id]: score }))
                        }
                        className={cn(
                          'flex-1 h-12 rounded-lg font-bold',
                          'tap-target touch-manipulation transition-colors',
                          scores[player.id] === score
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        )}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentEvent.phase === 'prizes' && (
          <div className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-semibold mb-2">Prizes</h3>
            <p className="text-muted-foreground mb-4">
              Winner draws Silver, others draw Crap.
            </p>

            <div className="space-y-2">
              {session.players
                .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))
                .map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="font-medium">{player.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {index === 0 ? '→ Silver' : '→ Crap'}
                    </span>
                  </div>
                ))}
            </div>

            <p className="text-sm text-muted-foreground mt-4">
              Draw cards from the Loot tab.
            </p>
          </div>
        )}

        {/* Next/Finish Button */}
        <button
          onClick={currentEvent.phase === 'prizes' ? handleFinish : handleNext}
          className={cn(
            'w-full h-14 rounded-lg flex items-center justify-center gap-2',
            'bg-primary text-primary-foreground',
            'font-semibold text-lg',
            'tap-target touch-manipulation',
            'hover:bg-primary/90 active:bg-primary/80',
            'transition-colors'
          )}
        >
          {currentEvent.phase === 'prizes' ? (
            'Finish Event ✓'
          ) : (
            <>
              Next <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

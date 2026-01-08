'use client'

import { useState } from 'react'
import { useSessionStore } from '@/lib/stores/sessionStore'
import { useHydration } from '@/lib/hooks/useHydration'
import { TabLayout } from '@/components/layout/TabLayout'
import { Header } from '@/components/layout/Header'
import { LoadingScreen } from '@/components/layout/LoadingSpinner'
import { EventRunner } from '@/components/events/EventRunner'
import { SEED_TEMPLATES } from '@/lib/constants/templates'
import type { EventTemplate } from '@/lib/types'
import { cn } from '@/lib/utils/cn'
import { Play, Plus } from 'lucide-react'

const CATEGORY_ICONS: Record<string, string> = {
  race: '🏃',
  brawl: '💪',
  gauntlet: '📦',
  puzzle: '🧩',
  mixed: '🎲',
}

export default function EventsPage() {
  const isHydrated = useHydration()
  const session = useSessionStore((state) => state.session)
  const startEvent = useSessionStore((state) => state.startEvent)
  const [showRunner, setShowRunner] = useState(false)

  if (!isHydrated) {
    return <LoadingScreen />
  }

  if (!session) {
    return (
      <TabLayout>
        <Header title="Events" />
        <div className="p-4 text-center text-muted-foreground">
          <p>No active session.</p>
          <p className="text-sm mt-2">Create a session first.</p>
        </div>
      </TabLayout>
    )
  }

  // If there's a current event, show the runner
  if (session.currentEventId || showRunner) {
    return (
      <TabLayout>
        <EventRunner onClose={() => setShowRunner(false)} />
      </TabLayout>
    )
  }

  const handleStartEvent = (template: EventTemplate) => {
    startEvent({
      templateId: template.id,
      title: template.title,
      phase: 'briefing',
      roundNumber: 1,
      notes: '',
    })
    setShowRunner(true)
  }

  const handleStartAdHoc = () => {
    startEvent({
      templateId: null,
      title: 'Ad-hoc Event',
      phase: 'briefing',
      roundNumber: 1,
      notes: '',
    })
    setShowRunner(true)
  }

  return (
    <TabLayout>
      <Header title="Events" subtitle={`${session.eventsRun.length} completed`} />

      <div className="p-4 space-y-4">
        {/* Templates */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Templates
          </h3>
          <div className="space-y-2">
            {SEED_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleStartEvent(template)}
                className={cn(
                  'w-full p-4 rounded-xl bg-card border border-border',
                  'tap-target touch-manipulation',
                  'hover:bg-card/80 active:bg-card/70',
                  'transition-colors text-left',
                  'flex items-center gap-3'
                )}
              >
                <span className="text-2xl">
                  {CATEGORY_ICONS[template.category]}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{template.title}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {template.category}
                  </div>
                </div>
                <Play className="w-5 h-5 text-primary" />
              </button>
            ))}
          </div>
        </div>

        {/* Ad-hoc */}
        <button
          onClick={handleStartAdHoc}
          className={cn(
            'w-full h-14 rounded-lg flex items-center justify-center gap-2',
            'bg-secondary text-secondary-foreground',
            'font-medium',
            'tap-target touch-manipulation',
            'hover:bg-secondary/80 active:bg-secondary/70',
            'transition-colors'
          )}
        >
          <Plus className="w-5 h-5" />
          Ad-hoc Event
        </button>

        {/* Past Events */}
        {session.eventsRun.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 mt-6">
              Completed Events
            </h3>
            <div className="space-y-2">
              {session.eventsRun
                .filter((e) => e.endedAt)
                .reverse()
                .map((event) => (
                  <div
                    key={event.id}
                    className="p-3 rounded-lg bg-card/50 border border-border/50"
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.results
                        .map((r) => {
                          const player = session.players.find(
                            (p) => p.id === r.playerId
                          )
                          return `${player?.name}: ${r.pointsAwarded}pts`
                        })
                        .join(' · ')}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </TabLayout>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useSessionStore } from '@/lib/stores/sessionStore'
import { useHydration } from '@/lib/hooks/useHydration'
import { cn } from '@/lib/utils/cn'
import { Trophy, Swords, RefreshCw } from 'lucide-react'

export default function PlayerViewPage() {
  const isHydrated = useHydration()
  const session = useSessionStore((state) => state.session)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Auto-refresh every 5 seconds (for future NeonDB integration)
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
      // When NeonDB is added, this will trigger a refetch
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Swords className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">No Active Session</h1>
        <p className="text-muted-foreground">
          Waiting for the GM to start a session...
        </p>
        <p className="text-xs text-muted-foreground mt-4">
          Last checked: {lastUpdate.toLocaleTimeString()}
        </p>
      </div>
    )
  }

  // Sort players by score
  const sortedPlayers = [...session.players].sort(
    (a, b) => b.scoreTotal - a.scoreTotal
  )

  const maxScore = Math.max(...sortedPlayers.map((p) => p.scoreTotal), 1)

  // Get current event
  const currentEvent = session.currentEventId
    ? session.eventsRun.find((e) => e.id === session.currentEventId)
    : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-card border-b border-border px-4 py-4 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{session.name}</h1>
            <p className="text-sm text-muted-foreground">
              {session.players.length} players
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="w-3 h-3" />
            <span>Live</span>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Current Event Banner */}
        {currentEvent && (
          <div className="bg-primary/20 border border-primary/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Swords className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wide">
                Event in Progress
              </span>
            </div>
            <h2 className="text-lg font-bold">{currentEvent.title}</h2>
            <p className="text-sm text-muted-foreground capitalize">
              Phase: {currentEvent.phase}
              {currentEvent.roundNumber > 0 && ` • Round ${currentEvent.roundNumber}`}
            </p>
          </div>
        )}

        {/* Scoreboard */}
        <div className="bg-card rounded-xl p-5 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Scoreboard</h2>
          </div>

          <div className="space-y-4">
            {sortedPlayers.map((player, index) => {
              const barWidth = maxScore > 0 ? (player.scoreTotal / maxScore) * 100 : 0
              const isLeader = index === 0 && player.scoreTotal > 0

              return (
                <div
                  key={player.id}
                  className={cn(
                    'p-4 rounded-lg transition-all',
                    isLeader ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-muted/30'
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0',
                        index === 0 && player.scoreTotal > 0
                          ? 'bg-yellow-500 text-yellow-950'
                          : index === 1 && player.scoreTotal > 0
                            ? 'bg-gray-400 text-gray-900'
                            : index === 2 && player.scoreTotal > 0
                              ? 'bg-amber-600 text-amber-950'
                              : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {index + 1}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-lg font-semibold truncate">
                          {player.name}
                        </span>
                        <span className="text-2xl font-bold tabular-nums ml-2">
                          {player.scoreTotal}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            isLeader ? 'bg-yellow-500' : 'bg-primary'
                          )}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      {/* Commoner count */}
                      <p className="text-xs text-muted-foreground mt-1">
                        {player.commoners.filter((c) => c.status === 'alive').length}/
                        {player.commoners.length} commoners alive
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Arena GM • Updated {lastUpdate.toLocaleTimeString()}
        </p>
      </main>
    </div>
  )
}

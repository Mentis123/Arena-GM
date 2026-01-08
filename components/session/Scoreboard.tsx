'use client'

import { useSessionStore } from '@/lib/stores/sessionStore'
import { cn } from '@/lib/utils/cn'
import { Trophy } from 'lucide-react'

export function Scoreboard() {
  const session = useSessionStore((state) => state.session)

  if (!session) return null

  // Sort players by score (descending)
  const sortedPlayers = [...session.players].sort(
    (a, b) => b.scoreTotal - a.scoreTotal
  )

  const maxScore = Math.max(...sortedPlayers.map((p) => p.scoreTotal), 1)

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Scoreboard</h3>
      </div>

      <div className="space-y-2">
        {sortedPlayers.map((player, index) => {
          const barWidth = maxScore > 0 ? (player.scoreTotal / maxScore) * 100 : 0

          return (
            <div key={player.id} className="flex items-center gap-3">
              {/* Rank */}
              <span
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
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
              </span>

              {/* Name and Bar */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{player.name}</span>
                  <span className="text-sm font-bold tabular-nums">
                    {player.scoreTotal}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

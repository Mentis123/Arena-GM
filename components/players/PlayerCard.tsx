'use client'

import { useState } from 'react'
import { useSessionStore } from '@/lib/stores/sessionStore'
import type { Player, Commoner } from '@/lib/types'
import { cn } from '@/lib/utils/cn'
import { Check, X } from 'lucide-react'

interface PlayerCardProps {
  player: Player
  onCommonerClick: (commoner: Commoner) => void
}

export function PlayerCard({ player, onCommonerClick }: PlayerCardProps) {
  const updatePlayer = useSessionStore((state) => state.updatePlayer)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(player.name)

  const handleSave = () => {
    if (editName.trim()) {
      updatePlayer(player.id, { name: editName.trim() })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditName(player.name)
    setIsEditing(false)
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Player Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={cn(
                'flex-1 h-10 px-3 rounded-lg',
                'bg-input border border-border',
                'text-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
            />
            <button
              onClick={handleSave}
              className="tap-target flex items-center justify-center text-primary"
              aria-label="Save"
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancel}
              className="tap-target flex items-center justify-center text-muted-foreground"
              aria-label="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="text-lg font-semibold hover:text-primary transition-colors"
            >
              {player.name}
            </button>
            <span className="text-lg font-bold tabular-nums text-primary">
              {player.scoreTotal} pts
            </span>
          </>
        )}
      </div>

      {/* Commoners */}
      <div className="p-3 flex flex-wrap gap-2">
        {player.commoners.map((commoner) => (
          <CommonerChip
            key={commoner.id}
            commoner={commoner}
            onClick={() => onCommonerClick(commoner)}
          />
        ))}
      </div>
    </div>
  )
}

interface CommonerChipProps {
  commoner: Commoner
  onClick: () => void
}

function CommonerChip({ commoner, onClick }: CommonerChipProps) {
  const statusColors = {
    alive: 'bg-green-900/50 border-green-700 text-green-100',
    ko: 'bg-yellow-900/50 border-yellow-700 text-yellow-100',
    dead: 'bg-red-900/50 border-red-700 text-red-100',
    out: 'bg-gray-900/50 border-gray-700 text-gray-400',
  }

  const hpPercent = (commoner.hpCurrent / commoner.hpMax) * 100
  const hpColor =
    hpPercent > 50
      ? 'text-green-400'
      : hpPercent > 25
        ? 'text-yellow-400'
        : 'text-red-400'

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center px-3 py-2 rounded-lg border',
        'tap-target touch-manipulation',
        'transition-colors',
        statusColors[commoner.status]
      )}
    >
      <span className="text-sm font-medium truncate max-w-[80px]">
        {commoner.name.split(' ')[0]}
      </span>
      <span className={cn('text-xs font-mono', hpColor)}>
        {commoner.hpCurrent}/{commoner.hpMax}
      </span>
    </button>
  )
}

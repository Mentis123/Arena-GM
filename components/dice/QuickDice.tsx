'use client'

import { useState } from 'react'
import { roll, formatRollResult } from '@/lib/utils/dice'
import type { RollResult, DieType } from '@/lib/types'
import { cn } from '@/lib/utils/cn'
import { Dice6 } from 'lucide-react'

export function QuickDice() {
  const [lastRoll, setLastRoll] = useState<RollResult | null>(null)
  const [isRolling, setIsRolling] = useState(false)

  const handleRoll = (die: DieType = 'd20') => {
    setIsRolling(true)

    // Brief animation delay
    setTimeout(() => {
      const result = roll(die)
      setLastRoll(result)
      setIsRolling(false)
    }, 150)
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dice6 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Quick Roll
          </span>
        </div>

        {lastRoll && !isRolling && (
          <span className="text-xs text-muted-foreground">
            {formatRollResult(lastRoll)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mt-3">
        {/* Result Display */}
        <div
          className={cn(
            'flex-1 h-16 rounded-lg bg-muted/50',
            'flex items-center justify-center',
            'text-3xl font-bold tabular-nums',
            isRolling && 'animate-pulse'
          )}
        >
          {isRolling ? '...' : lastRoll ? lastRoll.total : '--'}
        </div>

        {/* Roll Button */}
        <button
          onClick={() => handleRoll('d20')}
          disabled={isRolling}
          className={cn(
            'h-16 px-6 rounded-lg',
            'bg-primary text-primary-foreground',
            'font-semibold',
            'tap-target touch-manipulation',
            'hover:bg-primary/90 active:bg-primary/80',
            'disabled:opacity-50',
            'transition-colors'
          )}
        >
          d20
        </button>

        <button
          onClick={() => handleRoll('d6')}
          disabled={isRolling}
          className={cn(
            'h-16 px-6 rounded-lg',
            'bg-secondary text-secondary-foreground',
            'font-semibold',
            'tap-target touch-manipulation',
            'hover:bg-secondary/80 active:bg-secondary/70',
            'disabled:opacity-50',
            'transition-colors'
          )}
        >
          d6
        </button>
      </div>
    </div>
  )
}

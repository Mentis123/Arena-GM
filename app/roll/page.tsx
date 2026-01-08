'use client'

import { useState, useCallback } from 'react'
import { TabLayout } from '@/components/layout/TabLayout'
import { Header } from '@/components/layout/Header'
import { cn } from '@/lib/utils/cn'
import {
  roll,
  rollWithAdvantage,
  rollWithDisadvantage,
  getDiceTypes,
  formatRollResult,
} from '@/lib/utils/dice'
import type { DieType, RollResult, Traits } from '@/lib/types'
import { Dice6, History, ChevronUp, ChevronDown, Zap, ZapOff } from 'lucide-react'

const TRAITS: (keyof Traits)[] = ['strong', 'quick', 'tough', 'clever', 'charming']
const MODIFIER_PRESETS = [-2, -1, 0, 1, 2, 3, 4, 5]

type RollMode = 'normal' | 'advantage' | 'disadvantage'

export default function RollPage() {
  const [selectedDie, setSelectedDie] = useState<DieType>('d20')
  const [modifier, setModifier] = useState(0)
  const [selectedTrait, setSelectedTrait] = useState<keyof Traits | null>(null)
  const [rollMode, setRollMode] = useState<RollMode>('normal')
  const [lastResult, setLastResult] = useState<RollResult | null>(null)
  const [isRolling, setIsRolling] = useState(false)
  const [rollHistory, setRollHistory] = useState<RollResult[]>([])
  const [showHistory, setShowHistory] = useState(false)

  const handleRoll = useCallback(() => {
    setIsRolling(true)

    setTimeout(() => {
      let result: RollResult

      const totalModifier = modifier + (selectedTrait ? 2 : 0) // Trait adds +2

      switch (rollMode) {
        case 'advantage':
          result = rollWithAdvantage(selectedDie, totalModifier, selectedTrait ?? undefined)
          break
        case 'disadvantage':
          result = rollWithDisadvantage(selectedDie, totalModifier, selectedTrait ?? undefined)
          break
        default:
          result = roll(selectedDie, totalModifier, selectedTrait ?? undefined)
      }

      setLastResult(result)
      setRollHistory((prev) => [result, ...prev].slice(0, 20))
      setIsRolling(false)
    }, 200)
  }, [selectedDie, modifier, selectedTrait, rollMode])

  const clearHistory = () => {
    setRollHistory([])
  }

  const diceTypes = getDiceTypes()

  return (
    <TabLayout>
      <Header title="Dice Roller" />

      <div className="p-4 space-y-4 pb-24">
        {/* Result Display */}
        <div className="bg-card rounded-xl p-6 border border-border text-center">
          <div
            className={cn(
              'text-6xl font-bold tabular-nums mb-2',
              isRolling && 'animate-pulse text-muted-foreground'
            )}
          >
            {isRolling ? '...' : lastResult ? lastResult.total : '--'}
          </div>
          {lastResult && !isRolling && (
            <div className="text-sm text-muted-foreground">
              {formatRollResult(lastResult)}
              {lastResult.traitUsed && (
                <span className="ml-2 text-primary">
                  (+{lastResult.traitUsed})
                </span>
              )}
              {rollMode !== 'normal' && (
                <span className="ml-2 text-yellow-500">
                  ({rollMode})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Dice Selector */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Dice6 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Select Die</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {diceTypes.map((die) => (
              <button
                key={die}
                onClick={() => setSelectedDie(die)}
                className={cn(
                  'h-12 rounded-lg font-semibold transition-colors',
                  'tap-target touch-manipulation',
                  selectedDie === die
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-foreground hover:bg-muted'
                )}
              >
                {die}
              </button>
            ))}
          </div>
        </div>

        {/* Modifier */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Modifier</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setModifier((m) => m - 1)}
                className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center tap-target touch-manipulation"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <span className="w-12 text-center text-xl font-bold tabular-nums">
                {modifier >= 0 ? `+${modifier}` : modifier}
              </span>
              <button
                onClick={() => setModifier((m) => m + 1)}
                className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center tap-target touch-manipulation"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {MODIFIER_PRESETS.map((m) => (
              <button
                key={m}
                onClick={() => setModifier(m)}
                className={cn(
                  'px-3 h-8 rounded-md text-sm font-medium transition-colors',
                  'tap-target touch-manipulation',
                  modifier === m
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 hover:bg-muted'
                )}
              >
                {m >= 0 ? `+${m}` : m}
              </button>
            ))}
          </div>
        </div>

        {/* Trait Selector */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Trait Bonus (+2)</span>
            {selectedTrait && (
              <button
                onClick={() => setSelectedTrait(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {TRAITS.map((trait) => (
              <button
                key={trait}
                onClick={() => setSelectedTrait(selectedTrait === trait ? null : trait)}
                className={cn(
                  'h-10 rounded-lg text-xs font-medium capitalize transition-colors',
                  'tap-target touch-manipulation',
                  selectedTrait === trait
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 hover:bg-muted'
                )}
              >
                {trait.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Advantage/Disadvantage */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Roll Mode</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setRollMode('disadvantage')}
              className={cn(
                'h-12 rounded-lg font-medium transition-colors flex items-center justify-center gap-1',
                'tap-target touch-manipulation',
                rollMode === 'disadvantage'
                  ? 'bg-red-600 text-white'
                  : 'bg-muted/50 hover:bg-muted'
              )}
            >
              <ZapOff className="w-4 h-4" />
              <span className="text-sm">Disadv</span>
            </button>
            <button
              onClick={() => setRollMode('normal')}
              className={cn(
                'h-12 rounded-lg font-medium transition-colors',
                'tap-target touch-manipulation',
                rollMode === 'normal'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 hover:bg-muted'
              )}
            >
              Normal
            </button>
            <button
              onClick={() => setRollMode('advantage')}
              className={cn(
                'h-12 rounded-lg font-medium transition-colors flex items-center justify-center gap-1',
                'tap-target touch-manipulation',
                rollMode === 'advantage'
                  ? 'bg-green-600 text-white'
                  : 'bg-muted/50 hover:bg-muted'
              )}
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Adv</span>
            </button>
          </div>
        </div>

        {/* Roll Button */}
        <button
          onClick={handleRoll}
          disabled={isRolling}
          className={cn(
            'w-full h-16 rounded-xl',
            'bg-primary text-primary-foreground',
            'font-bold text-xl',
            'tap-target touch-manipulation',
            'hover:bg-primary/90 active:bg-primary/80',
            'disabled:opacity-50',
            'transition-colors'
          )}
        >
          {isRolling ? 'Rolling...' : `Roll ${selectedDie}`}
        </button>

        {/* Roll History */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-4 flex items-center justify-between tap-target touch-manipulation"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Roll History ({rollHistory.length})
              </span>
            </div>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-muted-foreground transition-transform',
                showHistory && 'rotate-180'
              )}
            />
          </button>

          {showHistory && (
            <div className="border-t border-border">
              {rollHistory.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No rolls yet
                </div>
              ) : (
                <>
                  <div className="max-h-60 overflow-y-auto">
                    {rollHistory.map((result, i) => (
                      <div
                        key={result.timestamp + i}
                        className="px-4 py-2 flex items-center justify-between border-b border-border last:border-0"
                      >
                        <span className="text-2xl font-bold tabular-nums">
                          {result.total}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatRollResult(result)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={clearHistory}
                    className="w-full p-3 text-sm text-muted-foreground hover:text-foreground border-t border-border"
                  >
                    Clear History
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </TabLayout>
  )
}

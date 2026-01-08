'use client'

import { useState } from 'react'
import { useSessionStore } from '@/lib/stores/sessionStore'
import type { Commoner, CommonerStatus } from '@/lib/types'
import { cn } from '@/lib/utils/cn'
import { TRAIT_LABELS, STANDARD_CONDITIONS } from '@/lib/constants/rules'
import { formatModifier, getPositiveTrait, getNegativeTrait } from '@/lib/utils/traits'
import { X, Check, Plus, Minus } from 'lucide-react'

interface CommonerSheetProps {
  playerId: string
  commoner: Commoner
  onClose: () => void
}

export function CommonerSheet({ playerId, commoner, onClose }: CommonerSheetProps) {
  const updateCommoner = useSessionStore((state) => state.updateCommoner)
  const setCommonerHP = useSessionStore((state) => state.setCommonerHP)
  const setCommonerStatus = useSessionStore((state) => state.setCommonerStatus)
  const addCondition = useSessionStore((state) => state.addCommonerCondition)
  const removeCondition = useSessionStore((state) => state.removeCommonerCondition)

  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState(commoner.name)
  const [showConditionPicker, setShowConditionPicker] = useState(false)

  const handleSaveName = () => {
    if (editName.trim()) {
      updateCommoner(playerId, commoner.id, { name: editName.trim() })
    }
    setIsEditingName(false)
  }

  const handleHPChange = (delta: number) => {
    setCommonerHP(playerId, commoner.id, commoner.hpCurrent + delta)
  }

  const handleStatusChange = (status: CommonerStatus) => {
    setCommonerStatus(playerId, commoner.id, status)
  }

  const positiveTrait = getPositiveTrait(commoner.traits)
  const negativeTrait = getNegativeTrait(commoner.traits)

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl safe-area-inset-bottom max-h-[85vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-card">
          <div className="w-12 h-1 rounded-full bg-muted" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 tap-target flex items-center justify-center text-muted-foreground"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 pb-8">
          {/* Name */}
          <div className="mb-6">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={cn(
                    'flex-1 h-12 px-4 rounded-lg text-xl font-semibold',
                    'bg-input border border-border',
                    'text-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring'
                  )}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName()
                    if (e.key === 'Escape') setIsEditingName(false)
                  }}
                />
                <button
                  onClick={handleSaveName}
                  className="tap-target flex items-center justify-center text-primary"
                >
                  <Check className="w-6 h-6" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="text-xl font-semibold hover:text-primary transition-colors"
              >
                {commoner.name}
              </button>
            )}
          </div>

          {/* HP and AC */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <span className="text-sm text-muted-foreground block mb-2">HP</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleHPChange(-3)}
                  className={cn(
                    'w-12 h-12 rounded-lg',
                    'bg-red-900 text-white font-bold',
                    'tap-target touch-manipulation',
                    'active:bg-red-800'
                  )}
                >
                  -3
                </button>
                <button
                  onClick={() => handleHPChange(-1)}
                  className={cn(
                    'w-12 h-12 rounded-lg',
                    'bg-red-700 text-white font-bold',
                    'tap-target touch-manipulation',
                    'active:bg-red-600'
                  )}
                >
                  -1
                </button>
                <span className="w-16 text-center text-xl font-mono font-bold">
                  {commoner.hpCurrent}/{commoner.hpMax}
                </span>
                <button
                  onClick={() => handleHPChange(1)}
                  className={cn(
                    'w-12 h-12 rounded-lg',
                    'bg-green-700 text-white font-bold',
                    'tap-target touch-manipulation',
                    'active:bg-green-600'
                  )}
                >
                  +1
                </button>
                <button
                  onClick={() => handleHPChange(3)}
                  className={cn(
                    'w-12 h-12 rounded-lg',
                    'bg-green-900 text-white font-bold',
                    'tap-target touch-manipulation',
                    'active:bg-green-800'
                  )}
                >
                  +3
                </button>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block mb-2">AC</span>
              <div className="w-16 h-12 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-xl font-mono font-bold">{commoner.ac}</span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <span className="text-sm text-muted-foreground block mb-2">Status</span>
            <div className="flex gap-2">
              {(['alive', 'ko', 'dead', 'out'] as CommonerStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={cn(
                    'flex-1 h-12 rounded-lg font-medium capitalize',
                    'tap-target touch-manipulation transition-colors',
                    commoner.status === status
                      ? status === 'alive'
                        ? 'bg-green-600 text-white'
                        : status === 'ko'
                          ? 'bg-yellow-600 text-white'
                          : status === 'dead'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-600 text-white'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Traits */}
          <div className="mb-6">
            <span className="text-sm text-muted-foreground block mb-2">Traits</span>
            <div className="space-y-1">
              {(Object.keys(commoner.traits) as (keyof typeof commoner.traits)[]).map((trait) => {
                const value = commoner.traits[trait]
                return (
                  <div
                    key={trait}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-lg',
                      value === 2
                        ? 'bg-green-900/30'
                        : value === -2
                          ? 'bg-red-900/30'
                          : 'bg-muted/30'
                    )}
                  >
                    <span className="font-medium">{TRAIT_LABELS[trait]}</span>
                    <span
                      className={cn(
                        'font-mono font-bold',
                        value === 2
                          ? 'text-green-400'
                          : value === -2
                            ? 'text-red-400'
                            : 'text-muted-foreground'
                      )}
                    >
                      {formatModifier(value)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Conditions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Conditions</span>
              <button
                onClick={() => setShowConditionPicker(!showConditionPicker)}
                className="tap-target flex items-center justify-center text-primary"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {showConditionPicker && (
              <div className="flex flex-wrap gap-2 mb-3 p-3 bg-muted/30 rounded-lg">
                {STANDARD_CONDITIONS.filter(
                  (c) => !commoner.conditions.includes(c)
                ).map((condition) => (
                  <button
                    key={condition}
                    onClick={() => {
                      addCondition(playerId, commoner.id, condition)
                      setShowConditionPicker(false)
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm',
                      'bg-secondary text-secondary-foreground',
                      'tap-target touch-manipulation',
                      'hover:bg-secondary/80'
                    )}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {commoner.conditions.length === 0 ? (
                <span className="text-sm text-muted-foreground">None</span>
              ) : (
                commoner.conditions.map((condition) => (
                  <button
                    key={condition}
                    onClick={() => removeCondition(playerId, commoner.id, condition)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm',
                      'bg-yellow-900/50 text-yellow-100',
                      'tap-target touch-manipulation',
                      'flex items-center gap-1'
                    )}
                  >
                    {condition}
                    <X className="w-3 h-3" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Done Button */}
          <button
            onClick={onClose}
            className={cn(
              'w-full h-14 rounded-lg',
              'bg-primary text-primary-foreground',
              'font-semibold text-lg',
              'tap-target touch-manipulation',
              'hover:bg-primary/90 active:bg-primary/80',
              'transition-colors'
            )}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

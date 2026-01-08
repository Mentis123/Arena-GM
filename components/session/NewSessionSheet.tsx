'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/lib/stores/sessionStore'
import { cn } from '@/lib/utils/cn'
import { X } from 'lucide-react'

interface NewSessionSheetProps {
  onClose: () => void
}

export function NewSessionSheet({ onClose }: NewSessionSheetProps) {
  const router = useRouter()
  const createNewSession = useSessionStore((state) => state.createNewSession)

  const [name, setName] = useState('Tournament of Pigs Night 1')
  const [playerCount, setPlayerCount] = useState(3)
  const [commonersPerPlayer, setCommonersPerPlayer] = useState(3)

  const handleCreate = () => {
    createNewSession({
      name,
      playerCount,
      commonersPerPlayer,
    })
    onClose()
    router.push('/players')
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl safe-area-inset-bottom animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
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
          <h2 className="text-xl font-semibold mb-6">New Session</h2>

          {/* Session Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Session Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={cn(
                'w-full h-12 px-4 rounded-lg',
                'bg-input border border-border',
                'text-foreground placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring'
              )}
              placeholder="Enter session name"
            />
          </div>

          {/* Number of Players */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Number of Players
            </label>
            <div className="flex gap-2">
              {[2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setPlayerCount(num)}
                  className={cn(
                    'flex-1 h-12 rounded-lg font-medium transition-colors',
                    'tap-target touch-manipulation',
                    playerCount === num
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Commoners per Player */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Commoners per Player
            </label>
            <div className="flex gap-2">
              {[2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setCommonersPerPlayer(num)}
                  className={cn(
                    'flex-1 h-12 rounded-lg font-medium transition-colors',
                    'tap-target touch-manipulation',
                    commonersPerPlayer === num
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className={cn(
              'w-full h-14 rounded-lg',
              'bg-primary text-primary-foreground',
              'font-semibold text-lg',
              'tap-target touch-manipulation',
              'hover:bg-primary/90 active:bg-primary/80',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            Create Session
          </button>
        </div>
      </div>
    </div>
  )
}

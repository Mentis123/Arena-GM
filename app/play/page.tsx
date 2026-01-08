'use client'

import { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'
import { Trophy, Swords, RefreshCw, WifiOff, Dices, BookOpen, Users, Heart, Shield, Sparkles } from 'lucide-react'
import type { Session, DieType, Player, Traits } from '@/lib/types'

const DICE_TYPES: DieType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100']

function rollDie(die: DieType): number {
  const max = parseInt(die.slice(1))
  return Math.floor(Math.random() * max) + 1
}

const TRAIT_LABELS: Record<keyof Traits, string> = {
  strong: 'STR',
  quick: 'QCK',
  tough: 'TGH',
  clever: 'CLV',
  charming: 'CHR',
}

type Tab = 'scores' | 'team' | 'dice' | 'rules'

export default function PlayerViewPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState<Tab>('scores')

  // Dice roller state
  const [selectedDie, setSelectedDie] = useState<DieType>('d20')
  const [modifier, setModifier] = useState(0)
  const [lastRoll, setLastRoll] = useState<{ die: DieType; roll: number; total: number } | null>(null)
  const [isRolling, setIsRolling] = useState(false)

  // Player selection for "My Team" tab
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch('/api/session', {
        cache: 'no-store',
      })

      if (!res.ok) {
        throw new Error('Failed to fetch session')
      }

      const data = await res.json()
      setSession(data.session)
      setError(null)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Error fetching session:', err)
      setError('Unable to connect')
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  // Auto-refresh every 3 seconds
  useEffect(() => {
    const interval = setInterval(fetchSession, 3000)
    return () => clearInterval(interval)
  }, [fetchSession])

  const handleRoll = () => {
    setIsRolling(true)
    setTimeout(() => {
      const roll = rollDie(selectedDie)
      setLastRoll({ die: selectedDie, roll, total: roll + modifier })
      setIsRolling(false)
    }, 200)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <WifiOff className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Connection Error</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchSession}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Retry
        </button>
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
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Checking for updates...</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
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
    <div className="min-h-screen bg-background pb-20">
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
            <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
            <span>{error ? 'Reconnecting...' : 'Live'}</span>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
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

        {/* Tab Content */}
        {activeTab === 'scores' && (
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
        )}

        {activeTab === 'team' && (
          <div className="space-y-4">
            {/* Player Selector */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-3">Who are you?</p>
              <div className="grid grid-cols-2 gap-2">
                {session.players.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayerId(player.id)}
                    className={cn(
                      'p-3 rounded-lg font-medium transition-colors',
                      selectedPlayerId === player.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 hover:bg-muted'
                    )}
                  >
                    {player.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Commoners */}
            {selectedPlayerId && (() => {
              const player = session.players.find(p => p.id === selectedPlayerId)
              if (!player) return null

              return (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    {player.name}&apos;s Commoners
                  </h3>

                  {player.commoners.map((commoner) => {
                    const plusTrait = (Object.entries(commoner.traits) as [keyof Traits, number][])
                      .find(([, v]) => v === 2)?.[0]
                    const minusTrait = (Object.entries(commoner.traits) as [keyof Traits, number][])
                      .find(([, v]) => v === -2)?.[0]

                    return (
                      <div
                        key={commoner.id}
                        className={cn(
                          'bg-card rounded-xl p-4 border border-border',
                          commoner.status !== 'alive' && 'opacity-60'
                        )}
                      >
                        {/* Name & Status */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold">{commoner.name}</span>
                          <span
                            className={cn(
                              'text-xs px-2 py-1 rounded-full font-medium uppercase',
                              commoner.status === 'alive' && 'bg-green-500/20 text-green-400',
                              commoner.status === 'ko' && 'bg-yellow-500/20 text-yellow-400',
                              commoner.status === 'dead' && 'bg-red-500/20 text-red-400',
                              commoner.status === 'out' && 'bg-gray-500/20 text-gray-400'
                            )}
                          >
                            {commoner.status}
                          </span>
                        </div>

                        {/* HP & AC */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-red-400" />
                            <span className="font-bold">{commoner.hpCurrent}</span>
                            <span className="text-muted-foreground">/{commoner.hpMax}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span className="font-bold">{commoner.ac}</span>
                          </div>
                        </div>

                        {/* HP Bar */}
                        <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              commoner.hpCurrent > commoner.hpMax / 2
                                ? 'bg-green-500'
                                : commoner.hpCurrent > 0
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            )}
                            style={{ width: `${(commoner.hpCurrent / commoner.hpMax) * 100}%` }}
                          />
                        </div>

                        {/* Traits */}
                        <div className="flex gap-2 mb-2">
                          {plusTrait && (
                            <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">
                              +2 {TRAIT_LABELS[plusTrait]}
                            </span>
                          )}
                          {minusTrait && (
                            <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                              -2 {TRAIT_LABELS[minusTrait]}
                            </span>
                          )}
                        </div>

                        {/* Conditions */}
                        {commoner.conditions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {commoner.conditions.map((cond, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400"
                              >
                                {cond}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Inventory */}
                        {commoner.inventory.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-border">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                              <Sparkles className="w-3 h-3" />
                              Loot
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {commoner.inventory.map((item, i) => (
                                <span
                                  key={i}
                                  className={cn(
                                    'text-xs px-2 py-1 rounded',
                                    item.deck === 'silver'
                                      ? 'bg-gray-300/20 text-gray-300'
                                      : 'bg-amber-700/20 text-amber-500'
                                  )}
                                >
                                  {item.deck === 'silver' ? 'Silver' : 'Crap'} #{item.cardId.slice(-4)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {!selectedPlayerId && (
              <p className="text-center text-muted-foreground py-8">
                Select your name above to see your commoners
              </p>
            )}
          </div>
        )}

        {activeTab === 'dice' && (
          <div className="space-y-4">
            {/* Result Display */}
            <div className="bg-card rounded-xl p-6 border border-border text-center">
              <div
                className={cn(
                  'text-6xl font-bold tabular-nums mb-2',
                  isRolling && 'animate-pulse text-muted-foreground'
                )}
              >
                {isRolling ? '...' : lastRoll ? lastRoll.total : '--'}
              </div>
              {lastRoll && !isRolling && (
                <p className="text-sm text-muted-foreground">
                  {lastRoll.die}: {lastRoll.roll}
                  {modifier !== 0 && ` ${modifier >= 0 ? '+' : ''}${modifier} = ${lastRoll.total}`}
                </p>
              )}
            </div>

            {/* Dice Selection */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <p className="text-sm text-muted-foreground mb-3">Select Die</p>
              <div className="grid grid-cols-4 gap-2">
                {DICE_TYPES.map((die) => (
                  <button
                    key={die}
                    onClick={() => setSelectedDie(die)}
                    className={cn(
                      'h-12 rounded-lg font-semibold transition-colors',
                      selectedDie === die
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 hover:bg-muted'
                    )}
                  >
                    {die}
                  </button>
                ))}
              </div>
            </div>

            {/* Modifier */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Modifier</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModifier((m) => m - 1)}
                    className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center font-bold text-lg"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-xl font-bold tabular-nums">
                    {modifier >= 0 ? `+${modifier}` : modifier}
                  </span>
                  <button
                    onClick={() => setModifier((m) => m + 1)}
                    className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {[-2, 0, 2].map((m) => (
                  <button
                    key={m}
                    onClick={() => setModifier(m)}
                    className={cn(
                      'flex-1 h-10 rounded-lg text-sm font-medium',
                      modifier === m ? 'bg-primary text-primary-foreground' : 'bg-muted/50'
                    )}
                  >
                    {m >= 0 ? `+${m}` : m}
                  </button>
                ))}
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
                'disabled:opacity-50',
                'transition-colors'
              )}
            >
              {isRolling ? 'Rolling...' : `Roll ${selectedDie}`}
            </button>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="space-y-4">
            {/* DC Chart */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-semibold mb-3">Difficulty Class (DC)</h3>
              <div className="space-y-2">
                {[
                  { label: 'Easy', dc: 8, desc: 'Simple tasks' },
                  { label: 'Tricky', dc: 11, desc: 'Requires skill' },
                  { label: 'Hard', dc: 14, desc: 'Challenging' },
                  { label: 'Heroic', dc: 17, desc: 'Legendary feats' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div>
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">{item.desc}</span>
                    </div>
                    <span className="text-lg font-bold text-primary">{item.dc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traits */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-semibold mb-3">Traits</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Each commoner has one +2 trait and one -2 trait. Apply the modifier when that trait is relevant.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { trait: 'Strong', use: 'Lifting, melee' },
                  { trait: 'Quick', use: 'Speed, dodging' },
                  { trait: 'Tough', use: 'Endurance, HP' },
                  { trait: 'Clever', use: 'Puzzles, traps' },
                  { trait: 'Charming', use: 'Social, bluff' },
                ].map((item) => (
                  <div key={item.trait} className="bg-muted/30 rounded-lg p-3">
                    <span className="font-medium block">{item.trait}</span>
                    <span className="text-xs text-muted-foreground">{item.use}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Combat Basics */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h3 className="font-semibold mb-3">Quick Rules</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Attack:</strong> d20 + trait vs AC (usually 10)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Damage:</strong> d6 (or d6+2 if strong)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>HP:</strong> Commoners start with 6 HP</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>0 HP:</strong> Knocked out (or dead in deadly mode)</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pt-2">
          Arena GM • {lastUpdate.toLocaleTimeString()}
        </p>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16">
          {[
            { id: 'scores' as Tab, label: 'Scores', icon: Trophy },
            { id: 'team' as Tab, label: 'Team', icon: Users },
            { id: 'dice' as Tab, label: 'Dice', icon: Dices },
            { id: 'rules' as Tab, label: 'Rules', icon: BookOpen },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-full h-full',
                'transition-colors',
                activeTab === id
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={activeTab === id ? 2.5 : 2} />
              <span className={cn('text-xs', activeTab === id && 'font-medium')}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

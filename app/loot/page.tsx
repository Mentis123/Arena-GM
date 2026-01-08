'use client'

import { useState } from 'react'
import { useSessionStore } from '@/lib/stores/sessionStore'
import { useHydration } from '@/lib/hooks/useHydration'
import { TabLayout } from '@/components/layout/TabLayout'
import { Header } from '@/components/layout/Header'
import { LoadingScreen } from '@/components/layout/LoadingSpinner'
import type { DeckType, DeckCard } from '@/lib/types'
import { cn } from '@/lib/utils/cn'
import { Plus, Shuffle, Trash2, Gift } from 'lucide-react'

export default function LootPage() {
  const isHydrated = useHydration()
  const session = useSessionStore((state) => state.session)
  const addDeckCard = useSessionStore((state) => state.addDeckCard)
  const removeDeckCard = useSessionStore((state) => state.removeDeckCard)
  const drawCard = useSessionStore((state) => state.drawCard)
  const discardCard = useSessionStore((state) => state.discardCard)
  const shuffleDeck = useSessionStore((state) => state.shuffleDeck)

  const [activeDeck, setActiveDeck] = useState<DeckType>('crap')
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCardName, setNewCardName] = useState('')
  const [newCardText, setNewCardText] = useState('')
  const [drawnCard, setDrawnCard] = useState<DeckCard | null>(null)

  if (!isHydrated) {
    return <LoadingScreen />
  }

  if (!session) {
    return (
      <TabLayout>
        <Header title="Loot" />
        <div className="p-4 text-center text-muted-foreground">
          <p>No active session.</p>
          <p className="text-sm mt-2">Create a session first.</p>
        </div>
      </TabLayout>
    )
  }

  const deck = session.decks[activeDeck]

  const handleAddCard = () => {
    if (newCardName.trim()) {
      addDeckCard(activeDeck, {
        name: newCardName.trim(),
        text: newCardText.trim(),
        tags: [],
      })
      setNewCardName('')
      setNewCardText('')
      setShowAddCard(false)
    }
  }

  const handleDraw = () => {
    const card = drawCard(activeDeck)
    if (card) {
      setDrawnCard(card)
    }
  }

  const handleDiscard = () => {
    if (drawnCard) {
      discardCard(activeDeck, drawnCard)
      setDrawnCard(null)
    }
  }

  return (
    <TabLayout>
      <Header title="Loot Decks" />

      <div className="p-4 space-y-4">
        {/* Deck Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveDeck('crap')}
            className={cn(
              'flex-1 h-12 rounded-lg font-medium',
              'tap-target touch-manipulation transition-colors',
              activeDeck === 'crap'
                ? 'bg-amber-700 text-white'
                : 'bg-secondary text-secondary-foreground'
            )}
          >
            Crap ({session.decks.crap.cards.length})
          </button>
          <button
            onClick={() => setActiveDeck('silver')}
            className={cn(
              'flex-1 h-12 rounded-lg font-medium',
              'tap-target touch-manipulation transition-colors',
              activeDeck === 'silver'
                ? 'bg-gray-400 text-gray-900'
                : 'bg-secondary text-secondary-foreground'
            )}
          >
            Silver ({session.decks.silver.cards.length})
          </button>
        </div>

        {/* Deck Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDraw}
            disabled={deck.cards.length === 0}
            className={cn(
              'flex-1 h-12 rounded-lg flex items-center justify-center gap-2',
              'bg-primary text-primary-foreground',
              'font-medium',
              'tap-target touch-manipulation',
              'disabled:opacity-50'
            )}
          >
            <Gift className="w-4 h-4" />
            Draw
          </button>
          <button
            onClick={() => shuffleDeck(activeDeck)}
            className={cn(
              'h-12 px-4 rounded-lg flex items-center justify-center gap-2',
              'bg-secondary text-secondary-foreground',
              'tap-target touch-manipulation'
            )}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddCard(true)}
            className={cn(
              'h-12 px-4 rounded-lg flex items-center justify-center gap-2',
              'bg-secondary text-secondary-foreground',
              'tap-target touch-manipulation'
            )}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Drawn Card */}
        {drawnCard && (
          <div className="bg-card rounded-xl p-6 border-2 border-primary text-center">
            <div className="text-sm text-muted-foreground mb-2 uppercase">
              {activeDeck} Card
            </div>
            <h3 className="text-xl font-bold mb-2">{drawnCard.name}</h3>
            <p className="text-muted-foreground mb-4">{drawnCard.text || 'No description'}</p>
            <button
              onClick={handleDiscard}
              className={cn(
                'w-full h-12 rounded-lg',
                'bg-secondary text-secondary-foreground',
                'font-medium',
                'tap-target touch-manipulation'
              )}
            >
              Discard
            </button>
          </div>
        )}

        {/* Card List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Cards in Deck
            </h3>
            <span className="text-sm text-muted-foreground">
              Discard: {deck.discard.length}
            </span>
          </div>

          {deck.cards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No cards in deck.</p>
              <p className="text-sm mt-1">Add cards to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {deck.cards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                >
                  <div>
                    <div className="font-medium">{card.name}</div>
                    {card.text && (
                      <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {card.text}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeDeckCard(activeDeck, card.id)}
                    className="tap-target flex items-center justify-center text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Card Sheet */}
      {showAddCard && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAddCard(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl safe-area-inset-bottom">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 rounded-full bg-muted" />
            </div>
            <div className="px-6 pb-8">
              <h2 className="text-xl font-semibold mb-6">Add Card</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newCardName}
                    onChange={(e) => setNewCardName(e.target.value)}
                    className={cn(
                      'w-full h-12 px-4 rounded-lg',
                      'bg-input border border-border',
                      'text-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-ring'
                    )}
                    placeholder="Card name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCardText}
                    onChange={(e) => setNewCardText(e.target.value)}
                    className={cn(
                      'w-full h-24 px-4 py-3 rounded-lg',
                      'bg-input border border-border',
                      'text-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-ring',
                      'resize-none'
                    )}
                    placeholder="Card description"
                  />
                </div>

                <button
                  onClick={handleAddCard}
                  disabled={!newCardName.trim()}
                  className={cn(
                    'w-full h-14 rounded-lg',
                    'bg-primary text-primary-foreground',
                    'font-semibold',
                    'tap-target touch-manipulation',
                    'disabled:opacity-50'
                  )}
                >
                  Add Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TabLayout>
  )
}

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Session,
  SessionConfig,
  Player,
  Commoner,
  CommonerStatus,
  EventInstance,
  EventPhase,
  LogEntry,
  LogEntryType,
  DeckCard,
  DeckType,
} from '../types'
import { createSession, CURRENT_SCHEMA_VERSION } from '../utils/session'
import { dexieStorage } from '../db'
import { nanoid } from 'nanoid'
import { syncSessionToCloud } from '../sync'

interface SessionState {
  session: Session | null
  isHydrated: boolean

  // Session actions
  createNewSession: (config: SessionConfig) => void
  clearSession: () => void
  importSession: (session: Session) => void

  // Player actions
  updatePlayer: (playerId: string, updates: Partial<Player>) => void
  setPlayerScore: (playerId: string, score: number) => void

  // Commoner actions
  updateCommoner: (playerId: string, commonerId: string, updates: Partial<Commoner>) => void
  setCommonerHP: (playerId: string, commonerId: string, hp: number) => void
  setCommonerStatus: (playerId: string, commonerId: string, status: CommonerStatus) => void
  addCommonerCondition: (playerId: string, commonerId: string, condition: string) => void
  removeCommonerCondition: (playerId: string, commonerId: string, condition: string) => void

  // Event actions
  startEvent: (event: Omit<EventInstance, 'id' | 'startedAt' | 'endedAt' | 'results'>) => void
  updateCurrentEvent: (updates: Partial<EventInstance>) => void
  setEventPhase: (phase: EventPhase) => void
  incrementRound: () => void
  decrementRound: () => void
  endEvent: (results: EventInstance['results']) => void

  // Deck actions
  addDeckCard: (deck: DeckType, card: Omit<DeckCard, 'id'>) => void
  removeDeckCard: (deck: DeckType, cardId: string) => void
  drawCard: (deck: DeckType) => DeckCard | null
  discardCard: (deck: DeckType, card: DeckCard) => void
  shuffleDeck: (deck: DeckType) => void
  assignCardToCommoner: (playerId: string, commonerId: string, deck: DeckType, cardId: string) => void

  // Log actions
  addLogEntry: (type: LogEntryType, text: string, payload?: unknown) => void

  // Hydration
  setHydrated: (hydrated: boolean) => void
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      session: null,
      isHydrated: false,

      setHydrated: (hydrated) => set({ isHydrated: hydrated }),

      createNewSession: (config) => {
        const session = createSession(config)
        set({ session })
      },

      clearSession: () => set({ session: null }),

      importSession: (session) => {
        // Update schema version if needed
        set({
          session: {
            ...session,
            schemaVersion: CURRENT_SCHEMA_VERSION,
            updatedAt: new Date().toISOString(),
          }
        })
      },

      updatePlayer: (playerId, updates) => {
        const session = get().session
        if (!session) return

        set({
          session: {
            ...session,
            updatedAt: new Date().toISOString(),
            players: session.players.map(p =>
              p.id === playerId ? { ...p, ...updates } : p
            ),
          }
        })
      },

      setPlayerScore: (playerId, score) => {
        get().updatePlayer(playerId, { scoreTotal: score })
      },

      updateCommoner: (playerId, commonerId, updates) => {
        const session = get().session
        if (!session) return

        set({
          session: {
            ...session,
            updatedAt: new Date().toISOString(),
            players: session.players.map(p =>
              p.id === playerId
                ? {
                  ...p,
                  commoners: p.commoners.map(c =>
                    c.id === commonerId ? { ...c, ...updates } : c
                  ),
                }
                : p
            ),
          }
        })
      },

      setCommonerHP: (playerId, commonerId, hp) => {
        const session = get().session
        if (!session) return

        const player = session.players.find(p => p.id === playerId)
        const commoner = player?.commoners.find(c => c.id === commonerId)
        if (!commoner) return

        const clampedHP = Math.max(0, Math.min(commoner.hpMax, hp))

        // Auto-change status if HP hits 0
        let status = commoner.status
        if (clampedHP === 0 && commoner.status === 'alive') {
          status = session.ruleset.zeroHPBehaviour
        } else if (clampedHP > 0 && (commoner.status === 'ko' || commoner.status === 'dead')) {
          status = 'alive'
        }

        get().updateCommoner(playerId, commonerId, {
          hpCurrent: clampedHP,
          status,
        })
      },

      setCommonerStatus: (playerId, commonerId, status) => {
        get().updateCommoner(playerId, commonerId, { status })
      },

      addCommonerCondition: (playerId, commonerId, condition) => {
        const session = get().session
        if (!session) return

        const player = session.players.find(p => p.id === playerId)
        const commoner = player?.commoners.find(c => c.id === commonerId)
        if (!commoner || commoner.conditions.includes(condition)) return

        get().updateCommoner(playerId, commonerId, {
          conditions: [...commoner.conditions, condition],
        })
      },

      removeCommonerCondition: (playerId, commonerId, condition) => {
        const session = get().session
        if (!session) return

        const player = session.players.find(p => p.id === playerId)
        const commoner = player?.commoners.find(c => c.id === commonerId)
        if (!commoner) return

        get().updateCommoner(playerId, commonerId, {
          conditions: commoner.conditions.filter(c => c !== condition),
        })
      },

      startEvent: (eventData) => {
        const session = get().session
        if (!session) return

        const event: EventInstance = {
          ...eventData,
          id: nanoid(),
          startedAt: new Date().toISOString(),
          endedAt: null,
          results: [],
        }

        set({
          session: {
            ...session,
            updatedAt: new Date().toISOString(),
            eventsRun: [...session.eventsRun, event],
            currentEventId: event.id,
          }
        })
      },

      updateCurrentEvent: (updates) => {
        const session = get().session
        if (!session || !session.currentEventId) return

        set({
          session: {
            ...session,
            updatedAt: new Date().toISOString(),
            eventsRun: session.eventsRun.map(e =>
              e.id === session.currentEventId ? { ...e, ...updates } : e
            ),
          }
        })
      },

      setEventPhase: (phase) => {
        get().updateCurrentEvent({ phase })
      },

      incrementRound: () => {
        const session = get().session
        if (!session || !session.currentEventId) return

        const event = session.eventsRun.find(e => e.id === session.currentEventId)
        if (!event) return

        get().updateCurrentEvent({ roundNumber: event.roundNumber + 1 })
      },

      decrementRound: () => {
        const session = get().session
        if (!session || !session.currentEventId) return

        const event = session.eventsRun.find(e => e.id === session.currentEventId)
        if (!event || event.roundNumber <= 1) return

        get().updateCurrentEvent({ roundNumber: event.roundNumber - 1 })
      },

      endEvent: (results) => {
        const session = get().session
        if (!session || !session.currentEventId) return

        // Update event with results
        get().updateCurrentEvent({
          endedAt: new Date().toISOString(),
          results,
        })

        // Update player scores
        results.forEach(result => {
          const player = session.players.find(p => p.id === result.playerId)
          if (player) {
            get().setPlayerScore(result.playerId, player.scoreTotal + result.pointsAwarded)
          }
        })

        // Clear current event
        set({
          session: {
            ...get().session!,
            currentEventId: null,
          }
        })
      },

      addDeckCard: (deck, card) => {
        const session = get().session
        if (!session) return

        const newCard: DeckCard = { ...card, id: nanoid() }

        set({
          session: {
            ...session,
            updatedAt: new Date().toISOString(),
            decks: {
              ...session.decks,
              [deck]: {
                ...session.decks[deck],
                cards: [...session.decks[deck].cards, newCard],
              },
            },
          }
        })
      },

      removeDeckCard: (deck, cardId) => {
        const session = get().session
        if (!session) return

        set({
          session: {
            ...session,
            updatedAt: new Date().toISOString(),
            decks: {
              ...session.decks,
              [deck]: {
                ...session.decks[deck],
                cards: session.decks[deck].cards.filter(c => c.id !== cardId),
                discard: session.decks[deck].discard.filter(c => c.id !== cardId),
              },
            },
          }
        })
      },

      drawCard: (deck) => {
        const session = get().session
        if (!session || session.decks[deck].cards.length === 0) return null

        const [drawnCard, ...remainingCards] = session.decks[deck].cards

        set({
          session: {
            ...session,
            updatedAt: new Date().toISOString(),
            decks: {
              ...session.decks,
              [deck]: {
                ...session.decks[deck],
                cards: remainingCards,
              },
            },
          }
        })

        return drawnCard
      },

      discardCard: (deck, card) => {
        const session = get().session
        if (!session) return

        set({
          session: {
            ...session,
            updatedAt: new Date().toISOString(),
            decks: {
              ...session.decks,
              [deck]: {
                ...session.decks[deck],
                discard: [...session.decks[deck].discard, card],
              },
            },
          }
        })
      },

      shuffleDeck: (deck) => {
        const session = get().session
        if (!session) return

        // Combine cards and discard, then shuffle
        const allCards = [
          ...session.decks[deck].cards,
          ...session.decks[deck].discard,
        ]

        // Fisher-Yates shuffle
        for (let i = allCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allCards[i], allCards[j]] = [allCards[j], allCards[i]]
        }

        set({
          session: {
            ...session,
            updatedAt: new Date().toISOString(),
            decks: {
              ...session.decks,
              [deck]: {
                cards: allCards,
                discard: [],
              },
            },
          }
        })
      },

      assignCardToCommoner: (playerId, commonerId, deck, cardId) => {
        const session = get().session
        if (!session) return

        const player = session.players.find(p => p.id === playerId)
        const commoner = player?.commoners.find(c => c.id === commonerId)
        if (!commoner) return

        get().updateCommoner(playerId, commonerId, {
          inventory: [...commoner.inventory, { deck, cardId }],
        })
      },

      addLogEntry: (type, text, payload) => {
        const session = get().session
        if (!session) return

        const entry: LogEntry = {
          ts: new Date().toISOString(),
          type,
          text,
          payload,
        }

        set({
          session: {
            ...session,
            updatedAt: new Date().toISOString(),
            log: [...session.log, entry],
          }
        })
      },
    }),
    {
      name: 'current-session',
      storage: createJSONStorage(() => dexieStorage),
      partialize: (state) => ({ session: state.session }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHydrated(true)
          // Sync to cloud on rehydration
          if (state.session) {
            syncSessionToCloud(state.session)
          }
        }
      },
    }
  )
)

// Subscribe to session changes and sync to cloud
useSessionStore.subscribe(
  (state) => {
    if (state.isHydrated && state.session) {
      syncSessionToCloud(state.session)
    }
  }
)

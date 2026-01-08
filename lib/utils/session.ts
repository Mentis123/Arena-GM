import { nanoid } from 'nanoid'
import type { Session, SessionConfig, Player, Commoner } from '../types'
import { generateNames } from './names'
import { generateTraits } from './traits'
import { DEFAULT_RULESET } from '../constants/rules'

export const CURRENT_SCHEMA_VERSION = 1

/**
 * Generate a new session with players and commoners
 */
export function createSession(config: SessionConfig): Session {
  const now = new Date().toISOString()

  // Generate players
  const players: Player[] = []
  for (let i = 0; i < config.playerCount; i++) {
    const commonerNames = generateNames(config.commonersPerPlayer)

    const commoners: Commoner[] = commonerNames.map(name => ({
      id: nanoid(),
      name,
      hpCurrent: DEFAULT_RULESET.defaultHP,
      hpMax: DEFAULT_RULESET.defaultHP,
      ac: DEFAULT_RULESET.defaultAC,
      traits: generateTraits(),
      status: 'alive',
      conditions: [],
      inventory: [],
      notes: '',
    }))

    players.push({
      id: nanoid(),
      name: `Player ${i + 1}`,
      scoreTotal: 0,
      commoners,
    })
  }

  return {
    id: nanoid(),
    name: config.name,
    createdAt: now,
    updatedAt: now,
    players,
    eventsRun: [],
    currentEventId: null,
    decks: {
      crap: { cards: [], discard: [] },
      silver: { cards: [], discard: [] },
    },
    ruleset: { ...DEFAULT_RULESET },
    log: [],
    schemaVersion: CURRENT_SCHEMA_VERSION,
  }
}

/**
 * Calculate total score for a player across all events
 */
export function calculatePlayerScore(session: Session, playerId: string): number {
  return session.eventsRun.reduce((total, event) => {
    const result = event.results.find(r => r.playerId === playerId)
    return total + (result?.pointsAwarded ?? 0)
  }, 0)
}

/**
 * Get all commoners from all players
 */
export function getAllCommoners(session: Session): Array<Commoner & { playerId: string; playerName: string }> {
  return session.players.flatMap(player =>
    player.commoners.map(commoner => ({
      ...commoner,
      playerId: player.id,
      playerName: player.name,
    }))
  )
}

/**
 * Get living commoners only
 */
export function getLivingCommoners(session: Session): Array<Commoner & { playerId: string; playerName: string }> {
  return getAllCommoners(session).filter(c => c.status === 'alive')
}

/**
 * Count survivors and casualties
 */
export function getSessionStats(session: Session) {
  const all = getAllCommoners(session)

  return {
    total: all.length,
    alive: all.filter(c => c.status === 'alive').length,
    ko: all.filter(c => c.status === 'ko').length,
    dead: all.filter(c => c.status === 'dead').length,
    out: all.filter(c => c.status === 'out').length,
  }
}

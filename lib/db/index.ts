import Dexie, { type Table } from 'dexie'
import type { Session, DeckCard } from '../types'

export const CURRENT_SCHEMA_VERSION = 1

export interface SessionRecord {
  id: string
  data: Session
  updatedAt: number
  schemaVersion: number
}

export interface DeckCardRecord extends DeckCard {
  deck: 'crap' | 'silver'
}

export interface SettingsRecord {
  key: string
  value: unknown
}

export class ArenaGMDatabase extends Dexie {
  sessions!: Table<SessionRecord>
  deckCards!: Table<DeckCardRecord>
  settings!: Table<SettingsRecord>

  constructor() {
    super('arena-gm')

    // Version 1: Initial schema
    this.version(1).stores({
      sessions: 'id, updatedAt',
      deckCards: 'id, deck, [deck+id]',
      settings: 'key'
    })
  }
}

export const db = new ArenaGMDatabase()

// Storage adapter for Zustand persist
export const dexieStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const record = await db.sessions.get(name)
      return record?.data ? JSON.stringify(record.data) : null
    } catch (error) {
      console.error('Error reading from IndexedDB:', error)
      return null
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const data = JSON.parse(value)
      await db.sessions.put({
        id: name,
        data,
        updatedAt: Date.now(),
        schemaVersion: CURRENT_SCHEMA_VERSION
      })
    } catch (error) {
      console.error('Error writing to IndexedDB:', error)
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await db.sessions.delete(name)
    } catch (error) {
      console.error('Error removing from IndexedDB:', error)
    }
  }
}

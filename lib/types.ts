// Core data types for Arena GM

export type TraitValue = -2 | 0 | 2

export type CommonerStatus = 'alive' | 'ko' | 'dead' | 'out'

export type EventPhase = 'briefing' | 'setup' | 'rounds' | 'resolution' | 'scoring' | 'prizes'

export type EventCategory = 'brawl' | 'race' | 'gauntlet' | 'puzzle' | 'mixed'

export type RoundStructure = 'timed' | 'turns' | 'freeform'

export type LogEntryType = 'roll' | 'damage' | 'status' | 'score' | 'loot' | 'note'

export type DeckType = 'crap' | 'silver'

export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'

export interface Traits {
  strong: TraitValue
  quick: TraitValue
  tough: TraitValue
  clever: TraitValue
  charming: TraitValue
}

export interface Commoner {
  id: string
  name: string
  hpCurrent: number
  hpMax: number
  ac: number
  traits: Traits
  status: CommonerStatus
  conditions: string[]
  inventory: LootCardRef[]
  notes: string
}

export interface Player {
  id: string
  name: string
  scoreTotal: number
  commoners: Commoner[]
}

export interface LootCardRef {
  deck: DeckType
  cardId: string
}

export interface DeckCard {
  id: string
  name: string
  text: string
  tags: string[]
}

export interface DeckState {
  cards: DeckCard[]
  discard: DeckCard[]
}

export interface SuggestedCheck {
  label: string
  trait: keyof Traits
  dc: number
}

export interface EventTemplate {
  id: string
  title: string
  category: EventCategory
  briefing: string
  setupSteps: string[]
  roundStructure: RoundStructure
  suggestedChecks: SuggestedCheck[]
  scoringGuidance: string
  gmNotes: string
  isBuiltIn: boolean
}

export interface EventResult {
  playerId: string
  pointsAwarded: number
  survivors: string[]
  casualties: string[]
}

export interface EventInstance {
  id: string
  templateId: string | null
  title: string
  startedAt: string
  endedAt: string | null
  phase: EventPhase
  roundNumber: number
  notes: string
  results: EventResult[]
}

export interface RulesetConfig {
  checkDCs: {
    easy: number
    tricky: number
    hard: number
    heroic: number
  }
  defaultHP: number
  defaultAC: number
  attackBonusIfTraitMatches: number
  damageDie: 'd6'
  zeroHPBehaviour: 'ko' | 'dead'
  advantageEnabled: boolean
  scoringMode: 'simple'
}

export interface LogEntry {
  ts: string
  type: LogEntryType
  text: string
  payload?: unknown
}

export interface Session {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  players: Player[]
  eventsRun: EventInstance[]
  currentEventId: string | null
  decks: {
    crap: DeckState
    silver: DeckState
  }
  ruleset: RulesetConfig
  log: LogEntry[]
  schemaVersion: number
}

export interface RollResult {
  die: DieType
  modifier: number
  roll: number
  total: number
  timestamp: string
  traitUsed?: keyof Traits
}

// Session creation config
export interface SessionConfig {
  name: string
  playerCount: number
  commonersPerPlayer: number
}

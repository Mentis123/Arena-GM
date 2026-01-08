import type { RulesetConfig, Traits } from '../types'

export const DEFAULT_RULESET: RulesetConfig = {
  checkDCs: {
    easy: 10,
    tricky: 15,
    hard: 18,
    heroic: 20,
  },
  defaultHP: 5,
  defaultAC: 10,
  attackBonusIfTraitMatches: 2,
  damageDie: 'd6',
  zeroHPBehaviour: 'ko',
  advantageEnabled: true,
  scoringMode: 'simple',
}

export const TRAIT_LABELS: Record<keyof Traits, string> = {
  strong: 'Strong',
  quick: 'Quick',
  tough: 'Tough',
  clever: 'Clever',
  charming: 'Charming',
}

export const STATUS_LABELS = {
  alive: 'Alive',
  ko: 'KO',
  dead: 'Dead',
  out: 'Out',
}

export const STANDARD_CONDITIONS = [
  'Prone',
  'Grappled',
  'Restrained',
  'Blinded',
  'Deafened',
  'Frightened',
  'Poisoned',
  'Stunned',
  'Exhausted',
]

export const DC_LABELS: Record<keyof RulesetConfig['checkDCs'], string> = {
  easy: 'Easy (10)',
  tricky: 'Tricky (15)',
  hard: 'Hard (18)',
  heroic: 'Heroic (20)',
}

import type { DieType, RollResult, Traits } from '../types'

const DIE_MAX: Record<DieType, number> = {
  d4: 4,
  d6: 6,
  d8: 8,
  d10: 10,
  d12: 12,
  d20: 20,
  d100: 100,
}

/**
 * Roll a single die
 */
export function rollDie(die: DieType): number {
  const max = DIE_MAX[die]
  return Math.floor(Math.random() * max) + 1
}

/**
 * Roll with modifier and return full result
 */
export function roll(
  die: DieType,
  modifier: number = 0,
  traitUsed?: keyof Traits
): RollResult {
  const dieRoll = rollDie(die)

  return {
    die,
    modifier,
    roll: dieRoll,
    total: dieRoll + modifier,
    timestamp: new Date().toISOString(),
    traitUsed,
  }
}

/**
 * Roll with advantage (roll twice, take higher)
 */
export function rollWithAdvantage(
  die: DieType,
  modifier: number = 0,
  traitUsed?: keyof Traits
): RollResult {
  const roll1 = rollDie(die)
  const roll2 = rollDie(die)
  const best = Math.max(roll1, roll2)

  return {
    die,
    modifier,
    roll: best,
    total: best + modifier,
    timestamp: new Date().toISOString(),
    traitUsed,
  }
}

/**
 * Roll with disadvantage (roll twice, take lower)
 */
export function rollWithDisadvantage(
  die: DieType,
  modifier: number = 0,
  traitUsed?: keyof Traits
): RollResult {
  const roll1 = rollDie(die)
  const roll2 = rollDie(die)
  const worst = Math.min(roll1, roll2)

  return {
    die,
    modifier,
    roll: worst,
    total: worst + modifier,
    timestamp: new Date().toISOString(),
    traitUsed,
  }
}

/**
 * Format a roll result for display
 */
export function formatRollResult(result: RollResult): string {
  const modStr = result.modifier >= 0 ? `+${result.modifier}` : `${result.modifier}`

  if (result.modifier === 0) {
    return `${result.die}: ${result.total}`
  }

  return `${result.die}${modStr}: ${result.total} (${result.roll}${modStr})`
}

/**
 * Check if a roll meets or exceeds a DC
 */
export function checkSuccess(result: RollResult, dc: number): boolean {
  return result.total >= dc
}

/**
 * Get available dice types
 */
export function getDiceTypes(): DieType[] {
  return ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100']
}

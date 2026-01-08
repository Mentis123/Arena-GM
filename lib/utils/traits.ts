import type { Traits, TraitValue } from '../types'

const TRAIT_KEYS: (keyof Traits)[] = ['strong', 'quick', 'tough', 'clever', 'charming']

/**
 * Generate random trait values for a commoner
 * Rules: One trait is +2, one trait is -2, rest are 0
 */
export function generateTraits(): Traits {
  // Shuffle trait keys
  const shuffled = [...TRAIT_KEYS].sort(() => Math.random() - 0.5)

  const traits: Traits = {
    strong: 0,
    quick: 0,
    tough: 0,
    clever: 0,
    charming: 0,
  }

  // First shuffled trait gets +2
  traits[shuffled[0]] = 2

  // Second shuffled trait gets -2
  traits[shuffled[1]] = -2

  return traits
}

/**
 * Get the positive trait for a commoner
 */
export function getPositiveTrait(traits: Traits): keyof Traits | null {
  for (const key of TRAIT_KEYS) {
    if (traits[key] === 2) {
      return key
    }
  }
  return null
}

/**
 * Get the negative trait for a commoner
 */
export function getNegativeTrait(traits: Traits): keyof Traits | null {
  for (const key of TRAIT_KEYS) {
    if (traits[key] === -2) {
      return key
    }
  }
  return null
}

/**
 * Get the modifier value for a specific trait
 */
export function getTraitModifier(traits: Traits, trait: keyof Traits): TraitValue {
  return traits[trait]
}

/**
 * Format a trait modifier for display (+2, +0, -2)
 */
export function formatModifier(value: number): string {
  if (value >= 0) {
    return `+${value}`
  }
  return `${value}`
}

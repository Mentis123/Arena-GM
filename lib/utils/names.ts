// Generic peasant names for commoner generation
// All names are original/generic and not derived from copyrighted sources

const FIRST_NAMES = [
  // Short, peasant-style names
  'Gurt', 'Mags', 'Pip', 'Bren', 'Sal', 'Twig',
  'Jax', 'Nell', 'Wick', 'Dob', 'Fern', 'Cob',
  'Rue', 'Bash', 'Moll', 'Grim', 'Nan', 'Tig',
  'Wort', 'Peg', 'Hob', 'Jem', 'Dot', 'Rook',
  'Sly', 'Kit', 'Bram', 'Elda', 'Moss', 'Grub',
  'Flint', 'Pru', 'Sten', 'Ivy', 'Craw', 'Dulce',
  'Brick', 'Maud', 'Sprig', 'Oat', 'Birch', 'Midge',
  'Clay', 'Tess', 'Soot', 'Reed', 'Ash', 'Lark',
]

const EPITHETS = [
  // Descriptive nicknames
  'the Muddy', 'One-Eye', 'Stinky', 'the Loud',
  'Stumpy', 'the Quick', 'No-Teeth', 'the Bold',
  'Greasy', 'the Slow', 'Lucky', 'the Grim',
  'Soggy', 'Half-Wit', 'the Brave', 'Scabby',
  'Lumpy', 'the Meek', 'Warty', 'the Sly',
]

/**
 * Generate a random peasant name
 */
export function generateName(): string {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]

  // 30% chance to add an epithet
  if (Math.random() < 0.3) {
    const epithet = EPITHETS[Math.floor(Math.random() * EPITHETS.length)]
    return `${firstName} ${epithet}`
  }

  return firstName
}

/**
 * Generate multiple unique names
 */
export function generateNames(count: number): string[] {
  const names: string[] = []
  const usedFirstNames = new Set<string>()

  while (names.length < count) {
    const name = generateName()
    const firstName = name.split(' ')[0]

    // Ensure unique first names
    if (!usedFirstNames.has(firstName)) {
      usedFirstNames.add(firstName)
      names.push(name)
    }

    // Fallback if we run out of unique names
    if (usedFirstNames.size >= FIRST_NAMES.length) {
      break
    }
  }

  return names
}

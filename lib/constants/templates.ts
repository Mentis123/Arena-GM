import type { EventTemplate } from '../types'

export const SEED_TEMPLATES: EventTemplate[] = [
  {
    id: 'template-greased-sprint',
    title: 'Greased Sprint',
    category: 'race',
    briefing: 'Commoners race across a hazard-filled course. First to finish wins.',
    setupSteps: [
      'Mark start, checkpoints, and finish',
      'Assign hazards to zones (grease, obstacles, etc.)',
      'Position commoners at the start line',
    ],
    roundStructure: 'turns',
    suggestedChecks: [
      { label: 'Advance one zone', trait: 'quick', dc: 12 },
      { label: 'Resist hazard damage', trait: 'tough', dc: 15 },
      { label: 'Find shortcut', trait: 'clever', dc: 15 },
    ],
    scoringGuidance: 'First to finish = 3pts. Second = 2pts. Third = 1pt. DNF = 0pts.',
    gmNotes: '',
    isBuiltIn: true,
  },
  {
    id: 'template-crate-gauntlet',
    title: 'Crate Gauntlet',
    category: 'gauntlet',
    briefing: 'Navigate through trapped crates to reach the prize at the end.',
    setupSteps: [
      'Describe trap types: spikes, flame jets, pit traps',
      'Set up crate arrangement (3-5 rows)',
      'Place prize at the far end',
    ],
    roundStructure: 'turns',
    suggestedChecks: [
      { label: 'Avoid trap', trait: 'quick', dc: 12 },
      { label: 'Disarm trap', trait: 'clever', dc: 15 },
      { label: 'Endure damage', trait: 'tough', dc: 12 },
    ],
    scoringGuidance: 'Reach end = 2pts. Fewest casualties = +1pt. All survive = +1pt.',
    gmNotes: '',
    isBuiltIn: true,
  },
  {
    id: 'template-mud-brawl',
    title: 'Mud Brawl',
    category: 'brawl',
    briefing: 'Last commoner standing wins. The arena is ankle-deep in mud.',
    setupSteps: [
      'Define arena zones: centre pit, edges, escape zone',
      'Explain mud effects: -2 to Quick checks',
      'Position commoners around the arena',
    ],
    roundStructure: 'turns',
    suggestedChecks: [
      { label: 'Grapple opponent', trait: 'strong', dc: 12 },
      { label: 'Escape grapple', trait: 'quick', dc: 12 },
      { label: 'Taunt opponent', trait: 'charming', dc: 15 },
    ],
    scoringGuidance: 'Last standing = 3pts. Knocked out but alive = 1pt. Dead = 0pts.',
    gmNotes: '',
    isBuiltIn: true,
  },
]

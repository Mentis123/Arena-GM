'use client'

import { useState } from 'react'
import { TabLayout } from '@/components/layout/TabLayout'
import { Header } from '@/components/layout/Header'
import { cn } from '@/lib/utils/cn'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

interface PromptItem {
  id: string
  title: string
  description: string
  prompt: string
}

const PROMPTS: PromptItem[] = [
  {
    id: 'premise',
    title: '1. Game Premise',
    description: 'What is Tournament of Pigs?',
    prompt: `Create a 16:9 infographic titled "TOURNAMENT OF PIGS" with a medieval/fantasy tavern game aesthetic. Dark background with warm torch-like accent colors (amber, orange, gold).

Main headline: "A Chaotic Tabletop Tournament for 2-5 Players"

Include these visual sections:

TOP SECTION - The Hook:
"Send your peasants into deadly challenges. Laugh when they die. Win glory anyway."

MIDDLE - 3 Column Layout with icons:
Column 1 - "YOU ARE THE GM"
- Icon: Crown or game master figure
- "Run events, roll dice, award points"

Column 2 - "PLAYERS CONTROL COMMONERS"
- Icon: Group of simple peasant figures
- "Expendable peasants with 5 HP each"

Column 3 - "SIMPLE RULES"
- Icon: D20 die
- "Roll d20 + trait bonus. That's it."

BOTTOM SECTION - Key Stats in badges:
- "5 HP per commoner"
- "d20 + modifier"
- "0-3 points per event"
- "Traits: +2 / 0 / -2"

Footer: "No prep. No complicated rules. Just chaos."

Style: Medieval manuscript meets modern infographic. Use parchment textures subtly. Icons should be simple line art or flat design. Typography should feel bold and readable.`,
  },
  {
    id: 'gameplay',
    title: '2. Gameplay Loop',
    description: 'How to Play - circular flow diagram',
    prompt: `Create a 16:9 infographic showing the complete gameplay loop of Tournament of Pigs. Dark medieval aesthetic with gold/amber accents.

Title: "HOW TO PLAY TOURNAMENT OF PIGS"

Create a CIRCULAR FLOW DIAGRAM with 4 main stages connected by arrows:

STAGE 1 (Top) - "SETUP"
- Icon: Scroll or checklist
- "Create session, name players, assign commoners"
- Small text: "2-6 commoners per player"

STAGE 2 (Right) - "RUN EVENT"
- Icon: Crossed swords or flag
- "Race, Brawl, Gauntlet, or Puzzle"
- Small text: "Follow the 6-phase event loop"

STAGE 3 (Bottom) - "SCORE"
- Icon: Trophy
- "Award 0-3 points per player"
- Small text: "3=Win, 2=Strong, 1=Ok, 0=Fail"

STAGE 4 (Left) - "LOOT"
- Icon: Treasure chest
- "Winner draws Silver, others draw Crap"
- Small text: "Assign items to commoners"

CENTER of circle:
"REPEAT UNTIL SATISFIED"
with subtext "Run as many events as you want!"

BOTTOM BANNER:
"Highest total score wins the tournament!"

Style: Clean circular diagram with numbered stages. Use connecting arrows that feel hand-drawn or medieval. Each stage should have its own subtle color coding.`,
  },
  {
    id: 'phase1',
    title: '3. Phase 1: Briefing',
    description: 'Set the scene',
    prompt: `Create a 16:9 infographic for "PHASE 1: BRIEFING" from Tournament of Pigs. Dark background with blue/purple accent (calm, storytelling mood).

Title: "PHASE 1: BRIEFING" with subtitle "Set the Scene"

Main visual: A GM figure reading from a scroll to seated players (silhouette or simple illustration style)

THREE KEY ACTIONS in horizontal layout:

1. "READ THE SCENARIO"
   - Icon: Open book or scroll
   - "Each event has a briefing text in the app"

2. "DESCRIBE THE ENVIRONMENT"
   - Icon: Castle/arena outline
   - "Paint a picture: sights, sounds, smells"

3. "EXPLAIN THE OBJECTIVE"
   - Icon: Target/flag
   - "What are players trying to achieve?"

EXAMPLE BOX (styled like a quote):
"Before you stretches a muddy pit, ankle-deep in filth. The rules are simple: last peasant standing wins!"

PRO TIP at bottom:
"Hammy acting encouraged. Bad accents welcome."

Style: Theatrical/storytelling feel. Use spotlight effect or scroll unfurling visual metaphor.`,
  },
  {
    id: 'phase2',
    title: '4. Phase 2: Setup',
    description: 'Prepare the battlefield',
    prompt: `Create a 16:9 infographic for "PHASE 2: SETUP" from Tournament of Pigs. Dark background with warm orange/yellow accents (preparation energy).

Title: "PHASE 2: SETUP" with subtitle "Prepare the Battlefield"

Main visual: A simple top-down arena sketch being drawn, with tokens being placed

THREE KEY ACTIONS:

1. "SKETCH THE ZONES"
   - Icon: Map/pencil
   - Show simple zone diagram: Start → Middle → End
   - "Use paper, whiteboard, or just describe it"

2. "PLACE THE TOKENS"
   - Icon: Game pieces/meeples
   - "Each player positions their commoners"

3. "MARK HAZARDS"
   - Icon: Warning triangle or spike trap
   - "Traps, obstacles, environmental dangers"

ZONE SYSTEM DIAGRAM:
Three connected circles labeled:
"ENGAGED" (red) → "NEAR" (yellow) → "FAR" (green)
Caption: "Theatre of Mind - No Grid Required"

PRO TIP:
"Coins, dice, or candy work great as commoner tokens!"

Style: Blueprint/tactical planning aesthetic. Use dotted lines, simple shapes, planning grid in background.`,
  },
  {
    id: 'phase3',
    title: '5. Phase 3: Rounds',
    description: 'Where the chaos happens!',
    prompt: `Create a 16:9 infographic for "PHASE 3: ROUNDS" from Tournament of Pigs. Dark background with RED/ORANGE accents (action, intensity).

Title: "PHASE 3: ROUNDS" with subtitle "Where the Chaos Happens!"

Main visual: Explosive action scene silhouette with dice flying

CORE MECHANIC (large, centered):
"d20 + TRAIT vs DC"
With visual example: "🎲 14 + 2 = 16 vs DC 15 ✓"

DIFFICULTY CLASSES in horizontal badges:
- "EASY 10" (green)
- "TRICKY 15" (yellow)
- "HARD 18" (orange)
- "HEROIC 20" (red)

THE 5 TRAITS (icon for each):
- STRONG (fist) - "Melee, lifting"
- QUICK (lightning) - "Speed, dodging"
- TOUGH (shield) - "Endurance"
- CLEVER (lightbulb) - "Puzzles, traps"
- CHARMING (heart) - "Social, bluff"

COMBAT BOX:
"ATTACK: d20 + trait vs AC 10"
"DAMAGE: 1d6 HP"
"0 HP = Knocked Out"

ROUND STRUCTURE:
"Go around table → Each player acts with one commoner → Repeat"

Style: Dynamic, energetic. Use motion lines, impact effects. This should feel exciting and fast-paced.`,
  },
  {
    id: 'phase4',
    title: '6. Phase 4: Resolution',
    description: 'The dust settles',
    prompt: `Create a 16:9 infographic for "PHASE 4: RESOLUTION" from Tournament of Pigs. Dark background with PURPLE/GRAY accents (conclusion, settling dust).

Title: "PHASE 4: RESOLUTION" with subtitle "The Dust Settles"

Main visual: Battlefield aftermath scene - some standing, some fallen figures (silhouette style)

THREE KEY ACTIONS:

1. "ANNOUNCE RESULTS"
   - Icon: Megaphone/proclamation
   - "Dramatically declare winners and losers"

2. "UPDATE STATUSES"
   - Icon: Heart with minus
   - Status badges: "ALIVE" (green) "KO" (yellow) "DEAD" (red) "OUT" (gray)

3. "TAKE NOTES"
   - Icon: Quill/notepad
   - "Record memorable moments in the app"

MEMORABLE DEATHS BOX (styled like obituary):
"Throg the Bold slipped in mud and was trampled by three peasants. He died as he lived: confused and covered in filth."
Caption: "Make deaths memorable!"

PRO TIP:
"Give fallen commoners dramatic last words"

Style: Somber but with dark humor. Tombstone shapes, memorial wreaths used ironically. Post-battle calm aesthetic.`,
  },
  {
    id: 'phase5',
    title: '7. Phase 5: Scoring',
    description: 'Award the points',
    prompt: `Create a 16:9 infographic for "PHASE 5: SCORING" from Tournament of Pigs. Dark background with GOLD/YELLOW accents (achievement, reward).

Title: "PHASE 5: SCORING" with subtitle "Award the Points"

Main visual: Trophy or medal being awarded, with scoreboard in background

SCORING SCALE (large, visual):
Four horizontal bars or podium steps:
- "3 POINTS" - "Clear winner / Dominated" - Crown icon
- "2 POINTS" - "Strong showing / Close second" - Medal icon
- "1 POINT" - "Participated / Survived" - Thumbs up
- "0 POINTS" - "Failed / Wiped out" - Skull

BONUS POINT callout (starred):
"+1 FOR CLEVER PLAY"
"Award for especially creative or entertaining actions"

EXAMPLE SCENARIOS in small boxes:
"First across the finish line → 3 pts"
"Survived but came last → 1 pt"
"All commoners died → 0 pts"
"Did something hilariously stupid → +1 bonus"

SCOREBOARD PREVIEW:
Simple table showing: Player 1: 5pts, Player 2: 3pts, Player 3: 7pts
Caption: "Cumulative score across all events"

Style: Awards ceremony feel. Use ribbons, badges, podium imagery. Celebratory but not over-the-top.`,
  },
  {
    id: 'phase6',
    title: '8. Phase 6: Prizes',
    description: 'Distribute the loot!',
    prompt: `Create a 16:9 infographic for "PHASE 6: PRIZES" from Tournament of Pigs. Dark background with contrasting GOLD and BROWN accents.

Title: "PHASE 6: PRIZES" with subtitle "Distribute the Loot!"

Main visual: Two treasure chests side by side - one glowing gold, one grimy

TWO DECKS (split layout):

LEFT SIDE - "SILVER DECK" (glowing, premium feel):
- Icon: Sparkling treasure chest
- "The Good Stuff"
- "Winner draws from here"
- Example items: "Magic Sword +2", "Lucky Charm", "Healing Potion"

RIGHT SIDE - "CRAP DECK" (dingy, humorous):
- Icon: Rusty bucket or garbage
- "Junk & Jokes"
- "Everyone else draws here"
- Example items: "Slightly Used Bandage", "Rock (just a rock)", "IOUs"

HOW IT WORKS (3 steps):
1. "Highest scorer draws SILVER"
2. "Everyone else draws CRAP"
3. "Assign loot to specific commoners"

FUN FACT callout:
"The Crap deck items are intentionally terrible - that's part of the fun!"

PRO TIP:
"Add your own cards to either deck in the Loot tab"

Style: Treasure hunting aesthetic. Contrast the shiny/desirable with the comically bad. Use treasure map textures subtly.`,
  },
  {
    id: 'reference',
    title: '9. Quick Reference Card',
    description: 'Cheat sheet for gameplay',
    prompt: `Create a 16:9 infographic serving as a QUICK REFERENCE CARD for Tournament of Pigs. Dark background, clean layout, high information density.

Title: "TOURNAMENT OF PIGS - QUICK REFERENCE"

FOUR QUADRANT LAYOUT:

TOP LEFT - "CHECKS"
d20 + trait (−2/0/+2) vs DC
DC: Easy 10 | Tricky 15 | Hard 18 | Heroic 20
"Clever ideas = -2 to -5 DC bonus"

TOP RIGHT - "COMBAT"
Attack: d20 + trait vs AC 10
Damage: 1d6
0 HP = KO (or Dead in hard mode)
"Strong/Quick apply to melee attacks"

BOTTOM LEFT - "COMMONERS"
HP: 5 | AC: 10
5 Traits: Strong, Quick, Tough, Clever, Charming
One at +2, one at -2, rest at 0
Status: Alive → KO → Dead

BOTTOM RIGHT - "SCORING"
3 = Win | 2 = Strong | 1 = OK | 0 = Fail
+1 bonus for clever play
Winner → Silver deck
Others → Crap deck

CENTER STRIP (horizontal bar):
"THE 6 PHASES: Briefing → Setup → Rounds → Resolution → Scoring → Prizes"

FOOTER:
"Arena GM App: Dice rolling, HP tracking, live scoreboard at /play"

Style: Clean, utilitarian, easy to read at a glance. Use consistent iconography. This is a reference tool, not a promotional piece. High contrast text.`,
  },
]

function CopyablePrompt({ item }: { item: PromptItem }) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      const textArea = document.createElement('textarea')
      textArea.value = item.prompt
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{item.title}</div>
          <div className="text-xs text-muted-foreground">{item.description}</div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
            'bg-secondary text-muted-foreground',
            'tap-target touch-manipulation transition-colors',
            'hover:text-foreground'
          )}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        <button
          onClick={handleCopy}
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center shrink-0',
            'tap-target touch-manipulation transition-all',
            copied
              ? 'bg-green-500/20 text-green-400'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
          aria-label={copied ? 'Copied!' : 'Copy prompt'}
        >
          {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>

      {/* Expandable Content */}
      {expanded && (
        <div className="px-3 pb-3">
          <pre className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap font-mono">
            {item.prompt}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function PromptsPage() {
  const [allExpanded, setAllExpanded] = useState(false)

  return (
    <TabLayout>
      <Header title="Infographic Prompts" subtitle="For Nano Banana Pro" showSettings={false} />

      <div className="p-4 space-y-4 pb-nav">
        {/* Info */}
        <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
          <p className="text-sm text-primary/90">
            <span className="font-medium">16:9 aspect ratio</span> prompts for creating
            Tournament of Pigs infographics. Tap copy to grab any prompt!
          </p>
        </div>

        {/* Prompts List */}
        <div className="space-y-2">
          {PROMPTS.map((item) => (
            <CopyablePrompt key={item.id} item={item} />
          ))}
        </div>
      </div>
    </TabLayout>
  )
}

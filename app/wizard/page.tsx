'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionStore } from '@/lib/stores/sessionStore'
import { useHydration } from '@/lib/hooks/useHydration'
import { LoadingScreen } from '@/components/layout/LoadingSpinner'
import { SEED_TEMPLATES } from '@/lib/constants/templates'
import { cn } from '@/lib/utils/cn'
import {
  ChevronRight,
  ChevronLeft,
  Users,
  Swords,
  Trophy,
  Dices,
  BookOpen,
  Sparkles,
  Target,
  Flag,
  HelpCircle,
  Play,
  Check,
  X,
} from 'lucide-react'

// Wizard Steps
type WizardStep =
  | 'welcome'
  | 'table-setup'
  | 'create-session'
  | 'name-players'
  | 'meet-commoners'
  | 'choose-event'
  | 'how-to-run'
  | 'phase-briefing'
  | 'phase-setup'
  | 'phase-rounds'
  | 'phase-resolution'
  | 'phase-scoring'
  | 'phase-prizes'
  | 'ready-to-play'

const WIZARD_STEPS: WizardStep[] = [
  'welcome',
  'table-setup',
  'create-session',
  'name-players',
  'meet-commoners',
  'choose-event',
  'how-to-run',
  'phase-briefing',
  'phase-setup',
  'phase-rounds',
  'phase-resolution',
  'phase-scoring',
  'phase-prizes',
  'ready-to-play',
]

const STEP_GROUPS = {
  intro: ['welcome', 'table-setup'],
  setup: ['create-session', 'name-players', 'meet-commoners'],
  event: ['choose-event', 'how-to-run'],
  phases: ['phase-briefing', 'phase-setup', 'phase-rounds', 'phase-resolution', 'phase-scoring', 'phase-prizes'],
  finish: ['ready-to-play'],
}

export default function WizardPage() {
  const router = useRouter()
  const isHydrated = useHydration()
  const session = useSessionStore((state) => state.session)
  const createNewSession = useSessionStore((state) => state.createNewSession)
  const updatePlayer = useSessionStore((state) => state.updatePlayer)
  const startEvent = useSessionStore((state) => state.startEvent)

  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome')
  const [sessionName, setSessionName] = useState('Tournament of Pigs')
  const [playerCount, setPlayerCount] = useState(3)
  const [commonersPerPlayer, setCommonersPerPlayer] = useState(3)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2', 'Player 3'])

  // Update player names array when count changes
  useEffect(() => {
    setPlayerNames((prev) => {
      const newNames = [...prev]
      while (newNames.length < playerCount) {
        newNames.push(`Player ${newNames.length + 1}`)
      }
      return newNames.slice(0, playerCount)
    })
  }, [playerCount])

  if (!isHydrated) {
    return <LoadingScreen />
  }

  const currentStepIndex = WIZARD_STEPS.indexOf(currentStep)
  const progress = ((currentStepIndex + 1) / WIZARD_STEPS.length) * 100

  const canGoBack = currentStepIndex > 0
  const canGoNext = currentStepIndex < WIZARD_STEPS.length - 1

  const goNext = () => {
    if (canGoNext) {
      // Handle session creation when leaving create-session step
      if (currentStep === 'create-session' && !session) {
        createNewSession({
          name: sessionName,
          playerCount,
          commonersPerPlayer,
        })
      }
      setCurrentStep(WIZARD_STEPS[currentStepIndex + 1])
    }
  }

  const goBack = () => {
    if (canGoBack) {
      setCurrentStep(WIZARD_STEPS[currentStepIndex - 1])
    }
  }

  const skipToPlay = () => {
    // If we have a session and selected template, start the event
    if (session && selectedTemplate) {
      const template = SEED_TEMPLATES.find((t) => t.id === selectedTemplate)
      if (template) {
        startEvent({
          templateId: template.id,
          title: template.title,
          phase: 'briefing',
          roundNumber: 1,
          notes: '',
        })
      }
    }
    router.push('/session')
  }

  const handleSavePlayerNames = () => {
    if (session) {
      session.players.forEach((player, index) => {
        if (playerNames[index] && playerNames[index] !== player.name) {
          updatePlayer(player.id, { name: playerNames[index] })
        }
      })
    }
  }

  // Get current group for progress indicator
  const getCurrentGroup = (): string => {
    for (const [group, steps] of Object.entries(STEP_GROUPS)) {
      if (steps.includes(currentStep)) return group
    }
    return 'intro'
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Progress */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border safe-area-inset-top">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={() => router.push('/session')}
            className="tap-target flex items-center justify-center text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            Campaign Guide
          </span>
          <button
            onClick={skipToPlay}
            className="text-sm text-primary font-medium tap-target"
          >
            Skip
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 pb-3">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            {Object.keys(STEP_GROUPS).map((group) => (
              <span
                key={group}
                className={cn(
                  'capitalize',
                  getCurrentGroup() === group && 'text-primary font-medium'
                )}
              >
                {group === 'phases' ? 'Gameplay' : group}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 pb-32 overflow-y-auto">
        {/* WELCOME */}
        {currentStep === 'welcome' && (
          <StepContent
            icon={<Sparkles className="w-12 h-12 text-primary" />}
            title="Welcome to Tournament of Pigs!"
            subtitle="Let's get you set up to run an amazing game night"
          >
            <div className="space-y-4 text-muted-foreground">
              <p>
                You're about to be the <span className="text-foreground font-medium">Game Master (GM)</span> for
                a chaotic, hilarious tournament where players send their peasants
                into deadly challenges.
              </p>
              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium text-foreground mb-2">What is this game?</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Users className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>2-5 players each control a team of "commoners" (peasant NPCs)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Swords className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>You run events: races, brawls, gauntlets, puzzles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Trophy className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Award points based on performance (0-3 per event)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Dices className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Simple d20 rolls with trait bonuses (+2 or -2)</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm">
                This wizard will walk you through setup, teach you the rules, and
                get your first event running in minutes!
              </p>
            </div>
          </StepContent>
        )}

        {/* TABLE SETUP */}
        {currentStep === 'table-setup' && (
          <StepContent
            icon={<BookOpen className="w-12 h-12 text-primary" />}
            title="Gather Your Table"
            subtitle="What you need to play"
          >
            <div className="space-y-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium mb-3">Physical Setup (Optional)</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span><span className="text-foreground">Tokens/minis</span> for commoners (coins, meeples, anything works)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span><span className="text-foreground">Paper/whiteboard</span> to sketch zones and hazards</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span><span className="text-foreground">Dice</span> - just d20 and d6 (or use the app!)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                <h4 className="font-medium text-green-400 mb-2">The App Handles:</h4>
                <ul className="space-y-1 text-sm text-green-300/80">
                  <li>• Tracking HP, status, and conditions</li>
                  <li>• Rolling dice with modifiers</li>
                  <li>• Scoring and event progression</li>
                  <li>• Loot card management</li>
                  <li>• Live player scoreboard view</li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground">
                Players can view their teams live at <span className="text-primary font-mono">/play</span> on
                any device!
              </p>
            </div>
          </StepContent>
        )}

        {/* CREATE SESSION */}
        {currentStep === 'create-session' && (
          <StepContent
            icon={<Target className="w-12 h-12 text-primary" />}
            title="Create Your Session"
            subtitle="Set up the tournament"
          >
            <div className="space-y-6">
              {/* Session Name */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Session Name
                </label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className={cn(
                    'w-full h-12 px-4 rounded-lg',
                    'bg-input border border-border',
                    'text-foreground placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-2 focus:ring-ring'
                  )}
                  placeholder="e.g., Friday Night Chaos"
                />
              </div>

              {/* Number of Players */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  How many players? <span className="text-xs">(not counting you, the GM)</span>
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setPlayerCount(num)}
                      className={cn(
                        'flex-1 h-14 rounded-lg font-bold text-lg transition-colors',
                        'tap-target touch-manipulation',
                        playerCount === num
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  3 players is the sweet spot, but 2-5 works great!
                </p>
              </div>

              {/* Commoners per Player */}
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Commoners per player
                </label>
                <div className="flex gap-2">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setCommonersPerPlayer(num)}
                      className={cn(
                        'flex-1 h-12 rounded-lg font-medium transition-colors',
                        'tap-target touch-manipulation',
                        commonersPerPlayer === num
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  3 is quick, 5-6 for longer games with more chaos
                </p>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <p className="text-sm text-muted-foreground">
                  Total commoners: <span className="text-foreground font-bold">{playerCount * commonersPerPlayer}</span>
                </p>
              </div>
            </div>
          </StepContent>
        )}

        {/* NAME PLAYERS */}
        {currentStep === 'name-players' && (
          <StepContent
            icon={<Users className="w-12 h-12 text-primary" />}
            title="Name Your Players"
            subtitle="Who's playing tonight?"
          >
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter names for each player so everyone knows who's who on the scoreboard.
              </p>

              <div className="space-y-3">
                {playerNames.map((name, index) => (
                  <div key={index}>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Player {index + 1}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        const newNames = [...playerNames]
                        newNames[index] = e.target.value
                        setPlayerNames(newNames)
                      }}
                      onBlur={handleSavePlayerNames}
                      className={cn(
                        'w-full h-12 px-4 rounded-lg',
                        'bg-input border border-border',
                        'text-foreground placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring'
                      )}
                      placeholder={`Player ${index + 1}`}
                    />
                  </div>
                ))}
              </div>

              <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                <p className="text-sm text-yellow-300/80">
                  <span className="font-medium text-yellow-400">Tip:</span> You can always
                  edit names later in the Players tab!
                </p>
              </div>
            </div>
          </StepContent>
        )}

        {/* MEET COMMONERS */}
        {currentStep === 'meet-commoners' && (
          <StepContent
            icon={<Swords className="w-12 h-12 text-primary" />}
            title="Meet the Commoners"
            subtitle="Understanding your peasant warriors"
          >
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Each player controls a team of commoners - simple peasants with
                5 HP and basic traits. They're expendable and hilarious.
              </p>

              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium mb-3">Every Commoner Has:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Hit Points (HP)</span>
                    <span className="font-bold">5</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Armor Class (AC)</span>
                    <span className="font-bold">10</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">5 Traits</span>
                    <span className="font-bold">+2 / 0 / -2</span>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium mb-3">The 5 Traits</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <span className="font-medium">Strong</span>
                    <p className="text-xs text-muted-foreground">Melee, lifting</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <span className="font-medium">Quick</span>
                    <p className="text-xs text-muted-foreground">Speed, dodging</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <span className="font-medium">Tough</span>
                    <p className="text-xs text-muted-foreground">Endurance, HP</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <span className="font-medium">Clever</span>
                    <p className="text-xs text-muted-foreground">Puzzles, traps</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2 col-span-2">
                    <span className="font-medium">Charming</span>
                    <p className="text-xs text-muted-foreground">Social, bluffing</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                <p className="text-sm text-primary/90">
                  <span className="font-medium">Each commoner gets:</span> One trait at +2,
                  one at -2, the rest at 0. This is randomly assigned!
                </p>
              </div>
            </div>
          </StepContent>
        )}

        {/* CHOOSE EVENT */}
        {currentStep === 'choose-event' && (
          <StepContent
            icon={<Flag className="w-12 h-12 text-primary" />}
            title="Choose Your First Event"
            subtitle="What challenge will you run?"
          >
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Events are the core of the game. Pick one to start with!
              </p>

              <div className="space-y-3">
                {SEED_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border transition-all',
                      'tap-target touch-manipulation',
                      selectedTemplate === template.id
                        ? 'bg-primary/20 border-primary'
                        : 'bg-card border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{template.title}</h4>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          template.category === 'race' && 'bg-blue-500/20 text-blue-400',
                          template.category === 'brawl' && 'bg-red-500/20 text-red-400',
                          template.category === 'gauntlet' && 'bg-orange-500/20 text-orange-400'
                        )}>
                          {template.category}
                        </span>
                      </div>
                      {selectedTemplate === template.id && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {template.briefing}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </StepContent>
        )}

        {/* HOW TO RUN */}
        {currentStep === 'how-to-run' && (
          <StepContent
            icon={<Play className="w-12 h-12 text-primary" />}
            title="How Events Work"
            subtitle="The 6-phase event loop"
          >
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Every event follows the same 6 phases. The app guides you through each one!
              </p>

              <div className="space-y-2">
                {[
                  { phase: 'Briefing', desc: 'Read the scenario to your players', icon: '1' },
                  { phase: 'Setup', desc: 'Position tokens, explain hazards', icon: '2' },
                  { phase: 'Rounds', desc: 'The action! Roll dice, track damage', icon: '3' },
                  { phase: 'Resolution', desc: 'Wrap up, note what happened', icon: '4' },
                  { phase: 'Scoring', desc: 'Award 0-3 points per player', icon: '5' },
                  { phase: 'Prizes', desc: 'Winner draws Silver, others Crap', icon: '6' },
                ].map((item) => (
                  <div
                    key={item.phase}
                    className="flex items-center gap-3 bg-card rounded-lg p-3 border border-border"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-sm">
                      {item.icon}
                    </div>
                    <div>
                      <span className="font-medium">{item.phase}</span>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                Let's walk through each phase in detail...
              </p>
            </div>
          </StepContent>
        )}

        {/* PHASE: BRIEFING */}
        {currentStep === 'phase-briefing' && (
          <StepContent
            icon={<div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-2xl font-bold">1</div>}
            title="Phase 1: Briefing"
            subtitle="Set the scene"
          >
            <div className="space-y-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium mb-2">What to do:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Read the event description aloud (it's in the app)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Describe the environment - make it vivid!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Explain the goal and any special rules</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                <h4 className="font-medium text-yellow-400 mb-2">Example:</h4>
                <p className="text-sm text-yellow-300/80 italic">
                  "Before you stretches a muddy pit, ankle-deep in filth. The rules are simple:
                  last peasant standing wins. The mud makes you slow - all Quick checks are
                  at -2. Ready? FIGHT!"
                </p>
              </div>
            </div>
          </StepContent>
        )}

        {/* PHASE: SETUP */}
        {currentStep === 'phase-setup' && (
          <StepContent
            icon={<div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-2xl font-bold">2</div>}
            title="Phase 2: Setup"
            subtitle="Prepare the battlefield"
          >
            <div className="space-y-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium mb-2">What to do:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Sketch zones on paper (or just describe them)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Have players place their commoner tokens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Mark any hazards or objectives</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium mb-2">Zone System (Theatre of Mind)</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  No grid needed! Just use zones:
                </p>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded">Engaged</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded">Near</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded">Far</span>
                </div>
              </div>
            </div>
          </StepContent>
        )}

        {/* PHASE: ROUNDS */}
        {currentStep === 'phase-rounds' && (
          <StepContent
            icon={<div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-2xl font-bold">3</div>}
            title="Phase 3: Rounds"
            subtitle="Where the action happens!"
          >
            <div className="space-y-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium mb-2">Running Rounds:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Go around the table - each player acts with one commoner</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>When a check is needed: roll d20 + trait (+2, 0, or -2)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Compare to the DC (Difficulty Class)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium mb-3">Difficulty Classes (DC)</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-green-500/20 rounded-lg p-2 text-center">
                    <span className="font-bold text-green-400">10</span>
                    <p className="text-xs text-green-300/80">Easy</p>
                  </div>
                  <div className="bg-yellow-500/20 rounded-lg p-2 text-center">
                    <span className="font-bold text-yellow-400">15</span>
                    <p className="text-xs text-yellow-300/80">Tricky</p>
                  </div>
                  <div className="bg-orange-500/20 rounded-lg p-2 text-center">
                    <span className="font-bold text-orange-400">18</span>
                    <p className="text-xs text-orange-300/80">Hard</p>
                  </div>
                  <div className="bg-red-500/20 rounded-lg p-2 text-center">
                    <span className="font-bold text-red-400">20</span>
                    <p className="text-xs text-red-300/80">Heroic</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium mb-2">Combat (if fighting):</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li><span className="text-foreground">Attack:</span> d20 + trait vs AC 10</li>
                  <li><span className="text-foreground">Damage:</span> 1d6 HP</li>
                  <li><span className="text-foreground">At 0 HP:</span> Knocked Out (or Dead in hard mode)</li>
                </ul>
              </div>
            </div>
          </StepContent>
        )}

        {/* PHASE: RESOLUTION */}
        {currentStep === 'phase-resolution' && (
          <StepContent
            icon={<div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-2xl font-bold">4</div>}
            title="Phase 4: Resolution"
            subtitle="Wrap up the event"
          >
            <div className="space-y-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium mb-2">What to do:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Announce the results dramatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Update commoner statuses (KO, Dead, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                    <span>Take notes if needed (the app has a notes field)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30">
                <h4 className="font-medium text-yellow-400 mb-2">Pro Tip:</h4>
                <p className="text-sm text-yellow-300/80">
                  Make deaths memorable! "Throg the Bold slipped in the mud and was
                  immediately trampled by three other peasants. He died as he lived:
                  confused and covered in filth."
                </p>
              </div>
            </div>
          </StepContent>
        )}

        {/* PHASE: SCORING */}
        {currentStep === 'phase-scoring' && (
          <StepContent
            icon={<div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-2xl font-bold">5</div>}
            title="Phase 5: Scoring"
            subtitle="Award the points"
          >
            <div className="space-y-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium mb-3">Simple Scoring (0-3 per player)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="font-bold text-xl">3</span>
                    <span className="text-muted-foreground">Clear winner / dominated</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="font-bold text-xl">2</span>
                    <span className="text-muted-foreground">Strong showing / close second</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="font-bold text-xl">1</span>
                    <span className="text-muted-foreground">Participated / survived</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="font-bold text-xl">0</span>
                    <span className="text-muted-foreground">Failed / wiped out</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                <h4 className="font-medium text-green-400 mb-2">Bonus Point!</h4>
                <p className="text-sm text-green-300/80">
                  Award +1 for especially clever or entertaining play.
                  "That was so stupid it was brilliant - take a bonus point!"
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                The app shows score buttons for each player. Just tap to award!
              </p>
            </div>
          </StepContent>
        )}

        {/* PHASE: PRIZES */}
        {currentStep === 'phase-prizes' && (
          <StepContent
            icon={<div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-2xl font-bold">6</div>}
            title="Phase 6: Prizes"
            subtitle="Distribute the loot!"
          >
            <div className="space-y-4">
              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium mb-2">Two Loot Decks:</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <span className="font-medium text-yellow-400">Silver Deck</span>
                      <p className="text-muted-foreground">Good stuff! Winner draws from here.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
                      <span className="text-xl">💩</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-400">Crap Deck</span>
                      <p className="text-muted-foreground">Junk and jokes. Everyone else draws here.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium mb-2">How it works:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">1.</span>
                    <span>Highest scorer draws from <span className="text-yellow-400">Silver</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">2.</span>
                    <span>Everyone else draws from <span className="text-gray-400">Crap</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">3.</span>
                    <span>Assign loot to specific commoners</span>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground">
                You can add your own cards in the Loot tab, or skip this phase entirely!
              </p>
            </div>
          </StepContent>
        )}

        {/* READY TO PLAY */}
        {currentStep === 'ready-to-play' && (
          <StepContent
            icon={<Sparkles className="w-12 h-12 text-primary" />}
            title="You're Ready!"
            subtitle="Time to play"
          >
            <div className="space-y-4">
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30 text-center">
                <p className="text-lg font-medium text-green-400 mb-2">
                  Session Created!
                </p>
                <p className="text-sm text-green-300/80">
                  {playerCount} players × {commonersPerPlayer} commoners = {playerCount * commonersPerPlayer} total peasants ready for chaos!
                </p>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium mb-3">Quick Reference:</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><span className="text-foreground font-medium">Checks:</span> d20 + trait vs DC</p>
                  <p><span className="text-foreground font-medium">Attack:</span> d20 + trait vs AC 10</p>
                  <p><span className="text-foreground font-medium">Damage:</span> 1d6</p>
                  <p><span className="text-foreground font-medium">Score:</span> 0-3 points per event</p>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <h4 className="font-medium mb-3">Navigation Tabs:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <span className="font-medium">Session</span>
                    <p className="text-xs text-muted-foreground">Scoreboard & dice</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <span className="font-medium">Players</span>
                    <p className="text-xs text-muted-foreground">Manage commoners</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <span className="font-medium">Events</span>
                    <p className="text-xs text-muted-foreground">Run events</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-2">
                    <span className="font-medium">Loot</span>
                    <p className="text-xs text-muted-foreground">Draw cards</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
                <p className="text-sm text-primary/90">
                  <span className="font-medium">Player View:</span> Share <span className="font-mono">/play</span> with
                  players so they can see scores live on their phones!
                </p>
              </div>
            </div>
          </StepContent>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border p-4 safe-area-inset-bottom">
        <div className="flex gap-3">
          {canGoBack && (
            <button
              onClick={goBack}
              className={cn(
                'h-14 px-6 rounded-lg flex items-center justify-center gap-2',
                'bg-secondary text-secondary-foreground',
                'font-medium',
                'tap-target touch-manipulation',
                'hover:bg-secondary/80 active:bg-secondary/70',
                'transition-colors'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}

          <button
            onClick={currentStep === 'ready-to-play' ? skipToPlay : goNext}
            className={cn(
              'flex-1 h-14 rounded-lg flex items-center justify-center gap-2',
              'bg-primary text-primary-foreground',
              'font-semibold text-lg',
              'tap-target touch-manipulation',
              'hover:bg-primary/90 active:bg-primary/80',
              'transition-colors'
            )}
          >
            {currentStep === 'ready-to-play' ? (
              <>
                Start Playing! <Play className="w-5 h-5" />
              </>
            ) : (
              <>
                Next <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Step Content Wrapper Component
function StepContent({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">{icon}</div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

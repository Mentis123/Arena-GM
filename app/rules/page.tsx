'use client'

import { useSessionStore } from '@/lib/stores/sessionStore'
import { useHydration } from '@/lib/hooks/useHydration'
import { TabLayout } from '@/components/layout/TabLayout'
import { Header } from '@/components/layout/Header'
import { LoadingScreen } from '@/components/layout/LoadingSpinner'
import { DEFAULT_RULESET, DC_LABELS, TRAIT_LABELS } from '@/lib/constants/rules'
import { cn } from '@/lib/utils/cn'

export default function RulesPage() {
  const isHydrated = useHydration()
  const session = useSessionStore((state) => state.session)
  const ruleset = session?.ruleset ?? DEFAULT_RULESET

  if (!isHydrated) {
    return <LoadingScreen />
  }

  return (
    <TabLayout>
      <Header title="Rules" subtitle="Micro ruleset" />

      <div className="p-4 space-y-6">
        {/* Checks */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold mb-3">Checks</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Roll d20 + trait bonus. Beat the DC to succeed.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Easy</span>
              <span className="font-mono">DC {ruleset.checkDCs.easy}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tricky</span>
              <span className="font-mono">DC {ruleset.checkDCs.tricky}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Hard</span>
              <span className="font-mono">DC {ruleset.checkDCs.hard}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Heroic</span>
              <span className="font-mono">DC {ruleset.checkDCs.heroic}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-3">
            💡 Clever ideas can reduce DC by 2-5.
          </p>
        </section>

        {/* Traits */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold mb-3">Traits</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Each commoner has one +2 trait and one -2 trait.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(TRAIT_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded-lg text-sm"
              >
                <span>{label}</span>
                <span className="text-muted-foreground">±2 or 0</span>
              </div>
            ))}
          </div>
        </section>

        {/* Combat */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold mb-3">Combat</h3>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Attack: </span>
              d20 + {ruleset.attackBonusIfTraitMatches} (if Strong/Quick applies)
            </div>
            <div>
              <span className="text-muted-foreground">Hit: </span>
              Roll ≥ target AC ({ruleset.defaultAC} default)
            </div>
            <div>
              <span className="text-muted-foreground">Damage: </span>
              1{ruleset.damageDie}
            </div>
            <div>
              <span className="text-muted-foreground">At 0 HP: </span>
              {ruleset.zeroHPBehaviour === 'ko' ? 'Knocked Out' : 'Dead'}
            </div>
          </div>
        </section>

        {/* Movement */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold mb-3">Movement</h3>
          <p className="text-sm text-muted-foreground">
            Zones: <span className="text-foreground">Engaged</span> → <span className="text-foreground">Near</span> → <span className="text-foreground">Far</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            GM adjudicates distance. No grid required.
          </p>
        </section>

        {/* Scoring */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold mb-3">Scoring</h3>
          <p className="text-sm text-muted-foreground mb-3">
            GM awards points per player per event.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>3 points</span>
              <span className="text-muted-foreground">Clear win</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>2 points</span>
              <span className="text-muted-foreground">Strong showing</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>1 point</span>
              <span className="text-muted-foreground">Partial/survived</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>0 points</span>
              <span className="text-muted-foreground">Failed/wiped</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-3">
            💡 Award +1 "style bonus" for clever play.
          </p>
        </section>

        {/* Loot */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold mb-3">Loot</h3>
          <p className="text-sm text-muted-foreground">
            After each event:
          </p>
          <ul className="text-sm mt-2 space-y-1">
            <li>• Winner draws from <span className="text-gray-400">Silver</span> deck</li>
            <li>• Others draw from <span className="text-amber-600">Crap</span> deck</li>
            <li>• GM can override at any time</li>
          </ul>
        </section>
      </div>
    </TabLayout>
  )
}

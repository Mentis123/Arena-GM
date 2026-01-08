'use client'

import { useState } from 'react'
import { useSessionStore } from '@/lib/stores/sessionStore'
import { useHydration } from '@/lib/hooks/useHydration'
import { TabLayout } from '@/components/layout/TabLayout'
import { Header } from '@/components/layout/Header'
import { LoadingScreen } from '@/components/layout/LoadingSpinner'
import { PlayerCard } from '@/components/players/PlayerCard'
import { CommonerSheet } from '@/components/players/CommonerSheet'
import type { Commoner } from '@/lib/types'

export default function PlayersPage() {
  const isHydrated = useHydration()
  const session = useSessionStore((state) => state.session)
  const [selectedCommoner, setSelectedCommoner] = useState<{
    playerId: string
    commoner: Commoner
  } | null>(null)

  if (!isHydrated) {
    return <LoadingScreen />
  }

  if (!session) {
    return (
      <TabLayout>
        <Header title="Players" />
        <div className="p-4 text-center text-muted-foreground">
          <p>No active session.</p>
          <p className="text-sm mt-2">Create a session first.</p>
        </div>
      </TabLayout>
    )
  }

  return (
    <TabLayout>
      <Header
        title="Players"
        subtitle={`${session.players.length} players`}
      />

      <div className="p-4 space-y-4">
        {session.players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onCommonerClick={(commoner) =>
              setSelectedCommoner({ playerId: player.id, commoner })
            }
          />
        ))}
      </div>

      {/* Commoner Detail Sheet */}
      {selectedCommoner && (
        <CommonerSheet
          playerId={selectedCommoner.playerId}
          commoner={selectedCommoner.commoner}
          onClose={() => setSelectedCommoner(null)}
        />
      )}
    </TabLayout>
  )
}

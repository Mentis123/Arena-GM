'use client'

import { useRef } from 'react'
import { useSessionStore } from '@/lib/stores/sessionStore'
import { useHydration } from '@/lib/hooks/useHydration'
import { TabLayout } from '@/components/layout/TabLayout'
import { Header } from '@/components/layout/Header'
import { LoadingScreen } from '@/components/layout/LoadingSpinner'
import { cn } from '@/lib/utils/cn'
import { Download, Upload, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const isHydrated = useHydration()
  const session = useSessionStore((state) => state.session)
  const clearSession = useSessionStore((state) => state.clearSession)
  const importSession = useSessionStore((state) => state.importSession)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isHydrated) {
    return <LoadingScreen />
  }

  const handleExport = () => {
    if (!session) return

    const data = JSON.stringify(session, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `arena-gm-${session.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)

        // Basic validation
        if (!data.id || !data.players || !data.schemaVersion) {
          alert('Invalid session file')
          return
        }

        if (session && !confirm('This will replace your current session. Continue?')) {
          return
        }

        importSession(data)
        alert('Session imported successfully!')
      } catch (err) {
        alert('Failed to parse session file')
      }
    }
    reader.readAsText(file)

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to delete this session? This cannot be undone.')) {
      clearSession()
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border safe-area-inset-top">
        <div className="flex items-center h-14 px-4">
          <Link
            href="/session"
            className="tap-target flex items-center justify-center text-muted-foreground mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Session Info */}
        {session && (
          <section className="bg-card rounded-xl p-4 border border-border">
            <h3 className="font-semibold mb-3">Current Session</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span>{session.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Players</span>
                <span>{session.players.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Events Run</span>
                <span>{session.eventsRun.filter(e => e.endedAt).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(session.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </section>
        )}

        {/* Export/Import */}
        <section className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">Data</h3>

          <button
            onClick={handleExport}
            disabled={!session}
            className={cn(
              'w-full h-14 rounded-lg flex items-center justify-center gap-3',
              'bg-card border border-border',
              'font-medium',
              'tap-target touch-manipulation',
              'hover:bg-card/80 active:bg-card/70',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            <Download className="w-5 h-5" />
            Export Session
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'w-full h-14 rounded-lg flex items-center justify-center gap-3',
              'bg-card border border-border',
              'font-medium',
              'tap-target touch-manipulation',
              'hover:bg-card/80 active:bg-card/70',
              'transition-colors'
            )}
          >
            <Upload className="w-5 h-5" />
            Import Session
          </button>

          {session && (
            <button
              onClick={handleClear}
              className={cn(
                'w-full h-14 rounded-lg flex items-center justify-center gap-3',
                'bg-destructive/10 border border-destructive/30 text-destructive',
                'font-medium',
                'tap-target touch-manipulation',
                'hover:bg-destructive/20 active:bg-destructive/30',
                'transition-colors'
              )}
            >
              <Trash2 className="w-5 h-5" />
              Delete Session
            </button>
          )}
        </section>

        {/* About */}
        <section className="bg-card rounded-xl p-4 border border-border">
          <h3 className="font-semibold mb-3">About</h3>
          <p className="text-sm text-muted-foreground">
            Arena GM is a mobile GM companion for tabletop tournaments.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            All data is stored locally on your device. No account required.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Version 1.0.0
          </p>
        </section>

        {/* Legal */}
        <section className="text-xs text-muted-foreground text-center pb-8">
          <p>
            Arena GM is an independent tool for tabletop RPG game masters.
            It is not affiliated with, endorsed by, or associated with any game publisher.
          </p>
        </section>
      </div>
    </div>
  )
}

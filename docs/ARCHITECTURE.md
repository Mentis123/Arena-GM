# Architecture — Arena GM

This document outlines the technical decisions, storage strategy, PWA implementation, and risk mitigations for Arena GM.

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 15 (App Router) | Modern React, excellent PWA support, Vercel-native |
| Language | TypeScript | Type safety, better DX, catch errors early |
| Styling | Tailwind CSS | Utility-first, small bundle, design system ready |
| Components | shadcn/ui | Accessible, customisable, no vendor lock-in |
| State | Zustand | Lightweight (2KB), persist middleware, simple API |
| Storage | Dexie.js (IndexedDB) | Complex queries, schema migrations, reactive |
| PWA | Manual service worker | Full control, version-keyed caching, Next.js native |
| Deployment | Vercel | Edge network, automatic HTTPS, preview deploys |

---

## Project Structure

```
arena-gm/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Redirect to /session
│   ├── manifest.ts               # Dynamic PWA manifest
│   ├── sw.ts                     # Service worker source
│   ├── (tabs)/                   # Tab-based navigation group
│   │   ├── layout.tsx            # Bottom nav shell
│   │   ├── session/
│   │   │   └── page.tsx          # Session overview
│   │   ├── players/
│   │   │   └── page.tsx          # Player/commoner management
│   │   ├── events/
│   │   │   └── page.tsx          # Event templates & runner
│   │   ├── loot/
│   │   │   └── page.tsx          # Deck management
│   │   └── rules/
│   │       └── page.tsx          # Rules reference
│   └── settings/
│       └── page.tsx              # Export/import, theme
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── layout/
│   │   ├── BottomNav.tsx
│   │   ├── Header.tsx
│   │   └── BottomSheet.tsx
│   ├── session/
│   │   ├── SessionCard.tsx
│   │   ├── Scoreboard.tsx
│   │   └── QuickDice.tsx
│   ├── players/
│   │   ├── PlayerCard.tsx
│   │   ├── CommonerCard.tsx
│   │   ├── CommonerSheet.tsx
│   │   └── HPControl.tsx
│   ├── events/
│   │   ├── EventRunner.tsx
│   │   ├── PhaseStepper.tsx
│   │   ├── RoundTracker.tsx
│   │   └── ScoringPanel.tsx
│   ├── dice/
│   │   ├── DiceRoller.tsx
│   │   ├── ModifierChips.tsx
│   │   └── RollHistory.tsx
│   └── loot/
│       ├── DeckBuilder.tsx
│       ├── CardReveal.tsx
│       └── AssignCard.tsx
│
├── lib/
│   ├── db/
│   │   ├── index.ts              # Dexie database instance
│   │   ├── schema.ts             # Database schema (versioned)
│   │   └── migrations.ts         # Schema migrations
│   ├── stores/
│   │   ├── sessionStore.ts       # Session state + persistence
│   │   ├── eventStore.ts         # Event runner state
│   │   └── uiStore.ts            # UI state (non-persisted)
│   ├── hooks/
│   │   ├── useHydration.ts       # Wait for store hydration
│   │   ├── useDice.ts            # Dice rolling logic
│   │   └── useTimer.ts           # Countdown timer
│   ├── utils/
│   │   ├── names.ts              # Random name generator
│   │   ├── traits.ts             # Trait assignment logic
│   │   ├── dice.ts               # Dice rolling functions
│   │   └── export.ts             # Session export/import
│   └── constants/
│       ├── templates.ts          # Seed event templates
│       ├── conditions.ts         # Standard conditions list
│       └── rules.ts              # Micro ruleset defaults
│
├── public/
│   ├── icons/                    # PWA icons (192, 512)
│   ├── splash/                   # iOS splash screens
│   └── offline.html              # Offline fallback page
│
├── docs/                         # Project documentation
│   ├── PRD_v2.md
│   ├── ARCHITECTURE.md
│   ├── UX_FLOWS.md
│   ├── BACKLOG.md
│   └── IP_GUARDRAILS.md
│
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json
```

---

## Storage Architecture

### Database Schema (Dexie.js)

```typescript
// lib/db/schema.ts
import Dexie, { Table } from 'dexie'

export interface SessionRecord {
  id: string
  data: Session  // Full session object (JSON)
  updatedAt: number
  schemaVersion: number
}

export interface DeckCardRecord {
  id: string
  deck: 'crap' | 'silver'
  name: string
  text: string
  tags: string[]
}

export interface SettingsRecord {
  key: string
  value: unknown
}

export class ArenaGMDatabase extends Dexie {
  sessions!: Table<SessionRecord>
  deckCards!: Table<DeckCardRecord>
  settings!: Table<SettingsRecord>

  constructor() {
    super('arena-gm')

    // Version 1: Initial schema
    this.version(1).stores({
      sessions: 'id, updatedAt',
      deckCards: 'id, deck, [deck+id]',
      settings: 'key'
    })

    // Future versions add upgrade logic here
  }
}

export const db = new ArenaGMDatabase()
```

### State Management (Zustand + Dexie)

```typescript
// lib/stores/sessionStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { db } from '../db'

// Custom storage adapter for Dexie
const dexieStorage = {
  getItem: async (name: string) => {
    const record = await db.sessions.get(name)
    return record?.data ? JSON.stringify(record.data) : null
  },
  setItem: async (name: string, value: string) => {
    const data = JSON.parse(value)
    await db.sessions.put({
      id: name,
      data,
      updatedAt: Date.now(),
      schemaVersion: CURRENT_SCHEMA_VERSION
    })
  },
  removeItem: async (name: string) => {
    await db.sessions.delete(name)
  }
}

interface SessionState {
  session: Session | null
  isHydrated: boolean

  // Actions
  createSession: (config: SessionConfig) => void
  updatePlayer: (playerId: string, updates: Partial<Player>) => void
  updateCommoner: (commonerId: string, updates: Partial<Commoner>) => void
  // ... more actions
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      session: null,
      isHydrated: false,

      createSession: (config) => {
        const session = generateSession(config)
        set({ session })
      },

      updateCommoner: (commonerId, updates) => {
        const session = get().session
        if (!session) return

        // Immutable update
        set({
          session: {
            ...session,
            players: session.players.map(p => ({
              ...p,
              commoners: p.commoners.map(c =>
                c.id === commonerId ? { ...c, ...updates } : c
              )
            }))
          }
        })
      },
      // ... more actions
    }),
    {
      name: 'current-session',
      storage: createJSONStorage(() => dexieStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      }
    }
  )
)
```

### Hydration Guard

```typescript
// lib/hooks/useHydration.ts
import { useSessionStore } from '../stores/sessionStore'

export function useHydration() {
  const isHydrated = useSessionStore(state => state.isHydrated)
  return isHydrated
}

// Usage in components
function SessionPage() {
  const isHydrated = useHydration()

  if (!isHydrated) {
    return <LoadingSpinner />
  }

  return <SessionContent />
}
```

---

## PWA Strategy

### Service Worker Architecture

```typescript
// app/sw.ts (compiled to public/sw.js)
const CACHE_VERSION = 'v1.0.0'  // Synced with package.json
const CACHE_NAME = `arena-gm-${CACHE_VERSION}`

const PRECACHE_URLS = [
  '/',
  '/session',
  '/players',
  '/events',
  '/loot',
  '/rules',
  '/offline.html',
  // Critical JS/CSS will be added by build process
]

// Install: precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    })
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key.startsWith('arena-gm-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch: network-first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET and external requests
  if (request.method !== 'GET') return
  if (!request.url.startsWith(self.location.origin)) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone)
          })
        }
        return response
      })
      .catch(() => {
        // Serve from cache on network failure
        return caches.match(request).then((cached) => {
          if (cached) return cached

          // Fallback for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline.html')
          }

          return new Response('Offline', { status: 503 })
        })
      })
  )
})
```

### PWA Manifest

```typescript
// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Arena GM',
    short_name: 'Arena GM',
    description: 'Mobile GM companion for tabletop tournaments',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ]
  }
}
```

### iOS-Specific Considerations

```html
<!-- app/layout.tsx head section -->
<head>
  <!-- PWA meta tags -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Arena GM" />

  <!-- Prevent zoom on input focus (iOS) -->
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

  <!-- iOS splash screens -->
  <link rel="apple-touch-startup-image" href="/splash/splash.png" />

  <!-- Theme color -->
  <meta name="theme-color" content="#0a0a0a" />
</head>
```

---

## Data Flow

### Session Creation Flow

```
User taps "New Session"
        │
        ▼
┌─────────────────┐
│ SessionConfig   │  (players: 3, commoners: 3)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ generateSession │  Pure function
│ - Generate IDs  │
│ - Random names  │
│ - Assign traits │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Zustand Store   │  set({ session })
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Persist MW      │  Debounced 300ms
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Dexie (IDB)     │  sessions.put(record)
└─────────────────┘
```

### Dice Roll Flow

```
User taps "Roll"
        │
        ▼
┌─────────────────┐
│ DiceRoller      │  Component
│ - die: 'd20'    │
│ - modifier: +2  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ rollDice()      │  lib/utils/dice.ts
│ - Random [1,20] │
│ - Add modifier  │
│ - Return result │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Local UI State  │  useState for history
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Session Log     │  Optional (store.addLog)
└─────────────────┘
```

---

## Component Architecture

### Design Principles

1. **Colocation**: Components with their styles, tests, and types
2. **Composition**: Small, single-purpose components
3. **Props-down, events-up**: Unidirectional data flow
4. **Server vs Client**: Default server, `'use client'` only when needed

### Component Categories

| Category | Server/Client | Purpose |
|----------|---------------|---------|
| `app/**/page.tsx` | Server | Route entry points |
| `components/ui/*` | Client | shadcn/ui primitives |
| `components/layout/*` | Client | Navigation, sheets |
| `components/session/*` | Client | Session-specific UI |
| `components/dice/*` | Client | Interactive dice |

### Example Component

```typescript
// components/players/HPControl.tsx
'use client'

interface HPControlProps {
  current: number
  max: number
  onChange: (newValue: number) => void
}

export function HPControl({ current, max, onChange }: HPControlProps) {
  const clamp = (value: number) => Math.max(0, Math.min(max, value))

  return (
    <div className="flex items-center gap-2">
      {/* Large tap targets: min 48px */}
      <button
        className="h-12 w-12 rounded-lg bg-red-900 text-white text-lg font-bold
                   active:bg-red-800 touch-manipulation"
        onClick={() => onChange(clamp(current - 3))}
        aria-label="Decrease HP by 3"
      >
        -3
      </button>
      <button
        className="h-12 w-12 rounded-lg bg-red-700 text-white text-lg font-bold
                   active:bg-red-600 touch-manipulation"
        onClick={() => onChange(clamp(current - 1))}
        aria-label="Decrease HP by 1"
      >
        -1
      </button>

      <span className="w-16 text-center text-xl font-mono">
        {current}/{max}
      </span>

      <button
        className="h-12 w-12 rounded-lg bg-green-700 text-white text-lg font-bold
                   active:bg-green-600 touch-manipulation"
        onClick={() => onChange(clamp(current + 1))}
        aria-label="Increase HP by 1"
      >
        +1
      </button>
      <button
        className="h-12 w-12 rounded-lg bg-green-900 text-white text-lg font-bold
                   active:bg-green-800 touch-manipulation"
        onClick={() => onChange(clamp(current + 3))}
        aria-label="Increase HP by 3"
      >
        +3
      </button>
    </div>
  )
}
```

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | <1.5s | Lighthouse |
| Largest Contentful Paint | <2.5s | Lighthouse |
| Time to Interactive | <3.0s | Lighthouse |
| Lighthouse Performance | ≥90 | Mobile, 3G throttled |
| Lighthouse PWA | ≥90 | All audits pass |
| Bundle Size (JS) | <100KB | Initial load |
| IndexedDB Write | <50ms | Debounced, background |

### Optimisation Strategies

1. **Code Splitting**: Dynamic imports for non-critical routes
2. **Image Optimisation**: next/image with WebP, proper sizing
3. **Font Loading**: System fonts preferred; if custom, `font-display: swap`
4. **CSS**: Tailwind purge, critical CSS inlined
5. **State**: Selective subscriptions to prevent unnecessary re-renders

---

## Error Handling

### Storage Errors

```typescript
// Wrap all IndexedDB operations
async function safeStorageOp<T>(op: () => Promise<T>): Promise<T | null> {
  try {
    return await op()
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // Storage full
      toast.error('Storage full. Please export and clear old sessions.')
    } else if (error.name === 'InvalidStateError') {
      // Database closed (iOS backgrounding)
      await db.open()
      return safeStorageOp(op)
    }
    console.error('Storage error:', error)
    return null
  }
}
```

### Offline Detection

```typescript
// lib/hooks/useOnlineStatus.ts
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
```

---

## Security Considerations

### Data Validation

```typescript
// lib/utils/export.ts
import { z } from 'zod'

const SessionSchema = z.object({
  id: z.string().uuid(),
  schemaVersion: z.number().int().positive(),
  // ... full schema
})

export function validateImport(data: unknown): Session | null {
  const result = SessionSchema.safeParse(data)
  if (!result.success) {
    console.error('Invalid import data:', result.error)
    return null
  }
  return result.data
}
```

### No Sensitive Data

- No user accounts or authentication
- No API keys or secrets in client code
- All data stored locally on user's device
- Export files contain only session data

---

## Testing Strategy

| Type | Tool | Coverage Target |
|------|------|-----------------|
| Unit | Vitest | Utils, pure functions |
| Component | Vitest + Testing Library | Interactive components |
| E2E | Playwright | Critical user flows |
| Visual | Playwright screenshots | Responsive layouts |

### Critical Test Scenarios

1. Session creation flow
2. HP adjustment (all buttons)
3. Event phase progression
4. Dice rolling (statistical distribution)
5. Export/import round-trip
6. Offline functionality
7. iOS Safari specific behaviours

---

## Deployment

### Vercel Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for better PWA caching
  // output: 'export', // Uncomment if full static is needed

  // Headers for PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

### Environment Variables

```bash
# .env.local (development only)
NEXT_PUBLIC_APP_VERSION=$npm_package_version
```

---

## Risk Mitigations (Technical)

| Risk | Mitigation |
|------|------------|
| iOS storage eviction | Prompt home screen install; show storage warning at 80% |
| Zustand hydration race | Gate rendering with `useHydration()` hook |
| Service worker stale | Version-keyed cache; force refresh on deploy |
| IndexedDB corruption | Validate data on read; export backup prompts |
| Large bundle size | Code splitting; lazy load event/loot tabs |
| Poor touch response | `touch-manipulation` CSS; debounce writes not reads |

---

*End of Architecture*

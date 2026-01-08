# PRD v2 — Arena GM (Vercel Mobile GM Companion)

**Author:** Adam (product owner) | **Builder:** Claude Code
**Date:** 2026-01-08
**Language:** Australian English
**Primary device:** iPhone (mobile-first), works on desktop too
**Hosting:** Vercel (Next.js)

---

## Research Notes

### Key Findings

#### 1. Mobile UX Patterns for GM Tools

**Thumb Zone Design (Critical)**
- 75% of mobile interactions are thumb-driven (Clark research)
- 49% of users hold smartphones with one hand (Hoober research)
- The screen divides into three zones:
  - **Natural zone** (bottom centre): Primary actions (Next, Roll, Save)
  - **Stretch zone** (middle/sides): Secondary actions
  - **Hard-to-reach zone** (top corners): Rarely-used actions only

**Tap Target Requirements**
- Minimum 48×48px tap targets (Android guideline)
- Apple recommends 44×44px minimum
- 8-10px padding between interactive elements to prevent mis-taps

**Navigation Patterns**
- Bottom navigation bar with 3–5 icons is standard for mobile-first apps
- Avoid hamburger menus in top-left (hard to reach one-handed)
- Swipe gestures as alternative to buttons for common actions

**GM Tool UX Anti-Patterns (from competitive research)**
- Opening keyboard for numeric input is slow—use +/- buttons instead
- Too many modals interrupt flow; prefer inline editing
- Cramped stat blocks on mobile cause frustration
- Lack of offline support = broken sessions

#### 2. iOS Safari PWA Constraints

**Storage Limits**
- Cache Storage: ~50MB strict limit
- IndexedDB: Up to 500MB
- **Critical risk**: iOS evicts PWA storage after ~7 days of inactivity for non-home-screen PWAs
- **Mitigation**: Prompt users to add to home screen; this provides near-permanent storage persistence

**Service Worker Limitations**
- No true background sync on iOS (unlike Android)
- Service workers suspend when app is backgrounded
- Cannot run continuous background tasks

**Storage Isolation**
- PWA installed to home screen has separate storage from Safari
- CacheStorage and Service Worker are shared with Safari (iOS 14+)
- IndexedDB, cookies, and localStorage remain isolated

**Update Strategy**
- Use versioned cache names tied to app version
- Clear old caches on service worker activation
- next-pwa package handles this automatically

#### 3. Local Persistence Strategy

**Recommendation: Dexie.js + Zustand**

| Library | Use Case | Why |
|---------|----------|-----|
| **Dexie.js** | IndexedDB wrapper | Superior querying, bulk operations, schema migrations, reactive hooks for React |
| **Zustand** | State management | Lightweight (2KB), persist middleware, simple API, async hydration support |
| **idb-keyval** | Rejected | Too simple for our complex data model with relationships |

**Hydration Considerations**
- Zustand's persist middleware with async storage (IndexedDB) does not hydrate on initial render
- Must handle "loading" state before store is hydrated
- Risk of race condition where empty store overwrites persisted data
- Solution: Use `onFinishHydration` callback to gate rendering

**Auto-save Pattern**
- Subscribe to Zustand store changes
- Debounce writes to IndexedDB (300ms recommended)
- Save on every action for zero data loss

#### 4. Competitive Analysis Insights

**What works well:**
- **Shieldmaiden**: Live initiative list visible to players; damage leaderboards; easy custom monster creation
- **Game Master 5th Edition**: Menu tray accessible from any screen; compendium lookup mid-combat
- **Improved Initiative**: Dual-screen mode (GM detail + player simple view); browser caching for offline
- **Physical initiative trackers**: High contrast (black/white) for clarity; wet-erase markers for flexibility

**What to avoid:**
- D&D Beyond mobile: Cannot alter player HP or apply conditions (read-only limitation)
- Roll20: No mobile app; limited condition automation
- Complex encounter builders: Too many taps to start combat
- Keyboard-heavy input: Slows down table-speed play

**Patterns to adopt:**
- "+/−" buttons for HP changes (not keyboard input)
- Drag-and-drop or simple tap to reorder initiative
- Condition tracking with automatic turn decrements
- One-tap "Next Turn" advancement
- Phase stepper with clear visual progress

#### 5. Security & Share Link Patterns

**For read-only scoreboard links (stretch goal):**
- Use opaque 6-character shortcodes (1.8B combinations)
- Store token→session mapping server-side or in query param with encrypted payload
- Short-lived tokens (24h expiry) for session data
- HTTPS required (Vercel default)
- Avoid sensitive data in URL (can appear in logs, browser history)
- For local-only MVP: Store share state in IndexedDB with UUID-based lookup

---

### Applied Decisions

Based on the research, we will:

| Finding | Decision |
|---------|----------|
| 75% thumb-driven interactions | Place primary CTAs (Next, Roll) in bottom third of screen |
| 48×48px minimum tap targets | Use min-h-12 (48px) for all interactive elements |
| iOS 7-day storage eviction | Prompt add-to-home-screen prominently; test eviction scenarios |
| Dexie better than idb-keyval | Use Dexie.js for IndexedDB with schema migrations |
| Zustand lightweight + persist | Use Zustand with Dexie-based custom storage adapter |
| Keyboard input is slow | HP changes via +/− buttons; dice modifiers via preset chips |
| Modal spam kills flow | Use bottom sheets, inline editing, and slide-over panels |
| Dual-screen pattern popular | Consider "cast to TV" mode for player scoreboard (V2) |
| Cache versioning prevents stale | Tie service worker cache to package.json version |
| Share links need short tokens | Use nanoid for 6-char URL-safe IDs |

---

### Known Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| iOS evicts IndexedDB data | Medium | Critical | Prompt home screen install; export reminders; auto-backup prompt |
| Hydration race condition | Medium | High | Gate rendering until `onFinishHydration`; never persist empty state |
| Service worker cache stale | Low | Medium | Version-keyed caches; force refresh on new deploy |
| Large session data exceeds storage | Low | Medium | Monitor storage usage; warn at 80% capacity |
| User loses phone mid-session | Medium | High | Export session regularly; consider cloud backup (V2) |
| Poor Lighthouse scores | Low | Medium | Lazy load non-critical routes; preload critical CSS |

---

## 1. Problem / Context

I have a boxed tabletop RPG tournament ("Tournament of Pigs") but:
- No dice, no other rulebooks, no accessories beyond what's in the box.
- 4 people total (me as GM + 3 players).

I want a mobile app that lets me run the night smoothly: setup, rules, dice rolling, character/commoner tracking, event flow, scoring, and loot draws—without needing any external materials.

**Copyright/IP constraint:**
- The app must NOT ship publisher copyrighted adventure text.
- Provide "bring-your-own-content" structure (templates + manual entry).
- Optionally allow private local photo references (no OCR required).
- App CAN include an original lightweight micro ruleset sufficient for a tournament night.

---

## 2. Goals (Success Criteria)

MVP should let a GM run a full session from a phone:
- Create a session in <60 seconds
- Generate and manage commoners for 3 players
- Run events with timed phases, checks, and basic combat (micro rules)
- Roll dice digitally (d20 + d6 are the main ones)
- Track scores, survivors, casualties/KO, and prize draws
- Maintain pace: "one-tap next" workflows; minimal typing during play
- Works offline after first load

---

## 3. Non-Goals

- Not a full D&D/DCC rules engine
- Not shipping the commercial module text/art
- Not accounts, payments, or social features for MVP
- Not OCR or automated extraction of printed content
- Not cross-device sync (local-only for MVP)

---

## 4. Users

**Primary:** GM (mobile operator)
**Secondary:** Players (optional read-only scoreboard link later)

---

## 5. Core User Stories

### GM Stories

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| G1 | Create session with 3 players | Session + 3 players created in <60s |
| G2 | Generate 2–5 commoners per player | Tap "Generate", get random names + traits |
| G3 | Quick rename commoner | Inline edit, no modal |
| G4 | Run event with phases | Briefing → Setup → Rounds → Resolution → Scoring → Prizes |
| G5 | Roll dice with modifiers | d20+2 in <3 taps; result logged |
| G6 | Mark commoner KO/dead | Single tap toggle; HP auto-sets to 0 |
| G7 | Adjust HP quickly | +1, −1, +3, −3 buttons; no keyboard |
| G8 | Add condition to commoner | Select from list; shows on card |
| G9 | Award points per player | Score entry at event end; totals update |
| G10 | Draw and assign loot | Draw from deck → reveal → assign to commoner |
| G11 | Export session | JSON file with all data |
| G12 | Import session | Load JSON, migrate schema if needed |

### Player Stories (Stretch)

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| P1 | View live scoreboard | Read-only link; auto-updates |
| P2 | See my surviving commoners | Filtered view per player |

---

## 6. Product Principles

1. **One-handed operation**: Primary actions in thumb zone
2. **Fast and minimal taps**: Avoid modal spam; use inline editing
3. **Offline-first**: Robust persistence; zero data loss
4. **Clear**: GM shouldn't hunt for controls mid-event
5. **Dark mode default**: High contrast; reduce eye strain
6. **Table-speed**: Everything achievable in <3 seconds

---

## 7. Information Architecture (Screens)

### Bottom Navigation (5 tabs)

| Tab | Icon | Primary Content |
|-----|------|-----------------|
| **Session** | Play | Current event card, "Next" CTA, quick dice, scoreboard summary |
| **Players** | Users | Player list → commoner cards; HP/status/loot actions |
| **Events** | Calendar | Template library; event runner with phases |
| **Loot** | Gift | Crap/Silver decks; draw/assign/discard |
| **Rules** | Book | Micro rules reference; house rules toggles |

### Secondary Screens (slide-over or modal)

- **Settings**: Export/import, PWA status, theme toggle
- **Commoner Detail**: Full edit form (rarely needed)
- **Deck Builder**: Card list + CSV import
- **Dice History**: Full roll log

---

## 8. Data Model (TypeScript)

```typescript
interface Session {
  id: string
  name: string
  createdAt: string // ISO
  updatedAt: string // ISO
  players: Player[]
  eventsRun: EventInstance[]
  decks: { crap: DeckState; silver: DeckState }
  ruleset: RulesetConfig
  log: LogEntry[]
  schemaVersion: number
}

interface Player {
  id: string
  name: string
  scoreTotal: number
  commoners: Commoner[]
}

interface Commoner {
  id: string
  name: string
  hpCurrent: number
  hpMax: number // default 5
  ac: number // default 10
  traits: {
    strong: TraitValue
    quick: TraitValue
    tough: TraitValue
    clever: TraitValue
    charming: TraitValue
  }
  status: 'alive' | 'ko' | 'dead' | 'out'
  conditions: string[]
  inventory: LootCardRef[]
  notes: string
}

type TraitValue = -2 | 0 | 2

interface EventTemplate {
  id: string
  title: string
  category: 'brawl' | 'race' | 'gauntlet' | 'puzzle' | 'mixed'
  briefing: string
  setupSteps: string[]
  roundStructure: 'timed' | 'turns' | 'freeform'
  suggestedChecks: { label: string; trait: string; dc: number }[]
  scoringGuidance: string
  gmNotes: string
}

interface EventInstance {
  id: string
  templateId: string | null
  title: string
  startedAt: string
  endedAt: string | null
  phase: 'briefing' | 'setup' | 'rounds' | 'resolution' | 'scoring' | 'prizes'
  roundNumber: number
  notes: string
  results: {
    playerId: string
    pointsAwarded: number
    survivors: string[]
    casualties: string[]
  }[]
}

interface DeckState {
  cards: DeckCard[]
  discard: DeckCard[]
}

interface DeckCard {
  id: string
  name: string
  text: string
  tags: string[]
}

interface LootCardRef {
  deck: 'crap' | 'silver'
  cardId: string
}

interface RulesetConfig {
  checkDCs: { easy: number; tricky: number; hard: number; heroic: number }
  defaultHP: number
  defaultAC: number
  attackBonusIfTraitMatches: number
  damageDie: 'd6'
  zeroHPBehaviour: 'ko' | 'dead'
  advantageEnabled: boolean
  scoringMode: 'simple'
}

interface LogEntry {
  ts: string
  type: 'roll' | 'damage' | 'status' | 'score' | 'loot' | 'note'
  text: string
  payload?: unknown
}
```

---

## 9. Micro Ruleset (Original, Included in App)

### Checks
- Roll d20 + trait bonus (+2 if relevant "good at", −2 if "bad at", else 0)
- DCs: 10 (easy), 15 (tricky), 18 (hard), 20 (heroic)
- Clever idea can reduce DC by 2–5 at GM discretion

### Combat (When Needed)
- Attack: d20 + 2 if Strong/Quick applies, else +0; hit if ≥ AC
- Damage: 1d6
- At 0 HP: KO (default). "Deadly mode" toggles 0 HP = dead.

### Movement
- Zones: Engaged / Near / Far (GM adjudicates)

### Scoring (Simple)
- GM awards 0–3 points per player per event:
  - 3 = clear win
  - 2 = strong showing
  - 1 = partial/survived
  - 0 = failed/wiped
- Optional +1 "style" bonus for clever play

### Loot
- Winner: 1 Silver draw; others: 1 Crap draw (configurable)
- GM can override and assign any card any time

---

## 10. Functional Requirements (MVP)

### Session Setup
- [ ] New session → add 3 players → choose commoners per player (default 3)
- [ ] Generate commoners with random names + auto-assigned traits (+2 and −2)
- [ ] Quick rename (inline tap-to-edit)

### Event Runner
- [ ] Start from template or ad-hoc
- [ ] Phase stepper with visual progress
- [ ] "Next" CTA advances phase
- [ ] Round tracker (+/−) and optional countdown timer with vibration

### Dice Roller
- [ ] Support: d4, d6, d8, d10, d12, d20, d100
- [ ] Modifier field with quick-select chips (+2, +0, −2)
- [ ] Roll history (last 20 rolls)
- [ ] Copy result to session log

### Commoner Management
- [ ] HP adjustment: +1, −1, +3, −3 buttons
- [ ] Status toggle: alive → ko → dead → out
- [ ] Condition picker (dropdown or chips)
- [ ] Notes field
- [ ] Assign loot from inventory

### Scoring
- [ ] At event end, allocate 0–3 points per player
- [ ] Auto-total on player cards
- [ ] Scoreboard summary on Session tab

### Loot
- [ ] Empty decks by default (GM creates cards)
- [ ] Deck builder: add/edit/delete cards
- [ ] CSV import (name, text, tags)
- [ ] Draw → reveal → assign to commoner → discard
- [ ] Shuffle discard back into deck

### Persistence
- [ ] IndexedDB via Dexie.js
- [ ] Auto-save on every state change (debounced 300ms)
- [ ] Schema versioning with migration support

### Export/Import
- [ ] Export session as JSON (with schemaVersion)
- [ ] Import JSON with schema migration if needed
- [ ] Validate imported data before applying

---

## 11. Stretch Goals (Post-MVP)

| Priority | Feature |
|----------|---------|
| V1 | Read-only scoreboard share link (opaque token) |
| V1 | QR code for share link |
| V1 | Local photo references viewer |
| V2 | Session summary PDF/text export |
| V2 | Cloud backup (optional, opt-in) |
| V2 | Multi-session management |

---

## 12. Technical Requirements

- **Framework**: Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: Zustand with persist middleware (custom Dexie adapter)
- **Storage**: Dexie.js (IndexedDB)
- **PWA**: next-pwa or manual service worker (version-keyed cache)
- **Performance**: Mobile Lighthouse ≥90 after first load
- **Accessibility**: VoiceOver labels; min 44×44px tap targets

---

## 13. Security / Privacy

- Local-first; no account required
- No analytics by default (future: opt-in, privacy-preserving)
- Share links use opaque tokens; minimal data exposed
- No copyrighted content shipped
- Export files are user-owned data

---

## 14. Acceptance Criteria (MVP)

- [ ] Can create session + 3 players + 3 commoners each in <60s
- [ ] Can run an event end-to-end: phases, rounds, casualties, scoring, loot
- [ ] Dice roller supports core dice + modifiers + roll log
- [ ] Works offline after first load; persistence survives refresh
- [ ] Export/import restores session correctly
- [ ] Mobile Lighthouse Performance ≥90, PWA ≥90
- [ ] All tap targets ≥44×44px
- [ ] No horizontal scroll on iPhone SE (smallest target)

---

## 15. Build Plan

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| 1 | Foundation | Next.js scaffold, Tailwind/shadcn, Dexie setup, Zustand stores, bottom nav shell |
| 2 | Core GM Loop | Session/Players screens, commoner cards, HP/status actions, dice roller |
| 3 | Events + Scoring | Event runner, phase stepper, round tracker, scoring UI |
| 4 | Loot Decks | Deck builder, CSV import, draw/assign/discard flow |
| 5 | PWA + Polish | Service worker, offline fallback, Lighthouse audit, a11y pass |

---

## 16. Seed Content (Generic, Original)

Three generic event templates included:

### Greased Sprint (Race)
- **Category**: Race
- **Briefing**: Commoners race across a hazard-filled course.
- **Setup**: Mark start, checkpoints, finish. Assign hazards.
- **Rounds**: Turns (each commoner acts once per round).
- **Checks**: Quick (DC 12) to advance; Tough (DC 15) to resist hazard damage.
- **Scoring**: First to finish = 3pts; others by placement.

### Crate Gauntlet (Gauntlet)
- **Category**: Gauntlet
- **Briefing**: Navigate trapped crates to reach the prize.
- **Setup**: Describe trap types (spikes, flame, pit).
- **Rounds**: Turns.
- **Checks**: Quick (DC 12) to avoid; Clever (DC 15) to disarm.
- **Scoring**: Reach end = 2pts; fewest casualties = +1pt.

### Mud Brawl (Brawl)
- **Category**: Brawl
- **Briefing**: Last commoner standing wins. It's muddy.
- **Setup**: Define arena zones.
- **Rounds**: Turns (initiative optional).
- **Checks**: Strong to grapple (DC 12); Quick to escape (DC 12).
- **Scoring**: Last standing = 3pts; KO'd but alive = 1pt.

---

*End of PRD v2*

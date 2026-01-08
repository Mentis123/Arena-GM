# Product Backlog — Arena GM

Prioritised feature backlog with acceptance criteria for MVP, V1, and V2 releases.

---

## Release Overview

| Release | Focus | Target |
|---------|-------|--------|
| **MVP** | Core GM loop; offline-first | Single-session tournament |
| **V1** | Polish + share features | Shareable scoreboard |
| **V2** | Advanced features | Multi-session, cloud backup |

---

## MVP Backlog

### Epic 1: Foundation

#### 1.1 Project Scaffold
**Priority:** P0 (Blocker)
**Points:** 3

**Description:** Set up Next.js 15 project with TypeScript, Tailwind CSS, and shadcn/ui.

**Acceptance Criteria:**
- [ ] Next.js 15 with App Router initialised
- [ ] TypeScript configured with strict mode
- [ ] Tailwind CSS configured with dark mode default
- [ ] shadcn/ui initialised with required components
- [ ] ESLint + Prettier configured
- [ ] Project runs locally with `npm run dev`

---

#### 1.2 Bottom Navigation Shell
**Priority:** P0 (Blocker)
**Points:** 2

**Description:** Implement persistent bottom navigation with 5 tabs.

**Acceptance Criteria:**
- [ ] Bottom nav visible on all tab routes
- [ ] 5 tabs: Session, Players, Events, Loot, Rules
- [ ] Active tab highlighted
- [ ] Icons and labels visible
- [ ] Minimum 48×48px tap targets
- [ ] Navigation works with browser back/forward

---

#### 1.3 IndexedDB Setup (Dexie)
**Priority:** P0 (Blocker)
**Points:** 3

**Description:** Configure Dexie.js database with schema versioning.

**Acceptance Criteria:**
- [ ] Dexie database initialised with schema v1
- [ ] Sessions table created
- [ ] DeckCards table created
- [ ] Settings table created
- [ ] Database opens without errors on page load
- [ ] Schema version stored with each record

---

#### 1.4 Zustand Store with Persistence
**Priority:** P0 (Blocker)
**Points:** 5

**Description:** Set up Zustand stores with Dexie persistence adapter.

**Acceptance Criteria:**
- [ ] Session store created with persist middleware
- [ ] Custom Dexie storage adapter implemented
- [ ] Auto-save on state changes (debounced 300ms)
- [ ] Hydration hook created and working
- [ ] Data survives page refresh
- [ ] Empty state handled gracefully (no crash)

---

### Epic 2: Session Management

#### 2.1 Create Session Flow
**Priority:** P0 (Critical)
**Points:** 5

**Description:** Allow GM to create a new session with players and commoners.

**Acceptance Criteria:**
- [ ] "New Session" button on empty Session tab
- [ ] Bottom sheet with session config form
- [ ] Session name input (pre-filled default)
- [ ] Player count selector (2-5, default 3)
- [ ] Commoners per player selector (2-6, default 3)
- [ ] "Create" generates session with all data
- [ ] Players auto-named "Player 1", "Player 2", etc.
- [ ] Commoners generated with random names
- [ ] Traits auto-assigned (+2 and -2)
- [ ] Total time <60 seconds (tested)

---

#### 2.2 Player List View
**Priority:** P0 (Critical)
**Points:** 3

**Description:** Display all players with their commoners on Players tab.

**Acceptance Criteria:**
- [ ] Player cards show name and score
- [ ] Commoner chips visible under each player
- [ ] Commoner chips show name and HP
- [ ] Tap player name to edit (inline)
- [ ] Visual indication of commoner status (alive/KO/dead)
- [ ] Smooth scroll for overflow

---

#### 2.3 Commoner Detail Sheet
**Priority:** P0 (Critical)
**Points:** 5

**Description:** Bottom sheet for viewing/editing commoner details.

**Acceptance Criteria:**
- [ ] Sheet opens on commoner chip tap
- [ ] Name editable (tap to edit)
- [ ] HP displayed with +1/-1/+3/-3 buttons
- [ ] Status toggle: alive → KO → dead → out
- [ ] All 5 traits displayed with values
- [ ] Conditions list (add/remove)
- [ ] Inventory list (assigned loot)
- [ ] Notes field
- [ ] Changes save immediately

---

#### 2.4 HP Quick Actions
**Priority:** P0 (Critical)
**Points:** 2

**Description:** Fast HP adjustment without opening detail sheet.

**Acceptance Criteria:**
- [ ] Long-press or swipe on commoner chip reveals HP controls
- [ ] +1/-1 buttons visible
- [ ] HP updates immediately in UI
- [ ] HP cannot go below 0 or above max
- [ ] At 0 HP, status auto-changes to KO (or dead if deadly mode)

---

### Epic 3: Dice Roller

#### 3.1 Quick Dice Widget
**Priority:** P0 (Critical)
**Points:** 3

**Description:** Dice roller widget on Session tab for quick rolls.

**Acceptance Criteria:**
- [ ] Widget visible on Session tab
- [ ] d20 selected by default
- [ ] Tap "Roll" to roll
- [ ] Result displayed prominently
- [ ] Roll animation or feedback
- [ ] Result clears on next roll

---

#### 3.2 Full Dice Roller
**Priority:** P0 (Critical)
**Points:** 5

**Description:** Complete dice roller with all dice types and modifiers.

**Acceptance Criteria:**
- [ ] Dice selector: d4, d6, d8, d10, d12, d20, d100
- [ ] Modifier chips: +2, +0, -2 (quick select)
- [ ] Custom modifier input (optional)
- [ ] Trait selector dropdown (applies appropriate modifier)
- [ ] Roll button (minimum 48×48px)
- [ ] Result shows: total, breakdown (e.g., "14 = 12 + 2")
- [ ] Success/fail indication against DC (optional)

---

#### 3.3 Roll History
**Priority:** P1 (Important)
**Points:** 2

**Description:** Display recent dice rolls.

**Acceptance Criteria:**
- [ ] Last 20 rolls stored in session
- [ ] History list shows die, modifier, result
- [ ] Timestamp on each roll
- [ ] Scrollable list
- [ ] Clear history option

---

### Epic 4: Event Runner

#### 4.1 Event Template Library
**Priority:** P0 (Critical)
**Points:** 3

**Description:** Display available event templates.

**Acceptance Criteria:**
- [ ] Events tab shows template list
- [ ] 3 seed templates included (Greased Sprint, Crate Gauntlet, Mud Brawl)
- [ ] Template card shows: title, category, brief description
- [ ] Tap template to start event
- [ ] "Ad-hoc Event" option for custom events

---

#### 4.2 Event Phase Stepper
**Priority:** P0 (Critical)
**Points:** 5

**Description:** Step through event phases with visual progress.

**Acceptance Criteria:**
- [ ] Phase indicator shows all 6 phases
- [ ] Current phase highlighted
- [ ] Completed phases marked
- [ ] Phase names: Briefing, Setup, Rounds, Resolution, Scoring, Prizes
- [ ] "Next →" button advances phase
- [ ] Cannot skip phases (sequential only)
- [ ] Can end event early (with confirmation)

---

#### 4.3 Briefing Phase
**Priority:** P0 (Critical)
**Points:** 2

**Description:** Display event briefing for GM to read.

**Acceptance Criteria:**
- [ ] Briefing text displayed prominently
- [ ] "Read this to players" instruction
- [ ] "Next →" advances to Setup

---

#### 4.4 Setup Phase
**Priority:** P0 (Critical)
**Points:** 2

**Description:** Display setup checklist.

**Acceptance Criteria:**
- [ ] Setup steps displayed as checklist
- [ ] Steps can be tapped to mark complete (optional UX)
- [ ] GM notes field available
- [ ] "Next →" advances to Rounds

---

#### 4.5 Rounds Phase
**Priority:** P0 (Critical)
**Points:** 5

**Description:** Core gameplay phase with round tracking.

**Acceptance Criteria:**
- [ ] Round counter displayed (starts at 1)
- [ ] +/- buttons to adjust round
- [ ] Suggested checks displayed from template
- [ ] Dice roller accessible
- [ ] Quick access to commoner HP/status
- [ ] Optional timer (countdown with vibration)
- [ ] "End Rounds →" advances to Resolution

---

#### 4.6 Resolution Phase
**Priority:** P0 (Critical)
**Points:** 2

**Description:** Record event outcomes.

**Acceptance Criteria:**
- [ ] Summary of survivors/casualties displayed
- [ ] Notes field for GM observations
- [ ] "Next →" advances to Scoring

---

#### 4.7 Scoring Phase
**Priority:** P0 (Critical)
**Points:** 3

**Description:** Award points to players.

**Acceptance Criteria:**
- [ ] Each player shown with score buttons (0, 1, 2, 3)
- [ ] Tap to select score
- [ ] Visual feedback on selection
- [ ] Scoring guidance text displayed
- [ ] "Next →" advances to Prizes

---

#### 4.8 Prizes Phase
**Priority:** P0 (Critical)
**Points:** 3

**Description:** Distribute loot cards.

**Acceptance Criteria:**
- [ ] Winner identified (highest score this event)
- [ ] Winner gets Silver draw prompt
- [ ] Others get Crap draw prompt
- [ ] Draw buttons visible for each player
- [ ] "Finish Event ✓" ends event and returns to Session

---

### Epic 5: Loot Decks

#### 5.1 Deck Builder
**Priority:** P0 (Critical)
**Points:** 5

**Description:** Create and manage loot card decks.

**Acceptance Criteria:**
- [ ] Loot tab shows Crap and Silver decks
- [ ] Each deck shows card count
- [ ] "Add Card" opens card creation form
- [ ] Card form: name, text, tags
- [ ] Card list scrollable
- [ ] Tap card to edit
- [ ] Swipe or long-press to delete
- [ ] "Shuffle" option to randomise deck

---

#### 5.2 CSV Import
**Priority:** P1 (Important)
**Points:** 3

**Description:** Import cards from CSV file.

**Acceptance Criteria:**
- [ ] "Import CSV" button on deck
- [ ] File picker opens
- [ ] CSV format: name,text,tags (comma-separated tags)
- [ ] Parse and add all valid rows
- [ ] Show count of imported cards
- [ ] Handle errors gracefully (skip invalid rows)

---

#### 5.3 Draw and Reveal
**Priority:** P0 (Critical)
**Points:** 3

**Description:** Draw cards from deck with reveal animation.

**Acceptance Criteria:**
- [ ] "Draw" button on deck
- [ ] Card revealed in modal
- [ ] Card shows name, text, tags
- [ ] "Assign" button to assign to commoner
- [ ] "Discard" button to put in discard pile
- [ ] Deck count updates after draw

---

#### 5.4 Assign to Commoner
**Priority:** P0 (Critical)
**Points:** 2

**Description:** Assign drawn card to a commoner's inventory.

**Acceptance Criteria:**
- [ ] Commoner picker shown after draw
- [ ] Only living commoners shown
- [ ] Tap commoner to assign
- [ ] Card appears in commoner's inventory
- [ ] Confirmation feedback

---

### Epic 6: Rules Reference

#### 6.1 Micro Rules Display
**Priority:** P0 (Critical)
**Points:** 2

**Description:** Display the micro ruleset for quick reference.

**Acceptance Criteria:**
- [ ] Rules tab shows all micro rules
- [ ] Sections: Checks, Combat, Movement, Scoring, Loot
- [ ] DC table displayed
- [ ] Collapsible sections for space
- [ ] Search/filter (optional)

---

#### 6.2 House Rules Toggles
**Priority:** P1 (Important)
**Points:** 3

**Description:** Configure ruleset options.

**Acceptance Criteria:**
- [ ] "0 HP = KO" vs "0 HP = Dead" toggle
- [ ] Advantage enabled toggle
- [ ] Default HP input
- [ ] Default AC input
- [ ] Changes apply to current session
- [ ] Settings persist

---

### Epic 7: Export/Import

#### 7.1 Export Session
**Priority:** P0 (Critical)
**Points:** 3

**Description:** Export session data to JSON file.

**Acceptance Criteria:**
- [ ] "Export" button in Settings
- [ ] Generates JSON file with all session data
- [ ] Includes schemaVersion
- [ ] File downloads with sensible name
- [ ] Works on iOS Safari (share sheet)

---

#### 7.2 Import Session
**Priority:** P0 (Critical)
**Points:** 3

**Description:** Import session from JSON file.

**Acceptance Criteria:**
- [ ] "Import" button in Settings
- [ ] File picker opens
- [ ] JSON validated before import
- [ ] Schema migration if needed
- [ ] Confirmation before overwriting current session
- [ ] Error message for invalid files

---

### Epic 8: PWA

#### 8.1 Service Worker
**Priority:** P0 (Critical)
**Points:** 5

**Description:** Implement service worker for offline support.

**Acceptance Criteria:**
- [ ] Service worker registered on first load
- [ ] Critical assets precached
- [ ] Network-first strategy with cache fallback
- [ ] Offline fallback page
- [ ] Cache versioned with app version
- [ ] Old caches cleaned on activate

---

#### 8.2 PWA Manifest
**Priority:** P0 (Critical)
**Points:** 2

**Description:** Configure PWA manifest for installability.

**Acceptance Criteria:**
- [ ] manifest.json generated
- [ ] App name, short name set
- [ ] Icons (192, 512) included
- [ ] Theme colour set (dark)
- [ ] Display: standalone
- [ ] Start URL: /

---

#### 8.3 iOS Install Prompt
**Priority:** P1 (Important)
**Points:** 2

**Description:** Prompt iOS users to add to home screen.

**Acceptance Criteria:**
- [ ] Detect iOS Safari (non-standalone)
- [ ] Show install instructions banner
- [ ] "Add to Home Screen" steps displayed
- [ ] Dismissable (remember preference)
- [ ] Only show once per session

---

### Epic 9: Polish

#### 9.1 Loading States
**Priority:** P1 (Important)
**Points:** 2

**Description:** Add loading states for async operations.

**Acceptance Criteria:**
- [ ] Hydration loading spinner
- [ ] Skeleton loaders for lists
- [ ] Button loading states
- [ ] No flash of empty content

---

#### 9.2 Error Handling
**Priority:** P1 (Important)
**Points:** 3

**Description:** Handle errors gracefully.

**Acceptance Criteria:**
- [ ] Storage errors show toast
- [ ] Import errors show details
- [ ] Offline state indicated
- [ ] Error boundaries prevent crashes

---

#### 9.3 Accessibility Audit
**Priority:** P1 (Important)
**Points:** 3

**Description:** Ensure accessibility compliance.

**Acceptance Criteria:**
- [ ] All buttons have aria-labels
- [ ] Focus indicators visible
- [ ] VoiceOver tested on iOS
- [ ] Colour contrast meets WCAG AA
- [ ] All tap targets ≥44×44px

---

#### 9.4 Performance Audit
**Priority:** P1 (Important)
**Points:** 3

**Description:** Meet Lighthouse performance targets.

**Acceptance Criteria:**
- [ ] Lighthouse Performance ≥90
- [ ] Lighthouse PWA ≥90
- [ ] Lighthouse Accessibility ≥90
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s

---

## V1 Backlog (Post-MVP)

### 10.1 Read-Only Scoreboard Link
**Priority:** P2
**Points:** 5

**Description:** Generate shareable link for players to view scoreboard.

**Acceptance Criteria:**
- [ ] "Share Scoreboard" button in Settings
- [ ] Generates opaque 6-character token
- [ ] Link format: /share/[token]
- [ ] Share page shows scoreboard only (read-only)
- [ ] Auto-refreshes periodically
- [ ] Token expires after 24 hours

---

### 10.2 QR Code for Share Link
**Priority:** P2
**Points:** 2

**Description:** Display QR code for share link.

**Acceptance Criteria:**
- [ ] QR code generated for share URL
- [ ] Displayed in modal
- [ ] Players can scan from GM's phone

---

### 10.3 Local Photo References
**Priority:** P3
**Points:** 5

**Description:** Attach photos to session for reference.

**Acceptance Criteria:**
- [ ] "Add Photo" option in Settings
- [ ] Photo picker opens
- [ ] Photos stored locally (not uploaded)
- [ ] Gallery view for attached photos
- [ ] Photos persist with session

---

### 10.4 Custom Event Templates
**Priority:** P2
**Points:** 5

**Description:** Create and save custom event templates.

**Acceptance Criteria:**
- [ ] "Create Template" button on Events tab
- [ ] Full template editor form
- [ ] Save to local storage
- [ ] Appears in template library
- [ ] Edit/delete custom templates

---

## V2 Backlog (Future)

### 11.1 Session Summary Export
**Priority:** P3
**Points:** 5

**Description:** Export formatted session summary.

**Acceptance Criteria:**
- [ ] Generate PDF or text summary
- [ ] Includes: final scores, events run, notable moments
- [ ] Export via share sheet

---

### 11.2 Multi-Session Management
**Priority:** P3
**Points:** 5

**Description:** Manage multiple saved sessions.

**Acceptance Criteria:**
- [ ] Session list view
- [ ] Create new session without losing current
- [ ] Switch between sessions
- [ ] Delete old sessions
- [ ] Storage usage indicator

---

### 11.3 Cloud Backup (Optional)
**Priority:** P3
**Points:** 8

**Description:** Optional cloud backup for session data.

**Acceptance Criteria:**
- [ ] Opt-in only
- [ ] Simple backup/restore
- [ ] No account required (anonymous tokens)
- [ ] Privacy-preserving

---

## Backlog Summary

| Release | Epic Count | Total Points | Critical Items |
|---------|------------|--------------|----------------|
| MVP | 9 | ~85 | 25 |
| V1 | 4 | ~17 | 0 |
| V2 | 3 | ~18 | 0 |

---

*End of Backlog*

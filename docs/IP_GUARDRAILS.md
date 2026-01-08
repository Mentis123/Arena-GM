# IP Guardrails — Arena GM

Clear rules for intellectual property compliance and content ownership.

---

## Core Principle

**Arena GM is a "bring-your-own-content" tool.** It provides structure, mechanics, and utilities—not copyrighted game content. Users supply their own adventure details, monster stats, and flavour text.

---

## DO: Allowed Content

### Original Content (Included)

| Content Type | Status | Notes |
|--------------|--------|-------|
| **Micro Ruleset** | ✅ Included | Original lightweight rules sufficient for tournament play |
| **Generic Event Templates** | ✅ Included | 3 seed templates with original text (Greased Sprint, Crate Gauntlet, Mud Brawl) |
| **Random Name Lists** | ✅ Included | Generic peasant names (non-derivative) |
| **Standard Conditions** | ✅ Included | Generic conditions (Prone, Grappled, etc.) are game-agnostic |
| **UI/UX Copy** | ✅ Included | All labels, instructions, and help text |
| **DC Numbers** | ✅ Included | Difficulty class concept is generic |

### User-Generated Content

| Content Type | Status | Notes |
|--------------|--------|-------|
| **Session Names** | ✅ User-created | User types their own |
| **Player Names** | ✅ User-created | Real names or nicknames |
| **Commoner Names** | ✅ User-editable | Can override generated names |
| **Custom Event Templates** | ✅ User-created | User writes all text |
| **Loot Cards** | ✅ User-created | User creates via deck builder or CSV import |
| **GM Notes** | ✅ User-created | Free-form text |
| **Local Photos** | ✅ User-owned | User's own photos; stored locally only |

---

## DON'T: Prohibited Content

### Never Include

| Content Type | Status | Reason |
|--------------|--------|--------|
| **Published Adventure Text** | ❌ Prohibited | Copyrighted by publisher |
| **Module Maps/Illustrations** | ❌ Prohibited | Copyrighted artwork |
| **Official Monster Stat Blocks** | ❌ Prohibited | Copyrighted game content |
| **Official Spell Descriptions** | ❌ Prohibited | Copyrighted game content |
| **Character Class Features** | ❌ Prohibited | Copyrighted game content |
| **Published NPC Descriptions** | ❌ Prohibited | Copyrighted narrative |
| **Trademarked Names** | ❌ Prohibited | "Dungeons & Dragons", "DCC", etc. in marketing |
| **SRD Content** | ⚠️ Avoid | Even OGL content has restrictions; stay original |

### Never Implement

| Feature | Status | Reason |
|---------|--------|--------|
| **OCR/Text Extraction** | ❌ Not implemented | Could facilitate copying copyrighted text |
| **Content Scraping** | ❌ Not implemented | No pulling data from official sources |
| **Pre-populated Databases** | ❌ Not implemented | No shipping third-party content |
| **"Import from D&D Beyond"** | ❌ Not implemented | Third-party integration issues |

---

## Micro Ruleset Originality

The included micro ruleset is **original work** designed for this app:

### Original Elements
- Trait system (+2/0/-2) is a simplified, original take on attributes
- DC scale (10/15/18/20) uses common numbers but original names (easy/tricky/hard/heroic)
- Scoring system (0-3 points) is original to this tournament format
- "Crap/Silver" deck naming is original
- Zone movement (Engaged/Near/Far) is a common pattern, not proprietary

### Derivative Concerns Addressed
- **d20 mechanic**: Public domain; used in countless games
- **Hit Points concept**: Generic game design; not owned by anyone
- **Armour Class concept**: Generic; widely used beyond D&D
- **Ability scores**: We use "traits" with different names (strong/quick/tough/clever/charming)

---

## Content Templates: How They Work

### Seed Templates (Included)

Each seed template contains ONLY:
1. **Title**: Original name (e.g., "Greased Sprint")
2. **Category**: Generic type (race, brawl, gauntlet)
3. **Briefing**: 1-2 sentences of original flavour
4. **Setup Steps**: Generic instructions
5. **Suggested Checks**: Trait + DC pairs
6. **Scoring Guidance**: Points allocation hints

Example (full text of "Greased Sprint"):
```
Title: Greased Sprint
Category: Race
Briefing: Commoners race across a hazard-filled course. First to finish wins.
Setup Steps:
  - Mark start, checkpoints, and finish
  - Assign hazards to zones
  - Position commoners at start
Round Structure: Turns
Suggested Checks:
  - Quick DC 12 to advance
  - Tough DC 15 to resist hazard damage
Scoring: First to finish = 3pts; others by placement
GM Notes: (empty - user fills in)
```

This is entirely original and does not reference any published adventure.

### User Templates

When users create custom templates, they:
- Write all text themselves
- Are responsible for their own content
- Store data locally (not uploaded to our servers)
- Can export/import for personal use

---

## Loot Cards: How They Work

### Empty by Default

**The app ships with zero loot cards.** Users must:
1. Create cards manually via deck builder, OR
2. Import via CSV file

### User Responsibility

When users create cards, they may:
- Invent original items
- Reference items from their physical game (for personal use)
- Import data they have rights to use

**We do not:**
- Ship pre-made card content
- Provide sample cards that copy published items
- Sync cards with external databases

### CSV Import Format

```csv
name,text,tags
Lucky Coin,+1 to one roll then discard,consumable
Rusty Sword,Deals 1d6-1 damage,weapon
```

The format is generic; users supply their own content.

---

## Photo References: How They Work

### Local Storage Only

- Photos are stored in the browser's local storage
- Photos are never uploaded to any server
- Photos are user's own (taken or owned by them)
- No OCR or text extraction is performed

### User Responsibility

Users may photograph their own books for personal reference. This is:
- Legal under personal use / fair use principles
- Their responsibility to manage
- Not facilitated by automated extraction

---

## Marketing & Communications

### Allowed Language

- "GM companion app"
- "Tabletop RPG session tracker"
- "Tournament night tool"
- "Works with any tabletop RPG"
- "Bring your own content"

### Prohibited Language

- "D&D companion app" (trademark)
- "DCC character tracker" (trademark)
- "Dungeon Crawl Classics tool" (trademark)
- "Compatible with [specific game]" (implies endorsement)
- Any publisher logos or official artwork

---

## Legal Disclaimer (For App)

Include in Settings/About:

> **Arena GM** is an independent tool for tabletop RPG game masters. It is not affiliated with, endorsed by, or associated with any game publisher.
>
> All game content (adventures, monsters, items, etc.) is created by users. The app provides structure and utilities only.
>
> Trademarks are property of their respective owners.

---

## Compliance Checklist

Before each release, verify:

- [ ] No copyrighted adventure text included
- [ ] No trademarked names in UI or marketing
- [ ] All seed templates contain only original text
- [ ] Loot decks ship empty
- [ ] No external content databases connected
- [ ] Legal disclaimer present in app
- [ ] README/docs avoid trademark claims

---

## Summary

| Question | Answer |
|----------|--------|
| Can the app include published adventure text? | **No** |
| Can users type in adventure text themselves? | **Yes** (their responsibility) |
| Can the app include original micro rules? | **Yes** |
| Can the app include generic templates? | **Yes** (if original) |
| Can users photograph their books? | **Yes** (their responsibility) |
| Can the app OCR book photos? | **No** |
| Can we say "D&D compatible"? | **No** |
| Can we say "works with any tabletop RPG"? | **Yes** |

---

*End of IP Guardrails*

# Customized-Journey Page — Implementation Spec

## Overview

This spec documents design changes and implementation steps for the Action Roadmap (customized-journey) tab, aligned with best-in-class references: MGIC "Your Road Home," CFPB Homebuyers Milestone Map, Monarch Money, Rocket Money, and Credit Karma.

---

## Phase 1: Above-the-Fold Simplification ✅ DONE

### 1.1 Hero Strip with Progress
- **Status:** Implemented
- **Location:** Lines ~677–706
- **Behavior:** Personal greeting, progress bar (X of 7 phases), animated fill
- **Refinement:** Progress bar uses `(completed / total) * 100` for visual momentum

### 1.2 Collapse Kai Assistant
- **Status:** Implemented
- **Location:** Lines ~816–845
- **Before:** Large navy hero with dual CTAs
- **After:** Compact white bar — "Kai can help" + "Ask Kai" + optional Upgrade link
- **Result:** Reduced cognitive load, single primary CTA

### 1.3 Journey Mode Selector — Demoted
- **Status:** Implemented
- **Location:** Lines ~707–736
- **Behavior:** Smaller "View:" toggle (Step-by-step | Milestones | Calendar)

### 1.4 Trust Signal — Compact
- **Status:** Implemented
- **Location:** Lines ~807–811
- **Behavior:** One-line "Unbiased: We don't earn commissions..."

---

## Phase 2: Road Metaphor & Focus Block ✅ DONE

### 2.1 Visual Road / Timeline
- **Status:** Implemented
- **Location:** Lines ~939–999
- **Behavior:**
  - Horizontal connecting line (desktop)
  - Progress fill (emerald) shows position on road
  - Clickable nodes per phase (Preparation → Closing)
  - Nodes show: complete ✓, locked 🔒, or phase icon
  - Active phase: scaled, navy border
- **Reference:** MGIC "Your Road Home" interactive path

### 2.2 Focus Block — Single Current Phase + One CTA
- **Status:** Implemented
- **Location:** Lines ~890–936
- **Behavior:**
  - "Your focus" label
  - Current phase title + status badge (Not started | In progress | Complete)
  - Next best action text
  - Single CTA: "Start this step" or "Unlock to continue"
- **Scroll:** CTA scrolls to phase section

### 2.3 Fuel Up First
- **Status:** Implemented
- **Location:** Lines ~860–887
- **Behavior:** Collapsible `<details>` — credit check, down payment estimate, key terms
- **Reference:** MGIC "Fuel up before you go"

### 2.4 Your Numbers — Sticky Sidebar
- **Status:** Implemented
- **Location:** Lines ~773–801
- **Behavior:** When quiz data exists — Comfortable max, Down payment, Readiness score + "Update in Profile"
- **Reference:** Credit Karma personalization

---

## Phase 3: Phase Cards & Progressive Disclosure ✅ DONE

### 3.1 Accordion Phase Cards
- **Status:** Implemented
- **Location:** Lines ~1044–1098
- **Behavior:**
  - Phase header clickable to expand/collapse
  - `expandedPhases` state; current phase auto-expanded on scroll
  - Status bar at top (emerald/blue/slate)
  - Status buttons: Not started | In progress | Complete

### 3.2 Detail Cards — Hidden by Default
- **Status:** Implemented
- **Location:** Lines ~1002–1010, ~1036+
- **Behavior:** "Show detail cards" / "Hide detail cards" toggle
- **Result:** Phase cards stay concise; feature grid optional

### 3.3 Locked Phase Gate
- **Status:** Implemented
- **Behavior:** Phases 3+ locked for free; outcome-based copy (e.g. "skipping could cost $X–$Y")

---

## Phase 4: Remaining Enhancements (Optional)

### 4.1 Momentum / Streak Indicators
- **Status:** Implemented
- **Location:** Hero strip, next to "X of Y phases complete"
- **Behavior:** Stores `phaseCompletionTimestamps` when user marks phase complete; shows "— X this week" when completions in last 7 days > 0

### 4.2 GO Buttons on Phase Cards
- **Status:** Implemented
- **Location:** Next best action callout in each phase card
- **Behavior:** "GO" button links to `/resources#phase-{id}` (Playbooks for that phase)
- **Reference:** MGIC milestone "GO" buttons

### 4.3 Time Estimates on Road Nodes
- **Status:** Implemented
- **Location:** Under each road node title (e.g. "Preparation" + "2-4 weeks")

### 4.4 Mobile Road — Vertical Stack
- **Status:** Implemented
- **Behavior:** On mobile (< md): vertical layout with left-aligned line, nodes stack vertically with [icon][title + duration] per row. Progress fill animates vertically (height %). Desktop: horizontal layout unchanged.

---

## File Structure

| File | Purpose |
|------|---------|
| `app/customized-journey/page.tsx` | Main journey page (~2400 lines) |
| `lib/plan-your-journey-steps.tsx` | 8-step config (IDs, titles, phase mapping) |
| `app/customized-journey/detail/[phaseId]/[featureId]/page.tsx` | Phase feature detail |

---

## Key State Variables

- `currentPhase` — From scroll position; drives Focus block and road highlight
- `phaseStatus` — `Record<phaseId, 'not-started' | 'in-progress' | 'complete'>`
- `expandedPhases` — `Set<phaseId>` for accordion
- `journeyMode` — `'checklist' | 'milestones' | 'calendar'`
- `showFeatureCards` — Toggle for feature grid per phase

---

## Testing Checklist

- [ ] Progress bar animates on load
- [ ] Road nodes scroll to correct phase on click
- [ ] Focus block CTA scrolls to phase and expands it
- [ ] Fuel up first expands/collapses
- [ ] Phase accordion expand/collapse works
- [ ] Status buttons update phaseStatus and persist to localStorage
- [ ] Locked phases show upgrade CTA
- [ ] Your Numbers sidebar appears when quiz data exists
- [ ] Kai compact bar "Ask Kai" opens assistant
- [ ] Mobile: road nodes wrap; layout readable

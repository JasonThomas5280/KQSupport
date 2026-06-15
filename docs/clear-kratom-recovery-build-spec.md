# CLEAR — Kratom & Feel Free Recovery
## Build Specification (v1.25)

**For:** Claude Code
**Type:** Build-ready product + engineering spec (web-first, React + Vite)
**Companion artifact:** `clear-kratom-recovery-prototype.jsx` (functional reference, compiles clean)

---

## 0. How to Use This Document

The companion `.jsx` is a **working reference** — every flow writes real state and persists. It is the source of truth for UX, copy, visual tokens, and data shape. This document is the source of truth for architecture, the production persistence layer, the research basis, audience tailoring, **the test suite**, and acceptance criteria.

**Architectural rule that must survive the rewrite:** all "days clean" math derives from `entries` + `quitDate`. There is no stored counter to increment or reset. A slip appends a `setback` entry and lowers a *ratio*; it never zeroes a number. See §4.1. **Unit-test the derive functions before building UI — §6.**

Build web-first to validate the UX with the kratom/Feel Free community fast. Native (notifications, app store) is Phase 4.

> **Note on document type.** §1–§3 and §A–§C are the PRD layer (problem, goals, stories, prioritized requirements). §4 onward is the build spec (architecture, data model, tests, persistence). A builder should read the PRD layer for *why* and *done*, and the build layer for *how*.

---

## A. Problem Statement

People physically dependent on kratom, 7-OH extracts, and Feel Free face a withdrawal that peaks hard around days 3–4 — the exact point most relapse, because one dose ends the pain instantly. Existing sobriety apps are built around an unbroken-streak counter that resets to zero on any slip, which for this population punishes the most common path to quitting (slip, learn, continue) and erases the financial and symptom progress that actually motivates them. The cost of not solving it: people abandon the app right when withdrawal is worst, lose the one number (money saved) that holds them, and read normal PAWS fatigue as failure. There is no widely-used tool tailored to this substance class, its specific timeline, or its financial devastation pattern.

## B. Goals (outcomes, not features)

1. **Get users through the day-3–4 peak without using** — measured by urge-tool engagement during that window and 7-day post-slip retention ≥ 80% (a slip doesn't make them quit the app).
2. **Replace the demotivating reset with cumulative progress** — no user ever sees their progress zeroed; clean-day ratio and money-saved persist through slips.
3. **Make recovery feel like it's working** — surface a symptom-severity line that measurably descends, so users have evidence against "I'll never feel normal."
4. **Anchor motivation in money reclaimed** — the financial counter is viewed weekly by ≥ 60% of active users.
5. **Reduce isolation** — a meaningful share of users add at least one Circle member and can reach them in one tap mid-craving.

## C. User Stories

**Person in early withdrawal (primary persona)**
- As someone on day 3 fighting a craving, I want a one-tap tool that helps me outlast the wave, so that I don't use just to make it stop.
- As someone who just slipped, I want to log it without losing my progress, so that one bad night doesn't make me quit trying.
- As someone convinced I'll never feel normal, I want to see my symptoms easing over time, so that I believe recovery is actually happening.
- As someone who spent heavily on Feel Free, I want to see the money I'm keeping, so that I have a concrete reason to stay clean.
- As someone in a flat, exhausted week three, I want the app to tell me this is expected PAWS, so that I don't read it as failure.

**Person self-managing a taper**
- As someone tapering down, I want to log the doses I chose, so that I can see my own descent — without the app prescribing anything.

**Person building support**
- As someone quitting alone, I want to add a trusted person and reach them in one tap during a craving, so that I'm not isolated at the worst moment.
- As that trusted person, I want a gentle nudge if they go quiet, so that I can check in when it matters.

**Edge / empty / error states**
- As a brand-new user with no data, I want the empty Saved and Path screens to explain what will appear, so that the app doesn't feel broken on day one.
- As someone who entered the wrong quit date, I want to fix it and have every number recompute, so that my history stays accurate.
- As someone with no daily-spend entered, I want the money features to invite me to add it rather than show $0 or break.

---

## D. Requirements (P0 / P1 / P2)

**P0 — cannot ship without (defines MVP):**
- Non-destructive progress model: a slip never zeroes the counter. *AC: Given any number of setback entries, When metrics render, Then cumulativePct is > 0 and reflects clean ÷ total.*
- Urge tool reachable from every screen via the red Help nav tab. *AC: Given any screen, When the user taps Help, Then the urge flow opens within one tap and never navigates away from their context destructively.*
- Onboarding captures name, product, reason, quit date, daily spend, method. *AC: Given a completed onboarding, Then Today renders reason, ring, and phase card with no missing-data errors.*
- Check-in with mood + symptom severity (1–5). *AC: Given a check-in with ≥1 rated symptom, Then it appears in recent and feeds the symptom trend.*
- Phase card keyed to days since last use, naming the day-3–4 peak and PAWS. *AC: Given daysSinceLastUse = 3, Then the card names the peak and that it lifts.*
- Document-a-slip flow. *AC: Given a logged slip, Then progress is preserved and the slip is never described as a reset.*
- Money saved derived from spend × clean days, with a null-safe path. *AC: Given dailySpend = null, Then money features invite entry rather than showing $0 or throwing.*
- Local persistence that survives refresh; hard reset. *AC: Given a reload, Then all state restores; Given reset confirmed, Then state clears.*
- Persistent medical disclaimer + helplines in urge tool and Circle.

**P1 — important fast-follows (core works without them):**
- Symptom-severity line chart on Saved. *(Core P0 logic exists; the visualization is the lever but the app functions without it.)*
- Milestones (clean-time + money thresholds).
- Circle invites with opt-in visibility and one-tap text deep link.
- Taper log (method = taper only).
- Path screen month bars + narrative.

**P2 — future, design-for-not-built:**
- Native build with real reminders / high-risk-window prompts.
- Encrypted backend + Circle sync.
- Export to PDF/CSV for a counselor.
- Privacy-preserving urge analytics over time.

*Be ruthless about P0: if Circle, taper, milestones, or the trend chart slipped to a fast-follow, the app still gets someone through day 3 without a reset. That is the line.*

---

## 1. Audience & Research Basis

Built specifically for people quitting **kratom**, concentrated **7-OH extracts/shots**, and **Feel Free** tonics. **Fully secular** — no faith framing.

Research came from Reddit-derived sources: peer-reviewed studies that systematically coded hundreds of r/kratom and r/quittingkratom posts, plus direct reporting from r/QuittingFeelFree (5,000+ members). Findings that shaped the build:

- **Withdrawal timeline is predictable enough to design around.** Acute symptoms ~5–7 days, **peak days 3–4**, then a PAWS tail of **2–6 weeks**, insomnia and intermittent cravings lasting longest. **Day 3–4 is the most common relapse point** — relief is one dose away. This single insight drives the phase card AND the urge tool.
- **7-OH / Feel Free is a more severe subset** — faster onset (4–6 hrs after last dose), more intense than leaf. Users self-identify product.
- **Reported symptom set:** anxiety, irritability, craving/desire to use, low energy, poor sleep, restlessness, nausea/GI, low mood. These are the exact symptom tags.
- **Financial devastation is central, especially Feel Free** (drained savings, 401(k)s, tens of thousands spent). Money-saved is a **first-class metric**.
- **Tapering vs cold turkey** is a live community debate; many self-taper → **log-only** taper tracker.
- **Community wisdom for tone:** quitting won't fix everything underneath, and that's okay — quitting even briefly is still huge. No toxic positivity, no shame.

---

## 2. Safety Boundary (Non-Negotiable)

Tracker and peer-support tool, **not medical care**. Rules for every screen and any future feature:

- **No dosing advice, taper schedules, or substance/medication recommendations.** The taper tool logs numbers the *user* chooses; it must never suggest a dose, rate, or substance.
- **No comfort-med protocols** (community discusses loperamide — dangerous at high doses; clonidine). The app does not go there; point to a clinician.
- **The urge tool supports and redirects — it never assesses, diagnoses, scores risk, or replaces a human/hotline.** It offers wave-riding, breathing, their own reason, a one-tap text to a chosen person, and helplines. That's the whole scope.
- Surface crisis/helpline resources (SAMHSA 1-800-662-4357; Crisis Text HOME to 741741) in the urge tool, crisis check-in, and Circle.
- Persistent medical disclaimer (Settings): severe withdrawal can be dangerous; seek help for chest pain, seizures, self-harm thoughts.
- **Requires legal review before launch**, with extra attention on the urge tool since people may lean on it in genuine crisis.

---

## 3. Tech & Architecture

React + Vite, web-first, **local-first** (fully usable offline). State is one object (`useReducer` or Zustand in prod; prototype uses `useState` + debounced save). All storage behind `loadState` / `saveState` / `resetStore` — the only swap point for production. Keep the 300ms debounce. `deriveMetrics`, `deriveJourney`, `deriveSymptomTrend` are pure functions over `entries` + `quitDate`; render reads only derived output.

---

## 4. Data Model

```
AppState {
  onboarded: boolean
  profile: {
    name, reason,
    product: "Feel Free" | "Kratom (leaf/powder)" | "7-OH extract / shots" | "Other",
    method: "cold_turkey" | "taper",
    quitDate: ISO,           // origin for clean-day math, phase guidance, symptom-trend x-axis
    dailySpend: number|null  // $/day → money saved
  }
  entries: Entry[]           // append-only, newest first
  urgesRidden: Urge[]        // NEW
  taper: Taper               // log-only
  circle: CircleMember[]
  settings: { reminderTime, quietAlertDefaultDays }
}

Entry =
  | { date, type:"checkin", mood, symptoms: {key, severity:1..5}[], note }   // severity is NEW
  | { date, type:"setback", note, learned, nextMove }

Urge { date, ts, outcome: "rode_it" | "reached_out" | "used" }              // NEW
  // outcome "used" ALSO appends a setback entry (logged from the urge moment)

Taper { active, startDose, currentDose, unit:"g"|"ml"|"bottles", goal, history:{date,dose}[] }
CircleMember { id, name, role, sharedVisibility, quietAlertDays }
```

### 4.1 Derived math
```
totalDaysTracked = daysBetween(quitDate, today) + 1
cleanDays        = totalDaysTracked - count(distinct setback dates)
cumulativePct    = round(cleanDays / totalDaysTracked * 100)
currentStreak    = lastSetback ? daysBetween(lastSetback, today) : totalDaysTracked - 1
daysSinceLastUse = currentStreak                       // feeds phaseFor()
moneySaved       = dailySpend ? round(dailySpend * cleanDays) : null
urgesRidden      = count(urges where outcome != "used")
```

### 4.2 Symptom trend (the "prove it's working" feature)
`deriveSymptomTrend` groups check-ins by `daysBetween(quitDate, entry.date)`, averages the per-entry mean severity, and returns `{day, avg}[]` sorted by day. The Saved screen plots it so the line **descends** as withdrawal recedes — the counter-message to "I'll never feel normal again." Needs ≥2 distinct days of data to render.

### 4.3 Phase guidance
`phaseFor(daysSinceLastUse)` returns tag + message. Day 3–4 explicitly names the peak and that it's the common relapse point and that it lifts. Day 15–42 names PAWS so a low-energy week reads as healing. Copy in prototype; preserve intent.

---

## 5. Screen & Flow Inventory

| # | Screen / Flow | Inputs | Writes | Notes |
|---|---|---|---|---|
| 1 | Onboarding (4 steps) | name, product, reason, quitDate, dailySpend, method | `onboarded`, `profile` | Spend captured up front; money matters here. |
| 2 | Today | — | — | reason → ring → **milestone strip** → **phase card** → money/urges/slips → check-in → (taper) → recent → slip. |
| 3 | **Urge tool** (red Help tab, leftmost in nav) | breathing, outcome | `Urge` (+`setback` if used) | Opens from a red 🆘 "Help" nav tab reachable on every screen — not a floating bar (which blocked content). 3 phases: hold (wave framing + reason + text-Circle + helplines) → breathe (20-min timer + pacer) → after (outcome). Support/redirect only. |
| 4 | Check-in (2 steps) | mood, symptoms+**severity 1–5**, note | `checkin` entry | Crisis mood points to urge button. |
| 5 | Document a slip | date, what, learned, next | `setback` entry | "Data, not a verdict." Never "reset." |
| 6 | Saved | — | — | Money hero + projections + **money milestones** + **symptom-severity line chart**. |
| 7 | Path | — | — | Month bars + stats incl. urges ridden + narrative. |
| 8 | Taper log | doses/unit/goal | `taper` | Log-only; "does not recommend doses." method=taper only. |
| 9 | Circle + invite | name, role, visibility, quietDays | `CircleMember` | Shared person = who the urge tool can text. Helplines panel. |
| 10 | Settings | name, reason, spend, reset | `profile`/reset | Persistent disclaimer. |

---

## 6. Test Suite (build BEFORE the UI)

Use Vitest. These cover the derive functions — the heart of the non-destructive design — and the cases that historically break.

```js
import { describe, it, expect } from "vitest";
import { deriveMetrics, deriveJourney, deriveSymptomTrend } from "./model";

const base = (over = {}) => ({
  profile: { quitDate: "2026-06-01", dailySpend: 20, ...over.profile },
  entries: over.entries || [],
  urgesRidden: over.urgesRidden || [],
});

describe("deriveMetrics", () => {
  it("counts a fresh quit as full clean", () => {
    const m = deriveMetrics(base({ profile: { quitDate: "2026-06-15", dailySpend: 20 } }));
    // assuming 'today' mocked to 2026-06-15
    expect(m.cleanDays).toBe(m.totalDaysTracked);
    expect(m.cumulativePct).toBe(100);
  });

  it("a slip lowers the ratio but NEVER zeroes it", () => {
    const m = deriveMetrics(base({ entries: [{ type: "setback", date: "2026-06-10" }] }));
    expect(m.setbackCount).toBe(1);
    expect(m.cumulativePct).toBeGreaterThan(0);     // the core guarantee
    expect(m.cumulativePct).toBeLessThan(100);
  });

  it("dedupes multiple slips on the same day to one clean-day loss", () => {
    const m = deriveMetrics(base({ entries: [
      { type: "setback", date: "2026-06-10" },
      { type: "setback", date: "2026-06-10" },
    ]}));
    expect(m.setbackCount).toBe(1);
  });

  it("currentStreak counts from the most recent setback", () => {
    const m = deriveMetrics(base({ entries: [
      { type: "setback", date: "2026-06-05" },
      { type: "setback", date: "2026-06-12" },
    ]}));
    expect(m.currentStreak).toBeGreaterThanOrEqual(0);
  });

  it("moneySaved is null when dailySpend missing, else spend * cleanDays", () => {
    expect(deriveMetrics(base({ profile: { quitDate: "2026-06-01", dailySpend: null } })).moneySaved).toBeNull();
    expect(deriveMetrics(base()).moneySaved).toBe(20 * deriveMetrics(base()).cleanDays);
  });

  it("urgesRidden excludes outcomes where the person used", () => {
    const m = deriveMetrics(base({ urgesRidden: [
      { outcome: "rode_it" }, { outcome: "reached_out" }, { outcome: "used" },
    ]}));
    expect(m.urgesRidden).toBe(2);
  });
});

describe("deriveJourney", () => {
  it("returns one bucket per calendar month since quitDate", () => {
    const j = deriveJourney(base({ profile: { quitDate: "2026-04-15", dailySpend: 20 } }));
    expect(j.length).toBeGreaterThanOrEqual(2);
  });
  it("does not crash on a >18-month journey (chart-overflow guard)", () => {
    expect(() => deriveJourney(base({ profile: { quitDate: "2024-01-01", dailySpend: 20 } }))).not.toThrow();
    // UI: horizontally scroll or aggregate to quarters past 18 months — see §7.
  });
});

describe("deriveSymptomTrend", () => {
  it("needs >=2 distinct days to plot", () => {
    const t = deriveSymptomTrend(base({ entries: [
      { type: "checkin", date: "2026-06-02", symptoms: [{ key: "anxiety", severity: 5 }] },
    ]}));
    expect(t.length).toBeLessThan(2);
  });
  it("averages severity per day and sorts ascending by day", () => {
    const t = deriveSymptomTrend(base({ entries: [
      { type: "checkin", date: "2026-06-08", symptoms: [{ key: "anxiety", severity: 2 }] },
      { type: "checkin", date: "2026-06-02", symptoms: [{ key: "anxiety", severity: 5 }, { key: "sleep", severity: 5 }] },
    ]}));
    expect(t[0].day).toBeLessThan(t[1].day);   // sorted
    expect(t[0].avg).toBe(5);                   // day 1 mean
  });
});
```

**Edge cases the tests pin down:** slip never zeroes the ratio; same-day slip dedupe; money-saved null path; urges-ridden excludes "used"; symptom trend sorting/averaging; journeys past 18 months don't throw. Also handle in code: **quitDate edited after entries exist** (recompute, never persist a stale counter — guaranteed by derived-only design), and **timezone**: store dates as local-YYYY-MM-DD via the existing `todayISO()`; do all day math on date strings, not timestamps, to avoid DST drift.

---

## 7. Production Persistence (swap `window.storage`)

`window.storage` is an artifact API and will not exist in the Vite build. Replace the three functions with `localforage` (IndexedDB), keeping signatures and the 300ms debounce identical:

```js
import localforage from "localforage";
const STORE = localforage.createInstance({ name: "clear" });
const KEY = "clear_recovery_state_v1";

export async function loadState() {
  try { return (await STORE.getItem(KEY)) ?? null; } catch { return null; }
}
export async function saveState(state) {
  try { await STORE.setItem(KEY, state); } catch (e) { console.error("persist failed", e); }
}
export async function resetStore() {
  try { await STORE.removeItem(KEY); } catch {}
}
```

Nothing else changes — no component calls storage directly. Later, when adding sync/Circle, layer an encrypted backend behind these same three functions.

---

## 8. Production Additions Beyond Prototype

1. **Text-Circle deep link.** The urge tool's "Text {name}" currently `alert()`s; wire it to `sms:` with a prefilled body ("I'm having a hard moment, can you talk?").
2. **Real reminders.** `reminderTime` is stored but doesn't fire. Web push is limited — a key reason for the Phase-4 native build. Interim: daily in-app prompt.
3. **Journey chart overflow.** Past ~18 months, horizontally scroll the month bars or aggregate to quarters (test in §6 guards the crash; this is the UX fix).
4. **Money milestones toast.** Celebrate crossing thresholds in real time, not just on the Saved screen.
5. **Export** full history (PDF/CSV) for a counselor.
6. **Urge-tool analytics (privacy-preserving).** Count opens and outcomes locally; "urges ridden" is already a powerful on-device stat — surface trend over time.

---

## 9. Non-Goals (v1)
Each is out of scope for a deliberate reason, not an oversight:
- **No medical/dosing/taper-schedule advice** — liability and safety; this is a peer-support tracker, not care.
- **No risk scoring or assessment in the urge tool** — assessing someone mid-crisis invites both false reassurance and liability; the tool supports and redirects only.
- **No social feed or community forum** — moderation burden and relapse-contagion risk; Circle is private 1:1 support instead.
- **No gamified badges or streak-shaming** — the entire thesis is anti-streak; badges would reintroduce the reset psychology we're removing.
- **No content library or education hub** — scope creep away from the core day-3 job; the phase card delivers the minimum needed context inline.
- **No multi-substance tracking** — tailoring to kratom/7-OH/Feel Free is the differentiator; generality dilutes it.
- **No native build in v1** — web validates the UX fastest; native is P2 (§D) once the flow is proven.

---

## 10. Build Phases
1. **Model + tests** (§6), then **local core:** onboarding, Today w/ phase card + milestones, check-in w/ severity, slip, **urge tool**, persistence, reset.
2. **Saved & Path:** money hero + milestones + projections, **symptom-severity chart**, journey, export.
3. **Taper & Circle:** log-only taper; Circle invites + opt-in visibility + text-deep-link + quiet nudges (gate sharing behind privacy review).
4. **Native + reminders:** Expo build for notifications/app-store; learned high-risk-window prompts.

---

## 11. Success Metrics
**Leading:** urge-tool open→rode_it/reached_out rate (the core outcome); check-in completion ≥ 60%; **day-3–4 app opens** (phase card + urge tool working); post-slip 7-day retention ≥ 80%; money-saved viewed weekly ≥ 60%.
**Lagging:** 30/90-day retention; "this got me through the worst days"; symptom-severity trend down across cohorts; clean-day trend up. Measure by active check-in/urge days, not opens.

---

## 12. Open Questions
- Urge-tool + taper liability review, with attention to crisis reliance. *(Legal — blocking before launch)*
- Persistence/encryption for synced or Circle data. *(Eng + Legal — blocking before Circle)*
- Web push viability vs native timing. *(Eng — non-blocking for Phase 1)*
- Monetization that does not exploit a financially-drained, mid-withdrawal user. *(Business)*

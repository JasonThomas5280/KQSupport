# CLEAR — Kratom & Feel Free Recovery

A secular, withdrawal-aware recovery tracker for the kratom / 7-OH / Feel Free community.
Web-first, local-first (fully usable offline), built with React + Vite + TypeScript.

> **Core thesis (anti-streak):** a slip **never zeroes progress**. All "days clean"
> math derives from `entries` + `quitDate` — a slip lowers a *ratio*, it never resets
> a counter. There is no stored counter to increment or reset.

This is a **tracker and peer-support tool, not medical care.** It gives no dosing,
taper-schedule, or treatment advice. See the in-app disclaimer and helplines.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # Vitest — the model layer is the tested heart of the app
npm run build    # type-check (tsc) + production build to dist/
```

## Architecture

State is one `AppState` object behind a `useReducer` + Context store
(`src/state/StoreContext.tsx`), saved with a 300ms debounce.

- **Model (`src/model/`)** — pure, fully-tested functions over `entries` + `quitDate`:
  `deriveMetrics`, `deriveJourney`, `deriveSymptomTrend` (`derive.ts`), phase/milestone
  copy (`phase.ts`). Day math uses local `YYYY-MM-DD` strings via `todayISO()` — never
  timestamps — to avoid DST/timezone drift. **Tests are written before/alongside the UI.**
- **State (`src/state/`)** — `reducer.ts` (all mutations), `StoreContext.tsx` (load +
  debounced save), `storage.ts` (persistence).
- **Screens / modals / components (`src/screens`, `src/modals`, `src/components`)** —
  ported verbatim from the prototype; it is the source of truth for copy and visual tokens.

### Persistence swap-point

All storage lives behind three functions in `src/state/storage.ts` —
`loadState` / `saveState` / `resetStore` — backed by `localforage` (IndexedDB).
This is the **only** place that touches storage. To add an encrypted backend or
Circle sync later, layer it behind these same three signatures; nothing else changes.

## Safety boundary (non-negotiable)

- No dosing, taper-schedule, or substance recommendations. The taper log only records
  numbers the *user* chooses.
- The urge tool supports and redirects — it never assesses, diagnoses, or scores risk.
- Helplines (SAMHSA `1-800-662-4357`, Crisis Text `HOME to 741741`) appear in the urge
  tool and Circle; a persistent medical disclaimer lives in Settings.
- Requires legal review before launch.

## Native apps (App Store / Google Play)

The same web build is wrapped for the stores with [Capacitor](https://capacitorjs.com).
The native iOS (`ios/`) and Android (`android/`) projects live in the repo; the web
assets they load are produced by `build:native` (which sets a relative asset base so
they resolve inside a WebView) and copied in by `cap sync`.

```bash
npm run sync:native     # build:native + cap sync  (run after any web change)

# Android — needs Android Studio / JDK
npx cap open android    # then Build > Generate Signed Bundle (.aab) → Play Console

# iOS — needs macOS + Xcode + CocoaPods
cd ios/App && pod install && cd ../..
npx cap open ios        # then Product > Archive → App Store Connect
```

App identity lives in `capacitor.config.ts` (`appId` `com.clearrecovery.app`,
`appName` `CLEAR`). The synced `public/` asset folders are gitignored — regenerate
them with `cap sync`.

**Before submitting:** Apple Developer Program ($99/yr) + Google Play ($25 once);
app icons/splash (defaults are placeholders — replace before launch); a privacy
policy (data is local-only, nothing collected); and — non-negotiable for a
drug-recovery app touching crisis moments — the **legal review** the spec flags as
blocking. Expect extra App Store scrutiny for health/recovery content; frame as
peer support and tracking, not medical care.

## Status

Web v1 (P0 + P1) per `docs/clear-kratom-recovery-build-spec.md`, now wrapped as
native iOS/Android shells (Capacitor). Local/push notifications, encrypted backend
/ Circle sync, and counselor export remain future (P2) work. The full ticket
breakdown lives with the approved plan.

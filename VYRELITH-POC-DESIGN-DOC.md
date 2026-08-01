# Vyrelith POC — design doc and build instructions

Front-end-only demo of a symptom tracking app for women with autoimmune conditions. Runs in a mobile browser, deployed to Vercel, seeded with realistic demo data. No backend, no real PHI.

**Purpose:** a shareable artifact for waitlist conversion and investor demos. Not a production app.

---

## 1. Product summary

**Who it's for.** Women roughly 25–55 with suspected or diagnosed multisystem autoimmune disease. Many are undiagnosed and have been dismissed. Fatigue and cognitive symptoms matter as much as pain.

**What it does.** Captures daily symptoms across eight body systems, overlays them against menstrual cycle and medication timing, records the diagnostic journey, and generates a one-page summary for appointments.

**What it explicitly does not do.** Diagnose. Name candidate conditions. Interpret labs. Predict cycles. Give dosing advice.

**The one thing the demo must land.** A woman opens it, sees a populated 90-day timeline, and reads: *"Your joint pain averages 41% higher in the 4 days before your period."* That sentence is the product.

---

## 2. Tech stack

| Layer | Choice | Note |
|---|---|---|
| Framework | React 18 + Vite | Not React Native. Not Next.js — no server needed |
| Language | TypeScript | Strict mode |
| Routing | React Router v6 | 14 routes |
| Styling | Tailwind CSS | Brand tokens in config |
| State | React Context + useReducer | One `AppStateProvider` |
| Persistence | In-memory only | See §7 |
| Charts | Recharts | |
| Icons | lucide-react | |
| Dates | date-fns | |
| PDF | react-to-print or html2canvas + jsPDF | |
| Deploy | Vercel | Free tier |

**Hard constraint:** no `localStorage`, no `sessionStorage`, no `IndexedDB`. All state in memory. Refresh resets to seed. This is deliberate — it keeps the demo free of stored health data.

---

## 3. Design system

### Palette

Extracted from the Vyrelith deck. Put these in `tailwind.config.js` under `theme.extend.colors`.

```js
vyr: {
  purple:      '#2D1B69',  // primary surfaces, buttons, headings
  purpleDeep:  '#1A0F42',  // deepest backgrounds
  purpleMid:   '#38256E',  // hover states on purple
  magenta:     '#C2185B',  // primary accent, CTAs, flare states
  magentaLite: '#E91E8C',  // secondary highlight, sparingly
  lavender:    '#B39DDB',  // chart fills, inactive icons
  lavenderLt:  '#D1C4E9',  // chips, tags, dividers
  lavenderPl:  '#EDE7F6',  // borders, subtle fills
  bg:          '#F8F5FF',  // page background
  textMute:    '#5E5080',  // secondary text
  textMute2:   '#6E6088',  // tertiary text
  teal:        '#02C39A',  // positive states, insight emphasis
  violet:      '#7C4DFF',  // reserved, use sparingly
}
```

### Color rules — enforce these

- **Magenta means attention, not brand.** Only: primary CTA, flare indicators, cycle-correlated days, active severity fill, "add photo" affordance. Nowhere else.
- **Teal only for derived insight.** The percentage inside an insight card. Nothing else.
- **Dark chrome only on the welcome screen.** Every post-auth screen is white cards on `#F8F5FF`. Someone logging at 6am mid-flare does not want a dark UI, and charts read badly on it.
- Body text `#2D1B69`. Secondary `#5E5080`. Tertiary `#6E6088`. Never pure black.

### Type

- System stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Two weights only: 400 and 500. Never 600/700.
- Scale: heading 18px · subhead 15px · body 13px · label 11px · caption 9–10px
- Sentence case everywhere. No title case, no all caps except the wordmark.

### Layout

- Mobile-first, 390px design width. Max-width 430px centered on desktop.
- Radius: 12px cards, 8px controls, 20px pills.
- Borders: `0.5px solid #EDE7F6`.
- Tap targets minimum 44px.
- Bottom tab bar, 4 items: Today · Insights · Journey · Assistant.

### Voice

- Never imply exaggeration. She has been dismissed enough.
- Active voice, verb-first buttons: "Save entry", not "Submit".
- Empty states invite, don't apologise.
- Example copy that must appear verbatim: *"That's enough. Add detail if you want."*

---

## 4. Symptom taxonomy

This is the product's core asset. Get it right before writing UI. Map each term to SNOMED CT later; for the POC just keep IDs stable and structured.

Eight groups, ordered by prevalence. Each group has symptom chips and a 0–10 severity.

```ts
type SymptomGroup = {
  id: string
  label: string
  chips: { id: string; label: string }[]
  hasBodyMap?: boolean
  hasSeverity: boolean
}
```

| # | Group | Chips |
|---|---|---|
| 1 | Pain and joints | hands, wrists, knees, feet, hips, shoulders, back, morning stiffness, swelling, warmth |
| 2 | Energy | crashed after activity, unrefreshing sleep, napped, couldn't get out of bed, wired but tired |
| 3 | Head and thinking | brain fog, word-finding, headache, dizziness, memory, light sensitivity |
| 4 | Gut | nausea, bloating, abdominal pain, diarrhoea, constipation, reflux, appetite change |
| 5 | Skin and hair | rash, photosensitivity, hair loss, dryness, Raynaud's, bruising, mouth-adjacent sores |
| 6 | Eyes and mouth | dry eyes, dry mouth, mouth ulcers, blurred vision, eye pain |
| 7 | Whole body | fever, night sweats, swollen glands, weight change, chills, general malaise |
| 8 | Cycle and hormonal | period started, spotting, cramps, breast tenderness, mood shift, heavy flow |

Group 1 has the body map. Group 2 uses the three-option energy scale *instead of* a slider. All others: chips + slider.

**Energy scale wording (do not change):** "Ran on empty" · "Managed the essentials" · "Close to normal"

---

## 5. Data model

```ts
type DayRating = 'rough' | 'managing' | 'good'

type SymptomEntry = {
  id: string
  date: string              // ISO yyyy-mm-dd
  dayRating: DayRating | null
  groups: {
    groupId: string
    chipIds: string[]
    severity: number | null   // 0-10
    energyLevel?: 'empty' | 'essentials' | 'normal'
    bodyRegions?: string[]
    photoIds?: string[]
  }[]
  createdAt: string
  updatedAt: string
}

type Photo = {
  id: string
  entryId: string
  groupId: string
  dataUrl: string           // base64, in memory only
  bodyRegion: string | null
  chipIds: string[]
  severity: number | null
  capturedAt: string        // ISO datetime — provenance is the point
}

type CycleEvent = {
  id: string
  type: 'period_start' | 'period_end' | 'spotting'
  date: string
}

type Medication = {
  id: string
  name: string
  cadence: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'as_needed'
  doseDay?: number          // 0-6 for weekly
  startedOn: string
  active: boolean
}

type MedicationDose = {
  id: string
  medicationId: string
  takenAt: string
}

type CareEvent = {
  id: string
  type: 'symptom_onset' | 'gp_visit' | 'specialist_visit' | 'referral'
       | 'test_ordered' | 'test_result' | 'diagnosis' | 'treatment_started'
  date: string
  specialty?: string
  title: string
  note?: string
  status?: 'pending' | 'complete' | 'waiting'
}

type UserProfile = {
  email: string
  displayName: string
  journeyStage: 'seeking_answers' | 'recently_diagnosed' | 'managing'
  conditions: string[]
  firstSymptomDate: string | null
  cycleTrackingEnabled: boolean
  researchOptIn: boolean    // MUST default false
}
```

### Derived values — compute, never store

- **Flare:** ≥3 consecutive days with mean severity ≥6, or dayRating `rough`. Report start date and duration.
- **Cycle phase:** derive from most recent `period_start`. Menstrual d1–5 · follicular d6–13 · ovulatory d14–16 · luteal d17+.
- **Cycle correlation:** mean severity for a symptom group in the 4 days before period start, vs. mean across all other days. Express as percent difference. **Only show if ≥2 complete cycles are logged and the difference is ≥15%.** Otherwise show a "keep logging" state.
- **Medication response:** mean severity on days 1–2 post-dose vs. rest of cycle.
- **Time since first symptom:** from `firstSymptomDate` or earliest `symptom_onset` care event.

---

## 6. Routes

14 routes. `/log` is one route with nine UI states — not a wizard.

| Route | Screen | Notes |
|---|---|---|
| `/` | Welcome | Only dark screen. Wordmark, two CTAs |
| `/signin` | Sign in | Email + password, magic link, Apple. All fake |
| `/signup` | Create account | Email, password w/ strength meter, terms checkbox, 18+ |
| `/consent` | Consent | Three cards: not a diagnosis · your data is yours · research is opt-in |
| `/onboarding` | Onboarding | 3 questions: journey stage, conditions, first symptom date |
| `/today` | Today | Date, CTA, streak, cycle day, 7-day sparkline, tab bar |
| `/log` | Daily log | **See §6.1** |
| `/insights` | Timeline | Range toggle 30/90/all, per-group trend lines, flare banner |
| `/insights/cycle` | Cycle overlay | Bar chart w/ luteal days in magenta, insight card in teal |
| `/insights/photos` | Photo log | Grid + detail card with timestamp, region, tags |
| `/meds` | Medications | List, cadence, next dose, post-dose severity sparkline |
| `/journey` | Care journey | Vertical timeline, add event, time-since-onset counter |
| `/journey/summary` | Visit summary | Generated one-pager, PDF download, share |
| `/assistant` | Assistant | Chat UI, canned responses, persistent disclaimer |
| `/settings` | Settings | Toggles, export, delete everything |

### 6.1 The daily log — build this carefully

One scrollable screen. Header row per group; tapping expands a panel inline below that row. Multiple groups can be open at once. No navigation, no step counter, no Next button.

**Order of elements:**
1. Close X, today's date
2. "How are you today?" — three buttons: Rough / Managing / Good
3. Helper text: *"That's enough. Add detail if you want."*
4. Divider
5. Eight collapsed group rows in taxonomy order

**Group row states:**
- Collapsed, nothing logged → label + chevron-down
- Collapsed, has data → label + pill badge "N logged" + chevron-down
- Expanded → label + chevron-up (magenta), panel below

**Panel contents by group:**
- Pain and joints: body map → region chips → symptom chips → severity slider → "Add a photo"
- Energy: three-option scale → chips (no slider)
- All others: chips → severity slider
- Cycle: chips + "Log period start" button writing a `CycleEvent`

**Saving:** every interaction writes immediately to state. No submit. Bottom button says "Done" and is a dismissal that routes to `/today`.

**Body map:** simple front-facing SVG silhouette with ~12 tappable regions (hands L/R, wrists, elbows, shoulders, neck, back, hips, knees, ankles, feet). Selected regions fill magenta. Don't over-engineer — a clean silhouette beats an anatomical illustration.

---

## 7. Seed data

The demo must open populated. Generate deterministically at app boot into the initial state.

**Persona:** Maya, 34, seeking answers. First symptom November 2023. Undiagnosed. Suspected inflammatory arthritis.

**Generate:**
- **90 days** of `SymptomEntry` ending today. ~78 of 90 days present — realistic gaps, including a 4-day gap during the worst flare.
- **Cycle:** 3 complete cycles, 28-day, `period_start` events at approximately day -84, -56, -28.
- **The planted correlation:** joint pain and fatigue severity must run 40–45% higher in the 4 days before each `period_start`. This is what produces the insight card. Make it real in the data, not hardcoded in the UI.
- **One active flare:** last 4 days, severity 7–8, so the Today screen shows a live flare banner.
- **3 photos** with realistic timestamps, body regions, and tags. Use small placeholder images.
- **2 medications:** naproxen (daily), hydroxychloroquine (daily, started 3 months ago). No methotrexate — she's undiagnosed, so a DMARD would be inconsistent.
- **6 care events:** first symptom Nov 2023 · GP visit May 2 · ANA panel ordered May 3 (pending) · rheumatology referral Jun 12 (waiting 48d) · GP follow-up Jul 8 · physio referral Jul 20.
- **Streak:** 12 days.

**Consistency matters.** If the seed says she's undiagnosed, the care journey must not contain a diagnosis event and the meds must be symptomatic. An investor who reads carefully will notice.

---

## 8. Guardrails — non-negotiable

**Assistant.** Canned responses only for the POC; no live LLM call. Every response ends with a disclaimer. It must refuse — with a written fallback — any request to diagnose, name a likely condition, interpret a lab value, or advise on dose. It may: explain terminology, help articulate symptoms, summarise her own logged data, suggest questions for an appointment.

**Red-flag handling.** If a user types anything suggesting emergency symptoms (chest pain, difficulty breathing, sudden severe headache, suicidal ideation), the assistant returns a fixed message directing to emergency care and does not continue the conversation thread.

**No prediction.** No cycle forecasting, no flare prediction, no risk scores. Log what happened.

**Research opt-in defaults to false.** Separate from account creation, separate from consent-acknowledgement. This is both an ethical requirement and a signal you'll want to measure.

**No real data collection.** No analytics, no third-party scripts, no form posts to any endpoint.

---

## 9. Build phases

Six sessions. Commit after each. Verify the checkpoint before moving on.

### Phase 1 — Scaffold
Vite + React + TS + Tailwind + React Router. All 14 routes rendering placeholder text. Bottom tab bar. Mobile-first shell with max-width 430px.
**Checkpoint:** every route reachable, tab bar navigates, looks right at 390px.

### Phase 2 — Design system
Tailwind config with the `vyr` palette. Shared components: `Card`, `Button`, `Chip`, `SeveritySlider`, `GroupRow`, `TabBar`, `InsightCard`, `MetricTile`, `SectionHeader`. Build a `/kitchen-sink` dev route rendering every component in every state.
**Checkpoint:** kitchen sink looks like the approved wireframes. Delete the route before deploying.

### Phase 3 — Data layer and seed
Types from §5. `AppStateProvider` with reducer. Seed generator per §7. Derived selectors: flare detection, cycle phase, cycle correlation, med response, time-since-onset.
**Checkpoint:** console-log the seed. Verify 3 cycles exist and the correlation calculation returns 40–45% for joint pain.

### Phase 4 — Daily log
The full §6.1 screen. Taxonomy, eight groups, expand/collapse, body map SVG, all control types, immediate save.
**Checkpoint:** log across four groups, close, reopen — data persists in state and badges show counts.

### Phase 5 — Insight screens
Today, Timeline, Cycle overlay, Photo log, Medications, Care journey, Visit summary + PDF.
**Checkpoint:** the cycle insight card renders the real computed percentage from seed data. PDF downloads.

### Phase 6 — Auth, assistant, polish
Welcome, sign in, sign up, consent, onboarding, assistant, settings. Fake auth — any credentials pass, route to `/today`. Empty states, loading states, keyboard focus, `prefers-reduced-motion`.
**Checkpoint:** full flow from `/` to `/today` works on a real phone via the Vercel URL.

### Then
PWA manifest + icons. Custom domain. Waitlist form on the welcome screen — email plus journey stage and time-since-first-symptom, no health details.

---

## 10. Prompt for Claude Code — Phase 1

Paste this doc into the project, then start with:

> Read VYRELITH-POC-DESIGN-DOC.md. Execute Phase 1 only — do not start Phase 2.
>
> Scaffold a Vite + React 18 + TypeScript project with Tailwind CSS and React Router v6. Create all 14 routes from §6 as placeholder components that render just their screen name. Build the bottom tab bar with 4 items (Today, Insights, Journey, Assistant) shown only on post-auth routes. Wrap everything in a mobile-first shell, max-width 430px, centered, background `#F8F5FF`.
>
> Add the `vyr` palette from §3 to the Tailwind config now so it's ready for Phase 2.
>
> **Install everything locally to the project.** Never use `npm install -g`. Use `npx` for any one-off tooling. Confirm `.gitignore` contains `node_modules` and that `package.json` has `"private": true`.
>
> **Check the Tailwind major version before configuring it.** If v3, use `tailwind.config.js` with `theme.extend.colors`. If v4, use CSS-based config with `@theme` in the stylesheet — `tailwind.config.js` is ignored in v4 and the palette will silently fail. Tell me which version you installed. If you have no preference, pin v3 with `npm install -D tailwindcss@3`.
>
> Do not use localStorage, sessionStorage, or IndexedDB anywhere in this project.
>
> Do not install any auth library, state management library, database client, or analytics package. React Context is sufficient for state.
>
> When done, tell me how to run it locally and confirm every route is reachable.

For each later phase, the same pattern: name the phase, point at the section, forbid running ahead.

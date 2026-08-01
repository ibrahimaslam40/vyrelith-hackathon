# Vyrelith

A symptom-tracking app for women with autoimmune conditions. Captures daily symptoms across eight body systems, overlays them against menstrual cycle and medication timing, records the diagnostic journey, and generates a one-page summary for appointments.

Built in phases:

1. **Scaffold** — Next.js App Router, TypeScript, Tailwind CSS
2. **Design system** — shared components, `vyr` color palette, type scale
3. **Data layer** — symptom taxonomy, data model, seeded demo data, derived insights (flare detection, cycle correlation, medication response)
4. **Daily log** — the core logging screen: eight symptom groups, body map, severity sliders, photo capture
5. **Insight screens** — Today, Timeline, Cycle overlay, Photo log, Medications, Care journey, Visit summary with PDF export
6. **Auth, assistant, polish** — sign in/up flow, consent, onboarding, an in-app assistant with built-in safety guardrails (no diagnosis, red-flag handling), settings
7. **Backend** — Next.js App Router with a Supabase-backed database

See `VYRELITH-POC-DESIGN-DOC.md` for the full design spec and build plan.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

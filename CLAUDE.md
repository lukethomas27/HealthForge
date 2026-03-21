# MedBridge (HealthForge)

Medical consultation app — doctors record transcriptions, AI generates insights, patients get plain-language action plans.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Architecture

```
src/
  App.jsx                    # Root component, routing state, page transitions
  main.jsx                   # Entry point
  index.css                  # Tailwind imports
  components/
    LandingPage.jsx          # Marketing landing page
    DoctorDashboard.jsx      # Patient list with search, confidence badges
    PatientDetailView.jsx    # Two-panel: patient profile + session details
    PatientDashboard.jsx     # Patient-facing: action plan, visit history
  data/
    seedData.js              # Hardcoded demo data (fallback when no Supabase)
  lib/
    supabase.js              # Supabase client init
    queries.js               # All Supabase queries (doctors, patients, sessions, insights)
  utils/
    generateInsights.js      # Simulated AI insight generation from transcription text
supabase/
  schema.sql                 # Postgres schema (doctors, patients, sessions, insights, actions)
  seed.sql                   # Demo seed data for Supabase
  migrations/                # Database migrations
  config.toml                # Supabase local config
```

## Stack

- **React 19** (JSX, no TypeScript)
- **Vite 8** with `@vitejs/plugin-react`
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- **Supabase** for backend (Postgres + JS client)
- **lucide-react** for icons

## Design Tokens

- Background: `#F7F4EF` (warm off-white)
- Primary dark: `#0B1929` (deep navy)
- Accent: `#00C9A7` (electric teal)
- Warning: `#F59E0B` (amber)
- Critical: `#F87171` (soft rose/red)
- Headings: Georgia serif
- Numbers/scores/data: `'Courier New'` monospace
- Body: `system-ui` sans-serif
- Cards: white bg, `shadow-md`, `rounded-lg`, `p-6`
- No purple gradients, no pill-shaped buttons, no Inter/Roboto fonts

## Environment

Requires two env vars (create `.env` or `.env.local`):
```
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

## Gotchas

- **No auth** — login is mocked. "I'm a Doctor" logs in as Dr. Emily Chen, "I'm a Patient" logs in as Sarah Kim (first patient).
- **Insight generation is simulated** — `generateInsights.js` parses transcription word count and keywords to produce confidence scores and differentials. Not a real AI call.
- **Confidence thresholds** — scores ≥70 are normal (teal), 50–69 are warning (amber), <70 trigger "Review Required" alerts (red).
- **Dual data sources** — `seedData.js` has hardcoded fallback data; Supabase queries in `lib/queries.js` are the primary source when connected.
- **Patient actions** use structured format: `{ icon, text, category }` with categories: `medication`, `environment`, `activity`, `diet`, `warning`, `followup`.
- **Warning actions are never checkable** — they render differently from other action items in the patient dashboard.
- **ESLint rule** — `no-unused-vars` ignores variables starting with uppercase or underscore (`varsIgnorePattern: '^[A-Z_]'`).

## Data Model

- `doctors` → `patients` (1:many via `doctor_id`)
- `patients` → `sessions` (1:many)
- `sessions` → `insights` (1:1)
- `insights` → `patient_actions` (1:many)

Patient objects carry nested `sessions` with nested `insights` throughout the app.

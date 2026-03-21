# HealthForge — Split Architecture Prompts

Each prompt below is a self-contained build instruction. They are designed to be used in sequence, with each one referencing the previous output. The **shared contract** at the top of every prompt ensures they all compose cleanly.

---

## SHARED CONTRACT (include at the top of every prompt)

```
HEALTHFORGE SHARED CONTRACT — read before building:

Framework: Single-file React JSX artifact. Tailwind utility classes only. lucide-react for icons. React hooks (useState, useEffect, useCallback, useMemo). No localStorage, no fetch, no external APIs.

Design language:
- Background: #F7F4EF (warm off-white)
- Primary dark: #0B1929 (deep navy)
- Accent: #00C9A7 (electric teal)
- Warning: #F59E0B (amber)
- Critical: #F87171 (soft rose/red)
- Headings: Georgia serif — authoritative, medical
- Numbers/scores/data: 'Courier New' monospace — precise, clinical
- Body: system-ui sans-serif — clean, readable
- Cards: white background, subtle shadow (shadow-md), rounded-lg, generous padding (p-6)
- Buttons: solid navy or teal, NOT pill-shaped, NOT gradient, NOT purple
- Badges: colored left-border accent (border-l-4), not filled backgrounds
- Transitions: 200ms ease on all interactive elements
- NO purple gradients. NO generic dashboard grids. NO Inter/Roboto fonts.

App state structure (all data lives here):
{
  currentUser: null | { id, name, role: 'doctor'|'patient', email },
  currentPage: 'landing' | 'doctor-dashboard' | 'doctor-patient-detail' | 'patient-dashboard',
  selectedPatientId: null | string,
  patients: [ ...patientObjects ],
  doctors: [ ...doctorObjects ]
}

Patient object shape:
{
  id: string,
  name: string,
  dob: string,
  age: number,
  allergies: string[],
  medications: string[],
  city: string,
  doctorId: string,
  sessions: [ ...sessionObjects ]
}

Session object shape:
{
  id: string,
  date: string,
  transcription: string,
  insights: {
    confidence: number,         // 0-100
    summary: string,            // clinical summary (doctor view)
    plainSummary: string,       // plain language (patient view)
    simpleSummary: string,      // maximum simplification (patient "dumb down" toggle)
    differentials: [ { label: string, pct: number } ],
    medicationFlags: string[],
    wearableNote: string,
    environmentalNote: string,
    actionsForDoctor: string[],
    actionsForPatient: [ { icon: string, text: string, category: string } ],
    delta: string,
    riskLevel: 'low' | 'medium' | 'high'
  } | null
}
```

---

## PROMPT 1 — Design System + Landing Page

**Goal:** Build the visual foundation and the first thing anyone sees.

**What to build:**

A React component file that exports `App` as default. For now, `App` renders only the `LandingPage` component. Later prompts will add routing — leave a clean `setPage` prop interface.

### LandingPage

Full-viewport landing page. Sections top to bottom:

**Navigation bar** (sticky, white bg, subtle bottom border):
- Left: "HealthForge" wordmark in Georgia serif, bold, navy #0B1929. A small teal pulse dot (●) sits before the word — this is the brand mark.
- Right: two text links "For Doctors" and "For Patients" → both skip login and route directly to their respective dashboards. For patients, mock the login as Patient 1 (Sarah Kim). Clean, no button styling. Teal underline on hover.

**Hero section** (full viewport height, centered):
- Animated background: a slow CSS keyframe animation moves a radial gradient of teal and navy across the surface. Subtle — not loud. Think aurora borealis at low opacity (0.08) over the off-white background.
- Large serif headline (56px, navy): "The space between your appointment and your health."
- Subheading (20px, system-ui, muted gray #6B7280): "HealthForge turns what your doctor said into what you actually need to do."
- Two CTA buttons side by side:
  - "I'm a Doctor →" — solid navy background, white text, px-8 py-3, no border-radius beyond rounded-sm
  - "I'm a Patient →" — solid teal #00C9A7, navy text, same sizing
- Small print below: "Trusted by practitioners. Designed for patients."

**Feature strip** (3 columns, white bg section, py-16):
Each feature has: a large outlined icon (lucide), a short bold serif title, and 2 sentences of description.
1. **Transcription** (FileText icon): "Every word from your consultation, captured and stored. Your doctor's notes become a shared record."
2. **AI Insights** (Activity icon): "Complex medical language translated into clear, honest guidance. Confidence-scored so you know how certain the AI is."
3. **Action Plans** (CheckCircle icon): "Not just information — a daily plan. Medication reminders, environmental alerts, warning signs to watch for."

**Closing section** (navy background, white text, centered, py-24):
- Headline: "Built for the gap nobody talks about."
- Body: "Patients retain less than 20% of what they're told at appointments. HealthForge makes that 100%."
- Single CTA: "Get Started" → navigates to doctor dashboard.

**Design notes for this component:**
- The animated background gradient must use `@keyframes` via a `<style>` tag injected into the component, or inline `style` prop with `animation`.
- The teal pulse dot in the wordmark should have a soft `animate-pulse` equivalent.
- Use asymmetric padding in the hero — more padding-top than padding-bottom creates visual tension.
- On mobile: stack the two CTA buttons vertically, reduce headline to 36px.

**Props interface:**
```jsx
<LandingPage onNavigate={(page) => {}} />
```

---

## PROMPT 2 — State Foundation & Seed Data

**Goal:** Build the root App state and routing logic that all other prompts depend on, bypassing any authentication.

**What to build:**

Extend the file from Prompt 1. Wire up `App` to manage routing state directly from the Landing Page buttons without auth.

### App root state
```jsx
const [appState, setAppState] = useState({
  currentPage: 'landing',
  currentUser: null,
  selectedPatientId: null
})
```

Use `SEED_DATA` (defined as a constant at the top of the file) matching the shared contract shape above. This is the single source of truth for all patient/session data throughout the app.

### Seed data to hardcode:

**Doctor:**
```
id: 'doc-1', name: 'Dr. Emily Chen', specialty: 'Internal Medicine',
email: 'dr.chen@healthforge.io'
```

**Patient 1 — Sarah Kim:**
```
id: 'patient-1', name: 'Sarah Kim', dob: '1989-04-12', age: 36,
email: 'sarah.k@email.com',
allergies: ['Penicillin', 'Shellfish'],
medications: ['Lisinopril 10mg (daily)', 'Cetirizine 10mg (as needed)'],
city: 'Victoria, BC', doctorId: 'doc-1'
```

Sessions for Sarah:
- Session 1 (date: 2 weeks ago): full transcription + insights as described in the master prompt (confidence: 82, riskLevel: 'medium')
- Session 2 (date: 3 days ago): follow-up transcription + insights (confidence: 91, riskLevel: 'low')

**Patient 2 — James Miller:**
```
id: 'patient-2', name: 'James Miller', dob: '1975-11-30', age: 50,
email: 'james.m@email.com',
allergies: ['Sulfa drugs'],
medications: ['Metformin 500mg (twice daily)', 'Atorvastatin 20mg (nightly)'],
city: 'Victoria, BC', doctorId: 'doc-1'
```

Sessions for James:
- Session 1 (date: 1 week ago): diabetes check transcription + insights (confidence: 61 — BELOW THRESHOLD, riskLevel: 'high')

All `actionsForPatient` arrays must be fully populated with the structured format: `{ icon: '💊', text: '...', category: 'medication' }`. Categories: `medication`, `environment`, `activity`, `diet`, `warning`, `followup`.

**Routing logic:**
- When "I'm a Doctor" is clicked on the landing page → set currentUser to `SEED_DATA.doctor` and navigate to `doctor-dashboard`.
- When "I'm a Patient" is clicked on the landing page → set currentUser to `SEED_DATA.patients[0]` (Sarah Kim) and navigate to `patient-dashboard`.

---

## PROMPT 3 — Doctor Dashboard (Patient List)

**Goal:** The doctor's home screen — a searchable, scannable list of all their patients.

**What to build:**

`DoctorDashboard` component. This is the first screen the doctor sees.

### Layout

Full page layout with a persistent **top navigation bar**:
- Left: HealthForge wordmark (teal pulse dot + Georgia bold navy)
- Center: nothing (or a subtle breadcrumb "My Patients")
- Right: "Dr. Emily Chen" with a small User icon + "Sign Out" as a text link

Below nav: main content area (max-w-5xl, mx-auto, px-6, py-8)

### Header row
- Left: "My Patients" in large Georgia serif (32px, navy)
- Right: search input (w-64, border, rounded-sm, pl-10 with a Search icon inside)

### Patient cards list

Each patient renders as a horizontal card (white bg, shadow-sm, rounded-lg, p-5, mb-3, hover:shadow-md transition cursor-pointer):

**Left section (flex-1):**
- Patient name — Georgia, 18px, bold, navy
- Age + city — system-ui, small, muted gray
- Medications count — "3 active medications" — small, muted

**Center section:**
- Last visit date — "Last seen March 15, 2026"
- Session count — "3 sessions"

**Right section:**
- Confidence score badge — the most recent session's confidence score
  - Display as: a `font-mono` number + colored left-border badge
  - ≥ 70: `border-l-4 border-teal-400 bg-teal-50 text-teal-800`
  - 50–69: `border-l-4 border-amber-400 bg-amber-50 text-amber-800`
  - < 70: `border-l-4 border-red-400 bg-red-50 text-red-800`
- If confidence < 70: show a small "⚠ Review Required" text in red below the badge, with an AlertTriangle icon (12px)
- A chevron right icon (ChevronRight, muted gray)

**Empty state:** If search finds no patients, show centered: a Users icon (large, muted) + "No patients found" + "Try a different search term"

**Filtering:** As the doctor types in search, filter the patient list in real time by patient name (case-insensitive).

**On click:** Call `onSelectPatient(patientId)` to navigate to patient detail.

**Props:**
```jsx
<DoctorDashboard
  doctor={doctorObject}
  patients={[...patientObjects]}
  onSelectPatient={(id) => {}}
  onLogout={() => {}}
/>
```

**Design notes:**
- The card list should feel like a refined table — not a grid of tiles.
- The "⚠ Review Required" badge should catch the eye but not feel alarming. Red text, small, quiet.
- Cards should have a very subtle left border in navy on hover (border-l-2 border-navy transition).

---

## PROMPT 4 — Doctor Patient Detail View

**Goal:** The richest view in the app. Everything a doctor needs about one patient in a two-panel layout.

**What to build:**

`PatientDetailView` component. Accessed when doctor clicks a patient from the list.

### Top bar (inside main content, not the nav)
- "← Back to Patients" as a text link with ArrowLeft icon
- Patient name in large Georgia serif (28px, navy)
- Risk level badge (same border-l-4 style): Low (teal) / Medium (amber) / High (red)

### Two-panel layout (flex-row on desktop, stacked on mobile)

---

#### LEFT PANEL (35%, sticky on scroll)

**Patient Profile card** (white, shadow-md, rounded-lg, p-6):
- Name, DOB, age
- City with a small pin icon
- Divider
- **Allergies** — each allergy as a small badge: `border border-red-300 text-red-700 bg-red-50 rounded px-2 py-0.5 text-xs`
- **Current medications** — listed with a Pill icon prefix, each on its own line
- Divider

**Wearable Summary card** (below profile, same style):
- Header: "Wearable Data" with an Activity icon
- Resting HR: show as a number in Courier New with a small trend arrow (↑ or ↓ or →) in the appropriate color
- Sleep average: same format
- Note: "(simulated from device data)"

**Environmental card** (below wearable):
- Header: "Today's Environment" with a Wind icon
- AQI reading: simulated number (e.g. "AQI 42 — Good") in Courier New
- Pollen level: "Moderate"
- Note: "Victoria, BC"

---

#### RIGHT PANEL (65%)

**Add New Transcription button** — top right, solid teal, "+ New Session" with Plus icon

**Session list** — each session as an expandable card:

*Collapsed state* (default):
- Session date (bold, navy) + "Session #N" label
- One-line excerpt from transcription (truncated at 80 chars)
- Confidence score badge (same style as patient list)
- "⚠ Review Required" if < 70
- Expand icon (ChevronDown) — clicking expands

*Expanded state*:
- **Transcription section:**
  - Label: "Transcription" in small caps, muted
  - Full transcription text in a light gray bg block (bg-gray-50, p-4, rounded, font-mono text-sm)
  - "Edit Transcription" button — opens inline edit mode (textarea replaces the text block, Save / Cancel buttons)

- **AI Insights section** (only shown if insights exist):
  - Label: "AI Insights" in small caps, teal color
  - **Confidence Score Gauge** — center-placed SVG arc (120px diameter):
    - Full circle track in light gray
    - Arc fills from top clockwise proportional to confidence %
    - Color: teal if ≥70, amber if 50-69, red if <70
    - Score number centered inside arc in Courier New bold (24px)
    - Label below: "AI Confidence"
  - **⚠ Low Confidence Alert Banner** (only if confidence < 70):
    - Full-width banner: amber/red left border, light amber bg
    - Text: "AI confidence is below threshold ({{score}}/100). The insights below may be incomplete. Please review and add more detail to the transcription."
    - "Add Context →" button — opens the edit transcription mode
  - **Session Summary**: one paragraph, clinical language
  - **Key Differentials**: numbered list, each with label + percentage in Courier New
  - **Medication Flags**: if any, amber border-l-4 card with Pill icon + flag text
  - **Wearable Correlation**: italic note referencing the wearable data
  - **Environmental Note**: italic note referencing the environment data
  - **Session Delta**: "vs. last visit" comparison in a subtle gray callout box
  - **Recommended Actions** — two columns:
    - "For You (Doctor)" — bulleted list, clinical
    - "For Patient" — bulleted list, plain language

- **"Generate AI Insights" button** (shown if no insights yet, or below existing insights as "Regenerate"):
  - Solid navy, full width of section
  - On click: shows 1.5s loading skeleton (pulse animation over insight areas), then populates insights using the simulated generation logic

**Simulated insight generation logic** (when doctor saves a transcription):
Parse the transcription text for keywords and build the insights object:
- Word count < 80 → confidence 45–62
- Word count 80–150 → confidence 63–78
- Word count > 150 → confidence 79–94
- Contains "blood pressure" or "hypertension" → add BP differential
- Contains "cough" → add respiratory differential, check for ACE inhibitor in medications
- Contains "diabetes" or "glucose" or "HbA1c" → add glycemic differential
- Any drug name in transcription → cross-reference patient.allergies → flag if match
- Always populate: summary, 2 differentials, wearable note (reference patient's simulated wearable data), environmental note (reference patient's city), actionsForDoctor (2 items), actionsForPatient (4 items with icons and categories), delta ("First session" if only one, otherwise "compared to [last date]")

**Props:**
```jsx
<PatientDetailView
  patient={patientObject}
  onBack={() => {}}
  onUpdatePatient={(updatedPatient) => {}}
/>
```

---

## PROMPT 5 — Patient Dashboard

**Goal:** The patient's entire world. Plain language, emotionally safe, action-oriented.

**What to build:**

`PatientDashboard` component. This is everything the patient sees — and it must feel fundamentally different from the doctor view. Warmer, softer, more encouraging. Same color palette, different emotional register.

### Top navigation bar
- Left: HealthForge wordmark
- Right: Patient name + "Sign Out"
- Below nav: a subtle teal top border (border-t-2 border-teal-400) — signals "you're in a safe space"

### Page layout (single column, max-w-2xl, mx-auto — narrower than doctor view, more intimate)

---

#### Section 1: "How are you doing?" (top card)

Large card, white, shadow-md, p-8. This is the emotional anchor of the page.

- Greeting: "Hi, [first name]." in Georgia 28px navy
- Risk status line — rendered based on `riskLevel` of most recent session:
  - Low: "You're doing well. Keep it up." + a soft teal checkmark icon
  - Medium: "There are a few things to keep an eye on." + amber info icon
  - High: "Your doctor wants to make sure you're okay. Stay on top of your plan." + rose alert icon
- One plain-language sentence about the last visit: sourced from `plainSummary` of the most recent session
- Last visit date in small muted text: "Last visit: March 18, 2026 with Dr. Emily Chen"

---

#### Section 2: Today's Action Plan

This is the most important section. Bold header: "What to do today" in Georgia 24px navy.

Subheader: "Based on your most recent visit" in muted small text.

List of action items from the most recent session's `actionsForPatient` array. Each item renders as:

A horizontal row card (white, border-l-4 colored by category, shadow-sm, p-4, mb-2, rounded-r-lg):
- Left: checkbox (custom styled — square not circle, navy border, teal fill when checked, clicking toggles checked state in local useState)
- Center: icon (emoji or lucide) + action text
- Right: category badge (tiny, muted)

Category → left border colors:
- `medication` → teal border, 💊
- `environment` → green border, 🌿
- `activity` → blue border, 🚶
- `diet` → orange border, 🍎
- `warning` → red border, ⚠ (these are NOT checkable — always show as static alert)
- `followup` → purple border, 📅

Warning items (category: 'warning') should look different — they have a red bg-opacity-5 background and their text is slightly bolder. These represent "seek care if..." instructions and should not have a checkbox.

---

#### Section 3: My Health History

Header: "Your visit history" in Georgia 22px navy.

Each session as an accordion card (white, shadow-sm, p-5, mb-3, rounded-lg):

*Collapsed:*
- Date + "Visit with Dr. Emily Chen"
- Plain summary (1 sentence, from `plainSummary`)
- AI Confidence label — NOT a number. Just: "AI Confidence: High" / "Medium" / "Low" (mapped from score: ≥70=High, 50-69=Medium, <70=Low)
- If confidence was low: small italic note — "Your doctor has been asked to review this. Check back soon." with a Clock icon
- ChevronDown to expand

*Expanded:*
- **Reading level toggle**: two small text buttons side by side — "Simpler" | "More detail"
  - Default: shows `plainSummary`
  - "Simpler": shows `simpleSummary` (maximum plain language — short sentences, no medical terms)
  - "More detail": shows `summary` (clinical language, still edited for patient consumption)
  - The active toggle button has a teal underline
- The insight text renders in a clean block (bg-gray-50, p-4, rounded, leading-relaxed)
- Key action items from that session (smaller, muted, bullet list)

---

#### Design notes for PatientDashboard:
- This page must feel like a caring message, not a medical record.
- Font sizes are larger throughout (18px base body instead of 16px).
- More line height (leading-relaxed everywhere).
- Use encouraging language in empty states: if no sessions yet, show "Your doctor hasn't added any visits yet. They will appear here after your first appointment."
- The action plan checkboxes create a sense of agency — patients feel they're doing something.
- Warning items must never be checkable — you cannot "complete" a warning sign.

**Props:**
```jsx
<PatientDashboard
  patient={patientObject}
  onLogout={() => {}}
/>
```

---

## PROMPT 6 — Integration + Polish Pass

**Goal:** Wire all five prompts together into a single working artifact, fix edge cases, add final polish.

**What to build:**

Take all components from Prompts 1–5 and compose them in a single `App` component. This prompt is about integration, routing, and final detail work.

### App routing logic

```jsx
function App() {
  const [page, setPage] = useState('landing')
  const [currentUser, setCurrentUser] = useState(null)
  const [selectedPatientId, setSelectedPatientId] = useState(null)
  const [patients, setPatients] = useState(SEED_DATA.patients)

  // navigate() handles all page transitions
  const navigate = (newPage, options = {}) => {
    if (options.patientId) setSelectedPatientId(options.patientId)
    setPage(newPage)
  }

  const handleRoleSelect = (role) => {
    if (role === 'doctor') {
      setCurrentUser(SEED_DATA.doctor)
      navigate('doctor-dashboard')
    } else {
      // Mock logging in as the first patient
      setCurrentUser(SEED_DATA.patients[0])
      navigate('patient-dashboard')
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setSelectedPatientId(null)
    navigate('landing')
  }

  const handleUpdatePatient = (updatedPatient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p))
  }

  // Render based on page
}
```

### Page transition animation

Wrap the rendered page in a `div` with `key={page}` and apply:
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
```
Applied via inline style: `style={{ animation: 'fadeIn 150ms ease' }}`

### Guard rails (data safety)
- Doctor can only see patients where `patient.doctorId === currentUser.id`
- Patient can only see their own data: `patient.id === currentUser.id`
- If selectedPatientId doesn't match any patient in state → redirect to doctor-dashboard

### Final polish checklist to apply:
1. All empty states handled with friendly messages and icons
2. All `actionsForPatient` arrays have at least 5 items
3. Warning action items cannot be checked
4. Confidence gauge SVG arc is animated (strokeDashoffset transition: 1s ease)
5. Loading skeleton (pulse animation) shows for 1.5s when generating insights
6. Edit transcription mode saves correctly and regenerates insights
7. Mobile layout: left/right panels stack vertically, font sizes reduce gracefully
8. The HealthForge wordmark (teal dot + Georgia bold) is pixel-identical across all pages
9. Sign out from any page returns to landing
10. "Add Context" button in the low-confidence alert opens the edit transcription mode for that session

### What the demo flow should look like (verify this works end to end):

**Doctor flow:**
Landing → "I'm a Doctor" → Doctor Dashboard (sees Sarah + James) → James Miller card shows "⚠ Review Required" → Click James → Patient Detail → Session expands → Red alert banner shows (confidence 61) → Click "Add Context" → Edit transcription, add more text → Save → Generate AI Insights → Confidence score updates → Alert disappears if now ≥ 70

**Patient flow (Sarah):**
Landing → "I'm a Patient" → Patient Dashboard → "How are you doing?" shows Low risk → Today's Action Plan shows 5+ items → Check off a couple items → Scroll to history → Click session to expand → Toggle "Simpler" / "More detail" reading levels

Both flows must work without errors.

---

## HOW TO USE THESE PROMPTS

1. **Start with Prompt 1** — build the landing page and establish the visual system. Verify it looks right.
2. **Run Prompt 2** — add state foundation and seed data. Verify routing from landing page to dashboards directly.
3. **Run Prompt 3** — add doctor dashboard. Verify patient list, search, and confidence badges.
4. **Run Prompt 4** — add patient detail. Verify the two-panel layout, insights, and low-confidence alert.
5. **Run Prompt 5** — add patient dashboard. Verify action plan, reading toggle, and history accordion.
6. **Run Prompt 6** — integration pass. Wire everything together and verify both demo flows end to end.

Alternatively: paste all 6 prompts into a single context with "Build all of the above as one complete React artifact" and let Claude build the full app in one shot. The split structure ensures nothing is missed.
